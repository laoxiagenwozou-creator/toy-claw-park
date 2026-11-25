import {box,group,oval,paint,profile,rod,torus,tube} from './parts.js';
import {bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';

const ink=paint('#2d313d','rubber'),white=paint('#fffaf0'),cream=paint('#fdf2dc');
const leaf=paint('#4aa85d'),gold=paint('#f3c142');

function eyes(p,y,z,sep=.11,r=.028){
  for(const s of [-1,1]){
    bead(p,ink,r,r*1.16,r*.7,s*sep,y,z);
    bead(p,white,r*.34,r*.34,r*.3,s*sep-r*.25,y+r*.32,z+r*.55);
  }
}

// 6) Sweet Bakery stage
function shortcake(p){
  const sponge=paint('#f7d58b'),icing=paint('#fff7ec'),berry=paint('#e2474c');
  tube(p,sponge,.40,.42,.38,0,.20,0,28);
  tube(p,berry,.41,.41,.07,0,.20,0,28);
  tube(p,icing,.42,.42,.12,0,.40,0,28);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;oval(p,icing,.09,.08,.09,Math.cos(a)*.33,.49,Math.sin(a)*.33);}
  oval(p,berry,.14,.16,.14,0,.58,0);
  oval(p,leaf,.08,.03,.05,.07,.70,0).rotation.z=.4;
  eyes(p,.26,.41,.11,.026);
}
function donutPink(p){
  const dough=paint('#e6a85a'),glaze=paint('#f68bb1');
  const base=torus(p,dough,.34,.16,0,.48,0);base.rotation.x=0;
  const top=torus(p,glaze,.34,.145,0,.49,.035);top.rotation.x=0;
  const cols=['#ffe066','#63d2ff','#9cf28b','#fff8f0'];
  for(let i=0;i<10;i++){const a=i*Math.PI/5;box(p,paint(cols[i%4]),.08,.032,.032,Math.cos(a)*.34,.49+Math.sin(a)*.34,.175,.01).rotation.z=a+.6;}
  box(p,paint('#e6b97a'),.36,.06,.24,0,.04,0,.02);
}
function croissant(p){
  const crust=paint('#dfa046'),hi=paint('#f2bd66');
  sweep(p,crust,[[-.46,.16,.14],[-.26,.28,-.06],[0,.34,-.12],[.26,.28,-.06],[.46,.16,.14]],[.09,.17,.22,.17,.09],{segments:16});
  for(const x of [-.22,0,.22])oval(p,hi,.09,.19,.18,x,.31,-.09);
  eyes(p,.32,.11,.10,.026);
}
function macaronTower(p){
  for(const [y,c] of [[.14,'#f69eb8'],[.40,'#8ad9c2'],[.66,'#f6d46b']]){
    const m=paint(c);
    oval(p,m,.34,.085,.34,0,y-.045,0);
    tube(p,cream,.31,.31,.06,0,y+.02,0,24);
    oval(p,m,.34,.085,.34,0,y+.085,0);
  }
  eyes(p,.74,.32,.10,.024);
}
function bearCookie(p){
  const dough=paint('#cf8f4e'),choc=paint('#593825');
  oval(p,dough,.38,.36,.15,0,.40,0);
  for(const s of [-1,1])oval(p,dough,.14,.14,.12,s*.28,.70,0);
  oval(p,cream,.14,.11,.08,0,.35,.13);
  oval(p,choc,.055,.04,.04,0,.39,.19);
  eyes(p,.48,.14,.12,.028);
  box(p,choc,.26,.06,.16,0,.05,0,.02);
}
function matchaCupcake(p){
  const cup=paint('#f49386'),tea=paint('#74b86a');
  tube(p,cup,.30,.22,.34,0,.18,0,22);
  oval(p,tea,.34,.16,.34,0,.40,0);
  oval(p,tea,.25,.14,.25,0,.54,0);
  oval(p,tea,.14,.12,.14,0,.66,0);
  oval(p,paint('#e2474c'),.075,.075,.075,0,.77,0);
  eyes(p,.20,.28,.09,.024);
}

