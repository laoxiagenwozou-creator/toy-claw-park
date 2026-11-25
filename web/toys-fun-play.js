import {box,group,oval,paint,profile,rod,torus,tube} from './parts.js';
import {bead,sweep} from './sculpt.js';
import {collectable} from './models.js';

const ink=paint('#2c303c','rubber'),white=paint('#fffaf0'),cream=paint('#f6ebd4');
const gold=paint('#f3c442','chrome'),steel=paint('#c8d4df','chrome'),red=paint('#df4840');

function eyes(p,y,z,sep=.10,r=.026){
  for(const s of [-1,1]){
    bead(p,ink,r,r*1.15,r*.7,s*sep,y,z);
    bead(p,white,r*.34,r*.34,r*.3,s*sep-r*.22,y+r*.30,z+r*.55);
  }
}

// 16) Music Stage
function miniPiano(p){
  const blk=paint('#2b303c');
  box(p,blk,.74,.26,.68,0,.44,0,.06);
  const lid=box(p,blk,.72,.045,.66,0,.68,-.08,.02);lid.rotation.x=-.35;
  box(p,white,.64,.07,.16,0,.38,.32,.015);
  for(let i=-2;i<=2;i++)box(p,ink,.045,.045,.10,i*.11,.425,.29,.008);
  for(const [x,z] of [[-.28,.24],[.28,.24],[0,-.26]])tube(p,blk,.04,.03,.32,x,.16,z,10);
}
function acousticGuitar(p){
  const wood=paint('#d88f46'),dark=paint('#5a361d');
  oval(p,wood,.32,.28,.14,0,.32,0);
  oval(p,wood,.24,.22,.14,0,.58,0);
  oval(p,dark,.10,.10,.04,0,.52,.13);
  box(p,dark,.10,.56,.06,0,.96,0,.02);
  box(p,wood,.14,.16,.06,0,1.26,0,.02);
  box(p,dark,.28,.06,.18,0,.04,0,.02);
}
function jazzDrum(p){
  tube(p,red,.36,.36,.40,0,.24,0,26);
  tube(p,white,.37,.37,.05,0,.44,0,26);
  tube(p,steel,.38,.38,.05,0,.05,0,26);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;rod(p,gold,[Math.sin(a)*.37,.06,Math.cos(a)*.37],[Math.sin(a+.5)*.37,.43,Math.cos(a+.5)*.37],.014,6);}
  rod(p,paint('#d8a056'),[-.32,.56,.08],[.28,.48,-.06],.018,8);
  rod(p,paint('#d8a056'),[-.28,.48,-.08],[.32,.56,.06],.018,8);
}
function goldTrumpet(p){
  const body=tube(p,gold,.045,.045,.66,-.04,.34,0,14);body.rotation.z=Math.PI/2;
  const bell=tube(p,gold,.05,.20,.26,.40,.34,0,20);bell.rotation.z=Math.PI/2;
  const loop=torus(p,gold,.10,.032,-.06,.24,0);loop.rotation.x=0;
  for(const x of [-.14,-.05,.04])tube(p,steel,.024,.024,.16,x,.44,0,10);
  box(p,paint('#3b4658'),.42,.08,.26,0,.04,0,.025);
}
function miniViolin(p){
  const wood=paint('#b85c2c'),dark=paint('#362218');
  oval(p,wood,.26,.24,.12,0,.30,0);
  oval(p,wood,.20,.20,.12,0,.56,0);
  box(p,dark,.07,.54,.05,0,.92,0,.018);
  box(p,dark,.24,.06,.16,0,.04,0,.02);
  rod(p,paint('#e2b678'),[.22,.08,.10],[.34,1.06,.10],.014,6);
}
function xylophone(p){
  const frame=paint('#6e482c');
  box(p,frame,.94,.12,.48,0,.10,0,.03);
  const cols=['#e64c44','#f29038','#f6ca3e','#56ba68','#48a0e6','#8a64d0'];
  cols.forEach((c,i)=>{
    const x=-.36+i*.144,d=.46-i*.035;
    box(p,paint(c),.11,.06,d,x,.20,0,.02);
  });
  rod(p,woodMat('#d8a056'),[-.32,.30,.24],[.12,.28,.12],.016,6);
  oval(p,red,.05,.05,.05,.14,.28,.12);
}
function woodMat(c){return paint(c);}

