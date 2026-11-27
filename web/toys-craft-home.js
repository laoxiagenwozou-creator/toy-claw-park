import {box,group,oval,paint,profile,rod,torus,tube} from './parts.js';
import {bead} from './sculpt.js';
import {collectable} from './models.js';

const ink=paint('#262d38','rubber'),white=paint('#fffaf2'),cream=paint('#f6ebd4');
const wood=paint('#b07846'),gold=paint('#f4c438','chrome'),pink=paint('#f69ab2');
const red=paint('#e24646'),blue=paint('#3b8be0'),green=paint('#4cb062');

function cuteEyes(p,y,z,sep=.10,r=.028){
  for(const s of [-1,1]){
    bead(p,ink,r,r*1.16,r*.7,s*sep,y,z);
    bead(p,white,r*.35,r*.35,r*.3,s*sep-r*.25,y+r*.32,z+r*.55);
  }
}

// 11) Art Studio stage (小小画室)
function easelBoard(p){
  rod(p,wood,[-.26,.04,.16],[0,.94,-.04],.032,8);
  rod(p,wood,[.26,.04,.16],[0,.94,-.04],.032,8);
  rod(p,wood,[0,.04,-.30],[0,.94,-.04],.032,8);
  box(p,white,.54,.46,.05,0,.58,.12,.015);
  box(p,wood,.58,.06,.12,0,.34,.14,.015);
  // Colorful mini painting on canvas
  box(p,paint('#78c8f4'),.46,.22,.02,0,.67,.15,.006);
  box(p,green,.46,.16,.02,0,.48,.15,.006);
  oval(p,gold,.06,.06,.02,.14,.70,.16);
}
function paletteToy(p){
  const cols=['#e84a43','#f4a232','#f7df4c','#4eb862','#3b8ce0','#9c5cd8'];
  oval(p,cream,.46,.12,.36,0,.18,0);
  cols.forEach((c,i)=>{
    const a=i*.92-.4;
    oval(p,paint(c),.075,.04,.075,Math.cos(a)*.26,.26,Math.sin(a)*.20);
  });
  rod(p,wood,[-.34,.22,.16],[.38,.44,-.14],.028,10);
  oval(p,blue,.07,.05,.05,.42,.46,-.16);
}
function paintTube(p){
  const body=paint('#4896e8'),cap=paint('#fff6df');
  tube(p,cap,.11,.13,.14,0,.08,0,16);
  tube(p,body,.18,.14,.58,0,.42,0,18);
  box(p,body,.42,.12,.12,0,.74,0,.025);
  box(p,white,.24,.26,.04,0,.44,.16,.012);
  cuteEyes(p,.54,.175,.065,.022);
}
function origamiCrane(p){
  const paper=paint('#ff8fab');
  profile(p,paper,[[-.28,0],[0,.24],[.28,0],[0,-.14]],.14,0,.36,0,.015);
  for(const s of [-1,1]){
    const w=profile(p,paper,[[0,0],[.46,.22],[.12,-.16]],.04,s*.08,.38,0,.01);
    if(s<0)w.scale.x=-1;
  }
  rod(p,paper,[0,.42,.14],[0,.74,.32],.045,8);
  rod(p,paper,[0,.74,.32],[0,.68,.44],.032,8);
  rod(p,paper,[0,.42,-.14],[0,.76,-.34],.042,8);
  box(p,paint('#f4dfbe'),.34,.08,.34,0,.04,0,.02);
}
function clayJar(p){
  const clay=paint('#d87c52'),band=paint('#3b86b8');
  tube(p,clay,.18,.22,.18,0,.10,0,18);
  oval(p,clay,.30,.28,.30,0,.38,0);
  torus(p,band,.29,.04,0,.38,0).rotation.x=Math.PI/2;
  tube(p,clay,.14,.18,.18,0,.66,0,18);
  torus(p,gold,.16,.035,0,.75,0).rotation.x=Math.PI/2;
  cuteEyes(p,.44,.29,.09,.024);
}
function crayonRocket(p){
  const body=paint('#ff6b6b'),tip=paint('#ffe066');
  tube(p,body,.18,.20,.64,0,.38,0,18);
  tube(p,tip,.03,.18,.26,0,.82,0,18);
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3;
    box(p,blue,.05,.20,.14,Math.sin(a)*.20,.16,Math.cos(a)*.20,.015).rotation.y=a;
  }
  cuteEyes(p,.48,.195,.07,.024);
}