// 7) Fruit Orchard stage
function strawberry(p){
  const red=paint('#e6454d');
  loft(p,red,[[.04,.14,.14],[.22,.34,.34],[.48,.40,.40],[.70,.28,.28],[.78,.06,.06]],{sides:28});
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(p,leaf,.14,.04,.08,Math.cos(a)*.14,.78,Math.sin(a)*.14).rotation.y=-a;}
  for(const [x,y,z] of [[.26,.34,.24],[-.26,.34,.24],[.30,.50,-.18],[-.30,.50,-.18]])oval(p,gold,.026,.035,.02,x,y,z);
  eyes(p,.46,.39,.12,.030);
}
function watermelon(p){
  const rind=paint('#358c4e'),flesh=paint('#ef575e');
  profile(p,rind,[[-.50,.10],[.50,.10],[.46,.02],[0,-.04],[-.46,.02]],.24,0,.12,0,.02);
  profile(p,white,[[-.46,.14],[.46,.14],[.43,.09],[-.43,.09]],.23,0,.12,0,.015);
  profile(p,flesh,[[-.44,.14],[.44,.14],[0,.74]],.22,0,.12,0,.025);
  for(const [x,y] of [[-.14,.32],[.14,.32],[0,.52]])oval(p,ink,.025,.036,.125,x,y,0);
  eyes(p,.42,.13,.09,.024);
}
function pineapple(p){
  const body=paint('#f2b936'),grid=paint('#d88f1e');
  oval(p,body,.34,.40,.34,0,.42,0);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(p,grid,.05,.32,.05,Math.cos(a)*.31,.42,Math.sin(a)*.31);}
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const l=oval(p,leaf,.07,.24,.04,Math.cos(a)*.09,.90,Math.sin(a)*.09);l.rotation.z=-Math.cos(a)*.38;l.rotation.x=Math.sin(a)*.38;}
  eyes(p,.46,.34,.11,.028);
}
function redApple(p){
  const red=paint('#de3e44'),stem=paint('#6e482b');
  oval(p,red,.38,.36,.36,0,.38,0);
  tube(p,stem,.025,.032,.18,0,.78,0,10);
  oval(p,leaf,.13,.045,.07,.12,.80,0).rotation.z=.4;
  eyes(p,.42,.36,.12,.028);
}
function bananaBoat(p){
  const yel=paint('#f6d242'),tip=paint('#7a5832');
  sweep(p,yel,[[-.50,.48,0],[-.24,.24,0],[0,.18,0],[.24,.24,0],[.50,.48,0]],[.07,.17,.19,.17,.07],{segments:16});
  oval(p,tip,.05,.06,.05,-.52,.50,0);oval(p,tip,.05,.06,.05,.52,.50,0);
  eyes(p,.24,.18,.10,.026);
}
function grapeCluster(p){
  const pur=paint('#8a52b8'),stem=paint('#5a3e28');
  for(const [x,y,z] of [[0,.18,0],[-.14,.34,.10],[.14,.34,.10],[0,.34,-.14],[-.22,.52,.10],[0,.52,.16],[.22,.52,.10],[-.14,.52,-.14],[.14,.52,-.14],[-.14,.68,.08],[.14,.68,.08],[0,.68,-.10]])
    oval(p,pur,.14,.14,.14,x,y,z);
  tube(p,stem,.03,.035,.18,0,.84,0,10);
  oval(p,leaf,.14,.045,.09,.14,.84,0).rotation.z=.3;
  eyes(p,.54,.29,.09,.024);
}

