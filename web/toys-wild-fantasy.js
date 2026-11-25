import {box,group,oval,paint,profile,rod,torus,tube} from './parts.js';
import {bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';

const ink=paint('#2c3140','rubber'),white=paint('#fffaf0'),cream=paint('#f7ebd2');
const gold=paint('#f3c442','chrome'),steel=paint('#c2ced9','chrome'),glass=paint('#9edff5','glass');

function eyes(p,y,z,sep=.11,r=.028){
  for(const s of [-1,1]){
    bead(p,ink,r,r*1.15,r*.7,s*sep,y,z);
    bead(p,white,r*.34,r*.34,r*.3,s*sep-r*.24,y+r*.30,z+r*.55);
  }
}

// 11) African Safari stage
function giraffe(p){
  const yel=paint('#f4c454'),spot=paint('#9c5b2b');
  oval(p,yel,.30,.24,.22,-.04,.40,0);
  tube(p,yel,.09,.12,.68,.18,.80,0,16).rotation.z=-.12;
  oval(p,yel,.18,.13,.14,.28,1.14,0);
  for(const s of [-1,1]){
    tube(p,spot,.018,.022,.12,.22,1.28,s*.06,8);
    oval(p,spot,.035,.035,.035,.22,1.34,s*.06);
    bead(p,ink,.024,.028,.02,.32,1.17,s*.11);
    for(const x of [-.20,.14])tube(p,yel,.052,.058,.36,x,.18,s*.14,10);
  }
  for(const [x,y,z] of [[-.08,.48,.19],[.16,.76,.10],[.14,.94,-.09],[-.12,.38,-.19]])oval(p,spot,.065,.055,.04,x,y,z);
}
function lionCub(p){
  const fur=paint('#eab24d'),mane=paint('#b86028');
  oval(p,fur,.32,.26,.24,-.06,.34,0);
  const m=torus(p,mane,.24,.10,.26,.54,0);m.rotation.y=Math.PI/2;
  oval(p,fur,.21,.20,.21,.30,.54,0);
  oval(p,cream,.11,.08,.12,.45,.48,0);
  oval(p,ink,.045,.032,.04,.52,.51,0);
  for(const s of [-1,1]){
    bead(p,ink,.028,.034,.02,.42,.58,s*.12);
    oval(p,fur,.075,.075,.05,.26,.72,s*.18);
    for(const x of [-.24,.16])tube(p,fur,.068,.065,.24,x,.13,s*.16,12);
  }
  sweep(p,fur,[[-.32,.34,0],[-.52,.42,0]],[.035,.03],{segments:8});
  oval(p,mane,.07,.07,.07,-.54,.44,0);
}
function babyElephant(p){
  const gry=paint('#8ca4bc'),ear=paint('#a8bed4'),pink=paint('#ebb0bd');
  oval(p,gry,.38,.30,.30,-.04,.38,0);
  oval(p,gry,.25,.24,.24,.34,.52,0);
  sweep(p,gry,[[.52,.48,0],[.66,.36,0],[.72,.26,0],[.68,.38,0]],[.08,.06,.045,.038],{segments:12});
  for(const s of [-1,1]){
    oval(p,ear,.05,.24,.22,.24,.56,s*.26);
    oval(p,pink,.03,.16,.14,.26,.55,s*.27);
    bead(p,ink,.028,.032,.02,.46,.57,s*.15);
    tube(p,white,.012,.028,.12,.52,.40,s*.10,10).rotation.z=-.9;
    for(const x of [-.24,.18])tube(p,gry,.088,.092,.24,x,.13,s*.19,14);
  }
}
function zebra(p){
  const wht=paint('#faf8f2'),blk=paint('#2c303a');
  oval(p,wht,.38,.25,.22,-.04,.40,0);
  for(const x of [-.22,-.08,.06,.18])tube(p,blk,.23,.23,.05,x,.40,0,18).rotation.z=Math.PI/2;
  tube(p,wht,.10,.12,.34,.24,.64,0,14).rotation.z=-.38;
  oval(p,wht,.20,.14,.14,.38,.78,0);
  box(p,blk,.08,.36,.06,.16,.70,0,.02).rotation.z=-.38;
  for(const s of [-1,1]){
    bead(p,blk,.025,.03,.02,.42,.82,s*.11);
    for(const x of [-.24,.18])tube(p,wht,.055,.058,.30,x,.16,s*.14,10);
  }
}
function hippo(p){
  const pur=paint('#8f84a8'),snout=paint('#a89dc0');
  oval(p,pur,.42,.30,.32,-.04,.34,0);
  oval(p,pur,.24,.22,.24,.34,.44,0);
  box(p,snout,.28,.22,.32,.52,.36,0,.09);
  for(const s of [-1,1]){
    oval(p,white,.035,.05,.035,.58,.24,s*.10);
    bead(p,ink,.028,.034,.02,.42,.52,s*.15);
    oval(p,pur,.06,.07,.04,.26,.64,s*.15);
    for(const x of [-.26,.18])tube(p,pur,.09,.095,.20,x,.11,s*.21,14);
  }
}
function croc(p){
  const grn=paint('#4fa662'),belly=paint('#cde898'),ridge=paint('#357845');
  oval(p,grn,.46,.16,.24,0,.20,0);
  oval(p,belly,.38,.10,.18,0,.13,0);
  box(p,grn,.42,.14,.22,.46,.22,0,.06);
  sweep(p,grn,[[-.38,.20,0],[-.68,.16,0],[-.92,.14,0]],[.14,.09,.035],{segments:10});
  for(const x of [-.26,-.08,.10,.26])oval(p,ridge,.05,.05,.04,x,.35,0);
  for(const s of [-1,1]){
    oval(p,white,.05,.05,.045,.36,.32,s*.09);
    bead(p,ink,.025,.028,.02,.39,.33,s*.10);
    for(const x of [-.22,.22])box(p,grn,.14,.10,.14,x,.07,s*.22,.04);
  }
}

// 12) Polar Glacier stage
function polarBear(p){
  const ice=paint('#f6f8fc'),sn=paint('#dce6f2');
  oval(p,ice,.36,.36,.32,0,.40,0);
  oval(p,ice,.27,.25,.26,0,.78,0);
  oval(p,sn,.12,.09,.12,0,.72,.22);
  oval(p,ink,.048,.034,.04,0,.75,.32);
  eyes(p,.82,.24,.10,.026);
  for(const s of [-1,1]){
    oval(p,ice,.085,.085,.06,s*.21,.98,0);
    oval(p,ice,.11,.18,.11,s*.32,.44,.04).rotation.z=s*.35;
    oval(p,ice,.13,.10,.16,s*.18,.12,.14);
  }
}
function orcaWhale(p){
  const blk=paint('#262d38');
  oval(p,blk,.54,.28,.28,0,.32,0);
  oval(p,white,.42,.15,.22,.04,.20,0);
  profile(p,blk,[[-.08,0],[.14,0],[-.04,.34]],.06,0,.54,0,.02);
  oval(p,blk,.18,.04,.34,-.58,.30,0);
  for(const s of [-1,1]){
    oval(p,white,.12,.06,.04,.26,.40,s*.24);
    oval(p,blk,.20,.05,.18,.10,.20,s*.32).rotation.x=s*.3;
  }
}
function babySeal(p){
  const wht=paint('#f4f7fb'),nose=paint('#383e4a');
  oval(p,wht,.42,.24,.26,0,.26,0);
  oval(p,wht,.21,.20,.20,.34,.40,0);
  oval(p,nose,.045,.035,.04,.54,.40,0);
  for(const s of [-1,1]){
    bead(p,ink,.032,.038,.025,.44,.46,s*.12);
    oval(p,wht,.14,.05,.18,.12,.10,s*.26);
    oval(p,wht,.16,.06,.10,-.46,.16,s*.10).rotation.y=s*.35;
  }
}
function blueWhale(p){
  const blu=paint('#4a92d0'),belly=paint('#d8eefc');
  oval(p,blu,.56,.30,.32,0,.34,0);
  oval(p,belly,.44,.16,.24,.04,.20,0);
  oval(p,blu,.18,.045,.38,-.60,.34,0);
  // Water spout on top!
  for(const s of [-1,1])sweep(p,paint('#a8e2ff'),[[.10,.62,0],[.10+s*.08,.82,0],[.10+s*.18,.78,0]],[.028,.024,.018],{segments:8});
  for(const s of [-1,1]){
    bead(p,ink,.030,.034,.02,.32,.36,s*.27);
    oval(p,blu,.20,.05,.16,.06,.20,s*.34).rotation.x=s*.25;
  }
}
function snowFox(p){
  const wht=paint('#f7f9fc'),ice=paint('#b8d6f0');
  oval(p,wht,.32,.24,.24,-.04,.32,0);
  oval(p,wht,.22,.20,.22,.28,.54,0);
  oval(p,wht,.12,.08,.10,.46,.48,0);
  oval(p,ink,.04,.03,.035,.56,.49,0);
  sweep(p,wht,[[-.26,.28,0],[-.52,.38,0],[-.68,.54,0]],[.12,.16,.11],{segments:12});
  oval(p,ice,.12,.12,.12,-.66,.54,0);
  for(const s of [-1,1]){
    tube(p,wht,.01,.08,.18,.24,.76,s*.12,10);
    bead(p,ink,.026,.032,.02,.38,.58,s*.13);
    for(const x of [-.20,.14])tube(p,wht,.055,.052,.22,x,.12,s*.14,10);
  }
}
function igloo(p){
  const ice=paint('#e6f4fc'),trim=paint('#a8d6f0'),dark=paint('#2f4c68');
  oval(p,ice,.48,.42,.48,0,.18,0);
  box(p,trim,.98,.09,.98,0,.05,0,.04);
  const arch=tube(p,ice,.20,.20,.26,0,.22,.40,18);arch.rotation.x=Math.PI/2;
  const door=tube(p,dark,.13,.13,.10,0,.18,.50,16);door.rotation.x=Math.PI/2;
  for(const y of [.26,.42])torus(p,trim,.44-y*.35,.018,0,y,0).rotation.x=Math.PI/2;
}

// 13) Fairy Castle stage
function unicorn(p){
  const wht=paint('#fff8fc'),mane=paint('#f285c8'),tail=paint('#7fd4f5');
  oval(p,wht,.36,.24,.22,-.04,.38,0);
  tube(p,wht,.09,.11,.34,.22,.62,0,14).rotation.z=-.35;
  oval(p,wht,.20,.15,.15,.34,.78,0);
  tube(p,gold,.01,.04,.24,.42,.96,0,12).rotation.z=-.4;
  sweep(p,mane,[[.24,.88,0],[.12,.74,0],[.04,.58,0]],[.07,.08,.06],{segments:10});
  sweep(p,tail,[[-.34,.40,0],[-.52,.30,0],[-.58,.18,0]],[.07,.09,.06],{segments:10});
  for(const s of [-1,1]){
    bead(p,ink,.025,.03,.02,.40,.81,s*.12);
    for(const x of [-.22,.16])tube(p,wht,.052,.056,.30,x,.16,s*.14,10);
  }
}
function babyDragon(p){
  const grn=paint('#5cc498'),wing=paint('#f29e52'),belly=paint('#f7e8a8');
  oval(p,grn,.30,.32,.26,0,.40,0);
  oval(p,belly,.20,.22,.18,0,.38,.14);
  oval(p,grn,.24,.22,.24,0,.74,0);
  eyes(p,.78,.22,.10,.028);
  sweep(p,grn,[[0,.26,-.22],[0,.24,-.56],[0,.36,-.76]],[.11,.07,.035],{segments:10});
  for(const s of [-1,1]){
    const w=box(p,wing,.30,.22,.04,s*.32,.52,-.14,.02);w.rotation.y=s*-.35;w.rotation.z=s*.25;
    tube(p,gold,.01,.035,.14,s*.12,.96,-.02,10);
    oval(p,grn,.10,.08,.13,s*.16,.09,.10);
  }
}
function crownPrince(p){
  const cape=paint('#3b76c8'),tunic=paint('#5ca0e8'),skin=paint('#ffd9ba');
  tube(p,cape,.22,.34,.46,0,.28,0,22);
  oval(p,tunic,.24,.22,.22,0,.40,0);
  oval(p,skin,.24,.23,.24,0,.74,0);
  eyes(p,.76,.22,.09,.028);
  tube(p,gold,.19,.17,.14,0,.98,0,18);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;oval(p,gold,.04,.065,.04,Math.sin(a)*.16,1.06,Math.cos(a)*.16);}
}
function magicWand(p){
  const stem=paint('#e67eb8'),gem=paint('#7fdcf8');
  tube(p,stem,.048,.055,.72,0,.38,0,14);
  box(p,gold,.26,.07,.22,0,.04,0,.025);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const r=box(p,gold,.14,.28,.09,Math.sin(a)*.14,.86+Math.cos(a)*.14,0,.03);r.rotation.z=-a;}
  oval(p,gem,.13,.13,.10,0,.86,0);
}
function pumpkinCoach(p){
  const org=paint('#f49236');
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(p,org,.22,.32,.22,Math.cos(a)*.18,.44,Math.sin(a)*.18);}
  oval(p,glass,.16,.16,.38,0,.46,0);
  tube(p,gold,.05,.07,.16,0,.82,0,12);
  for(const x of [-.34,.34])for(const s of [-1,1]){const w=torus(p,gold,.14,.032,x,.16,s*.34);w.rotation.y=0;}
}
function fairyTower(p){
  const wall=paint('#f7eee4'),roof=paint('#7688d8');
  tube(p,wall,.30,.34,.66,0,.34,0,24);
  tube(p,roof,.02,.38,.52,0,.92,0,24);
  box(p,paint('#6b4832'),.18,.26,.06,0,.14,.32,.03);
  oval(p,gold,.065,.065,.065,0,1.20,0);
  for(const y of [.48,.62])box(p,glass,.12,.14,.06,0,y,.31,.02);
}

