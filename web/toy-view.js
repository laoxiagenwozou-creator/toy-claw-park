import {THREE} from './parts.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {PRIZES,preparePrizes} from './library.js';
import {CATALOG,toyModel} from './vehicles.js';

const specialist={fire:'点亮警灯',racer:'让赛车滑行',crane:'升起吊臂'};
export const playLabel=kind=>specialist[kind]||'玩一玩';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function createToyView(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=1.01;
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,40);
  const environment=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer);
  const studio=generator.fromScene(environment,.04);
  scene.environment=studio.texture;scene.environmentIntensity=.64;environment.dispose();generator.dispose();
  const sky=new THREE.HemisphereLight(0xfffbed,0xabc9df,.88);scene.add(sky);
  for(const [x,y,z,intensity] of [[-3.6,11,4.2,2.06],[4,3,-3,.87]]){
    const lamp=new THREE.DirectionalLight(0xfffaf2,intensity);lamp.position.set(x,y,z);scene.add(lamp);
  }
  const pivot=new THREE.Group(),center=new THREE.Group();pivot.add(center);scene.add(pivot);
  const stamp=document.createElement('canvas');stamp.width=stamp.height=96;
  const ink=stamp.getContext('2d'),radial=ink.createRadialGradient(48,48,4,48,48,48);
  radial.addColorStop(0,'rgba(57,53,42,.62)');radial.addColorStop(.49,'rgba(68,61,41,.38)');radial.addColorStop(1,'rgba(79,68,48,0)');
  ink.fillStyle=radial;ink.fillRect(0,0,96,96);
  const floorMap=new THREE.CanvasTexture(stamp);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:floorMap,transparent:true,depthWrite:false}));
  floor.rotation.x=-Math.PI/2;pivot.add(floor);
  let model,kind,frame=0,request=0,yaw=0,pitch=.23,animation=null,visible=false;
  let diameter=2,buttons=[],boom,line,lamps=[],wheelParts=[],restY=0,lineX=0,lineY=0;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(width=canvas.clientWidth,height=canvas.clientHeight,dpr=Math.min(devicePixelRatio,1.75)){
    if(!width||!height)return;
    renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);
    const aspect=width/height,h=diameter*Math.max(1,1/aspect)*.54;
    Object.assign(camera,{left:-h*aspect,right:h*aspect,top:h,bottom:-h});
    camera.updateProjectionMatrix();
  }
  function draw(){
    camera.position.set(Math.sin(.56+yaw)*Math.cos(pitch)*8,Math.sin(pitch)*8,Math.cos(.56+yaw)*Math.cos(pitch)*8);
    camera.lookAt(0,0,0);renderer.render(scene,camera);
  }
  function clean(){
    if(frame)cancelAnimationFrame(frame);frame=0;animation=null;
    for(const mat of buttons)mat.dispose();buttons=[];
    if(model)center.remove(model);model=null;lamps=[];wheelParts=[];boom=null;line=null;
    pivot.position.set(0,0,0);pivot.rotation.set(0,0,0);pivot.scale.setScalar(1);
  }
  async function show(id,{interactive=true}={}){
    const token=++request;clean();kind=id;visible=true;
    await preparePrizes([id]);if(token!==request)return false;
    model=interactive&&CATALOG[id]?toyModel(id,true):PRIZES[id].make();
    const box=new THREE.Box3().setFromObject(model),mid=box.getCenter(new THREE.Vector3()),span=box.getSize(new THREE.Vector3());
    diameter=Math.max(span.x,span.y,span.z)*(interactive?1.16:1.36);
    floor.visible=interactive;floor.position.y=-span.y/2-.008;floor.scale.set(span.x*1.34,span.z*1.75,1);
    center.position.copy(mid).multiplyScalar(-1);center.add(model);yaw=0;pitch=.25;
    if(interactive){
      model.traverse(part=>{
        if(part.name==='wheel')wheelParts.push(part);
        if(part.name==='boom')boom=part;
        if(part.name==='hook-line')line=part;
        if(part.name.endsWith('-beacon')){
          const blue=part.name==='blue-beacon';
          part.traverse(mesh=>{if(!mesh.isMesh)return;
            mesh.material=mesh.material.clone();buttons.push(mesh.material);
            mesh.material.emissive.set(blue?0x24a9ff:0xff5638);mesh.material.emissiveIntensity=0;
            lamps.push({material:mesh.material,blue});
          });
        }
      });
    }
    if(line){lineX=line.position.x;lineY=line.position.y;}
    restY=model.position.y;size();draw();return true;
  }
  function pose(t){
    const wave=Math.sin(Math.PI*t),amount=wave*wave;
    if(kind==='fire'){
      const light=Math.sin(Math.PI*2*t*2);
      for(const l of lamps)l.material.emissiveIntensity=amount*(.38+1.5*(.5+.5*(l.blue?light:-light)));
    }else if(kind==='crane'&&boom&&line){
      const angle=.54+.55*amount;boom.rotation.z=angle;
      line.position.x=lineX+1.61*(Math.cos(angle)-Math.cos(.54));
      line.position.y=lineY+1.61*(Math.sin(angle)-Math.sin(.54));
    }else if(kind==='racer'){
      const ride=.32*diameter*Math.sin(2*Math.PI*t)*wave;
      pivot.position.x=ride;for(const w of wheelParts)w.rotation.z=-ride/.20;
    }else{
      pivot.rotation.y=reduced()?.22*amount:t*Math.PI*2;
      model.position.y=restY+(reduced()?0:diameter*.065*wave);
    }
  }
  function play(){
    if(!model||!visible)return;
    if(frame)cancelAnimationFrame(frame);
    const start=performance.now(),duration=reduced()?580:kind==='fire'?2050:1450;animation=start;
    function tick(now){
      if(animation!==start||!model)return;
      const t=clamp((now-start)/duration,0,1);pose(t);draw();
      if(t<1)frame=requestAnimationFrame(tick);
      else {pose(0);draw();frame=0;animation=null;}
    }
    frame=requestAnimationFrame(tick);
  }
  const rotate=(dx,dy=0)=>{yaw+=dx;pitch=clamp(pitch+dy,-.16,.70);if(visible&&model)draw();};
  const hide=()=>{visible=false;++request;clean();};
  const observer=new ResizeObserver(()=>{if(visible&&model){size();draw();}});observer.observe(canvas);
  return {show,play,rotate,hide,renderAt(w,h){size(w,h,1);draw();},dispose(){
    hide();observer.disconnect();floorMap.dispose();floor.material.dispose();floor.geometry.dispose();
    studio.dispose();renderer.dispose();renderer.forceContextLoss();
  }};
}
