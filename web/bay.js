import {THREE,group,part} from './parts.js';
import {FLOOR,HOME,STALLS,poseFor} from './playfield.js';
import {POOLS,PRIZES,preparePrizes} from './library.js';
import {furnishBay,makeCrane} from './scenery.js';
import {createClawShadow} from './claw-shadow.js';
import {refillPose} from './landing.js';

const footprints=new Map();

export async function buildBay(theme,id,board,shadowGeometry,shadowMaterial) {
  const root=new THREE.Group();
  const clawShadow=createClawShadow();
  const [setGate]=await Promise.all([
    furnishBay(root,theme,clawShadow,id),
    preparePrizes(POOLS[id])
  ]);
  const updateCrane=makeCrane(root,clawShadow,theme);
  const prizes=group(root);
  const toys=Array(STALLS.length).fill(null);
  const parked={...HOME,open:.22,swayX:0,swayZ:0};
  let layoutChanged=true;

  function remove(index) {
    const toy=toys[index];
    if(!toy)return;
    prizes.remove(toy.model);
    root.remove(toy.shadow);
    toys[index]=null;layoutChanged=true;
  }
  function put(index,kind,stall,refilling=false,target=board) {
    remove(index);
    const model=PRIZES[kind].make();
    if(!footprints.has(kind)){
      const box=new THREE.Box3().setFromObject(model);
      footprints.set(kind,{cx:(box.max.x+box.min.x)/2,cz:(box.max.z+box.min.z)/2,
        hx:(box.max.x-box.min.x)/2,hz:(box.max.z-box.min.z)/2});
    }
    const shape=footprints.get(kind),grip=model.userData.grip;
    if(refilling){
      stall=refillPose(stall,{shape,grip},toys);
      if(!stall){target.slots[index]=null;return null;}
      target.poses[index]=stall;
    }
    model.traverse(mesh=>{
      if(mesh.isMesh)mesh.material=Array.isArray(mesh.material)?mesh.material.map(clawShadow.receiver):clawShadow.receiver(mesh.material);
    });
    const ca=Math.cos(stall.angle),sa=Math.sin(stall.angle);
    const sx=stall.x+shape.cx*ca+shape.cz*sa,sz=stall.z-shape.cx*sa+shape.cz*ca-.10;
    const shadow=part(root,shadowGeometry,shadowMaterial,sx,.016,sz);
    const shadowScale={x:THREE.MathUtils.clamp(shape.hx*2.55,.88,2.35),z:THREE.MathUtils.clamp(shape.hz*2.55,.84,2.15)};
    const shadowSize=Math.max(shadowScale.x,shadowScale.z);
    shadow.rotation.y=stall.angle;shadow.scale.set(shadowScale.x,1,shadowScale.z);
    model.position.set(stall.x,FLOOR,stall.z);model.rotation.y=stall.angle;
    model.userData.slot=index;prizes.add(model);
    const toy={kind,model,shadow,shape,grip,height:model.userData.height,size:model.scale.x,shadowSize,shadowScale,stall,baseAngle:stall.angle};
    toy.lastShadowMatrix=new THREE.Matrix4();
    toys[index]=toy;layoutChanged=true;
    return toy;
  }
  function sync(state=board) {
    state.slots.forEach((kind,i)=>{
      if(!kind){remove(i);return;}
      const stall=state.poses[i]??poseFor(id,i,state.generations[i]),toy=toys[i];
      if(!toy||toy.kind!==kind||toy.stall.x!==stall.x||toy.stall.z!==stall.z||toy.stall.angle!==stall.angle)put(i,kind,stall);
    });
  }
  function shadowsChanged(){
    let changed=layoutChanged;layoutChanged=false;
    for(const toy of toys){
      if(!toy)continue;
      const model=toy.model;
      model.updateMatrix();
      if(model.visible!==toy.shadowVisible||!toy.lastShadowMatrix.equals(model.matrix)){
        toy.shadowVisible=model.visible;toy.lastShadowMatrix.copy(model.matrix);changed=true;
      }
    }
    return changed;
  }
  function park(offset) {
    const weight=THREE.MathUtils.smoothstep(Math.abs(offset),0,.93);
    parked.x=THREE.MathUtils.lerp(HOME.x,offset>0?-3.31:3.31,weight);
    updateCrane(parked,false);
  }
  function dispose(){
    for(let i=0;i<toys.length;i++)remove(i);
    setGate.dispose?.();
    root.clear();
  }
  sync();park(0);
  return {root,toys,prizes,setGate,updateCrane,sync,park,put,remove,shadowsChanged,dispose};
}