// 12) Ice Cream Shop stage (冰淇淋小屋)
function softServe(p){
  const cone=paint('#df9c54'),swirl1=paint('#fff7e8'),swirl2=paint('#ff9cb6');
  tube(p,cone,.20,.05,.46,0,.24,0,18);
  torus(p,swirl1,.19,.085,0,.52,0).rotation.x=Math.PI/2;
  torus(p,swirl2,.15,.078,0,.64,0).rotation.x=Math.PI/2;
  oval(p,swirl1,.12,.14,.12,0,.78,0);
  oval(p,red,.055,.055,.055,.06,.88,.04);
  cuteEyes(p,.55,.24,.07,.022);
}
function popsicle(p){
  const stick=paint('#dfb67e'),mel=paint('#f25264'),rind=paint('#4cb562');
  box(p,stick,.09,.30,.04,0,.16,0,.015);
  box(p,rind,.42,.12,.16,0,.34,0,.035);
  box(p,mel,.42,.48,.16,0,.62,0,.08);
  for(const [x,y] of [[-.10,.70],[.10,.68],[0,.54]])oval(p,ink,.02,.032,.02,x,y,.085);
  cuteEyes(p,.64,.09,.08,.024);
}
function sundaeCup(p){
  const cup=paint('#8ed8f2','glass'),scoop1=paint('#fff2c4'),scoop2=paint('#ff9ab8'),choc=paint('#7a482c');
  tube(p,cup,.26,.16,.38,0,.22,0,20);
  tube(p,cup,.22,.24,.06,0,.03,0,20);
  oval(p,scoop1,.20,.18,.20,-.08,.48,0);
  oval(p,scoop2,.19,.18,.19,.10,.50,.04);
  oval(p,choc,.15,.14,.15,0,.66,0);
  oval(p,red,.06,.06,.06,0,.80,0);
  rod(p,paint('#df9c54'),[.12,.52,0],[.26,.86,0],.032,8);
}
function shavedIce(p){
  const bowl=paint('#fff7e8'),ice=paint('#b8e8ff'),syrup=paint('#4c8be6');
  tube(p,bowl,.34,.20,.22,0,.12,0,20);
  oval(p,ice,.30,.28,.30,0,.40,0);
  oval(p,syrup,.24,.18,.24,0,.52,0);
  oval(p,white,.10,.08,.10,0,.68,0);
  cuteEyes(p,.36,.29,.09,.024);
}
function bobaTea(p){
  const tea=paint('#e6bd8a'),lid=paint('#fff8ec'),straw=paint('#ff789a');
  tube(p,tea,.24,.18,.58,0,.30,0,20);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;oval(p,ink,.042,.042,.042,Math.cos(a)*.14,.10,Math.sin(a)*.14);}
  oval(p,lid,.25,.14,.25,0,.60,0);
  tube(p,straw,.045,.045,.34,.04,.82,0,12);
  cuteEyes(p,.42,.23,.08,.024);
}
function waffleCone(p){
  const waff=paint('#d89448'),berry=paint('#ff8eb0'),mint=paint('#86e0b8');
  box(p,waff,.54,.12,.54,0,.10,0,.04);
  for(const s of [-.14,0,.14]){box(p,paint('#b87430'),.48,.02,.04,0,.17,s,.005);box(p,paint('#b87430'),.04,.02,.48,s,.17,0,.005);}
  oval(p,berry,.20,.18,.20,-.10,.30,0);
  oval(p,mint,.19,.18,.19,.12,.30,0);
  oval(p,white,.12,.10,.12,0,.44,0);
  oval(p,red,.055,.055,.055,0,.54,0);
}

