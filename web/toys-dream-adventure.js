import {box,group,oval,paint,profile,rod,torus,tube} from './parts.js';
import {bead} from './sculpt.js';
import {collectable} from './models.js';

const ink=paint('#262d38','rubber'),white=paint('#fffaf2'),cream=paint('#f6ebd4');
const tire=paint('#262a34','rubber'),hub=paint('#d4dde6','chrome'),steel=paint('#b8c5d0','chrome');
const gold=paint('#f4c63a','chrome'),red=paint('#df413c'),blue=paint('#3684d6'),green=paint('#45a85a');

function wheel(p,x,y,z,r=.145,w=.095){
  const g=group(p,x,y,z);g.name='wheel';
  const t=tube(g,tire,r,r,w,0,0,0,16);t.rotation.x=Math.PI/2;
  const h=tube(g,hub,r*.52,r*.52,w+.016,0,0,0,12);h.rotation.x=Math.PI/2;
}
function cuteEyes(p,y,z,sep=.10,r=.028){
  for(const s of [-1,1]){
    bead(p,ink,r,r*1.16,r*.7,s*sep,y,z);
    bead(p,white,r*.35,r*.35,r*.3,s*sep-r*.25,y+r*.32,z+r*.55);
  }
}

// 16) Cloudland stage (云端彩虹国)
function cloudPillow(p){
  const cloudM=paint('#f6fbff');
  oval(p,cloudM,.36,.24,.26,0,.32,0);
  oval(p,cloudM,.24,.20,.22,-.26,.26,0);
  oval(p,cloudM,.24,.20,.22,.26,.26,0);
  oval(p,cloudM,.22,.20,.22,0,.46,0);
  cuteEyes(p,.36,.25,.10,.026);
  for(const s of [-1,1])oval(p,paint('#ff9eb8'),.05,.035,.02,s*.16,.30,.24);
}
function rainbowArch(p){
  const cols=['#ff6b78','#ffb048','#ffe058','#68cc78','#56b4f0'];
  cols.forEach((c,i)=>{
    const r=.46-i*.055;
    const arc=torus(p,paint(c),r,.034,0,.20,0);
    arc.scale.set(1,1,1.3);
  });
  for(const s of [-1,1])oval(p,white,.18,.14,.18,s*.44,.16,0);
}
function sunBuddy(p){
  const sun=paint('#ffd238'),ray=paint('#ff9e32');
  oval(p,sun,.34,.34,.22,0,.48,0);
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5;
    oval(p,ray,.08,.14,.06,Math.cos(a)*.42,.48+Math.sin(a)*.42,0).rotation.z=a-Math.PI/2;
  }
  box(p,white,.42,.08,.24,0,.04,0,.02);
  cuteEyes(p,.50,.21,.10,.026);
}
function crescentMoon(p){
  const moon=paint('#ffe270'),starM=paint('#ff9eb8');
  const ring=torus(p,moon,.32,.11,0,.48,0);ring.scale.set(1,1.05,.9);
  oval(p,starM,.12,.12,.10,.16,.58,0);
  box(p,paint('#84a6e6'),.46,.08,.26,0,.04,0,.02);
  cuteEyes(p,.50,.11,-.08,.024);
}
function raindropToy(p){
  const drop=paint('#62c4f6'),umb=paint('#ff7a96');
  oval(p,drop,.24,.24,.24,0,.28,0);
  tube(p,drop,.02,.22,.26,0,.52,0,16);
  rod(p,gold,[.22,.24,0],[.22,.82,0],.022,8);
  oval(p,umb,.30,.12,.30,.22,.84,0);
  cuteEyes(p,.32,.23,.08,.024);
}
function windMill(p){
  const stick=paint('#d8a868'),cols=['#ff6b78','#ffd248','#56c478','#4ea2f0'];
  tube(p,stick,.035,.035,.68,0,.34,0,10);
  tube(p,paint('#6ec288'),.20,.24,.08,0,.04,0,16);
  cols.forEach((c,i)=>{
    const a=i*Math.PI/2;
    const b=oval(p,paint(c),.24,.10,.04,Math.cos(a)*.18,.68+Math.sin(a)*.18,.05);
    b.rotation.z=a+.32;
  });
  oval(p,gold,.07,.07,.07,0,.68,.08);
}

