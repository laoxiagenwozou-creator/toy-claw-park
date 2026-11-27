import { THREE, bake, box, group, oval, paint, part, profile, rod, torus, tube } from './parts.js';
import { CHUTE, GATE, ROOF } from './playfield.js';
import {cabinetShell,cabinetCarpet} from './cabinet.js';
import {CLAW_SCALE,firstFingerYaw} from './claw-shadow.js';
import {disposeStageBackdrop} from './scene-art.js';

const cream = paint('#fff5dc');
const porcelain = paint('#f6f8fc');
const slateBlue = paint('#4c6a8d', 'enamel');
const faceplate = paint('#cde2f7', 'satin');
const gunmetal = paint('#384050', 'chrome');
const rubberPad = paint('#272c38', 'rubber');
const brass = paint('#e6ba62', 'chrome');
const navy = paint('#283f63');
const chrome = paint('#dfe9f0', 'chrome');
const brightChrome = paint('#f3f7fb', 'chrome');
const amberGlow = new THREE.MeshBasicMaterial({color:'#ffd369',toneMapped:false});
const wallFrame = paint('#5d6c7e', 'satin');
const ledStrip = new THREE.MeshBasicMaterial({color:'#fff5cf',toneMapped:false});

const domeColors = {
  snow:'#72a7e5', road:'#6ea9c4', paw:'#5e9bd4', sun:'#7ab88e', leaf:'#7cb89a',
  wave:'#5db1c4', star:'#8388d0', rainbow:'#b588d2', hill:'#7cb88b',
  shield:'#649ec4', nest:'#9cb86e', web:'#7584c8',
  recycle:'#58b878', dino:'#c89d54', construct:'#e5ac38', train:'#c8645a', farm:'#78b862',
  bakery:'#e88ca5', fruit:'#88bf58', kitchen:'#de9254', bamboo:'#5eb57a', insect:'#7bc268',
  safari:'#d99b4e', polar:'#64b8de', castle:'#b48ce2', pirate:'#54a4bd', robot:'#6898d8',
  music:'#a878d4', sports:'#5eb874', camp:'#608cb0', circus:'#de6868', amusement:'#d684b5',
  airport:'#58a4de', hospital:'#5ebfb8', firehouse:'#df5a52', harbor:'#4e8cc4', school:'#e6b83e',
  festival:'#e04c46', egypt:'#dfb04e', sakura:'#eb8eb2', desert:'#d4844e', aquarium:'#4aa8d6',
  artstudio:'#d89460', icecreamshop:'#eb8cb0', petshop:'#d69a64', greenhouse:'#64b878', library:'#b8865c',
  cloudland:'#74b8eb', halloween:'#966ed8', christmas:'#64a8d6', gemmine:'#9a7ce0', superhero:'#df5a52',
};

function metallicDome(color) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.19, metalness: 0.42 });
  mat.userData.finish = 'dome-' + color;
  return mat;
}

function playgroundFloor(scene,mat) {
  const left = -5.38, right = 5.38, near = 2.95, far = -4.25;
  const hx = CHUTE.w / 2, hz = CHUTE.d / 2;
  for (const [x1, x2, z1, z2] of [
    [left, CHUTE.x-hx, far, near], [CHUTE.x+hx, right, far, near],
    [CHUTE.x-hx, CHUTE.x+hx, far, CHUTE.z-hz], [CHUTE.x-hx, CHUTE.x+hx, CHUTE.z+hz, near],
  ]) {
    const geo = new THREE.PlaneGeometry(x2-x1, z2-z1);
    geo.rotateX(-Math.PI/2);
    geo.translate((x1+x2)/2, 0, (z1+z2)/2);
    const vertices = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < vertices.count; i++) {
      uv.setXY(i, (vertices.getX(i)-left)/(right-left), (near-vertices.getZ(i))/(near-far));
    }
    const mesh = part(scene, geo, mat, 0, 0, 0);
    mesh.receiveShadow = true;
  }
}

function deliveryWell(root){
  const {x,z,w,d}=CHUTE,hx=w/2,hz=d/2,inner=paint('#32414a','satin');
  for(const s of [-1,1]){
    box(root,inner,.082,1.05,d,x+s*hx,-.51,z,.012);
    box(root,inner,w,1.05,.082,x,-.51,z+s*hz,.012);
    box(root,brightChrome,.125,.075,d+.12,x+s*hx,.030,z,.017);
    box(root,brightChrome,w+.12,.075,.125,x,.030,z+s*hz,.017);
  }
  box(root,paint('#202b35','satin'),w,.075,d,x,-1.04,z);
}

