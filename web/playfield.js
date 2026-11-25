export const ROOF=7.72;
export const HOME={x:-.78,y:5.48,z:-.38};
export const LIMIT={left:-4.62,right:4.46,front:2.48,back:-3.72};
export const CHUTE={x:-3.72,z:1.78,w:1.92,d:1.48};
export const GATE={x:4.16,y:1.08,z:-3.98,lip:-3.40};
export const FLOOR=.035;
const pads=[
  [-1.49,1.47,.42],[1.01,1.40,-.48],[-3.56,-1.86,.56],
  [-.67,-2.36,-.43],[3.53,1.22,-.52],[2.12,-2.13,.37],
];
export const STALLS=pads.map(([x,z,angle])=>({x,z,angle}));
const snowAngles=[.38,-.42,1.29,-1.94,-.52,.73];
const cars=[-2.57,-.47,-.91,-2.49,-2.60,-.20];
export function poseFor(theme,id,generation) {
  const pad=STALLS[id], yaw=theme==='town'?cars[id]:theme==='snow'?snowAngles[id]:pad.angle;
  if(!generation)return {...pad,angle:yaw};
  const wave=(n)=>Math.sin(n*12.9898+id*46.762+generation*17.31);
  return {x:pad.x+.21*wave(1),z:pad.z+.16*wave(2),angle:yaw+.64*wave(3)};
}