// 17) Halloween stage (南瓜糖果夜)
function pumpkinLantern(p){
  const pump=paint('#f27a24'),stem=paint('#4c8c42');
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(p,pump,.24,.30,.24,Math.cos(a)*.14,.34,Math.sin(a)*.14);}
  rod(p,stem,[0,.60,0],[.06,.78,0],.055,10);
  for(const s of [-1,1])profile(p,gold,[[-.06,0],[.06,0],[0,.10]],.04,s*.12,.42,.34,.008);
  box(p,gold,.22,.05,.04,0,.28,.35,.01);
}
function cuteGhost(p){
  oval(p,white,.28,.38,.28,0,.44,0);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(p,white,.11,.14,.11,Math.cos(a)*.20,.14,Math.sin(a)*.20);}
  for(const s of [-1,1])oval(p,white,.08,.12,.08,s*.30,.46,.08).rotation.z=s*.45;
  cuteEyes(p,.54,.26,.09,.028);
  oval(p,paint('#ff9eb4'),.045,.03,.02,0,.44,.27);
}
function witchHat(p){
  const hat=paint('#5a3b8c'),band=paint('#f29c2e');
  tube(p,hat,.48,.52,.07,0,.08,0,24);
  tube(p,hat,.04,.30,.72,0,.46,0,20);
  torus(p,band,.30,.045,0,.15,0).rotation.x=Math.PI/2;
  box(p,gold,.12,.12,.04,0,.16,.32,.015);
}
function blackCat(p){
  const fur=paint('#2d313d'),hat=paint('#7a44a8');
  oval(p,fur,.26,.28,.24,0,.30,0);
  oval(p,fur,.24,.22,.22,0,.62,0);
  for(const s of [-1,1]){
    profile(p,fur,[[-.07,0],[.07,0],[0,.15]],.05,s*.14,.78,0,.01);
    oval(p,gold,.045,.05,.03,s*.09,.64,.22);
    oval(p,ink,.02,.04,.02,s*.09,.64,.245);
  }
  tube(p,hat,.02,.14,.24,0,.92,0,14);
  tube(p,hat,.22,.22,.04,0,.81,0,16);
  rod(p,fur,[0,.22,-.22],[.14,.48,-.30],.042,10);
}
function candyBucket(p){
  const buck=paint('#f28828'),cols=['#ff5e7e','#ffd238','#56cc78','#54a8f2','#b874f0'];
  tube(p,buck,.32,.24,.48,0,.26,0,20);
  torus(p,ink,.26,.028,0,.56,0);
  cols.forEach((c,i)=>{
    const a=i*Math.PI*2/5;
    oval(p,paint(c),.10,.09,.10,Math.cos(a)*.14,.54,Math.sin(a)*.14);
  });
  cuteEyes(p,.30,.28,.09,.024);
}
function batBuddy(p){
  const body=paint('#62448c'),wing=paint('#463066');
  oval(p,body,.24,.26,.22,0,.38,0);
  for(const s of [-1,1]){
    profile(p,body,[[-.06,0],[.06,0],[0,.14]],.04,s*.12,.62,0,.01);
    const w=profile(p,wing,[[0,.08],[.44,.22],[.36,-.12],[.14,-.04],[0,-.14]],.05,s*.18,.40,0,.012);
    if(s<0)w.scale.x=-1;
    oval(p,body,.06,.08,.08,s*.09,.08,0);
  }
  cuteEyes(p,.44,.21,.08,.024);
}