// 13) Pet Shop stage (萌宠咖啡馆)
function corgiPup(p){
  const fur=paint('#e69848');
  oval(p,fur,.38,.22,.24,0,.26,0);
  oval(p,white,.30,.12,.22,0,.18,0);
  oval(p,fur,.24,.22,.22,.28,.48,0);
  oval(p,white,.16,.12,.14,.38,.42,0);
  oval(p,ink,.04,.03,.03,.49,.45,0);
  for(const s of [-1,1]){
    profile(p,fur,[[-.07,0],[.07,0],[0,.18]],.05,.24,.66,s*.14,.01);
    oval(p,white,.07,.10,.07,-.22,.08,s*.13);
    oval(p,white,.07,.10,.07,.20,.08,s*.13);
  }
  for(const s of [-1,1])bead(p,ink,.024,.028,.024,.38,.52,s*.15);
}
function calicoCat(p){
  const patch1=paint('#e68e3c'),patch2=paint('#383c46');
  oval(p,white,.28,.28,.26,0,.32,0);
  oval(p,white,.25,.23,.24,0,.64,0);
  oval(p,patch1,.12,.11,.10,.12,.72,.08);
  oval(p,patch2,.11,.10,.09,-.12,.68,.08);
  for(const s of [-1,1]){
    profile(p,s>0?patch1:patch2,[[-.07,0],[.07,0],[0,.16]],.05,s*.14,.82,0,.01);
    oval(p,white,.07,.10,.10,s*.12,.08,.10);
  }
  rod(p,patch2,[0,.22,-.22],[0,.50,-.34],.042,10);
  cuteEyes(p,.65,.23,.09,.024);
  oval(p,pink,.032,.024,.02,0,.59,.24);
}
function hamsterWheel(p){
  const rim=paint('#5ec4b8'),ham=paint('#f0b670');
  box(p,rim,.52,.08,.34,0,.04,0,.02);
  torus(p,rim,.34,.055,0,.44,0);
  oval(p,ham,.16,.14,.16,0,.24,0);
  oval(p,white,.11,.08,.11,0,.20,.08);
  for(const s of [-1,1])oval(p,ham,.045,.045,.03,s*.10,.34,.06);
  cuteEyes(p,.26,.15,.055,.020);
}
function lopBunny(p){
  const fur=paint('#edd4be');
  oval(p,fur,.28,.28,.28,0,.30,0);
  oval(p,fur,.24,.22,.22,0,.62,.04);
  for(const s of [-1,1]){
    oval(p,fur,.08,.24,.06,s*.24,.50,.02).rotation.z=s*.18;
    oval(p,fur,.09,.10,.13,s*.13,.08,.08);
  }
  oval(p,white,.10,.10,.10,0,.24,-.26);
  cuteEyes(p,.64,.25,.085,.024);
  oval(p,pink,.035,.025,.02,0,.58,.26);
}
function parakeet(p){
  const body=paint('#6cd47a'),head=paint('#ffe25c'),wing=paint('#3ca85c');
  oval(p,body,.20,.30,.22,0,.38,0);
  oval(p,head,.18,.18,.18,0,.68,.04);
  oval(p,paint('#f49a3c'),.05,.06,.08,0,.64,.22);
  for(const s of [-1,1])oval(p,wing,.06,.22,.14,s*.20,.40,-.02).rotation.z=s*.14;
  rod(p,blue,[0,.22,-.16],[0,.08,-.38],.042,8);
  box(p,wood,.38,.06,.20,0,.06,0,.02);
  cuteEyes(p,.70,.19,.075,.022);
}
function catHouse(p){
  const post=paint('#dfbc86'),plush=paint('#ffb0c8');
  box(p,plush,.64,.08,.56,0,.05,0,.03);
  tube(p,post,.075,.075,.48,-.18,.30,0,14);
  tube(p,post,.075,.075,.72,.18,.42,0,14);
  box(p,plush,.36,.28,.34,-.18,.62,0,.04);
  oval(p,ink,.10,.10,.03,-.18,.62,.175);
  box(p,plush,.34,.08,.32,.18,.80,0,.03);
  oval(p,white,.10,.09,.10,.18,.90,0);
}

