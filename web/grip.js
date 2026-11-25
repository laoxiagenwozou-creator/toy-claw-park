export const DEFAULT_CATCH_PERCENT=30;
// An open finger can still reach a grip that the carriage isn't exactly over.
const fingerReach=.35;

// Find one reachable toy before rolling once. An empty drop never spends a roll.
export function contactAt(arm,toys,percent=DEFAULT_CATCH_PERCENT,random=Math.random){
  let best=null;
  toys.forEach((toy,id)=>{
    if(!toy)return;
    const p=toy.model.position,g=toy.model.userData.grip,a=toy.model.rotation.y,c=Math.cos(a),s=Math.sin(a);
    const dx=arm.x-p.x,dz=arm.z-p.z;
    const localX=dx*c-dz*s-g.x,localZ=dx*s+dz*c-g.z;
    const d=Math.hypot(localX/(g.rx+fingerReach),localZ/(g.rz+fingerReach));
    if(d<=1&&(!best||d<best.distance))best={id,distance:d,height:p.y+g.y};
  });
  if(best)best.hold=random()*100<percent;
  return best;
}
