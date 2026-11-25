import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { THREE, canvasTexture, group, part } from './parts.js';
import {buildBay} from './bay.js';
import {THEMES} from './themes.js';
import {CHUTE} from './playfield.js';

// A fixed, vertical front window matches the reference. A closer rest eye and
// elevated viewing angle open the full floor depth while delivering dramatic
// off-axis naked-eye 3D parallax as the player leans left, right, or up.
const frontZ=3.025,restEye=10.8,eyeAboveCenter=2.32;
// Adjustable 3D parallax presets so younger kids with smaller head movements
// still get bold, wide-range naked-eye 3D stereopsis.
const DEPTH_PRESETS={
  1:{gainX:1.18,gainY:1.15,maxX:8.6,minY:-2.4,maxY:3.8,restScale:1.0},
  2:{gainX:1.75,gainY:1.60,maxX:12.2,minY:-3.0,maxY:5.0,restScale:1.0},
  3:{gainX:2.45,gainY:2.15,maxX:15.2,minY:-3.5,maxY:6.0,restScale:.89},
};

// Keep joystick axes strictly aligned to the physical X/Z gantry rails even
// when leaning sideways, so side-peeking never pulls the claw off-line.
export function movementInView(stick) {
  return { x: stick.x, z: stick.z };
}