// 14) Greenhouse / Succulent stage (多肉植物园)
function succulentRose(p){
  const pot=paint('#e69a74'),leaf1=paint('#6ec28e'),leaf2=paint('#92d6a4');
  tube(p,pot,.26,.20,.28,0,.14,0,18);
  tube(p,pot,.29,.28,.06,0,.28,0,18);
  for(let ring=0;ring<2;ring++){
    const n=ring?6:8,rad=ring?.12:.22,y=ring?.44:.36;
    for(let i=0;i<n;i++){
      const a=i*Math.PI*2/n+ring*.4;
      const f=oval(p,ring?leaf2:leaf1,.12,.06,.08,Math.cos(a)*rad,y,Math.sin(a)*rad);
      f.rotation.y=-a;f.rotation.z=-.38;
    }
  }
  oval(p,pink,.08,.07,.08,0,.48,0);
}
function sunflowerPot(p){
  const pot=paint('#c8683e'),center=paint('#6b4226'),petal=paint('#ffd238');
  tube(p,pot,.22,.17,.26,0,.13,0,18);
  tube(p,green,.045,.045,.42,0,.42,0,12);
  for(const s of [-1,1])oval(p,green,.12,.05,.07,s*.12,.42,0).rotation.z=s*.35;
  oval(p,center,.16,.16,.08,0,.72,.04);
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5;
    oval(p,petal,.07,.11,.04,Math.cos(a)*.21,.72+Math.sin(a)*.21,.02).rotation.z=a-Math.PI/2;
  }
  cuteEyes(p,.74,.11,.06,.020);
}
function mushroomHouse(p){
  const cap=paint('#e64545'),door=paint('#9e6438');
  tube(p,cream,.24,.28,.40,0,.20,0,18);
  oval(p,cap,.46,.28,.46,0,.54,0);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;oval(p,white,.08,.06,.08,Math.cos(a)*.30,.58,Math.sin(a)*.30);}
  box(p,door,.16,.24,.06,0,.13,.26,.02);
  oval(p,gold,.06,.06,.04,.16,.28,.22);
}
function wateringCan(p){
  const body=paint('#52b88a');
  tube(p,body,.24,.26,.44,0,.24,0,20);
  rod(p,body,[.20,.20,0],[.54,.54,0],.045,10);
  tube(p,gold,.10,.05,.08,.56,.56,0,14).rotation.z=-.75;
  torus(p,body,.18,.042,-.22,.34,0);
  cuteEyes(p,.28,.25,.08,.024);
}
function bonsaiTree(p){
  const pot=paint('#3b6e8c'),trunk=paint('#7a4e32'),fol=paint('#4ca358');
  box(p,pot,.64,.18,.44,0,.09,0,.03);
  rod(p,trunk,[-.04,.18,0],[-.14,.50,0],.075,10);
  rod(p,trunk,[-.14,.50,0],[.14,.74,0],.06,10);
  oval(p,fol,.26,.14,.22,.16,.80,0);
  oval(p,fol,.22,.12,.18,-.22,.58,.06);
  oval(p,fol,.18,.11,.16,.28,.56,-.06);
}
function tulipPot(p){
  const pot=paint('#f2c864'),tulip=paint('#ff6896');
  tube(p,pot,.24,.18,.26,0,.13,0,18);
  tube(p,green,.04,.04,.38,0,.40,0,10);
  for(const s of [-1,1])oval(p,green,.07,.20,.04,s*.12,.40,0).rotation.z=-s*.32;
  oval(p,tulip,.16,.18,.16,0,.70,0);
  for(const s of [-1,1])oval(p,tulip,.10,.16,.12,s*.09,.74,0).rotation.z=-s*.18;
}

