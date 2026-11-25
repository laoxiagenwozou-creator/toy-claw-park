import {CHUTE,LIMIT} from './playfield.js';
import {motionType} from './toy-motion.js';

const tau=Math.PI*2;
const basin={left:-5.35,right:5.35,back:-4.18,front:2.93};
const chute={x:CHUTE.x,z:CHUTE.z,hx:CHUTE.w/2,hz:CHUTE.d/2,c:1,s:0};

function footprint(pose,shape){
  const c=Math.cos(pose.angle),s=Math.sin(pose.angle);
  return {x:pose.x+shape.cx*c+shape.cz*s,z:pose.z-shape.cx*s+shape.cz*c,hx:shape.hx,hz:shape.hz,c,s};
}
function extent(r,x,z){return r.hx*Math.abs(x*r.c-z*r.s)+r.hz*Math.abs(x*r.s+z*r.c);}
function overlaps(a,b){
  const dx=b.x-a.x,dz=b.z-a.z;
  for(const [x,z] of [[a.c,-a.s],[a.s,a.c],[b.c,-b.s],[b.s,b.c]]){
    if(Math.abs(dx*x+dz*z)>=extent(a,x,z)+extent(b,x,z)+.018)return false;
  }
  return true;
}
export function fits(pose,toy,others){
  const rect=footprint(pose,toy.shape),x=extent(rect,1,0),z=extent(rect,0,1);
  if(rect.x-x<basin.left||rect.x+x>basin.right||rect.z-z<basin.back||rect.z+z>basin.front||overlaps(rect,chute))return false;
  const grip=toy.grip,gx=pose.x+grip.x*rect.c+grip.z*rect.s,gz=pose.z-grip.x*rect.s+grip.z*rect.c;
  if(gx<LIMIT.left||gx>LIMIT.right||gz<LIMIT.back||gz>LIMIT.front)return false;
  return others.every(o=>!o||o===toy||!overlaps(rect,footprint(o.stall,o.shape)));
}
export function refillPose(preferred,toy,others){
  if(fits(preferred,toy,others))return preferred;
  // Search outwards from the supply's intended stall, trying both orientations.
  for(let ring=1;ring<=28;ring++){
    const n=ring*7;
    for(let i=0;i<n;i++){
      const a=tau*i/n+ring*.31;
      const x=preferred.x+ring*.36*Math.cos(a),z=preferred.z+ring*.36*Math.sin(a);
      for(const angle of [preferred.angle,preferred.angle+Math.PI/2]){
        const p={x,z,angle};if(fits(p,toy,others))return p;
      }
    }
  }
  return null;
}
export function interpolatePose(a,b,t){
  return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,angle:a.angle+(b.angle-a.angle)*t};
}
export function planSlip(toy,others,arm,random=Math.random){
  const start={x:toy.model.position.x,z:toy.model.position.z,angle:toy.model.rotation.y};
  const carried=random()<.55;
  for(let i=0;i<84;i++){
    const lift=carried&&i<52;
    const fraction=lift?.13+.67*random():0;
    const release={x:start.x+(CHUTE.x-arm.x)*fraction,z:start.z+(CHUTE.z-arm.z)*fraction,angle:start.angle};
    const rolling=motionType(toy.kind)==='wheels',soft=motionType(toy.kind)==='soft'&&!!toy.kind;
    // Most road toys face local X. The six-wheel lunar rover faces local Z.
    const axleHeading=(toy.kind==='rover'?Math.PI/2:0)-start.angle;
    const heading=rolling?axleHeading+(random()<.5?Math.PI:0)+(random()-.5)*.24:tau*random();
    const distance=rolling?.58+1.30*random():soft?.25+.67*random():(lift?.33:.27)+(lift?.99:.78)*random();
    const turn=(random()<.5?-1:1)*(rolling?.16+.35*random():.34+1.42*random());
    const end={x:release.x+distance*Math.cos(heading),z:release.z+distance*Math.sin(heading),angle:start.angle+turn};
    if(!fits(end,toy,others))continue;
    const impact=interpolatePose(release,end,lift?.63:.12);
    // Once on the felt, keep the rolling body clear of the glass, chute and other toys.
    if(![0,.35,.7].every(t=>fits(interpolatePose(impact,end,t),toy,others)))continue;
    return {lift,release,impact,end,turn,lean:Math.cos(heading),height:lift?1.55+random()*2.8:.08+.09*random()};
  }
  for(const turn of [.42,-.42,.22,-.22,0]){
    const end={...start,angle:start.angle+turn};
    if(!turn||fits(end,toy,others))return {lift:false,release:start,impact:start,end,turn,lean:.5,height:.09};
  }
}