// 18) Christmas stage (圣诞雪橇村)
function santaClaus(p){
  const skin=paint('#f8d4b8'),belt=paint('#2c3038');
  oval(p,red,.32,.32,.28,0,.34,0);
  torus(p,belt,.29,.042,0,.28,0).rotation.x=Math.PI/2;
  box(p,gold,.10,.10,.04,0,.28,.31,.01);
  oval(p,skin,.22,.20,.20,0,.68,0);
  oval(p,white,.22,.16,.14,0,.56,.16);
  tube(p,red,.03,.24,.32,0,.92,-.02,16);
  oval(p,white,.07,.07,.07,0,1.08,-.04);
  torus(p,white,.23,.05,0,.78,0).rotation.x=Math.PI/2;
  cuteEyes(p,.70,.19,.08,.024);
}
function christmasTree(p){
  const trunk=paint('#8a5632'),pine=paint('#389452');
  tube(p,trunk,.10,.12,.22,0,.11,0,14);
  tube(p,pine,.14,.42,.34,0,.36,0,18);
  tube(p,pine,.10,.34,.30,0,.60,0,18);
  tube(p,pine,.02,.24,.28,0,.84,0,18);
  oval(p,gold,.09,.09,.06,0,1.02,0);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3,col=i%2?red:gold;
    oval(p,col,.055,.055,.055,Math.cos(a)*.28,.40+(i%2)*.22,Math.sin(a)*.28);
  }
}
function reindeer(p){
  const fur=paint('#a86c3e'),antler=paint('#6e482c');
  oval(p,fur,.28,.22,.34,0,.32,0);
  oval(p,fur,.22,.20,.20,0,.64,.16);
  oval(p,red,.065,.065,.065,0,.62,.36);
  for(const s of [-1,1]){
    rod(p,antler,[s*.10,.80,.14],[s*.22,1.02,.10],.024,8);
    rod(p,antler,[s*.16,.92,.12],[s*.26,.96,.18],.018,6);
    tube(p,fur,.052,.048,.26,s*.13,.14,.14,10);
    tube(p,fur,.052,.048,.26,s*.13,.14,-.14,10);
  }
  cuteEyes(p,.68,.33,.08,.024);
}
function giftBox(p){
  const boxM=paint('#e64552');
  box(p,boxM,.62,.54,.62,0,.28,0,.04);
  box(p,gold,.65,.56,.12,0,.28,0,.015);
  box(p,gold,.12,.56,.65,0,.28,0,.015);
  for(const s of [-1,1])torus(p,gold,.12,.04,s*.11,.62,0).rotation.y=s*.5;
  cuteEyes(p,.32,.32,.12,.026);
}
function gingerbread(p){
  const cookie=paint('#b8743c');
  box(p,cookie,.36,.40,.14,0,.34,0,.06);
  oval(p,cookie,.22,.22,.12,0,.70,0);
  for(const s of [-1,1]){
    oval(p,cookie,.18,.08,.08,s*.24,.44,0).rotation.z=s*.15;
    oval(p,cookie,.09,.16,.09,s*.11,.10,0);
  }
  oval(p,red,.042,.042,.03,0,.40,.08);
  oval(p,green,.042,.042,.03,0,.28,.08);
  cuteEyes(p,.72,.12,.08,.024);
}
function sleighCar(p){
  box(p,red,.88,.30,.50,0,.32,0,.05);
  box(p,red,.24,.26,.50,-.34,.52,0,.04);
  box(p,gold,.92,.06,.54,0,.46,0,.015);
  for(const s of [-1,1]){
    box(p,gold,.96,.05,.05,.04,.06,s*.24,.01);
    rod(p,gold,[.46,.06,s*.24],[.62,.24,s*.24],.026,8);
    for(const x of [-.26,.26])rod(p,gold,[x,.06,s*.24],[x,.22,s*.24],.022,8);
  }
  box(p,green,.26,.22,.28,-.06,.52,0,.025);
}

// 19) Gem Mine stage (水晶宝石矿)
function mineCart(p){
  const body=paint('#5a6675','satin'),gem1=paint('#a45ce6','enamel'),gem2=paint('#38c4e6','enamel'),gem3=paint('#f4c838','chrome');
  box(p,body,.86,.40,.52,0,.38,0,.04);
  box(p,steel,.92,.07,.58,0,.58,0,.015);
  oval(p,gem1,.16,.18,.14,-.16,.64,0);
  oval(p,gem2,.15,.20,.15,.10,.66,.06);
  oval(p,gem3,.14,.16,.14,.22,.62,-.06);
  for(const x of [-.26,.26])for(const s of [-1,1])wheel(p,x,.13,s*.28,.13,.075);
}
function amethyst(p){
  const rock=paint('#626c7a'),c1=paint('#9e52e0','enamel'),c2=paint('#c484ff','enamel');
  oval(p,rock,.40,.18,.34,0,.12,0);
  tube(p,c1,.04,.14,.62,0,.48,0,6);
  const s1=tube(p,c2,.03,.10,.46,-.18,.38,.08,6);s1.rotation.z=.32;
  const s2=tube(p,c2,.03,.11,.50,.18,.40,-.06,6);s2.rotation.z=-.28;
  const s3=tube(p,c1,.025,.09,.40,.04,.34,.18,6);s3.rotation.x=.32;
}
function rubyHeart(p){
  const ruby=paint('#e63858','enamel');
  oval(p,ruby,.22,.22,.18,-.14,.52,0);
  oval(p,ruby,.22,.22,.18,.14,.52,0);
  const tip=tube(p,ruby,.30,.02,.42,0,.28,0,8);tip.scale.set(1.1,1,.65);
  box(p,gold,.40,.08,.24,0,.04,0,.02);
}
function emeraldGem(p){
  const em=paint('#34b870','enamel');
  tube(p,em,.03,.24,.30,0,.74,0,6);
  tube(p,em,.24,.24,.26,0,.46,0,6);
  tube(p,em,.24,.03,.28,0,.19,0,6);
  box(p,gold,.36,.08,.26,0,.04,0,.02);
}
function goldPickaxe(p){
  const handle=paint('#9e6438');
  tube(p,handle,.048,.055,.86,0,.44,0,12);
  box(p,paint('#6a7482'),.28,.08,.24,0,.04,0,.02);
  oval(p,gold,.44,.09,.10,0,.80,0);
  for(const s of [-1,1])tube(p,gold,.02,.07,.24,s*.38,.74,0,10).rotation.z=s*1.25;
}
function minerMole(p){
  const fur=paint('#66564e'),hat=paint('#f4c42e');
  oval(p,fur,.30,.32,.28,0,.34,0);
  oval(p,cream,.18,.20,.14,0,.32,.18);
  oval(p,paint('#f49ab0'),.065,.045,.05,0,.52,.28);
  for(const s of [-1,1])oval(p,paint('#f49ab0'),.10,.07,.10,s*.24,.32,.14);
  oval(p,hat,.26,.16,.26,0,.64,0);
  tube(p,hat,.31,.32,.04,0,.57,0,16);
  oval(p,white,.07,.07,.06,0,.67,.24);
  cuteEyes(p,.56,.25,.085,.024);
}

