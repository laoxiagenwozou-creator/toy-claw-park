const wheels=new Set(['fire','racer','crane','bus','tipper','icecream','convertible','scooter','rover','sheriffCar']);
const hard=new Set(['plane','helicopter','rocket','satellite','robot','lander','astronaut','fern','honey','coralBud','bells','moss','moon','sheriffGlass','sheriffRadio','webTrace']);
export const motionType=id=>wheels.has(id)?'wheels':id==='plane'||id==='helicopter'?'air':hard.has(id)?'solid':'soft';
export const surfaceSound=id=>motionType(id)==='soft'?'soft':'hard';
export function hangingAngle(toy,arm){
  const yaw=toy.model.rotation.y,dx=arm.x-toy.model.position.x,dz=arm.z-toy.model.position.z;
  const offset=(dx*Math.cos(yaw)-dz*Math.sin(yaw))/Math.max(.2,toy.shape.hx);
  const profile=motionType(toy.kind);
  return Math.max(-1,Math.min(1,offset))*(profile==='air'?.82:profile==='wheels'?.40:.18);
}
export function squash(toy,amount){
  toy.model.scale.set(toy.size*(1+amount*.40),toy.size*(1-amount),toy.size*(1+amount*.48));
}
