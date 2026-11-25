import assert from 'node:assert/strict';
import {headTracker} from '../web/head-tracking.js';
const tracker=headTracker();
let t=0,i=0;
function feed(x,y,s,rot=90,delay=83){t+=delay;i++;tracker.sample(x,y,s,rot,t);return {...tracker.pose};}
const baseline=()=>feed(.50,.48,.145);
for(let j=0;j<16;j++)baseline();
const swing=[];
for(const period of [1.25,2.6,4.2])for(let j=0;j<96;j++){
  const a=Math.sin(2*Math.PI*(j*.083/period)),skip=j%37===17?475:0;
  const p=feed(.5+.112*a+.0014*Math.cos(j),.48+.002*Math.sin(j*.3),.145*(1-.205*Math.abs(a)+.036*Math.sin(j*1.91)),90,83+skip);
  swing.push(p);
}
assert.equal(Math.min(...swing.map(p=>p.distance)),1);assert.equal(Math.max(...swing.map(p=>p.distance)),1);
assert.ok(Math.max(...swing.map(p=>p.x))>1.4&&Math.min(...swing.map(p=>p.x))< -1.4);
for(let j=0;j<30;j++)assert.equal(feed(.614,.48,.098).distance,1);
for(let j=0;j<16;j++)baseline();
for(let j=0;j<3;j++)assert.equal(feed(.5,.48,.20).distance,1);
for(let j=0;j<18;j++)baseline();
for(let j=0;j<52;j++)feed(.5+.001*Math.sin(j),.48,.145*(1+.24*Math.min(1,j/12))*(1+.009*Math.sin(j)));
const near=tracker.pose.distance;assert.ok(near<.86&&near>.77,'sustained forward motion');
for(let j=0;j<32;j++)baseline();assert.equal(tracker.pose.distance,1);
for(let j=0;j<42;j++)feed(.502,.479,.122);
assert.ok(tracker.pose.distance>1.13,'sustained backwards motion');
const old={...tracker.pose};tracker.sample(.1,.2,.05,90,t-150);assert.deepEqual(tracker.pose,old);
assert.equal(tracker.sample(.1,.2,.05,270,t-160),false);
assert.deepEqual(tracker.pose,old,'an old sample from a different orientation must leave the live pose alone');
for(let j=0;j<22;j++)feed(.60,.45,.12);
tracker.calibrate();assert.deepEqual(tracker.pose,{x:0,y:0,distance:1});
for(let j=0;j<32;j++)feed(.60+.0012*Math.sin(j),.45+.0007*Math.cos(j),.12*(1+.035*Math.sin(j)));
assert.ok(Math.abs(tracker.pose.x)<.024);assert.ok(Math.abs(tracker.pose.y)<.024);assert.equal(tracker.pose.distance,1);
for(let j=0;j<9;j++)feed(.44,.52,.107,270);
assert.deepEqual(tracker.pose,{x:0,y:0,distance:1});
function sideways(span,offset){
  const camera=headTracker();
  for(let j=0;j<24;j++)camera.sample(.5+(j<12?0:offset),.48,span,90,83*j);
  return camera.pose.x;
}
const reach=sideways(.145,.10);
assert.ok(reach>3.2&&reach<3.7,'a normal sideways lean must visibly reveal more of the toys');
assert.ok(Math.abs(sideways(.145,-.10)+reach)<.001,'left/right symmetry');
assert.ok(Math.abs(sideways(.105,.10*.105/.145)-reach)<.03,'match sensitivity at different starting distances');
assert.ok(sideways(.145,.23)>5.75&&sideways(.145,.47)<7.15,'smooth limit at the edge');
console.log('sway samples',swing.length,'depth range',Math.min(...swing.map(p=>p.distance)),Math.max(...swing.map(p=>p.distance)),'x range',Math.min(...swing.map(p=>p.x)).toFixed(2),Math.max(...swing.map(p=>p.x)).toFixed(2),'deliberate near',near.toFixed(3));
console.log('PASS lateral swings, held side pose, dropouts, spikes, stable center, deliberate forward/back, recenter, stale timestamps, rotation.');
