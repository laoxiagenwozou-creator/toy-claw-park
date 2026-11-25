import {group,oval,box,tube,torus,rod,profile,paint} from './parts.js';
import {bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';

const white='#f4ecd8',blue='#5188aa',ink='#354966',red='#eb795f',gold='#efba5c',mint='#7db8b7';
function porthole(p,x,y,z,r){
  const rim=torus(p,white,r,.028,x,y,z);bead(p,'#446a88',r*.94,r*.94,.038,x,y,z);
  bead(p,'#b7edf1',r*.36,r*.15,.012,x-r*.25,y+r*.3,z+.039).rotation.z=.57;
}
function rocket(p){
  loft(p,white,[[.2,.155,.155],[.27,.23,.23],[.52,.313,.313],[.82,.302,.302],[1.02,.228,.228],[1.23,.06,.06]]);
  loft(p,red,[[1.00,.233,.233],[1.12,.175,.175],[1.24,.085,.085],[1.32,.01,.01]]);
  tube(p,ink,.17,.225,.155,0,.18,0);tube(p,gold,.219,.216,.065,0,.107,0);
  porthole(p,0,.76,.293,.123);
  for(let i=0;i<3;i++){
    const fin=group(p);fin.rotation.y=.88+i*2*Math.PI/3;
    profile(fin,mint,[[.16,.35],[.23,.53],[.36,.42],[.46,.06],[.39,.066],[.29,.23]],.098);
    oval(fin,ink,.076,.031,.074,.39,.058,0);
  }
}
function astronaut(p){
  const pack=box(p,'#a6b9bf',.51,.48,.27,0,.59,-.197,.085);
  for(const s of [-1,1]){
    tube(p,white,.112,.118,.25,s*.13,.223,0);box(p,blue,.255,.13,.31,s*.132,.10,.047,.054);
    const arm=group(p,s*.228,.72,0);arm.rotation.z=s*(s<0?-1.91:.20);
    oval(arm,white,.106,.193,.123,s*.038,-.12,0);oval(arm,gold,.105,.102,.105,s*.058,-.277,.022);
  }
  box(p,white,.48,.48,.32,0,.53,.02,.119);box(p,blue,.247,.15,.049,0,.58,.18,.03);
  for(let i=0;i<3;i++)bead(p,[red,gold,mint][i],.021,.022,.012,-.066+i*.064,.605,.211);
  tube(p,ink,.214,.222,.067,0,.796,0);
  oval(p,white,.335,.324,.312,0,1.025,0);oval(p,'#50718a',.271,.227,.12,0,1.035,.226);
  oval(p,'#a9d5d2',.096,.033,.019,-.095,1.119,.327).rotation.z=.37;
  box(p,red,.096,.06,.15,.305,1.02,-.008);
}
function panel(p,x,y){
  box(p,'#e5c16e',.57,.058,.49,x,y,0,.025);box(p,'#596d9c',.52,.065,.45,x,y+.012,0,.017);
  for(const a of [-.15,0,.15])box(p,'#90aaca',.009,.008,.432,x+a,y+.047,0,0);
  for(const z of [-.12,.02,.16])box(p,'#9bb1cb',.507,.007,.009,x,y+.047,z,0);
}
function satellite(p){
  box(p,gold,.47,.44,.43,0,.51,0,.045);
  for(const s of [-1,1]){rod(p,white,[s*.15,.58,0],[s*.47,.58,0],.038);panel(p,.66*s,.58);}
  for(const s of [-1,1])bead(p,white,.057,.067,.05,s*.13,.50,.216);
  const dish=group(p,0,.77,-.03);dish.rotation.x=.50;
  loft(dish,white,[[0,.042,.042],[.045,.12,.12],[.10,.225,.225],[.12,.237,.237],[.13,.207,.207]],{steps:2});
  rod(dish,blue,[0,.11,0],[0,.25,0],.017);bead(dish,gold,.038,.039,.038,0,.25,0);
  tube(p,blue,.085,.13,.13,0,.24,0);
}
function rover(p){
  box(p,white,.52,.24,.79,0,.29,0,.06);box(p,gold,.45,.10,.56,0,.46,-.046,.03);
  for(const s of [-1,1])for(const z of [-.31,0,.31]){
    const wheel=tube(p,ink,.14,.14,.105,s*.336,.15,z,16);wheel.rotation.z=Math.PI/2;
    const hub=tube(p,'#a8b8b9',.066,.066,.118,s*.345,.15,z,12);hub.rotation.z=Math.PI/2;
  }
  for(const s of [-1,1])rod(p,blue,[s*.31,.17,-.32],[s*.31,.33,.19],.032);
  rod(p,ink,[.08,.46,.15],[.08,.78,.15],.045);
  box(p,white,.305,.15,.195,.08,.82,.16,.054);
  for(const x of [-.003,.147])bead(p,'#425a75',.050,.050,.022,x,.831,.261);
  const antenna=group(p,-.14,.45,-.25);rod(antenna,blue,[0,0,0],[-.04,.21,0],.018);bead(antenna,red,.029,.029,.029,-.04,.22,0);
}
function lander(p){
  loft(p,gold,[[.22,.23,.23],[.34,.303,.303],[.42,.29,.29],[.47,.20,.20]],{sides:8});
  box(p,white,.35,.33,.35,0,.606,.01,.054);box(p,ink,.225,.145,.03,0,.655,.19,.026);
  tube(p,blue,.092,.13,.12,0,.20,0);
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,s=Math.sin(a),c=Math.cos(a);
    rod(p,gold,[s*.19,.38,c*.19],[s*.44,.095,c*.44],.031);
    rod(p,white,[s*.24,.24,c*.24],[s*.40,.16,c*.40],.016);oval(p,ink,.11,.031,.11,s*.45,.064,c*.45);
  }
  rod(p,ink,[-.09,.72,-.04],[-.12,.91,-.04],.014);bead(p,red,.048,.048,.048,-.12,.91,-.04);
}
function robot(p){
  for(const s of [-1,1]){
    box(p,ink,.118,.19,.14,s*.135,.199,0,.039);box(p,mint,.20,.12,.23,s*.139,.082,.045,.046);
    const arm=group(p,s*.24,.53,0);arm.rotation.z=s*-.42;
    tube(arm,'#aebfc1',.062,.067,.18,s*.02,-.091,0);bead(arm,gold,.089,.09,.077,s*.02,-.191,0);
  }
  box(p,mint,.399,.34,.25,0,.436,0,.079);box(p,white,.251,.155,.035,0,.452,.132,.023);
  for(const s of [-1,1])bead(p,s<0?red:blue,.039,.039,.016,s*.067,.468,.155);
  tube(p,ink,.078,.08,.10,0,.638,0);
  box(p,white,.46,.32,.32,0,.824,0,.089);box(p,ink,.355,.157,.039,0,.84,.154,.058);
  for(const s of [-1,1])bead(p,'#a8eadb',.038,.048,.019,s*.091,.844,.181);
  rod(p,blue,[0,.95,0],[.045,1.094,0],.018);bead(p,red,.043,.043,.043,.046,1.102,0);
}
const pieces={
  rocket:['小火箭',rocket,1.70,[0,.78,0,.177,.177]],astronaut:['宇航员',astronaut,1.60,[0,.79,-.024,.159,.16]],
  rover:['月球车',rover,1.22,[0,.43,-.07,.13,.17]],satellite:['人造卫星',satellite,1.32,[0,.58,0,.159,.15]],
  lander:['登月舱',lander,1.42,[0,.51,0,.135,.14]],robot:['探险机器人',robot,1.54,[0,.67,0,.14,.15]],
};
export const SPACE=Object.fromEntries(Object.entries(pieces).map(([id,[name,make,height,grip]])=>
  [id,{name,make:collectable(make,{height,width:1.94,grip})}]));
