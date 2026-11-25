import assert from 'node:assert/strict';
import {planSlip,fits} from '../web/landing.js';
import {motionType,hangingAngle,squash} from '../web/toy-motion.js';
import {recoverShelf,awardToy,takeToy,moveToy,acceptRequest} from '../web/keepsakes.js';
const profiles=['racer','fire','rover','plane','bluey'];
const pool=['racer','fire','plane','bluey','crane','scooter'];
const makeBoard=()=>({slots:[...pool],generations:Array(6).fill(0),poses:Array(6).fill(null),round:5,total:11,clears:0,shelf:recoverShelf(null,pool)});
const b=makeBoard();b.shelf.request='accepted';
assert.equal(awardToy(b,'town',1,'fire',0),true);assert.equal(b.round,6);assert.equal(b.clears,1);
assert.equal(awardToy(b,'town',1,'fire',0),false);assert.equal(b.total,12);
assert.equal(b.shelf.request,'delivery');assert.equal(takeToy(b,'town','fire'),true);assert.equal(takeToy(b,'town','fire'),false);
assert.equal(b.shelf.owned.fire,1);assert.equal(b.shelf.request,'complete');
assert.equal(moveToy(b.shelf,'fire',1),false);
let seed=67801;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const samples={};
for(const id of profiles){
  samples[id]=0;
  for(let i=0;i<240;i++){
    const yaw=rand()*Math.PI*2,start={x:1.1,z:.1,angle:yaw};
    const toy={kind:id,shape:{cx:0,cz:0,hx:.75,hz:.32},grip:{x:0,z:0},size:1,stall:start,
      model:{position:{x:start.x,z:start.z},rotation:{y:yaw},scale:{set(x,y,z){Object.assign(this,{x,y,z});}}}};
    const plan=planSlip(toy,[toy],toy.model.position,rand);assert.ok(fits(plan.end,toy,[toy]));
    if(motionType(id)==='wheels'){
      const dx=plan.end.x-plan.release.x,dz=plan.end.z-plan.release.z,d=Math.hypot(dx,dz);
      if(d>.01){
        const acrossAxle=id==='rover'?dx*Math.cos(yaw)-dz*Math.sin(yaw):dx*Math.sin(yaw)+dz*Math.cos(yaw);
        assert.ok(Math.abs(acrossAxle)/d<.121);samples[id]++;
      }
    }else if(id==='plane'){
      const tilt=hangingAngle(toy,{x:start.x-.35*Math.cos(yaw),z:start.z+.35*Math.sin(yaw)});
      assert.ok(tilt<-.2);samples[id]++;
    }else{
      squash(toy,.14);assert.ok(toy.model.scale.y<1&&toy.model.scale.x>1);squash(toy,0);assert.equal(toy.model.scale.y,1);samples[id]++;
    }
  }
  assert.ok(samples[id]>200);
}
console.log(JSON.stringify({samples,sixthPrizeOnce:true,missionAndShelfAfterSix:true}));
const waiting={shelf:recoverShelf({pending:{fire:1}},pool,'town')};
assert.ok(acceptRequest(waiting,'town'));assert.equal(waiting.shelf.request,'delivery');
assert.ok(takeToy(waiting,'town','fire'));assert.equal(waiting.shelf.request,'complete');
assert.equal(recoverShelf({pending:{fire:1},request:'accepted'},pool,'town').request,'delivery');