// 15) Library stage (童话绘本馆)
function bookStack(p){
  const b1=paint('#e65252'),b2=paint('#3b88d6'),b3=paint('#4cb268');
  box(p,b1,.68,.16,.48,0,.09,0,.025);
  box(p,cream,.64,.12,.44,.02,.09,0,.01);
  const m2=box(p,b2,.62,.16,.44,0,.26,0,.025);m2.rotation.y=.14;
  const m3=box(p,b3,.56,.16,.40,0,.43,0,.025);m3.rotation.y=-.12;
  oval(p,gold,.10,.08,.10,0,.56,0);
}
function storyClock(p){
  const house=paint('#a86c3e'),roof=paint('#c8443a');
  box(p,house,.48,.58,.32,0,.34,0,.035);
  profile(p,roof,[[-.34,0],[0,.28],[.34,0]],.38,0,.62,0,.02);
  oval(p,cream,.15,.15,.04,0,.38,.16);
  box(p,ink,.025,.09,.02,0,.42,.18,.006);
  box(p,ink,.08,.025,.02,.04,.38,.18,.006);
  oval(p,gold,.06,.06,.06,0,.68,.16);
}
function retroRadio(p){
  const caseM=paint('#4aa8a0'),grill=paint('#f4e6c8');
  box(p,caseM,.78,.46,.32,0,.26,0,.06);
  box(p,grill,.36,.28,.04,-.14,.26,.16,.02);
  box(p,cream,.24,.12,.04,.20,.34,.16,.015);
  for(const x of [.14,.26])tube(p,gold,.045,.045,.06,x,.18,.17,14).rotation.x=Math.PI/2;
  rod(p,paint('#cfd8e0','chrome'),[.26,.48,0],[.46,.82,0],.018,8);
}
function teddyReader(p){
  const fur=paint('#c4844c'),book=paint('#3b88d6');
  oval(p,fur,.28,.28,.24,0,.30,0);
  oval(p,fur,.24,.23,.22,0,.66,0);
  oval(p,cream,.10,.08,.08,0,.60,.20);
  oval(p,ink,.038,.028,.03,0,.64,.26);
  for(const s of [-1,1]){
    oval(p,fur,.085,.085,.06,s*.20,.84,0);
    torus(p,gold,.065,.014,s*.085,.69,.22);
    oval(p,fur,.08,.12,.12,s*.14,.10,.14);
  }
  box(p,book,.34,.06,.24,0,.28,.26,.015);
  box(p,white,.30,.04,.20,0,.31,.26,.01);
  cuteEyes(p,.69,.22,.085,.022);
}
function featherQuill(p){
  const pot=paint('#2e4c7a','enamel'),plume=paint('#ff82a8');
  tube(p,pot,.22,.24,.30,0,.15,0,18);
  tube(p,gold,.14,.16,.10,0,.34,0,16);
  rod(p,white,[0,.34,0],[.22,.96,0],.024,8);
  const f=oval(p,plume,.14,.32,.05,.18,.78,0);f.rotation.z=-.34;
}
function globeLamp(p){
  const base=paint('#7a5234'),orb=paint('#6274cc','glass');
  tube(p,base,.24,.28,.16,0,.08,0,18);
  oval(p,orb,.32,.32,.32,0,.46,0);
  for(const [x,y,z] of [[.14,.56,.26],[-.16,.48,.26],[0,.66,.22],[.10,.36,-.28]])oval(p,gold,.045,.045,.045,x,y,z);
}