// 14) Pirate Treasure Cove stage
function treasureChest(p){
  const wood=paint('#8c542b'),dark=paint('#5a3418');
  box(p,wood,.74,.38,.48,0,.20,0,.04);
  const lid=tube(p,wood,.24,.24,.74,0,.40,0,18);lid.rotation.z=Math.PI/2;
  for(const x of [-.28,0,.28])box(p,gold,.07,.44,.52,x,.22,0,.015);
  box(p,gold,.14,.16,.06,0,.34,.25,.02);
  for(const [x,z] of [[-.18,.04],[0,-.04],[.18,.04]])oval(p,gold,.09,.06,.09,x,.44,z);
}
function pirateShip(p){
  const hull=paint('#7d4624'),sail=paint('#f8f2e4'),flag=paint('#262b34');
  box(p,hull,.96,.28,.44,0,.20,0,.09);
  box(p,gold,.98,.06,.46,0,.30,0,.02);
  tube(p,paint('#5c341a'),.035,.045,.86,0,.64,0,12);
  box(p,sail,.05,.44,.48,.05,.64,0,.02);
  box(p,flag,.22,.14,.03,.12,.98,0,.01);
  oval(p,white,.04,.04,.04,.12,.98,.02);
}
function parrot(p){
  const red=paint('#e2443c'),blu=paint('#3886d8'),yel=paint('#f4c43c');
  oval(p,red,.24,.30,.22,0,.42,0);
  oval(p,red,.18,.18,.18,0,.74,0);
  oval(p,white,.12,.10,.08,0,.74,.14);
  oval(p,ink,.07,.08,.09,0,.70,.22);
  eyes(p,.78,.17,.09,.024);
  for(const s of [-1,1]){
    oval(p,blu,.07,.22,.14,s*.24,.42,-.02);
    oval(p,yel,.06,.10,.12,s*.23,.52,-.02);
  }
  tube(p,paint('#8c5a32'),.04,.04,.46,0,.10,0,12).rotation.z=Math.PI/2;
}
function octopusCap(p){
  const pur=paint('#7a4ca6'),hat=paint('#2a303c');
  oval(p,pur,.34,.32,.34,0,.46,0);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(p,pur,.11,.08,.24,Math.sin(a)*.28,.12,Math.cos(a)*.28).rotation.y=a;}
  box(p,hat,.58,.14,.32,0,.80,0,.04);
  oval(p,gold,.07,.07,.04,0,.80,.16);
  eyes(p,.48,.32,.11,.030);
}
function goldAnchor(p){
  tube(p,gold,.065,.065,.78,0,.44,0,14);
  box(p,gold,.46,.08,.10,0,.68,0,.03);
  torus(p,gold,.13,.042,0,.90,0);
  sweep(p,gold,[[-.38,.36,0],[-.24,.12,0],[0,.07,0],[.24,.12,0],[.38,.36,0]],[.06,.065,.075,.065,.06],{segments:16});
  box(p,paint('#3b4c63'),.44,.07,.28,0,.03,0,.02);
}
function spyglassBarrel(p){
  const wood=paint('#925a32'),iron=paint('#3c434f','chrome');
  tube(p,wood,.32,.30,.64,0,.34,0,22);
  for(const y of [.18,.50])tube(p,iron,.325,.325,.06,0,y,0,22);
  const scope=tube(p,gold,.06,.09,.56,.18,.80,0,14);scope.rotation.z=-.65;
  oval(p,glass,.065,.065,.04,.38,.96,0);
}