// 17) Active Sports stage
function soccerBall(p){
  oval(p,white,.40,.40,.40,0,.42,0);
  for(const [x,y,z] of [[0,.42,.38],[.34,.52,.14],[-.34,.52,.14],[.22,.18,.28],[-.22,.18,.28],[0,.78,.06],[0,.42,-.38]])
    oval(p,ink,.10,.10,.06,x,y,z);
}
function basketball(p){
  const org=paint('#eb7428');
  oval(p,org,.40,.40,.40,0,.42,0);
  torus(p,ink,.395,.018,0,.42,0).rotation.x=Math.PI/2;
  torus(p,ink,.395,.018,0,.42,0).rotation.y=Math.PI/2;
}
function goldTrophy(p){
  const base=paint('#4a3424');
  box(p,base,.40,.16,.40,0,.08,0,.03);
  tube(p,gold,.07,.12,.22,0,.26,0,18);
  tube(p,gold,.30,.14,.42,0,.58,0,24);
  for(const s of [-1,1])torus(p,gold,.13,.035,s*.28,.62,0);
  oval(p,gold,.08,.08,.04,0,.58,.24);
}
function shuttleSet(p){
  const blu=paint('#3b8ce0');
  oval(p,white,.12,.11,.12,.24,.12,0);
  tube(p,white,.18,.09,.28,.24,.30,0,16);
  tube(p,red,.10,.10,.04,.24,.18,0,16);
  // Mini racket standing next to shuttlecock
  tube(p,blu,.032,.036,.38,-.18,.20,0,10);
  torus(p,blu,.24,.032,-.18,.62,0);
  oval(p,paint('#e6f4ff','glass'),.22,.22,.02,-.18,.62,0);
  box(p,paint('#569e66'),.66,.06,.34,0,.03,0,.02);
}
function skateboard(p){
  const deck=paint('#48a8e2'),stripe=paint('#f6c43c');
  box(p,deck,.96,.065,.34,0,.18,0,.03);
  box(p,stripe,.68,.07,.12,0,.185,0,.02);
  for(const x of [-.28,.28])for(const s of [-1,1]){
    const w=tube(p,red,.08,.08,.06,x,.08,s*.16,14);w.rotation.x=Math.PI/2;
  }
}
function boxingGlove(p){
  oval(p,red,.34,.32,.30,0,.48,0);
  oval(p,red,.14,.16,.14,.28,.38,.14);
  tube(p,white,.20,.22,.22,0,.14,0,20);
  box(p,gold,.20,.08,.06,0,.14,.21,.015);
}

// 18) Starry Camp stage
function campTent(p){
  const org=paint('#ef8238'),trim=paint('#f6d468'),dark=paint('#2d3e52');
  profile(p,org,[[-.46,0],[0,.74],[.46,0]],.72,0,.04,0,.03);
  profile(p,dark,[[-.22,0],[0,.42],[.22,0]],.06,0,.04,.35,.01);
  box(p,trim,.96,.06,.76,0,.03,0,.02);
}
function campfire(p){
  const log=paint('#7a4b2a'),fire=paint('#f57c2c'),core=paint('#ffe058');
  for(let i=0;i<4;i++){const a=i*Math.PI/4;const l=tube(p,log,.07,.07,.72,0,.09,0,12);l.rotation.z=Math.PI/2;l.rotation.y=a;}
  oval(p,fire,.24,.34,.24,0,.36,0);
  oval(p,core,.14,.24,.14,0,.32,.04);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;oval(p,paint('#7d8794'),.10,.08,.09,Math.cos(a)*.38,.08,Math.sin(a)*.38);}
}
function campLantern(p){
  const grn=paint('#388662'),glow=paint('#fff0a0');
  tube(p,grn,.26,.30,.16,0,.10,0,20);
  tube(p,glow,.20,.20,.36,0,.36,0,20);
  tube(p,grn,.14,.28,.16,0,.62,0,20);
  torus(p,steel,.16,.024,0,.74,0);
  for(const s of [-1,1])rod(p,steel,[s*.23,.18,0],[s*.23,.56,0],.018,6);
}
function backpack(p){
  const blu=paint('#3c84c8'),pkt=paint('#f2b644');
  box(p,blu,.54,.68,.34,0,.38,0,.10);
  box(p,pkt,.40,.28,.14,0,.24,.20,.05);
  torus(p,paint('#2c5c8a'),.12,.03,0,.74,0);
  for(const s of [-1,1])box(p,paint('#2c5c8a'),.09,.48,.08,s*.16,.38,-.19,.03);
}
function marshmallow(p){
  const stick=paint('#9e6c3e'),toast=paint('#e6b676');
  box(p,paint('#6c5644'),.36,.07,.28,0,.04,0,.025);
  tube(p,stick,.025,.03,.86,0,.46,0,10);
  tube(p,white,.18,.18,.22,0,.62,0,20);
  tube(p,toast,.17,.17,.22,0,.86,0,20);
  eyes(p,.62,.18,.07,.022);
}
function compass(p){
  const dial=paint('#fff9eb');
  tube(p,gold,.38,.38,.18,0,.12,0,28);
  tube(p,dial,.32,.32,.19,0,.125,0,26);
  box(p,red,.06,.04,.24,0,.23,.08,.01);
  box(p,paint('#3468b4'),.06,.04,.24,0,.23,-.08,.01);
  torus(p,gold,.10,.028,0,.16,-.44).rotation.x=Math.PI/2;
}