function supplyHatch(scene){
  const h=1.09,w=1.55,wall=-4.175;
  const root=group(scene,GATE.x,GATE.y,wall);
  const edge=paint('#8895a3','satin'),interior=paint('#43556d','satin');
  box(root,interior,w,h,.09,0,h/2,-.004,.045);
  for(const s of [-1,1])box(root,edge,.037,h+.07,.075,s*w/2,h/2,.050,.011);
  box(root,edge,w+.06,.065,.086,0,h+.016,.054,.012);
  const ramp=group(root,0,-.016,.07);
  box(ramp,chrome,w+.07,.07,.73,0,-.022,.34,.016);
  for(const s of [-1,1])box(ramp,cream,.035,.055,.69,s*(w/2-.012),.036,.33,.01);
  const panelM=new THREE.MeshBasicMaterial({toneMapped:false});
  const geometry=new THREE.PlaneGeometry(w,h);
  const uv=geometry.attributes.uv,pos=geometry.attributes.position;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(GATE.x+pos.getX(i)+5.33)/10.66,(GATE.y+h/2+pos.getY(i))/(ROOF+.04));
  const shutter=part(root,geometry,panelM,0,h/2,.104);
  return {
    artwork(texture){panelM.map=texture;panelM.needsUpdate=true;},
    open(t){
      shutter.scale.y=Math.max(.006,1-t);shutter.position.y=h*(.5+.5*t);
      ramp.rotation.x=-(1-t)*1.47;
      ramp.visible=t>.018;
      ramp.scale.z=Math.max(.015,t);
    },
  };
}

const textures=new Map();
const loader=new THREE.TextureLoader();
function wallTexture(theme){
  if(!textures.has(theme)){
    const loaded=typeof theme.bg==='function'?Promise.resolve(theme.bg()):loader.loadAsync(theme.bg);
    textures.set(theme,loaded.then(texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      const aspect=texture.image.width/texture.image.height,wallAspect=10.66/(ROOF+.04);
      texture.repeat.set(Math.min(1,wallAspect/aspect),Math.min(1,aspect/wallAspect));
      texture.offset.set((1-texture.repeat.x)/2,(1-texture.repeat.y)/2);
      return texture;
    }).catch(error=>{textures.delete(theme);throw error;}));
  }
  return textures.get(theme);
}

export function evictWallTexture(theme,id){
  if(typeof theme.bg==='function'){
    textures.delete(theme);
    disposeStageBackdrop(id);
  }
}

export async function furnishBay(root,theme,clawShadow,id){
  const texture=await wallTexture(theme);
  cabinetShell(root,theme);
  const well=group(root);deliveryWell(well);bake(well);
  const carpetTex=cabinetCarpet(theme);
  const carpet=new THREE.MeshStandardMaterial({roughness:.82,metalness:.01,map:carpetTex});
  const carpetMat=clawShadow.receiver(carpet);
  playgroundFloor(root,carpetMat);
  const hatch=supplyHatch(root);hatch.artwork(texture);hatch.open(0);
  const muralBase=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
  const mural=clawShadow.wallReceiver(muralBase);
  part(root,new THREE.PlaneGeometry(10.66,ROOF+.04),mural,0,(ROOF+.04)/2,-4.25);
  const wallShadow=new THREE.ShadowMaterial({color:'#182a44',opacity:.17,transparent:true,depthWrite:false});
  const wallCatch=part(root,new THREE.PlaneGeometry(10.66,ROOF+.04),wallShadow,0,(ROOF+.04)/2,-4.24);
  wallCatch.castShadow=false;wallCatch.receiveShadow=true;
  // Recessed inner back-wall border & vertical segmented corner LED strips.
  const backTrim=group(root);
  for(const s of [-1,1]){
    box(backTrim,wallFrame,.09,ROOF,.08,s*5.28,ROOF/2,-4.21,.012);
    for(let i=0;i<6;i++){
      box(backTrim,ledStrip,.075,.72,.028,s*5.13,.76+i*1.16,-4.22,.008);
    }
  }
  box(backTrim,wallFrame,10.64,.09,.08,0,ROOF-.04,-4.21,.012);
  bake(backTrim,{castShadow:false,receiveShadow:false});
  const open=hatch.open;
  open.dispose=()=>{
    carpetTex.dispose();carpet.dispose();if(carpetMat!==carpet)carpetMat.dispose();
    muralBase.dispose();if(mural!==muralBase)mural.dispose();wallShadow.dispose();
    if(id)evictWallTexture(theme,id);
  };
  return open;
}

