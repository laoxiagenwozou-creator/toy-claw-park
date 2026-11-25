import {THREE} from '../web/parts.js';
import {PRIZES,POOLS,preparePrizes} from '../web/library.js';
import {LIMIT,poseFor} from '../web/playfield.js';
import {contactAt} from '../web/grip.js';
import {deliver} from '../web/stock.js';
window.checkSculpts=async()=>{
  const results=[];
  for(const pool of [[],['fire'],['fire','plane'],['fire','plane','scooter','crane']]){
    const b={slots:Array(6).fill(null),poses:Array(6).fill(null),generations:Array(6).fill(0),next:0};
    const batch=deliver(b,pool);
    if(batch.map(p=>p.kind).join()!==pool.join()||deliver(b,pool).length)
      throw Error('A short pool did not refill with each available toy exactly once');
  }
  for(const [theme,ids] of Object.entries(POOLS)){
    await preparePrizes(ids);
    for(const [index,id] of ids.entries()){
      const m=PRIZES[id].make(),box=new THREE.Box3().setFromObject(m),s=box.getSize(new THREE.Vector3()),g=m.userData.grip;
      if(Math.min(...s.toArray())<=.18||g.y<=0||g.y>m.userData.height+.001)throw Error(id+' lacks depth or valid grip');
      let triangles=0,meshes=0;m.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;meshes++;}});
      for(let round=0;round<10;round++){
        const {x,z,angle}=poseFor(theme,index%6,round),c=Math.cos(angle),sn=Math.sin(angle);
        m.position.set(x,0,z);m.rotation.y=angle;
        const ax=x+c*g.x+sn*g.z,az=z-sn*g.x+c*g.z;
        if(ax<LIMIT.left||ax>LIMIT.right||az<LIMIT.back||az>LIMIT.front)throw Error(id+' unreachable');
        const root={model:m};
        if(!contactAt({x:ax,z:az},[root],100)?.hold)throw Error(id+' center fails');
        const edge=g.rx+.19,off=g.rx+.42;
        const finger={x:ax+edge*c,z:az-edge*sn};
        if(!contactAt(finger,[root],30,()=>.299)?.hold)throw Error(id+' open fingers miss a reachable toy');
        if(contactAt(finger,[root],30,()=>.30)?.hold!==false)throw Error(id+' slip outcome missing');
        if(contactAt({x:ax+off*c,z:az-off*sn},[root],100))throw Error(id+' grabbed through empty space');
      }
      results.push({theme,id,meshes,triangles:Math.round(triangles),width:+s.x.toFixed(2),height:+s.y.toFixed(2),depth:+s.z.toFixed(2)});
    }
  }
  return results;
};