// 19) Happy Circus stage
function circusBear(p){
  const brn=paint('#a86c3c'),ball=paint('#e24c48');
  oval(p,ball,.28,.26,.28,0,.26,0);
  torus(p,gold,.27,.03,0,.26,0).rotation.x=Math.PI/2;
  oval(p,brn,.24,.26,.22,0,.64,0);
  oval(p,brn,.20,.19,.20,0,.96,0);
  oval(p,cream,.09,.07,.09,0,.91,.16);
  eyes(p,.99,.18,.08,.024);
  for(const s of [-1,1]){
    oval(p,brn,.07,.07,.05,s*.16,1.12,0);
    oval(p,brn,.08,.15,.08,s*.26,.68,0).rotation.z=s*.6;
  }
}
function clownHat(p){
  const blu=paint('#4a8ce0'),yel=paint('#f6cc3c');
  tube(p,yel,.40,.42,.08,0,.06,0,26);
  tube(p,blu,.05,.30,.66,0,.42,0,24);
  oval(p,red,.12,.12,.12,0,.78,0);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(p,paint(i%2?'#f68bb1':'#f6cc3c'),.055,.055,.04,Math.sin(a)*.23,.30,Math.cos(a)*.23);}
  eyes(p,.26,.27,.10,.026);
}
function circusTent(p){
  tube(p,white,.42,.42,.42,0,.22,0,24);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;box(p,red,.12,.42,.06,Math.sin(a)*.41,.22,Math.cos(a)*.41,.01).rotation.y=a;}
  tube(p,red,.03,.48,.48,0,.66,0,24);
  tube(p,gold,.02,.02,.20,0,.96,0,8);
  box(p,gold,.16,.10,.03,.08,1.00,0,.01);
}
function unicycle(p){
  const wheel=torus(p,ink,.26,.065,0,.30,0);wheel.rotation.y=0;
  torus(p,steel,.20,.025,0,.30,0);
  rod(p,red,[0,.30,-.06],[0,.78,0],.03,8);
  rod(p,red,[0,.30,.06],[0,.78,0],.03,8);
  box(p,gold,.26,.09,.16,0,.82,0,.04);
  box(p,paint('#569e66'),.34,.06,.26,0,.03,0,.02);
}
function magicHatRabbit(p){
  const hat=paint('#2c303d');
  tube(p,hat,.40,.40,.06,0,.04,0,24);
  tube(p,hat,.30,.28,.44,0,.26,0,24);
  tube(p,red,.29,.29,.08,0,.14,0,24);
  oval(p,white,.24,.22,.24,0,.58,0);
  for(const s of [-1,1]){
    oval(p,white,.07,.22,.05,s*.11,.88,0).rotation.z=s*-.12;
    oval(p,paint('#f6a6b8'),.04,.15,.04,s*.11,.88,.03).rotation.z=s*-.12;
  }
  eyes(p,.62,.22,.09,.026);
}
function hotBalloon(p){
  const basket=paint('#b0743c');
  box(p,basket,.26,.20,.26,0,.11,0,.03);
  for(const sx of [-1,1])for(const sz of [-1,1])rod(p,cream,[sx*.10,.20,sz*.10],[sx*.16,.44,sz*.16],.014,6);
  const cols=['#e64c48','#f5be35','#4aa8e8','#64c278'];
  for(let i=0;i<8;i++){const a=i*Math.PI/4;oval(p,paint(cols[i%4]),.20,.36,.20,Math.sin(a)*.17,.74,Math.cos(a)*.17);}
}