// 20) Superhero / Racing Track stage (机甲赛车场)
function f1Racer(p){
  box(p,red,1.16,.20,.34,0,.22,0,.05);
  box(p,red,.36,.18,.48,-.04,.24,0,.04);
  box(p,white,.18,.08,.56,.52,.14,0,.02);
  box(p,red,.14,.18,.52,-.50,.36,0,.02);
  oval(p,gold,.11,.11,.11,-.04,.38,0);
  for(const x of [-.36,.36])for(const s of [-1,1])wheel(p,x,.14,s*.26,.14,.11);
}
function driftCar(p){
  box(p,blue,1.12,.26,.52,0,.26,0,.055);
  box(p,blue,.56,.22,.44,-.04,.46,0,.05);
  box(p,paint('#9ee0ff','glass'),.42,.14,.38,-.02,.46,0,.02);
  box(p,gold,1.14,.05,.18,0,.40,0,.01);
  box(p,ink,.10,.16,.52,-.50,.48,0,.015);
  for(const x of [-.34,.34])for(const s of [-1,1])wheel(p,x,.14,s*.28,.14,.095);
}
function monsterTruck(p){
  const body=paint('#48b85a');
  box(p,body,.96,.34,.52,0,.54,0,.06);
  box(p,paint('#9ee0ff','glass'),.36,.18,.44,.08,.68,0,.025);
  box(p,steel,.72,.12,.34,0,.32,0,.02);
  for(const x of [-.32,.32])for(const s of [-1,1])wheel(p,x,.22,s*.32,.22,.14);
}
function checkeredFlag(p){
  tube(p,steel,.035,.035,.96,-.28,.48,0,10);
  tube(p,ink,.20,.24,.08,-.28,.04,0,16);
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){
    box(p,(r+c)%2?white:ink,.14,.13,.04,-.16+c*.14,.62+r*.13,0,.008);
  }
}
function racingHelmet(p){
  const shell=paint('#e64545'),visor=paint('#22344a','glass');
  oval(p,shell,.36,.34,.38,0,.38,0);
  box(p,visor,.50,.18,.26,0,.40,.28,.05);
  box(p,gold,.08,.36,.40,0,.56,0,.02);
}
function podiumCup(p){
  tube(p,ink,.26,.30,.14,0,.07,0,18);
  tube(p,gold,.08,.12,.22,0,.24,0,16);
  tube(p,gold,.28,.16,.38,0,.52,0,20);
  for(const s of [-1,1])torus(p,gold,.14,.035,s*.26,.54,0);
  oval(p,red,.10,.10,.06,0,.56,.24);
}

