import assert from 'node:assert/strict';
import {fits,planSlip,refillPose} from '../web/landing.js';
import {poseFor} from '../web/playfield.js';

let seed=42;
const random=()=>((seed=Math.imul(1664525,seed)+1013904223>>>0)/4294967296);
const toys=Array.from({length:6},(_,i)=>{
  const p=poseFor('snow',i,0);
  return {slot:i,stall:p,shape:{cx:0,cz:0,hx:.58,hz:.50},grip:{x:0,z:.08},model:{position:{x:p.x,z:p.z},rotation:{y:p.angle}}};
});
let carried=0,rolled=0,longest=0;
const quadrants=new Set();
for(let trial=0;trial<1600;trial++){
  const t=toys[trial%6],arm=t.model.position,plan=planSlip(t,toys,arm,random);
  assert.ok(fits(plan.end,t,toys));
  const d=Math.hypot(plan.end.x-arm.x,plan.end.z-arm.z);
  longest=Math.max(longest,d);assert.ok(d>.01||Math.abs(plan.end.angle-t.stall.angle)>.01);
  if(plan.lift)carried++;else rolled++;
  quadrants.add(Math.sign(plan.end.x-arm.x)+','+Math.sign(plan.end.z-arm.z));
}
assert.ok(carried>400&&rolled>400&&longest>3&&quadrants.size===4);
const preferred=toys[2].stall,extra={shape:toys[0].shape,grip:toys[0].grip};
const opened=refillPose(preferred,extra,toys);
assert.ok(opened&&fits(opened,extra,toys));assert.notDeepEqual(opened,preferred);
console.log(JSON.stringify({trials:1600,carried,rolled,longestTravel:+longest.toFixed(2),directions:quadrants.size,refillFoundFreeSpace:true}));