// 8) Cozy Kitchen stage
function shrimpSushi(p){
  const rice=paint('#fffbf2'),shrimp=paint('#f26e46'),nori=paint('#26322b','satin');
  box(p,rice,.66,.26,.38,0,.15,0,.09);
  oval(p,shrimp,.42,.11,.20,.02,.32,0);
  oval(p,shrimp,.14,.08,.16,.44,.28,0).rotation.z=-.4;
  box(p,nori,.16,.34,.42,0,.20,0,.015);
  eyes(p,.17,.20,.09,.024);
}
function ramenBowl(p){
  const bowl=paint('#d94b43'),broth=paint('#f2c268'),egg=paint('#fff9eb');
  tube(p,bowl,.44,.26,.36,0,.20,0,26);
  tube(p,broth,.40,.40,.05,0,.37,0,24);
  oval(p,egg,.13,.04,.10,-.14,.42,.06);oval(p,gold,.065,.045,.055,-.14,.43,.06);
  oval(p,paint('#f69eb0'),.11,.035,.11,.15,.42,-.06);
  box(p,paint('#26322b','satin'),.03,.24,.22,.28,.48,-.12,.008);
  rod(p,paint('#9c6838'),[-.36,.44,.22],[.42,.56,.18],.018,8);
  rod(p,paint('#9c6838'),[-.36,.44,.14],[.42,.54,.10],.018,8);
}
function burger(p){
  const bun=paint('#e6a24c'),patty=paint('#6e3f28'),cheese=paint('#f8c83c');
  tube(p,bun,.38,.36,.12,0,.08,0,26);
  tube(p,patty,.40,.40,.11,0,.19,0,24);
  box(p,cheese,.62,.04,.62,0,.26,0,.01).rotation.y=.4;
  tube(p,leaf,.42,.42,.06,0,.31,0,22);
  tube(p,paint('#e04842'),.36,.36,.06,0,.37,0,22);
  oval(p,bun,.40,.22,.40,0,.44,0);
  for(const [x,z] of [[-.14,.12],[.14,.10],[0,-.16],[-.12,-.10],[.12,-.12]])oval(p,cream,.035,.018,.02,x,.64,z);
  eyes(p,.50,.38,.11,.026);
}
function pizzaSlice(p){
  const crust=paint('#df9c44'),cheese=paint('#f7cb48'),pep=paint('#d8443c');
  profile(p,cheese,[[-.44,.06],[.44,.06],[0,.80]],.16,0,.06,0,.02);
  tube(p,crust,.09,.09,.92,0,.09,0,16).rotation.z=Math.PI/2;
  for(const [x,y] of [[-.16,.24],[.16,.24],[0,.46]])oval(p,pep,.08,.08,.095,x,y,0);
  eyes(p,.36,.09,.09,.024);
}
function fryPanEgg(p){
  const pan=paint('#383f4c','chrome');
  tube(p,pan,.42,.38,.12,0,.08,0,26);
  rod(p,pan,[.36,.10,0],[.82,.16,0],.045,10);
  oval(p,white,.30,.045,.26,-.02,.15,0);
  oval(p,gold,.13,.095,.13,-.02,.19,0);
  eyes(p,.23,.12,.06,.020);
}
function teaPot(p){
  const pot=paint('#5fb3b0'),trim=paint('#f6e6c2');
  oval(p,pot,.38,.32,.36,0,.34,0);
  tube(p,trim,.22,.24,.06,0,.64,0,22);
  oval(p,pot,.08,.08,.08,0,.72,0);
  sweep(p,pot,[[.30,.30,0],[.54,.44,0],[.60,.58,0]],[.08,.06,.045],{segments:10});
  const handle=torus(p,trim,.18,.045,-.38,.36,0);handle.rotation.z=0;
  eyes(p,.38,.36,.11,.026);
}

