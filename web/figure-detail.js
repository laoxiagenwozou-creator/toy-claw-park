import {group,paint,profile} from './parts.js';
import {bead,sweep} from './sculpt.js';

export const ink=paint('#262433','enamel'),milk=paint('#fffdf6','enamel'),gold=paint('#ffca59','enamel');
export const satin=color=>paint(color,'satin');
export const enamel=color=>paint(color,'enamel');
export function eye(parent,x,y,z,size,{yaw=0,iris='#483449',stretch=1.14,lash=0}={}){
  const socket=group(parent,x,y,z);socket.rotation.y=yaw;
  // Soft dark lash rim framing a glossy sclera, rich colored iris, and dual catchlights.
  bead(socket,ink,size*1.04,size*stretch*1.06,size*.36,0,size*.03,0);
  bead(socket,milk,size,size*stretch,size*.42,0,-size*.01,size*.10);
  bead(socket,enamel(iris),size*.68,size*stretch*.80,size*.26,0,-size*.01,size*.42);
  bead(socket,ink,size*.40,size*stretch*.54,size*.18,0,.002,size*.61);
  bead(socket,milk,size*.22,size*.24,size*.09,-size*.19,size*.34,size*.77);
  bead(socket,milk,size*.10,size*.11,size*.06,size*.20,-size*.26,size*.76);
  if(lash){
    const s=Math.sign(lash);
    sweep(socket,ink,[[-s*size*.75,size*stretch*.62,size*.22],[0,size*stretch*1.02,size*.26],[s*size*.92,size*stretch*.82,size*.20],[s*size*1.26,size*stretch*1.06,size*.12]],
      [size*.08,size*.15,size*.14,size*.05],{sides:7,segments:10});
  }
}
export function line(parent,material,points,thickness){
  const widths=points.map((_,i)=>thickness*((i===0 || i===points.length-1) ? .65 : 1));
  return sweep(parent,material,points,widths,{sides:7,segments:Math.max(6,points.length*3)});
}
export function badge(parent,material,points,x,y,z,depth=.018){
  return profile(parent,material,points,depth,x,y,z,.006);
}
export function star(parent,color,x,y,z,r,points=5){
  const outline=Array.from({length:points*2},(_,i)=>{
    const angle=Math.PI*.5+i*Math.PI/points,rad=i%2?r*.42:r;
    return [rad*Math.cos(angle),rad*Math.sin(angle)];
  });
  return badge(parent,color,outline,x,y,z);
}
export function flower(parent,x,y,z,r,petals=milk){
  for(let i=0;i<5;i++){const a=i*2*Math.PI/5;
    bead(parent,petals,r*.45,r*.54,r*.22,x+Math.sin(a)*r*.56,y+Math.cos(a)*r*.56,z).rotation.z=-a;
  }
  bead(parent,gold,r*.29,r*.29,r*.28,x,y,z+r*.16);
}
