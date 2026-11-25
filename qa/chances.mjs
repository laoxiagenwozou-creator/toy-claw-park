import assert from 'node:assert/strict';
import {contactAt,DEFAULT_CATCH_PERCENT} from '../web/grip.js';

const toy=(x,z)=>({model:{position:{x,y:0,z},rotation:{y:0},userData:{grip:{x:0,z:0,y:1,rx:.24,rz:.19}}}});
const toys=[toy(0,0),toy(.56,0)];
const touching={x:.34,z:.02},empty={x:4,z:0};
let draws=0;
const miss=()=>{draws++;return .30;};
assert.equal(contactAt(empty,toys,100,miss),null);
assert.equal(draws,0);
assert.deepEqual([contactAt(touching,toys,30,miss).id,draws],[1,1]);
assert.equal(contactAt(touching,toys,30,()=>.299999).hold,true);
assert.equal(contactAt(touching,toys,30,()=>.30).hold,false);
assert.equal(contactAt(touching,toys,0,()=>0).hold,false);
assert.equal(contactAt(touching,toys,100,()=>.999999).hold,true);
assert.equal(DEFAULT_CATCH_PERCENT,30);
let seed=41703;
const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const trials=10000;
for(const percent of [20,30,70]){
  let caught=0;
  for(let i=0;i<trials;i++)if(contactAt(touching,toys,percent,next).hold)caught++;
  assert.ok(Math.abs(caught/trials-percent/100)<.015);
  console.log(JSON.stringify({percent,touchingAttempts:trials,caught,slipped:trials-caught}));
}
console.log('PASS one roll per contact, nearest reachable toy, empty space, exact 30% threshold, 0% and 100%.');