// 9) Panda Bamboo Grove stage
function giantPanda(p){
  const blk=paint('#2a2d36');
  oval(p,white,.38,.38,.34,0,.40,0);
  oval(p,white,.31,.29,.29,0,.80,0);
  for(const s of [-1,1]){
    oval(p,blk,.11,.11,.09,s*.24,1.02,0);
    oval(p,blk,.09,.11,.04,s*.12,.82,.27).rotation.z=s*.25;
    bead(p,white,.024,.028,.02,s*.12,.84,.30);
    oval(p,blk,.11,.18,.11,s*.34,.46,.04).rotation.z=s*.4;
    oval(p,blk,.13,.10,.16,s*.18,.12,.14);
  }
  oval(p,blk,.05,.035,.04,0,.75,.29);
}
function redPanda(p){
  const rust=paint('#c85a32'),dark=paint('#3d251d');
  oval(p,rust,.34,.32,.30,0,.38,0);
  oval(p,rust,.28,.24,.26,0,.72,0);
  for(const s of [-1,1]){
    oval(p,white,.10,.08,.05,s*.14,.68,.24);
    oval(p,rust,.10,.12,.06,s*.22,.92,0);
    oval(p,white,.06,.07,.04,s*.22,.92,.04);
    oval(p,dark,.10,.16,.10,s*.28,.40,.06);
    oval(p,dark,.11,.09,.14,s*.16,.11,.12);
  }
  eyes(p,.76,.26,.11,.026);
  sweep(p,rust,[[0,.24,-.26],[0,.36,-.56],[0,.46,-.80]],[.12,.14,.10],{segments:12});
  for(const z of [-.42,-.60,-.74])oval(p,cream,.13,.13,.04,0,.36,z);
}
function bambooShoot(p){
  const grn=paint('#74b856'),husk=paint('#a87c4a');
  loft(p,grn,[[.04,.30,.30],[.34,.28,.28],[.68,.18,.18],[.96,.04,.04]],{sides:24});
  for(const y of [.16,.36,.56])tube(p,husk,.31-y*.16,.33-y*.16,.14,0,y,0,22);
  eyes(p,.48,.24,.09,.026);
}
function redLantern(p){
  const red=paint('#dc3832');
  oval(p,red,.40,.34,.40,0,.48,0);
  tube(p,gold,.22,.22,.08,0,.82,0,20);
  tube(p,gold,.22,.22,.08,0,.14,0,20);
  tube(p,red,.06,.09,.16,0,.02,0,12);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;oval(p,gold,.03,.32,.03,Math.cos(a)*.39,.48,Math.sin(a)*.39);}
}
function porcelainCup(p){
  const blu=paint('#3468b4');
  tube(p,white,.34,.24,.46,0,.24,0,28);
  tube(p,blu,.345,.33,.06,0,.43,0,28);
  tube(p,blu,.29,.27,.07,0,.24,0,28);
  const h=torus(p,white,.13,.038,.33,.26,0);h.rotation.z=0;
  eyes(p,.30,.31,.09,.024);
}
function bambooFan(p){
  const silk=paint('#92d4a6'),wood=paint('#9e6c3b');
  tube(p,silk,.42,.42,.06,0,.58,0,28).rotation.x=Math.PI/2;
  torus(p,wood,.42,.032,0,.58,0);
  tube(p,wood,.038,.045,.28,0,.14,0,12);
  box(p,wood,.22,.05,.18,0,.03,0,.02);
  eyes(p,.60,.04,.12,.028);
}