function contactMaterial() {
  const texture = canvasTexture(128, 128, (ctx, w) => {
    const g = ctx.createRadialGradient(w/2,w/2,4,w/2,w/2,w/2);
    g.addColorStop(0,'rgba(10,27,42,.68)');
    g.addColorStop(0.36,'rgba(14,35,52,.46)');
    g.addColorStop(0.70,'rgba(20,44,62,.16)');
    g.addColorStop(1,'rgba(20,44,62,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,w);
  });
  return new THREE.MeshBasicMaterial({ map:texture, transparent:true, depthWrite:false, toneMapped:false });
}

function makeMarker(scene) {
  const marker = group(scene);
  const neutral = new THREE.MeshBasicMaterial({ color:'#257d91', depthWrite:false, toneMapped:false });
  const rim = new THREE.MeshBasicMaterial({ color:'#fffbdd', depthWrite:false, toneMapped:false });
  // Keep a faint footprint visible at the paws when a tall toy covers the floor.
  const obscured = new THREE.MeshBasicMaterial({color:'#255a75',transparent:true,opacity:.45,
    depthFunc:THREE.GreaterDepth,depthWrite:false,toneMapped:false});
  for (let i = 0; i < 4; i++) {
    const angle = i*Math.PI/2 + 0.10;
    for (const [inner, outer, mat, h] of [[0.82,1,rim,0],[0.858,0.968,neutral,.003],[.88,.957,obscured,.004]]) {
      const arc = part(marker, new THREE.RingGeometry(inner,outer,14,1,angle,1.15), mat,0,h,0);
      arc.rotation.x = -Math.PI/2;
      arc.renderOrder = mat===rim?1:mat===neutral?2:4;
    }
  }
  marker.scale.set(.445,1,.445);
  return function placeMarker(arm) {
    marker.visible = arm.marker && arm.showGuide;
    if (!marker.visible) return;
    marker.position.set(arm.x,0.052,arm.z);
  };
}

export function createChamber(canvas, viewport) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c2c0c5');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new RoomEnvironment();
  scene.environment = pmrem.fromScene(studio, 0.04).texture;
  scene.environmentIntensity = 0.50;
  studio.dispose();
  pmrem.dispose();
  // Sculptural arcade showcase lighting: strong overhead-front key light carves
  // round 3D toy form while a deeper cool carpet bounce gives rich undersides.
  scene.add(new THREE.HemisphereLight('#fffdf6','#698da6',0.86));
  const sun = new THREE.DirectionalLight('#fff4df',2.02);
  sun.position.set(-1.6,12.4,5.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.radius = 4.2;
  Object.assign(sun.shadow.camera,{left:-11.4,right:11.4,top:6.6,bottom:-5.6,near:3.0,far:24.0});
  sun.shadow.normalBias=0.03;
  sun.shadow.bias=-0.0004;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#d0ecff',0.44);
  fill.position.set(4.2,4.6,-3.2);
  scene.add(fill);

  const shade=contactMaterial();
  const shadowGeo=new THREE.PlaneGeometry(1,1);shadowGeo.rotateX(-Math.PI/2);
  const camera=new THREE.PerspectiveCamera(),raycaster=new THREE.Raycaster();
  const pointer=new THREE.Vector2(),point=new THREE.Vector3();
  const ids=Object.keys(THEMES),count=ids.length,pitch=10.85;
  const cabinets=new Map(),building=new Map();
  const markerRoot=group(scene),updateMarker=makeMarker(markerRoot);
  scene.add(sun.target);
  let height=7.94,width=15.6,dirty=true,position=0,active=null,visited=false,inTransit=false;
  let onTrack=()=>{},shadowSlot=null;
  function setSize(){
    const w=Math.max(1,viewport.clientWidth),h=Math.max(1,viewport.clientHeight);
    height=Math.max(7.94,15.6/(w/h));width=height*w/h;
    viewport.parentElement.style.setProperty('--bay-edge',Math.max(4,((1-10.82/width)*50))+'%');
    onTrack(position,100*pitch/width);
    const density=Math.min(window.devicePixelRatio||1,1.55,Math.sqrt(1850000/(w*h)));
    renderer.setPixelRatio(Math.max(.68,density));renderer.setSize(w,h,false);dirty=true;
  }
  setSize();new ResizeObserver(setSize).observe(viewport);
  function indexAt(slot){return ((slot%count)+count)%count;}
  function nearestSlot(index,center){return index+Math.round((center-index)/count)*count;}
  async function ensure(id,boards){
    if(!building.has(id)){
      const promise=buildBay(THEMES[id],id,boards[id],shadowGeo,shade).then(bay=>{
        bay.root.visible=false;scene.add(bay.root);cabinets.set(id,bay);return bay;
      }).catch(error=>{building.delete(id);throw error;});
      building.set(id,promise);
    }
    return building.get(id);
  }
  function move(value){
    position=value;
    for(const [id,bay] of cabinets){
      const slot=nearestSlot(ids.indexOf(id),position),offset=slot-position;
      bay.root.position.x=slot*pitch;
      bay.root.visible=Math.abs(offset)<2.2;
      if(bay.root.visible&&(inTransit||bay!==active))bay.park(offset);
    }
    const anchor=Math.round(position);
    if(anchor!==shadowSlot){
      const x=anchor*pitch;
      sun.position.x=x-1.6;sun.target.position.x=x;
      fill.position.x=x+4.2;fill.target=sun.target;
      shadowSlot=anchor;renderer.shadowMap.needsUpdate=true;
    }
    markerRoot.visible=!inTransit&&!!active;
    if(active)markerRoot.position.x=active.root.position.x;
    onTrack(position,100*pitch/width);dirty=true;
  }
  async function route(id,boards){
    const index=ids.indexOf(id);
    // On first entry the menu has no cabinet position to travel from. Bring the
    // selected cabinet into view without building the opposite half of the aisle.
    const from=visited?position:index-.48;
    const to=nearestSlot(index,from),needed=new Set();
    for(let slot=Math.floor(Math.min(from,to))-1;slot<=Math.ceil(Math.max(from,to))+1;slot++)needed.add(ids[indexAt(slot)]);
    const bays=await Promise.all([...needed].map(key=>ensure(key,boards)));
    bays.forEach(bay=>bay.sync());
    // Warm up outer ±2 neighbor bays in the background so wide-angle 3D peeking never hits an empty void.
    for(const d of [-2,2])ensure(ids[indexAt(to+d)],boards).then(bay=>{bay.sync();move(position);}).catch(()=>{});
    renderer.shadowMap.needsUpdate=true;
    active=cabinets.get(id);active.setGate(0);visited=true;inTransit=true;move(from);
    return {from,to};
  }
  function dock(slot){inTransit=false;move(slot);viewport.dataset.ready='true';}
  function pick(clientX,clientY){
    if(!active||inTransit)return -1;
    const b=viewport.getBoundingClientRect();
    pointer.set((clientX-b.left)/b.width*2-1,1-(clientY-b.top)/b.height*2);
    raycaster.setFromCamera(pointer,camera);
    for(const hit of raycaster.intersectObjects(active.prizes.children,true)){
      let node=hit.object;while(node&&node.parent!==active.prizes)node=node.parent;
      if(node)return node.userData.slot;
    }
    return -1;
  }
  function neighborAt(clientX){
    const rect=viewport.getBoundingClientRect(),x=((clientX-rect.left)/rect.width-.5)*width;
    return Math.abs(x)>pitch/2+.025?Math.sign(x):0;
  }
  function prizeOutlet(){
    point.set(active.root.position.x+CHUTE.x,.04,CHUTE.z).project(camera);
    return {x:(1+point.x)*50,y:(1-point.y)*50};
  }
  function draw(arm,gaze,changed){
    if(!dirty&&!changed)return;
    dirty=false;
    if(active&&!inTransit){
      active.updateCrane(arm);updateMarker(arm);
      if(active.shadowsChanged())renderer.shadowMap.needsUpdate=true;
    }
    // Move the complete eye and projection window along the aisle together.
    // Only the player's motion offsets the eye relative to that window.
    const preset=DEPTH_PRESETS[gaze.depth]||DEPTH_PRESETS[2];
    const distance=restEye*preset.restScale*gaze.distance;
    const eyeX=THREE.MathUtils.clamp(gaze.x*preset.gainX,-preset.maxX,preset.maxX);
    const eyeY=eyeAboveCenter+THREE.MathUtils.clamp(gaze.y*preset.gainY,preset.minY,preset.maxY);
    const near=.18,k=near/distance;
    camera.position.set(position*pitch+eyeX,height/2-.07+eyeY,frontZ+distance);
    camera.projectionMatrix.makePerspective((-width/2-eyeX)*k,(width/2-eyeX)*k,
      (height/2-eyeY)*k,(-height/2-eyeY)*k,near,90);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();renderer.render(scene,camera);
  }
  return {route,move,dock,neighborAt,prizeOutlet,pick,draw,setSize,
    track(fn){onTrack=fn;onTrack(position,100*pitch/width);},
    get toys(){return active.toys;},
    sync:state=>active.sync(state),put:(...args)=>active.put(...args),remove:id=>active.remove(id),setGate:t=>active.setGate(t)};
}