// 20) Dream Amusement Park stage
function ferrisWheel(p){
  const pink=paint('#f07aa6');
  for(const s of [-1,1]){
    rod(p,steel,[-.28,.04,s*.14],[0,.62,s*.08],.032,8);
    rod(p,steel,[.28,.04,s*.14],[0,.62,s*.08],.032,8);
  }
  box(p,paint('#4a6c8e'),.66,.07,.38,0,.04,0,.02);
  torus(p,pink,.40,.035,0,.62,0);
  const cols=['#f5be35','#58b8e6','#68c878','#f27a68','#b084e6','#f89eb8'];
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3,x=Math.cos(a)*.40,y=.62+Math.sin(a)*.40;
    rod(p,gold,[0,.62,0],[x,y,0],.016,6);
    box(p,paint(cols[i]),.13,.13,.14,x,y,0,.03);
  }
}
function carouselHorse(p){
  const pink=paint('#f7a4c2'),base=paint('#5a92d6');
  tube(p,base,.36,.40,.10,0,.06,0,24);
  tube(p,gold,.032,.032,.96,0,.52,0,12);
  oval(p,white,.32,.18,.18,0,.44,0);
  oval(p,pink,.22,.10,.20,0,.50,0);
  tube(p,white,.075,.09,.26,.20,.64,0,12).rotation.z=-.35;
  oval(p,white,.16,.12,.12,.30,.76,0);
  tube(p,red,.04,.38,.20,0,1.02,0,20);
  for(const s of [-1,1])bead(p,ink,.022,.026,.02,.34,.79,s*.10);
}
function coasterCar(p){
  const blu=paint('#3b8ce0'),yel=paint('#f6c438'),dark=paint('#2f3644','satin');
  box(p,dark,.92,.10,.48,0,.14,0,.03);
  for(const x of [-.28,.28])for(const s of [-1,1]){const w=tube(p,ink,.10,.10,.07,x,.10,s*.24,14);w.rotation.x=Math.PI/2;}
  box(p,blu,.90,.28,.50,0,.32,0,.08);
  box(p,yel,.92,.07,.52,0,.34,0,.02);
  box(p,red,.24,.20,.40,-.22,.46,0,.04);
  box(p,red,.24,.20,.40,.18,.46,0,.04);
}
function popcornTub(p){
  tube(p,white,.34,.24,.52,0,.27,0,24);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;box(p,red,.08,.50,.04,Math.sin(a)*.29,.27,Math.cos(a)*.29,.01).rotation.y=a;}
  for(const [x,y,z] of [[0,.58,0],[-.16,.56,.12],[.16,.56,.12],[-.14,.57,-.14],[.14,.57,-.14],[0,.68,.04]])
    oval(p,cream,.13,.12,.13,x,y,z);
  eyes(p,.30,.30,.10,.026);
}
function cottonCandy(p){
  tube(p,white,.035,.04,.44,0,.22,0,12);
  box(p,paint('#f4a6c2'),.24,.06,.22,0,.03,0,.02);
  oval(p,paint('#f89cc4'),.32,.28,.32,0,.58,0);
  oval(p,paint('#92d8f8'),.26,.24,.26,0,.78,0);
  oval(p,paint('#fbe082'),.18,.18,.18,0,.94,0);
  eyes(p,.62,.31,.10,.026);
}
function bumperCar(p){
  const tire=paint('#2c303a','rubber'),body=paint('#e65258'),seat=paint('#f6ca44');
  torus(p,tire,.36,.12,0,.14,0).rotation.x=Math.PI/2;
  oval(p,body,.42,.20,.34,0,.26,0);
  box(p,seat,.24,.22,.28,-.10,.42,0,.05);
  tube(p,steel,.02,.02,.64,-.36,.52,0,8);
  oval(p,gold,.05,.05,.05,-.36,.84,0);
  for(const s of [-1,1])oval(p,cream,.04,.05,.05,.40,.28,s*.16);
}