// 10) Insect Secret Garden stage
function ladybug(p){
  const red=paint('#df3b38'),blk=paint('#262932');
  oval(p,red,.40,.30,.44,0,.26,0);
  oval(p,blk,.22,.18,.18,0,.24,.40);
  box(p,blk,.04,.30,.82,0,.28,-.02,.01);
  for(const [x,y,z] of [[.20,.42,.10],[-.20,.42,.10],[.24,.36,-.18],[-.24,.36,-.18]])oval(p,blk,.075,.06,.075,x,y,z);
  for(const s of [-1,1]){bead(p,white,.034,.038,.025,s*.09,.28,.55);bead(p,blk,.02,.024,.02,s*.09,.28,.57);}
}
function butterfly(p){
  const blu=paint('#4aa8f0'),trim=paint('#234c8a'),body=paint('#383d4a');
  oval(p,body,.08,.10,.34,0,.38,0);
  for(const s of [-1,1]){
    const w1=oval(p,blu,.32,.04,.24,s*.30,.46,.12);w1.rotation.z=s*.32;
    const w2=oval(p,trim,.24,.04,.18,s*.24,.36,-.14);w2.rotation.z=s*.22;
    oval(p,gold,.08,.045,.07,s*.34,.48,.14).rotation.z=s*.32;
  }
  box(p,leaf,.26,.08,.26,0,.05,0,.03);
}
function honeyBee(p){
  const yel=paint('#f6c836'),blk=paint('#2b2f3a'),wing=paint('#d8f2ff','glass');
  oval(p,yel,.30,.28,.40,0,.38,0);
  for(const z of [-.14,.06])tube(p,blk,.29,.29,.09,0,.38,z,24).rotation.x=Math.PI/2;
  for(const s of [-1,1]){
    const w=oval(p,wing,.24,.035,.14,s*.26,.62,-.04);w.rotation.z=s*.4;
    bead(p,blk,.032,.038,.025,s*.11,.42,.38);
    bead(p,white,.012,.012,.01,s*.11-.01,.44,.40);
  }
  box(p,paint('#f4d27c'),.28,.06,.28,0,.04,0,.02);
}
function beetle(p){
  const brn=paint('#6e442c'),dark=paint('#462819');
  oval(p,brn,.34,.24,.44,0,.26,0);
  oval(p,dark,.24,.20,.20,0,.26,.38);
  sweep(p,dark,[[0,.34,.48],[0,.54,.64],[0,.70,.56]],[.05,.04,.025],{segments:10});
  for(const s of [-1,1])for(const z of [-.20,0,.20])rod(p,dark,[s*.28,.20,z],[s*.44,.04,z],.028,8);
  eyes(p,.30,.54,.10,.024);
}
function mantis(p){
  const grn=paint('#66bf58'),hi=paint('#9ee384');
  oval(p,grn,.18,.16,.38,0,.28,-.10);
  tube(p,grn,.075,.09,.38,0,.52,.18,14).rotation.x=.35;
  oval(p,hi,.18,.12,.14,0,.74,.26);
  for(const s of [-1,1]){
    oval(p,gold,.055,.055,.045,s*.14,.78,.32);
    bead(p,ink,.022,.022,.02,s*.15,.78,.36);
    rod(p,grn,[s*.08,.56,.22],[s*.18,.44,.40],.03,8);
    rod(p,grn,[s*.18,.44,.40],[s*.10,.30,.30],.026,8);
    for(const z of [-.24,0])rod(p,grn,[s*.14,.22,z],[s*.32,.04,z],.026,8);
  }
}
function snail(p){
  const shell=paint('#e68248'),swirl=paint('#f6ca6e'),body=paint('#a8d482');
  oval(p,body,.18,.13,.46,0,.14,.04);
  const sh=tube(p,shell,.28,.28,.24,0,.38,-.08,24);sh.rotation.z=Math.PI/2;
  const sw=torus(p,swirl,.15,.038,0,.38,-.08);sw.rotation.y=Math.PI/2;
  for(const s of [-1,1]){
    rod(p,body,[s*.07,.22,.36],[s*.12,.42,.48],.022,8);
    oval(p,white,.052,.052,.052,s*.12,.44,.49);
    bead(p,ink,.026,.026,.026,s*.12,.44,.53);
  }
}