export function makeCrane(scene,clawShadow,theme) {
  const accentHex = domeColors[theme?.mark] || '#72a7e5';
  const domeMat = metallicDome(accentHex);
  const accentEnamel = paint(accentHex, 'enamel');
  const barY = ROOF - 0.30; // 7.42: clean upper track rail
  const pivotY = barY - 0.22; // 7.20: center of the upper carriage disc

  // Sleek bright white & chrome overhead cross-rail (open airy look like the reference video).
  const bar = group(scene);
  const railRod = tube(bar, brightChrome, 0.045, 0.045, 10.22, 0, -0.02, 0, 14);
  railRod.rotation.z = Math.PI / 2;
  box(bar, porcelain, 10.28, 0.075, 0.16, 0, 0.045, 0, 0.028);
  // Crisp slider carriages with glowing amber alignment markers on the left & right Z-rails.
  for (const s of [-1, 1]) {
    box(bar, slateBlue, 0.36, 0.24, 0.56, s * 5.00, 0.01, 0, 0.060);
    box(bar, amberGlow, 0.09, 0.09, 0.30, s * 4.78, 0.01, 0, 0.018);
  }
  bake(bar, { castShadow: false, receiveShadow: false });

  // Upper slotted carriage box (|||||) + circular ceiling reference disc ("上沿小盘").
  const cart = group(scene);
  box(cart, slateBlue, 1.12, 0.32, 0.60, 0, -0.02, 0, 0.068);
  box(cart, faceplate, 0.92, 0.21, 0.06, 0, -0.02, 0.285, 0.022);
  for (let i = 0; i < 5; i++) {
    box(cart, gunmetal, 0.044, 0.12, 0.03, -0.32 + i * 0.098, -0.02, 0.314, 0.008);
  }
  box(cart, cream, 0.20, 0.078, 0.03, 0.25, -0.02, 0.314, 0.016);
  // Bright circular reference platter directly below the carriage box.
  tube(cart, porcelain, 0.68, 0.72, 0.072, 0, -0.24, 0, 36);
  const discRim = torus(cart, brightChrome, 0.70, 0.026, 0, -0.268, 0);
  discRim.rotation.x = Math.PI / 2;
  tube(cart, accentEnamel, 0.56, 0.58, 0.080, 0, -0.252, 0, 36);
  tube(cart, gunmetal, 0.30, 0.30, 0.088, 0, -0.260, 0, 28);
  tube(cart, brightChrome, 0.16, 0.175, 0.115, 0, -0.278, 0, 22);
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    box(cart, gunmetal, i % 2 === 0 ? 0.062 : 0.15, 0.080, i % 2 === 0 ? 0.15 : 0.062,
      Math.sin(a) * 0.62, -0.252, Math.cos(a) * 0.62, 0.01);
  }
  bake(cart, { castShadow: false, receiveShadow: false });

  // Solid telescopic chrome piston shaft + large hero 1.68x sculpted 3-prong claw.
  const pendulum = group(scene);
  const sleeve = tube(pendulum, chrome, 0.106, 0.114, 0.54, 0, -0.27, 0, 18);
  const sleeveRim = tube(pendulum, brass, 0.124, 0.124, 0.058, 0, -0.54, 0, 18);
  const cable = tube(pendulum, brightChrome, 0.074, 0.074, 1, 0, 0, 0, 16);
  const cableCore = tube(pendulum, navy, 0.022, 0.022, 1, 0, 0, 0, 10);
  sleeve.receiveShadow = sleeveRim.receiveShadow = cable.receiveShadow = cableCore.receiveShadow = false;

  const claw = group(pendulum);
  claw.scale.setScalar(CLAW_SCALE);

  // Iconic large metallic saucer-dome cap + bright rim + contrasting dark actuator drum.
  const housing = group(claw);
  tube(housing, brass, 0.116, 0.154, 0.13, 0, 0.31, 0, 24);
  tube(housing, brightChrome, 0.168, 0.192, 0.055, 0, 0.235, 0, 24);
  // Broad glossy saucer dome ("大圆盘顶盖"): viewed from slightly above, its wide
  // circular top & bright chrome ring act as an unmistakable 3D spatial reference.
  oval(housing, domeMat, 0.425, 0.205, 0.425, 0, 0.105, 0);
  const eqRing = torus(housing, brightChrome, 0.420, 0.022, 0, 0.062, 0);
  eqRing.rotation.x = Math.PI / 2;
  tube(housing, porcelain, 0.398, 0.376, 0.038, 0, 0.028, 0, 32);
  // Deep gunmetal actuator drum + center lower pointer boss.
  tube(housing, gunmetal, 0.325, 0.295, 0.150, 0, -0.055, 0, 28);
  tube(housing, chrome, 0.302, 0.302, 0.022, 0, -0.036, 0, 28);
  tube(housing, gunmetal, 0.130, 0.092, 0.072, 0, -0.145, 0, 18);
  oval(housing, brightChrome, 0.062, 0.042, 0.062, 0, -0.178, 0);
  bake(housing, { castShadow: false, receiveShadow: false });

  // 3 sculpted wide-framing metallic talons with linkage struts, pivot pins & dark rubber pads.
  const fingers = [];
  for (let i = 0; i < 3; i++) {
    const pivot = group(claw);
    pivot.rotation.y = firstFingerYaw + i * Math.PI * 2 / 3;
    const finger = group(pivot, 0.215, -0.095, 0);
    profile(finger, chrome, [
      [-0.046, 0.046], [0.098, 0.044], [0.295, -0.245], [0.288, -0.430],
      [0.092, -0.675], [-0.014, -0.648], [0.156, -0.402], [0.154, -0.265],
    ], 0.122, 0, 0, 0, 0.018);
    rod(finger, brightChrome, [0.058, 0.018, 0], [0.256, -0.31, 0], 0.030, 8);
    rod(finger, brightChrome, [0.256, -0.33, 0], [0.074, -0.59, 0], 0.026, 8);
    rod(finger, gunmetal, [-0.038, -0.068, 0], [0.148, -0.32, 0], 0.022, 8);
    oval(finger, brass, 0.064, 0.068, 0.080, 0, 0, 0);
    oval(finger, gunmetal, 0.048, 0.048, 0.074, 0.215, -0.325, 0);
    // Bold beveled dark-charcoal rubber grip pad at fingertip.
    const pad = box(finger, rubberPad, 0.152, 0.112, 0.162, 0.038, -0.648, 0, 0.022);
    pad.rotation.z = -0.36;
    bake(finger, { castShadow: false, receiveShadow: false });
    fingers.push(finger);
  }

  return function update(arm) {
    bar.position.set(0, barY, arm.z);
    cart.position.set(arm.x, barY, arm.z);
    const swayX = arm.swayX || 0, swayZ = arm.swayZ || 0;
    const drop = Math.max(0.68, pivotY - arm.y);
    pendulum.position.set(arm.x, pivotY, arm.z);
    pendulum.rotation.set(-swayZ, 0, swayX);
    claw.position.set(0, -drop, 0);
    const sleeveLen = Math.min(0.54, Math.max(0.18, drop - 0.62));
    sleeve.scale.y = sleeveLen / 0.54;
    sleeve.position.y = -sleeveLen / 2;
    sleeveRim.position.y = -sleeveLen;
    const cableLen = Math.max(0.08, drop - 0.52);
    cable.scale.y = cableCore.scale.y = cableLen;
    cable.position.set(0, -cableLen / 2, 0);
    cableCore.position.set(0.040, -cableLen / 2, 0.036);
    const angle = -0.34 + arm.open * 0.92;
    for (const finger of fingers) finger.rotation.z = angle;
    const tipX = arm.x + drop * Math.sin(swayX);
    const tipZ = arm.z + drop * Math.sin(swayZ);
    clawShadow.update(scene.position.x + tipX, arm.y, tipZ, angle, scene.position.x, pivotY, swayX);
  };
}