export const CRAFT_HOME={
  // Art Studio
  easelBoard:{name:'木质小画架',make:collectable(easelBoard,{height:1.58,width:1.44,grip:[0,.52,0,.26,.22]})},
  paletteToy:{name:'彩虹调色盘',make:collectable(paletteToy,{height:1.14,width:1.86,grip:[0,.28,0,.34,.30]})},
  paintTube:{name:'颜料挤压管',make:collectable(paintTube,{height:1.54,width:1.26,grip:[0,.48,0,.24,.22]})},
  origamiCrane:{name:'千纸鹤摆件',make:collectable(origamiCrane,{height:1.44,width:1.84,grip:[0,.44,0,.32,.30]})},
  clayJar:{name:'彩陶小花瓶',make:collectable(clayJar,{height:1.50,width:1.36,grip:[0,.48,0,.26,.26]})},
  crayonRocket:{name:'画笔小精灵',make:collectable(crayonRocket,{height:1.62,width:1.28,grip:[0,.52,0,.24,.24]})},
  // Ice Cream Shop
  softServe:{name:'双旋甜筒',make:collectable(softServe,{height:1.62,width:1.24,grip:[0,.54,0,.22,.22]})},
  popsicle:{name:'西瓜冰棒',make:collectable(popsicle,{height:1.58,width:1.26,grip:[0,.54,0,.24,.20]})},
  sundaeCup:{name:'圣代冰淇淋杯',make:collectable(sundaeCup,{height:1.52,width:1.38,grip:[0,.50,0,.26,.26]})},
  shavedIce:{name:'蓝莓刨冰山',make:collectable(shavedIce,{height:1.42,width:1.52,grip:[0,.44,0,.28,.28]})},
  bobaTea:{name:'珍珠奶茶杯',make:collectable(bobaTea,{height:1.62,width:1.26,grip:[0,.50,0,.24,.24]})},
  waffleCone:{name:'华夫冰淇淋',make:collectable(waffleCone,{height:1.26,width:1.66,grip:[0,.36,0,.30,.30]})},
  // Pet Shop
  corgiPup:{name:'短腿小柯基',make:collectable(corgiPup,{height:1.36,width:1.86,grip:[0,.42,0,.32,.24]})},
  calicoCat:{name:'三花布偶猫',make:collectable(calicoCat,{height:1.52,width:1.42,grip:[0,.48,0,.26,.24]})},
  hamsterWheel:{name:'滚轮小仓鼠',make:collectable(hamsterWheel,{height:1.48,width:1.54,grip:[0,.48,0,.28,.22]})},
  lopBunny:{name:'垂耳小兔',make:collectable(lopBunny,{height:1.46,width:1.48,grip:[0,.46,0,.26,.26]})},
  parakeet:{name:'虎皮小鹦鹉',make:collectable(parakeet,{height:1.54,width:1.38,grip:[0,.50,0,.24,.24]})},
  catHouse:{name:'粉色猫爬架',make:collectable(catHouse,{height:1.56,width:1.68,grip:[0,.48,0,.30,.26]})},
  // Greenhouse
  succulentRose:{name:'莲花小多肉',make:collectable(succulentRose,{height:1.26,width:1.56,grip:[0,.36,0,.28,.28]})},
  sunflowerPot:{name:'微笑向日葵',make:collectable(sunflowerPot,{height:1.62,width:1.36,grip:[0,.52,0,.24,.22]})},
  mushroomHouse:{name:'红点蘑菇屋',make:collectable(mushroomHouse,{height:1.46,width:1.68,grip:[0,.46,0,.30,.30]})},
  wateringCan:{name:'绿叶洒水壶',make:collectable(wateringCan,{height:1.38,width:1.86,grip:[0,.42,0,.32,.24]})},
  bonsaiTree:{name:'迎客小松树',make:collectable(bonsaiTree,{height:1.52,width:1.72,grip:[0,.48,0,.30,.24]})},
  tulipPot:{name:'郁金香花盆',make:collectable(tulipPot,{height:1.58,width:1.32,grip:[0,.50,0,.24,.24]})},
  // Library
  bookStack:{name:'彩色绘本叠',make:collectable(bookStack,{height:1.28,width:1.68,grip:[0,.38,0,.30,.26]})},
  storyClock:{name:'布谷鸟挂钟',make:collectable(storyClock,{height:1.56,width:1.44,grip:[0,.50,0,.26,.22]})},
  retroRadio:{name:'复古收音机',make:collectable(retroRadio,{height:1.44,width:1.82,grip:[0,.42,0,.32,.22]})},
  teddyReader:{name:'戴眼镜小熊',make:collectable(teddyReader,{height:1.50,width:1.46,grip:[0,.48,0,.26,.26]})},
  featherQuill:{name:'羽毛墨水瓶',make:collectable(featherQuill,{height:1.66,width:1.28,grip:[0,.52,0,.24,.24]})},
  globeLamp:{name:'星空小夜灯',make:collectable(globeLamp,{height:1.50,width:1.42,grip:[0,.48,0,.26,.26]})},
};