export const FOOD_NATURE={
  shortcake:{name:'草莓奶油蛋糕',make:collectable(shortcake,{height:1.42,width:1.60,grip:[0,.38,0,.30,.30]})},
  donutPink:{name:'草莓甜甜圈',make:collectable(donutPink,{height:1.38,width:1.68,grip:[0,.48,0,.30,.24]})},
  croissant:{name:'金黄牛角包',make:collectable(croissant,{height:1.15,width:1.95,grip:[0,.28,0,.36,.24]})},
  macaronTower:{name:'三层马卡龙',make:collectable(macaronTower,{height:1.52,width:1.48,grip:[0,.44,0,.28,.28]})},
  bearCookie:{name:'小熊曲奇',make:collectable(bearCookie,{height:1.46,width:1.62,grip:[0,.44,0,.30,.22]})},
  matchaCupcake:{name:'抹茶纸杯蛋糕',make:collectable(matchaCupcake,{height:1.52,width:1.45,grip:[0,.42,0,.26,.26]})},
  strawberry:{name:'大草莓宝宝',make:collectable(strawberry,{height:1.48,width:1.52,grip:[0,.44,0,.30,.30]})},
  watermelon:{name:'西瓜切块',make:collectable(watermelon,{height:1.42,width:1.80,grip:[0,.38,0,.32,.22]})},
  pineapple:{name:'金黄小菠萝',make:collectable(pineapple,{height:1.62,width:1.48,grip:[0,.44,0,.28,.28]})},
  redApple:{name:'红彤彤苹果',make:collectable(redApple,{height:1.46,width:1.55,grip:[0,.40,0,.30,.30]})},
  bananaBoat:{name:'香蕉小船',make:collectable(bananaBoat,{height:1.18,width:1.98,grip:[0,.28,0,.36,.22]})},
  grapeCluster:{name:'紫葡萄串',make:collectable(grapeCluster,{height:1.54,width:1.48,grip:[0,.48,0,.28,.28]})},
  shrimpSushi:{name:'鲜虾寿司',make:collectable(shrimpSushi,{height:1.12,width:1.92,grip:[0,.22,0,.36,.24]})},
  ramenBowl:{name:'热气拉面碗',make:collectable(ramenBowl,{height:1.28,width:1.78,grip:[0,.30,0,.34,.34]})},
  burger:{name:'双层芝士汉堡',make:collectable(burger,{height:1.38,width:1.66,grip:[0,.36,0,.32,.32]})},
  pizzaSlice:{name:'拉丝披萨角',make:collectable(pizzaSlice,{height:1.44,width:1.76,grip:[0,.38,0,.32,.22]})},
  fryPanEgg:{name:'荷包蛋煎锅',make:collectable(fryPanEgg,{height:1.08,width:2.02,grip:[0,.16,0,.34,.32]})},
  teaPot:{name:'圆滚滚茶壶',make:collectable(teaPot,{height:1.38,width:1.88,grip:[0,.38,0,.32,.28]})},
  giantPanda:{name:'大熊猫滚滚',make:collectable(giantPanda,{height:1.56,width:1.66,grip:[0,.56,0,.30,.28]})},
  redPanda:{name:'小熊猫',make:collectable(redPanda,{height:1.46,width:1.90,grip:[0,.48,0,.28,.34]})},
  bambooShoot:{name:'鲜嫩竹笋',make:collectable(bambooShoot,{height:1.56,width:1.36,grip:[0,.46,0,.24,.24]})},
  redLantern:{name:'吉祥红灯笼',make:collectable(redLantern,{height:1.50,width:1.56,grip:[0,.48,0,.30,.30]})},
  porcelainCup:{name:'青花小茶杯',make:collectable(porcelainCup,{height:1.34,width:1.62,grip:[0,.28,0,.28,.28]})},
  bambooFan:{name:'竹韵小团扇',make:collectable(bambooFan,{height:1.56,width:1.58,grip:[0,.52,0,.30,.20]})},
  ladybug:{name:'七星瓢虫',make:collectable(ladybug,{height:1.18,width:1.78,grip:[0,.26,0,.32,.36]})},
  butterfly:{name:'蓝闪蝴蝶',make:collectable(butterfly,{height:1.24,width:1.90,grip:[0,.38,0,.34,.28]})},
  honeyBee:{name:'胖胖小蜜蜂',make:collectable(honeyBee,{height:1.34,width:1.76,grip:[0,.38,0,.28,.32]})},
  beetle:{name:'独角仙',make:collectable(beetle,{height:1.30,width:1.86,grip:[0,.30,0,.30,.36]})},
  mantis:{name:'翠绿小螳螂',make:collectable(mantis,{height:1.50,width:1.72,grip:[0,.44,0,.26,.30]})},
  snail:{name:'彩壳小蜗牛',make:collectable(snail,{height:1.32,width:1.85,grip:[0,.30,0,.28,.36]})},
};