export const DREAM_ADVENTURE={
  // Cloudland
  cloudPillow:{name:'微笑白云朵',make:collectable(cloudPillow,{height:1.22,width:1.86,grip:[0,.36,0,.34,.24]})},
  rainbowArch:{name:'七色彩虹桥',make:collectable(rainbowArch,{height:1.36,width:1.98,grip:[0,.44,0,.34,.24]})},
  sunBuddy:{name:'暖暖太阳公公',make:collectable(sunBuddy,{height:1.48,width:1.64,grip:[0,.48,0,.30,.22]})},
  crescentMoon:{name:'弯弯月牙船',make:collectable(crescentMoon,{height:1.46,width:1.56,grip:[0,.46,0,.28,.22]})},
  raindropToy:{name:'撑伞小雨滴',make:collectable(raindropToy,{height:1.58,width:1.44,grip:[0,.48,0,.26,.24]})},
  windMill:{name:'七彩小风车',make:collectable(windMill,{height:1.64,width:1.48,grip:[0,.54,0,.26,.20]})},
  // Halloween
  pumpkinLantern:{name:'笑脸南瓜灯',make:collectable(pumpkinLantern,{height:1.44,width:1.54,grip:[0,.44,0,.28,.28]})},
  cuteGhost:{name:'软萌小幽灵',make:collectable(cuteGhost,{height:1.52,width:1.44,grip:[0,.50,0,.26,.26]})},
  witchHat:{name:'星星魔法帽',make:collectable(witchHat,{height:1.54,width:1.62,grip:[0,.46,0,.30,.30]})},
  blackCat:{name:'戴帽小黑猫',make:collectable(blackCat,{height:1.62,width:1.38,grip:[0,.50,0,.24,.24]})},
  candyBucket:{name:'彩虹糖果桶',make:collectable(candyBucket,{height:1.46,width:1.46,grip:[0,.44,0,.28,.28]})},
  batBuddy:{name:'紫翼小蝙蝠',make:collectable(batBuddy,{height:1.26,width:1.96,grip:[0,.38,0,.34,.22]})},
  // Christmas
  santaClaus:{name:'圣诞老爷爷',make:collectable(santaClaus,{height:1.64,width:1.42,grip:[0,.52,0,.26,.24]})},
  christmasTree:{name:'星星圣诞树',make:collectable(christmasTree,{height:1.66,width:1.44,grip:[0,.52,0,.26,.26]})},
  reindeer:{name:'红鼻小驯鹿',make:collectable(reindeer,{height:1.58,width:1.56,grip:[0,.48,0,.26,.28]})},
  giftBox:{name:'蝴蝶结礼盒',make:collectable(giftBox,{height:1.38,width:1.56,grip:[0,.42,0,.30,.30]})},
  gingerbread:{name:'微笑姜饼人',make:collectable(gingerbread,{height:1.52,width:1.42,grip:[0,.50,0,.26,.20]})},
  sleighCar:{name:'红色雪橇车',make:collectable(sleighCar,{height:1.32,width:2.04,grip:[0,.42,0,.34,.24]})},
  // Gem Mine
  mineCart:{name:'宝石小矿车',make:collectable(mineCart,{height:1.42,width:1.94,grip:[0,.46,0,.32,.24]})},
  amethyst:{name:'紫水晶簇',make:collectable(amethyst,{height:1.50,width:1.56,grip:[0,.46,0,.28,.26]})},
  rubyHeart:{name:'红宝石爱心',make:collectable(rubyHeart,{height:1.46,width:1.48,grip:[0,.46,0,.28,.22]})},
  emeraldGem:{name:'绿宝石棱晶',make:collectable(emeraldGem,{height:1.56,width:1.32,grip:[0,.50,0,.24,.24]})},
  goldPickaxe:{name:'黄金小矿镐',make:collectable(goldPickaxe,{height:1.58,width:1.52,grip:[0,.54,0,.26,.20]})},
  minerMole:{name:'戴灯小鼹鼠',make:collectable(minerMole,{height:1.46,width:1.46,grip:[0,.46,0,.28,.26]})},
  // Superhero / Racing
  f1Racer:{name:'红色方程式',make:collectable(f1Racer,{height:1.12,width:2.08,grip:[0,.32,0,.34,.24]})},
  driftCar:{name:'蓝色漂移车',make:collectable(driftCar,{height:1.28,width:2.06,grip:[0,.38,0,.34,.24]})},
  monsterTruck:{name:'大脚越野车',make:collectable(monsterTruck,{height:1.48,width:1.96,grip:[0,.48,0,.32,.26]})},
  checkeredFlag:{name:'格子赛车旗',make:collectable(checkeredFlag,{height:1.64,width:1.48,grip:[0,.54,0,.26,.20]})},
  racingHelmet:{name:'闪电赛车盔',make:collectable(racingHelmet,{height:1.36,width:1.54,grip:[0,.42,0,.28,.28]})},
  podiumCup:{name:'冲刺金奖杯',make:collectable(podiumCup,{height:1.54,width:1.44,grip:[0,.50,0,.26,.24]})},
};