// 15) Future Mech Factory stage
function retroBot(p){
  const sil=paint('#b8c6d4','chrome'),red=paint('#e04c44');
  box(p,sil,.48,.46,.34,0,.48,0,.06);
  box(p,sil,.38,.30,.32,0,.88,0,.06);
  box(p,glass,.28,.11,.06,0,.90,.16,.02);
  tube(p,steel,.02,.02,.16,0,1.10,0,8);oval(p,red,.055,.055,.055,0,1.20,0);
  box(p,red,.24,.16,.05,0,.52,.17,.02);
  for(const s of [-1,1]){
    tube(p,sil,.065,.065,.26,s*.14,.14,0,12);
    tube(p,sil,.055,.055,.30,s*.34,.50,0,12);
  }
}
function sphereAI(p){
  const wht=paint('#eef3f8'),blu=paint('#3fa8e8');
  oval(p,wht,.40,.38,.40,0,.44,0);
  torus(p,blu,.39,.035,0,.44,0).rotation.x=Math.PI/2;
  oval(p,ink,.16,.14,.08,0,.48,.36);
  oval(p,blu,.09,.09,.06,0,.48,.41);
  box(p,steel,.36,.08,.36,0,.05,0,.03);
}
function mechWalker(p){
  const blu=paint('#4a7cc4'),org=paint('#f08c32');
  box(p,blu,.52,.40,.42,0,.56,0,.07);
  box(p,glass,.34,.18,.12,0,.60,.20,.03);
  for(const s of [-1,1]){
    box(p,org,.14,.28,.20,s*.34,.56,.04,.04);
    box(p,steel,.14,.34,.18,s*.18,.20,0,.04);
    box(p,org,.18,.09,.28,s*.18,.05,.04,.03);
  }
}
function quadDrone(p){
  const wht=paint('#eef2f6'),teal=paint('#3cb8b0');
  oval(p,wht,.24,.14,.28,0,.32,0);
  oval(p,glass,.10,.09,.08,0,.30,.24);
  for(const sx of [-1,1])for(const sz of [-1,1]){
    rod(p,paint('#3b424f'),[0,.34,0],[sx*.38,.42,sz*.34],.032,8);
    tube(p,teal,.15,.15,.025,sx*.38,.45,sz*.34,16);
  }
  for(const s of [-1,1])box(p,paint('#3b424f'),.04,.05,.46,s*.18,.04,0,.015);
}
function hoverCar(p){
  const cyan=paint('#3ea8d8'),dark=paint('#2e3645','satin');
  oval(p,cyan,.56,.18,.32,0,.26,0);
  oval(p,glass,.28,.16,.24,.04,.38,0);
  for(const x of [-.34,.34])for(const s of [-1,1])oval(p,paint('#7ef0ff'),.12,.06,.10,x,.12,s*.24);
  box(p,dark,.70,.08,.44,0,.06,0,.03);
}
function powerCore(p){
  const glow=paint('#5ce2ff'),ring=paint('#3c485c','chrome');
  tube(p,ring,.34,.38,.12,0,.08,0,22);
  tube(p,ring,.34,.38,.12,0,.76,0,22);
  tube(p,glow,.22,.22,.60,0,.42,0,22);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod(p,ring,[Math.sin(a)*.30,.12,Math.cos(a)*.30],[Math.sin(a)*.30,.72,Math.cos(a)*.30],.035,8);}
}