export const FUN_PLAY={
  miniPiano:{name:'三角小钢琴',make:collectable(miniPiano,{height:1.38,width:1.78,grip:[0,.44,0,.32,.30]})},
  acousticGuitar:{name:'原木小吉他',make:collectable(acousticGuitar,{height:1.68,width:1.25,grip:[0,.56,0,.24,.18]})},
  jazzDrum:{name:'红白小军鼓',make:collectable(jazzDrum,{height:1.28,width:1.68,grip:[0,.32,0,.32,.32]})},
  goldTrumpet:{name:'金色小号',make:collectable(goldTrumpet,{height:1.18,width:1.96,grip:[0,.32,0,.36,.24]})},
  miniViolin:{name:'典雅小提琴',make:collectable(miniViolin,{height:1.66,width:1.26,grip:[0,.52,0,.22,.18]})},
  xylophone:{name:'彩虹木琴',make:collectable(xylophone,{height:1.00,width:2.02,grip:[0,.20,0,.38,.26]})},
  soccerBall:{name:'黑白足球',make:collectable(soccerBall,{height:1.34,width:1.50,grip:[0,.42,0,.32,.32]})},
  basketball:{name:'橙色篮球',make:collectable(basketball,{height:1.34,width:1.50,grip:[0,.42,0,.32,.32]})},
  goldTrophy:{name:'冠军金奖杯',make:collectable(goldTrophy,{height:1.54,width:1.56,grip:[0,.50,0,.28,.26]})},
  shuttleSet:{name:'羽毛球套装',make:collectable(shuttleSet,{height:1.50,width:1.76,grip:[0,.42,0,.32,.24]})},
  skateboard:{name:'涂鸦滑板',make:collectable(skateboard,{height:.88,width:2.04,grip:[0,.22,0,.38,.24]})},
  boxingGlove:{name:'红色拳击套',make:collectable(boxingGlove,{height:1.48,width:1.58,grip:[0,.46,0,.30,.28]})},
  campTent:{name:'三角小帐篷',make:collectable(campTent,{height:1.34,width:1.86,grip:[0,.36,0,.34,.32]})},
  campfire:{name:'温暖篝火堆',make:collectable(campfire,{height:1.28,width:1.76,grip:[0,.32,0,.34,.34]})},
  campLantern:{name:'复古露营灯',make:collectable(campLantern,{height:1.54,width:1.42,grip:[0,.42,0,.26,.26]})},
  backpack:{name:'户外双肩包',make:collectable(backpack,{height:1.52,width:1.50,grip:[0,.44,0,.28,.24]})},
  marshmallow:{name:'烤棉花糖串',make:collectable(marshmallow,{height:1.62,width:1.25,grip:[0,.58,0,.22,.22]})},
  compass:{name:'黄铜指南针',make:collectable(compass,{height:.95,width:1.74,grip:[0,.16,0,.34,.34]})},
  circusBear:{name:'踩球小熊',make:collectable(circusBear,{height:1.68,width:1.44,grip:[0,.60,0,.26,.24]})},
  clownHat:{name:'红鼻小丑帽',make:collectable(clownHat,{height:1.52,width:1.56,grip:[0,.42,0,.30,.30]})},
  circusTent:{name:'红白马戏帐',make:collectable(circusTent,{height:1.58,width:1.68,grip:[0,.46,0,.32,.32]})},
  unicycle:{name:'杂技独轮车',make:collectable(unicycle,{height:1.58,width:1.42,grip:[0,.44,0,.26,.22]})},
  magicHatRabbit:{name:'礼帽魔术兔',make:collectable(magicHatRabbit,{height:1.64,width:1.50,grip:[0,.50,0,.28,.28]})},
  hotBalloon:{name:'彩虹热气球',make:collectable(hotBalloon,{height:1.66,width:1.52,grip:[0,.62,0,.28,.28]})},
  ferrisWheel:{name:'迷你摩天轮',make:collectable(ferrisWheel,{height:1.66,width:1.68,grip:[0,.58,0,.32,.22]})},
  carouselHorse:{name:'旋转木马',make:collectable(carouselHorse,{height:1.66,width:1.56,grip:[0,.54,0,.28,.26]})},
  coasterCar:{name:'过山车座舱',make:collectable(coasterCar,{height:1.14,width:2.02,grip:[0,.32,0,.36,.26]})},
  popcornTub:{name:'焦糖爆米花',make:collectable(popcornTub,{height:1.48,width:1.46,grip:[0,.40,0,.28,.28]})},
  cottonCandy:{name:'彩虹棉花糖',make:collectable(cottonCandy,{height:1.66,width:1.38,grip:[0,.60,0,.26,.26]})},
  bumperCar:{name:'游乐碰碰车',make:collectable(bumperCar,{height:1.32,width:1.86,grip:[0,.34,0,.34,.34]})},
};