export const WILD_FANTASY={
  giraffe:{name:'长颈鹿',make:collectable(giraffe,{height:1.74,width:1.62,grip:[0,.56,0,.26,.20]})},
  lionCub:{name:'小狮子王',make:collectable(lionCub,{height:1.42,width:1.86,grip:[.04,.44,0,.30,.24]})},
  babyElephant:{name:'小象宝宝',make:collectable(babyElephant,{height:1.42,width:1.96,grip:[0,.44,0,.32,.28]})},
  zebra:{name:'条纹小斑马',make:collectable(zebra,{height:1.52,width:1.85,grip:[0,.46,0,.30,.22]})},
  hippo:{name:'紫灰小河马',make:collectable(hippo,{height:1.30,width:1.92,grip:[.04,.38,0,.34,.28]})},
  croc:{name:'微笑小鳄鱼',make:collectable(croc,{height:1.05,width:2.08,grip:[0,.22,0,.40,.24]})},
  polarBear:{name:'北极熊',make:collectable(polarBear,{height:1.56,width:1.64,grip:[0,.54,0,.30,.28]})},
  orcaWhale:{name:'大虎鲸',make:collectable(orcaWhale,{height:1.28,width:2.05,grip:[0,.34,0,.38,.28]})},
  babySeal:{name:'白白小海豹',make:collectable(babySeal,{height:1.18,width:1.92,grip:[0,.28,0,.34,.26]})},
  blueWhale:{name:'蓝鲸宝宝',make:collectable(blueWhale,{height:1.36,width:2.05,grip:[0,.36,0,.38,.28]})},
  snowFox:{name:'蓬松雪狐',make:collectable(snowFox,{height:1.44,width:1.92,grip:[0,.42,0,.30,.24]})},
  igloo:{name:'冰雪圆顶屋',make:collectable(igloo,{height:1.24,width:1.82,grip:[0,.32,0,.36,.36]})},
  unicorn:{name:'彩虹独角兽',make:collectable(unicorn,{height:1.56,width:1.85,grip:[0,.48,0,.30,.22]})},
  babyDragon:{name:'小萌喷火龙',make:collectable(babyDragon,{height:1.52,width:1.86,grip:[0,.48,0,.28,.30]})},
  crownPrince:{name:'皇冠小骑士',make:collectable(crownPrince,{height:1.62,width:1.44,grip:[0,.54,0,.24,.24]})},
  magicWand:{name:'星光魔法杖',make:collectable(magicWand,{height:1.64,width:1.38,grip:[0,.58,0,.22,.20]})},
  pumpkinCoach:{name:'金色南瓜车',make:collectable(pumpkinCoach,{height:1.44,width:1.78,grip:[0,.44,0,.32,.32]})},
  fairyTower:{name:'尖顶童话塔',make:collectable(fairyTower,{height:1.68,width:1.40,grip:[0,.56,0,.26,.26]})},
  treasureChest:{name:'黄金宝箱',make:collectable(treasureChest,{height:1.26,width:1.80,grip:[0,.34,0,.34,.26]})},
  pirateShip:{name:'双桅海盗船',make:collectable(pirateShip,{height:1.56,width:1.98,grip:[0,.48,0,.36,.24]})},
  parrot:{name:'红羽鹦鹉',make:collectable(parrot,{height:1.54,width:1.44,grip:[0,.48,0,.24,.22]})},
  octopusCap:{name:'章鱼船长',make:collectable(octopusCap,{height:1.44,width:1.74,grip:[0,.46,0,.32,.32]})},
  goldAnchor:{name:'航海大铁锚',make:collectable(goldAnchor,{height:1.58,width:1.68,grip:[0,.48,0,.30,.22]})},
  spyglassBarrel:{name:'望远镜木桶',make:collectable(spyglassBarrel,{height:1.56,width:1.56,grip:[0,.44,0,.28,.28]})},
  retroBot:{name:'铁皮机器人',make:collectable(retroBot,{height:1.64,width:1.56,grip:[0,.56,0,.28,.22]})},
  sphereAI:{name:'球形智脑',make:collectable(sphereAI,{height:1.44,width:1.56,grip:[0,.44,0,.30,.30]})},
  mechWalker:{name:'双足小机甲',make:collectable(mechWalker,{height:1.52,width:1.72,grip:[0,.50,0,.30,.24]})},
  quadDrone:{name:'四旋翼无人机',make:collectable(quadDrone,{height:1.08,width:2.02,grip:[0,.30,0,.38,.36]})},
  hoverCar:{name:'磁悬浮飞车',make:collectable(hoverCar,{height:1.06,width:2.05,grip:[0,.26,0,.38,.26]})},
  powerCore:{name:'星能反应核',make:collectable(powerCore,{height:1.52,width:1.44,grip:[0,.44,0,.28,.28]})},
};
