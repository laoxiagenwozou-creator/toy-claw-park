import {box,group,oval,paint,profile,rod,torus,tube} from './parts.js';
import {bead} from './sculpt.js';
import {collectable} from './models.js';

const ink=paint('#262d38','rubber'),white=paint('#fffaf2'),cream=paint('#f6ebd4');
const gold=paint('#f3c43c','chrome'),red=paint('#de3d38'),amber=paint('#f49b36');
const wood=paint('#9e683c'),jade=paint('#4cb08a'),blue=paint('#3684d4');

function cuteEyes(p,y,z,sep=.10,r=.028){
  for(const s of [-1,1]){
    bead(p,ink,r,r*1.16,r*.7,s*sep,y,z);
    bead(p,white,r*.35,r*.35,r*.3,s*sep-r*.25,y+r*.32,z+r*.55);
  }
}

// 6) Festival stage (新春庙会街)
function lionDance(p){
  oval(p,red,.36,.32,.34,0,.44,0);
  // Fluffy white fur trim & gold horn
  for(let i=0;i<8;i++){const a=i*Math.PI/4;oval(p,white,.085,.085,.085,Math.cos(a)*.33,.44+Math.sin(a)*.29,.12);}
  oval(p,gold,.07,.12,.07,0,.80,.06);
  for(const s of [-1,1]){
    oval(p,gold,.09,.09,.06,s*.28,.74,-.04);
    oval(p,white,.09,.09,.05,s*.13,.50,.32);
    oval(p,ink,.04,.04,.03,s*.13,.50,.36);
    oval(p,red,.10,.12,.12,s*.15,.12,.04);
  }
  box(p,gold,.26,.09,.12,0,.32,.32,.03);
}
function goldIngot(p){
  const shine=paint('#ffe070','chrome');
  oval(p,gold,.54,.24,.30,0,.22,0);
  for(const s of [-1,1])oval(p,gold,.22,.22,.24,s*.34,.36,0).rotation.z=-s*.38;
  oval(p,shine,.24,.24,.22,0,.44,0);
  cuteEyes(p,.32,.29,.10,.026);
}
function tanghulu(p){
  const stick=paint('#d8b07a'),berry=paint('#d93232','enamel'),glaze=paint('#ff9eb0','glass');
  tube(p,stick,.032,.032,1.16,0,.58,0,10);
  tube(p,paint('#e6b85c'),.18,.22,.10,0,.05,0,16);
  for(let i=0;i<4;i++){
    const y=.36+i*.22;
    oval(p,berry,.14,.13,.14,0,y,0);
    oval(p,glaze,.15,.14,.15,0,y,0);
  }
  cuteEyes(p,.80,.15,.055,.020);
}
function dragonHead(p){
  const body=paint('#e6483e'),mane=paint('#4db87a');
  oval(p,body,.32,.28,.36,0,.44,0);
  box(p,body,.30,.16,.24,0,.34,.28,.05);
  for(const s of [-1,1]){
    rod(p,gold,[s*.12,.68,-.04],[s*.22,.96,-.10],.032,10);
    oval(p,mane,.10,.12,.08,s*.32,.50,-.08);
    oval(p,gold,.06,.05,.05,s*.09,.41,.38);
    oval(p,body,.10,.12,.12,s*.14,.10,0);
  }
  oval(p,mane,.18,.14,.14,0,.64,-.24);
  cuteEyes(p,.54,.30,.11,.028);
}
function fortuneCat(p){
  const collar=paint('#df3c38');
  oval(p,white,.30,.32,.26,0,.34,0);
  oval(p,white,.26,.24,.24,0,.68,0);
  for(const s of [-1,1]){
    profile(p,white,[[-.08,0],[.08,0],[0,.16]],.05,s*.16,.86,0,.01);
    oval(p,paint('#f498a8'),.04,.06,.02,s*.16,.90,.03);
  }
  // Raised beckoning paw + gold coin
  oval(p,white,.08,.18,.08,.29,.58,.08).rotation.z=-.35;
  oval(p,white,.08,.14,.08,-.28,.38,.08);
  torus(p,collar,.20,.035,0,.51,0).rotation.x=Math.PI/2;
  oval(p,gold,.065,.065,.065,0,.48,.22);
  oval(p,gold,.13,.16,.04,-.06,.30,.26);
  cuteEyes(p,.70,.22,.09,.025);
}
function drumToy(p){
  tube(p,wood,.04,.04,.46,0,.24,0,12);
  tube(p,paint('#c84438'),.18,.22,.08,0,.04,0,16);
  const d=tube(p,red,.32,.32,.18,0,.72,0,22);d.rotation.x=Math.PI/2;
  const face=tube(p,cream,.28,.28,.20,0,.72,0,22);face.rotation.x=Math.PI/2;
  for(const s of [-1,1]){
    rod(p,gold,[s*.32,.72,0],[s*.44,.52,0],.014,6);
    oval(p,gold,.055,.055,.055,s*.44,.48,0);
  }
  cuteEyes(p,.74,.11,.09,.026);
}

// 7) Egypt stage (金字塔探险)
function pyramid(p){
  const sand=paint('#e6b963'),cap=paint('#f6d24c','chrome');
  for(let i=0;i<5;i++){
    const sz=.92-i*.16;
    box(p,sand,sz,.14,sz,0,.08+i*.14,0,.02);
  }
  box(p,cap,.18,.14,.18,0,.78,0,.02);
  box(p,paint('#5c4028'),.16,.20,.06,0,.11,.46,.015);
}
function sphinxCat(p){
  const sand=paint('#e3ba72'),stripe=paint('#2c6bb8');
  box(p,sand,.48,.22,.66,0,.18,-.06,.05);
  for(const s of [-1,1])box(p,sand,.12,.14,.42,s*.16,.09,.30,.04);
  oval(p,sand,.22,.22,.22,0,.52,.16);
  // Nemes striped headdress
  box(p,stripe,.42,.26,.16,0,.52,.04,.04);
  box(p,gold,.44,.06,.18,0,.58,.04,.015);
  box(p,gold,.44,.06,.18,0,.44,.04,.015);
  cuteEyes(p,.54,.36,.08,.024);
}
function camelToy(p){
  const tan=paint('#d8a05a'),cloth=paint('#d94646');
  oval(p,tan,.36,.24,.24,0,.42,0);
  oval(p,tan,.18,.20,.16,-.04,.64,0);
  box(p,cloth,.26,.10,.26,-.04,.58,0,.03);
  rod(p,tan,[.24,.46,0],[.40,.74,0],.075,12);
  oval(p,tan,.14,.11,.11,.48,.78,0);
  for(const x of [-.20,.20])for(const s of [-1,1])tube(p,tan,.052,.046,.34,x,.18,s*.12,10);
  for(const s of [-1,1])bead(p,ink,.022,.026,.022,.50,.81,s*.10);
}
function pharaohMask(p){
  const lapis=paint('#2862b0');
  box(p,gold,.54,.68,.24,0,.40,0,.06);
  for(let i=0;i<4;i++)box(p,lapis,.56,.05,.26,0,.22+i*.14,0,.01);
  oval(p,gold,.22,.26,.18,0,.44,.12);
  box(p,lapis,.08,.18,.08,0,.14,.18,.02);
  oval(p,gold,.06,.09,.06,0,.74,.14);
  cuteEyes(p,.48,.29,.08,.025);
}
function scarabGem(p){
  const gem=paint('#2c88d8','enamel'),rim=paint('#f2c444','chrome');
  oval(p,gem,.32,.22,.42,0,.24,0);
  torus(p,rim,.32,.04,0,.20,0).rotation.x=Math.PI/2;
  oval(p,rim,.14,.12,.14,0,.24,.40);
  oval(p,gold,.10,.10,.10,0,.22,.52);
  for(const s of [-1,1])for(const z of [-.18,0,.18])rod(p,rim,[s*.26,.16,z],[s*.42,.08,z+.06],.024,8);
}
function oasisPalm(p){
  const pool=paint('#44b2d8'),sand=paint('#eed18a'),trunk=paint('#9e683c'),leaf=paint('#4ca84a');
  tube(p,sand,.40,.44,.09,0,.045,0,20);
  tube(p,pool,.26,.26,.10,0,.055,.04,18);
  for(let i=0;i<5;i++)tube(p,trunk,.08-i*.008,.09-i*.008,.16,-.06+i*.02,.16+i*.14,0,12);
  for(let a=0;a<6;a++){
    const ang=a*Math.PI/3;
    const f=oval(p,leaf,.24,.05,.09,.04+Math.cos(ang)*.22,.84,Math.sin(ang)*.22);
    f.rotation.y=-ang;f.rotation.z=-.35;
  }
}

// 8) Sakura stage (樱花和风街)
function daruma(p){
  oval(p,red,.36,.40,.34,0,.40,0);
  oval(p,cream,.22,.16,.12,0,.50,.28);
  for(const s of [-1,1]){
    oval(p,white,.065,.065,.04,s*.09,.52,.36);
    oval(p,ink,.032,.032,.03,s*.09,.52,.39);
    box(p,ink,.10,.028,.02,s*.09,.60,.36,.008);
  }
  box(p,gold,.16,.12,.04,0,.22,.33,.015);
}
function shibaInu(p){
  const fur=paint('#e69c4c'),band=paint('#df4646');
  oval(p,fur,.28,.24,.34,0,.28,0);
  oval(p,cream,.20,.16,.18,0,.22,.16);
  oval(p,fur,.25,.24,.24,0,.58,.18);
  oval(p,cream,.18,.13,.12,0,.51,.34);
  oval(p,ink,.04,.03,.03,0,.54,.44);
  for(const s of [-1,1]){
    profile(p,fur,[[-.07,0],[.07,0],[0,.15]],.05,s*.15,.76,.16,.01);
    oval(p,fur,.075,.14,.075,s*.14,.10,.16);
    oval(p,fur,.075,.14,.075,s*.14,.10,-.16);
  }
  torus(p,band,.18,.04,0,.44,.14).rotation.x=Math.PI/2;
  torus(p,fur,.10,.045,0,.42,-.28);
  cuteEyes(p,.61,.39,.085,.024);
}
function dangoStick(p){
  const stick=paint('#d8b47c'),pink=paint('#ffb0c4'),matcha=paint('#86c470');
  tube(p,stick,.032,.032,1.12,0,.56,0,10);
  tube(p,paint('#b88454'),.18,.22,.08,0,.04,0,16);
  oval(p,matcha,.17,.16,.17,0,.40,0);
  oval(p,white,.17,.16,.17,0,.66,0);
  oval(p,pink,.17,.16,.17,0,.92,0);
  cuteEyes(p,.94,.165,.06,.022);
}
function toriiGate(p){
  const verm=paint('#de4336');
  for(const s of [-1,1]){
    tube(p,ink,.085,.095,.14,s*.32,.07,0,14);
    tube(p,verm,.065,.072,.78,s*.32,.46,0,14);
  }
  box(p,verm,.88,.08,.10,0,.68,0,.015);
  box(p,verm,1.04,.10,.14,0,.88,0,.02);
  box(p,ink,1.08,.05,.16,0,.95,0,.015);
  box(p,gold,.14,.16,.06,0,.78,0,.015);
}
function koinobori(p){
  const pole=paint('#d8c088'),carp1=paint('#e64c56'),carp2=paint('#3b8be0');
  tube(p,pole,.03,.03,1.04,-.30,.52,0,10);
  tube(p,gold,.16,.20,.08,-.30,.04,0,14);
  oval(p,gold,.07,.07,.07,-.30,1.06,0);
  for(const [y,m,sc] of [[.80,carp1,1],[.46,carp2,.86]]){
    oval(p,m,.34*sc,.13*sc,.12*sc,.08,y,0);
    profile(p,m,[[0,0],[.14,.12],[.14,-.12]],.06*sc,.34*sc+.04,y,0,.01);
    oval(p,white,.045*sc,.045*sc,.04,-.12*sc,y+.02,.10*sc);
    oval(p,ink,.022*sc,.022*sc,.03,-.12*sc,y+.02,.13*sc);
  }
}
function sakuraMochi(p){
  const pink=paint('#ffaac4'),leaf=paint('#52a656'),flower=paint('#ffe4ee');
  oval(p,pink,.38,.26,.32,0,.28,0);
  box(p,leaf,.46,.16,.36,0,.16,0,.04);
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5;
    oval(p,flower,.07,.035,.05,Math.cos(a)*.08,.54,Math.sin(a)*.08);
  }
  oval(p,gold,.04,.04,.04,0,.55,0);
  cuteEyes(p,.34,.31,.10,.025);
}

// 9) Desert / Wild West stage (西部牛仔镇)
function cowboyHat(p){
  const leather=paint('#9e6238'),band=paint('#d84a3e');
  oval(p,leather,.56,.07,.48,0,.16,0);
  oval(p,leather,.28,.24,.32,0,.36,0);
  torus(p,band,.28,.038,0,.22,0).rotation.x=Math.PI/2;
  box(p,gold,.10,.08,.04,0,.23,.31,.01);
}
function cactusPot(p){
  const pot=paint('#c96a42'),cac=paint('#4ea854'),flower=paint('#ff7ea6');
  tube(p,pot,.24,.18,.26,0,.13,0,18);
  tube(p,pot,.27,.26,.06,0,.26,0,18);
  tube(p,cac,.15,.15,.54,0,.52,0,16);
  oval(p,cac,.15,.12,.15,0,.78,0);
  for(const [s,y] of [[-1,.54],[1,.62]]){
    tube(p,cac,.07,.07,.16,s*.16,y,0,12).rotation.z=Math.PI/2;
    tube(p,cac,.07,.07,.20,s*.24,y+.08,0,12);
    oval(p,cac,.07,.06,.07,s*.24,y+.18,0);
  }
  oval(p,flower,.08,.06,.08,0,.88,0);
  cuteEyes(p,.56,.155,.065,.022);
}
function wagonCart(p){
  const canvas=paint('#f8eed6'),wheelM=paint('#8a542d');
  box(p,wood,.86,.24,.48,0,.30,0,.03);
  const top=tube(p,canvas,.28,.28,.82,0,.54,0,18);top.rotation.z=Math.PI/2;
  for(const x of [-.30,.30])for(const s of [-1,1]){
    const w=torus(p,wheelM,.16,.032,x,.18,s*.28);w.name='wheel';
    for(let a=0;a<4;a++)box(p,wheelM,.30,.02,.02,x,.18,s*.28,.004).rotation.z=a*Math.PI/4;
  }
}
function westernHorse(p){
  const coat=paint('#9e5a32'),mane=paint('#4a2c1a'),saddle=paint('#d8483c');
  oval(p,coat,.34,.22,.22,0,.44,0);
  box(p,saddle,.24,.09,.25,0,.55,0,.03);
  rod(p,coat,[.22,.50,0],[.36,.78,0],.085,12);
  oval(p,coat,.16,.11,.11,.44,.80,0);
  box(p,mane,.08,.24,.06,.22,.68,0,.02);
  box(p,mane,.08,.26,.08,-.34,.36,0,.02);
  for(const x of [-.20,.20])for(const s of [-1,1])tube(p,coat,.055,.048,.34,x,.18,s*.11,10);
  for(const s of [-1,1])bead(p,ink,.022,.026,.022,.48,.83,s*.10);
}
function sheriffStar(p){
  const star=group(p,0,.52,0);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    const pt=profile(star,gold,[[-.12,0],[.12,0],[0,.38]],.10,0,0,0,.02);
    pt.rotation.z=a;
  }
  tube(star,paint('#d89c24','chrome'),.18,.18,.12,0,0,0,18).rotation.x=Math.PI/2;
  box(p,wood,.46,.08,.22,0,.04,0,.02);
  cuteEyes(p,.54,.07,.07,.022);
}
function guitarBoot(p){
  const boot=paint('#b05e34'),trim=paint('#f4c438');
  tube(p,boot,.18,.20,.56,-.06,.42,0,16);
  oval(p,boot,.28,.16,.19,.12,.18,0);
  box(p,paint('#3b281c'),.52,.07,.34,.04,.04,0,.02);
  box(p,trim,.06,.32,.04,-.06,.48,.19,.01);
  oval(p,gold,.06,.06,.04,-.28,.16,0);
}

// 10) Aquarium stage (梦幻海底隧道)
function jellyfish(p){
  const bell=paint('#c88cff'),glow=paint('#f2c8ff'),tent=paint('#a46ce6');
  oval(p,bell,.34,.24,.34,0,.64,0);
  oval(p,glow,.24,.14,.24,0,.72,0);
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3;
    tube(p,tent,.036,.024,.46,Math.cos(a)*.16,.28,Math.sin(a)*.16,10);
  }
  cuteEyes(p,.64,.32,.10,.026);
}
function mantaRay(p){
  const top=paint('#2d6da8'),belly=paint('#e6f4fc');
  oval(p,top,.28,.14,.34,0,.32,0);
  oval(p,belly,.24,.10,.28,0,.26,0);
  for(const s of [-1,1]){
    const w=profile(p,top,[[0,-.22],[.54,-.04],[.06,.24]],.07,s*.12,.30,0,.02);
    if(s<0)w.scale.x=-1;
    w.rotation.x=Math.PI/2;
  }
  rod(p,top,[0,.30,-.26],[0,.22,-.66],.028,8);
  cuteEyes(p,.36,.28,.11,.025);
}
function seahorse(p){
  const body=paint('#f4983c'),belly=paint('#ffe08c');
  oval(p,body,.18,.26,.20,0,.52,0);
  oval(p,belly,.10,.20,.10,0,.50,.15);
  oval(p,body,.16,.15,.16,0,.84,.04);
  tube(p,body,.04,.055,.16,0,.82,.20,12).rotation.x=Math.PI/2;
  torus(p,body,.14,.058,0,.18,-.04);
  profile(p,belly,[[0,-.10],[.14,0],[0,.12]],.04,0,.52,-.20,.01);
  cuteEyes(p,.86,.16,.075,.024);
}
function submarine(p){
  const body=paint('#f4c42e'),fin=paint('#e3543b');
  oval(p,body,.52,.26,.28,0,.32,0);
  tube(p,body,.14,.16,.24,.04,.58,0,16);
  tube(p,paint('#56687a','chrome'),.035,.035,.22,.04,.78,0,10);
  box(p,paint('#56687a','chrome'),.12,.05,.05,.09,.86,0,.015);
  for(const x of [-.14,.14])for(const s of [-1,1]){
    const w=tube(p,paint('#8ae0ff','glass'),.08,.08,.04,x,.34,s*.26,14);w.rotation.x=Math.PI/2;
  }
  box(p,fin,.06,.24,.24,-.52,.32,0,.015);
}
function hermitCrab(p){
  const shell=paint('#e68a5c'),stripe=paint('#fff0d2'),crab=paint('#e84a3c');
  oval(p,shell,.32,.28,.30,-.06,.34,0);
  oval(p,stripe,.22,.20,.20,-.22,.42,0);
  oval(p,crab,.18,.14,.18,.22,.22,0);
  for(const s of [-1,1]){
    oval(p,crab,.11,.08,.08,.34,.22,s*.16);
    rod(p,crab,[.24,.28,s*.08],[.28,.44,s*.10],.02,8);
    oval(p,ink,.032,.032,.032,.28,.46,s*.10);
  }
}
function clownFish(p){
  const orange=paint('#f47428');
  oval(p,orange,.40,.28,.22,0,.36,0);
  oval(p,white,.065,.285,.226,-.11,.36,0);
  oval(p,white,.065,.270,.216,.13,.36,0);
  profile(p,orange,[[0,0],[-.22,.18],[-.22,-.18]],.06,-.36,.36,0,.02);
  oval(p,orange,.14,.10,.06,0,.64,0);
  for(const s of [-1,1])bead(p,ink,.026,.030,.022,.28,.41,s*.165);
}

export const WORLD_CULTURE={
  // Festival
  lionDance:{name:'喜庆醒狮',make:collectable(lionDance,{height:1.44,width:1.62,grip:[0,.46,0,.30,.28]})},
  goldIngot:{name:'金元宝',make:collectable(goldIngot,{height:1.18,width:1.86,grip:[0,.34,0,.34,.24]})},
  tanghulu:{name:'冰糖葫芦',make:collectable(tanghulu,{height:1.68,width:1.18,grip:[0,.56,0,.22,.22]})},
  dragonHead:{name:'祥瑞小龙头',make:collectable(dragonHead,{height:1.48,width:1.62,grip:[0,.46,0,.28,.28]})},
  fortuneCat:{name:'招财小猫',make:collectable(fortuneCat,{height:1.54,width:1.42,grip:[0,.48,0,.26,.24]})},
  drumToy:{name:'拨浪小鼓',make:collectable(drumToy,{height:1.56,width:1.56,grip:[0,.52,0,.26,.22]})},
  // Egypt
  pyramid:{name:'黄金金字塔',make:collectable(pyramid,{height:1.38,width:1.78,grip:[0,.38,0,.32,.32]})},
  sphinxCat:{name:'狮身人面猫',make:collectable(sphinxCat,{height:1.34,width:1.72,grip:[0,.40,0,.28,.32]})},
  camelToy:{name:'沙漠小骆驼',make:collectable(camelToy,{height:1.52,width:1.82,grip:[0,.48,0,.30,.22]})},
  pharaohMask:{name:'法老金面具',make:collectable(pharaohMask,{height:1.52,width:1.42,grip:[0,.48,0,.26,.22]})},
  scarabGem:{name:'蓝宝石甲虫',make:collectable(scarabGem,{height:1.14,width:1.76,grip:[0,.30,0,.32,.34]})},
  oasisPalm:{name:'绿洲椰子树',make:collectable(oasisPalm,{height:1.64,width:1.54,grip:[0,.50,0,.26,.26]})},
  // Sakura
  daruma:{name:'不倒达摩',make:collectable(daruma,{height:1.44,width:1.46,grip:[0,.46,0,.28,.28]})},
  shibaInu:{name:'微笑柴犬',make:collectable(shibaInu,{height:1.44,width:1.66,grip:[0,.44,0,.26,.28]})},
  dangoStick:{name:'三色团子串',make:collectable(dangoStick,{height:1.66,width:1.18,grip:[0,.54,0,.22,.22]})},
  toriiGate:{name:'朱红小鸟居',make:collectable(toriiGate,{height:1.52,width:1.84,grip:[0,.50,0,.32,.20]})},
  koinobori:{name:'鲤鱼旗',make:collectable(koinobori,{height:1.66,width:1.58,grip:[0,.54,0,.28,.22]})},
  sakuraMochi:{name:'樱花大福',make:collectable(sakuraMochi,{height:1.16,width:1.62,grip:[0,.34,0,.30,.28]})},
  // Desert
  cowboyHat:{name:'棕色牛仔帽',make:collectable(cowboyHat,{height:1.14,width:1.86,grip:[0,.30,0,.34,.32]})},
  cactusPot:{name:'开花仙人掌',make:collectable(cactusPot,{height:1.56,width:1.46,grip:[0,.50,0,.26,.24]})},
  wagonCart:{name:'蓬布大马车',make:collectable(wagonCart,{height:1.38,width:1.98,grip:[0,.44,0,.32,.24]})},
  westernHorse:{name:'棕色骏马',make:collectable(westernHorse,{height:1.52,width:1.82,grip:[0,.48,0,.30,.22]})},
  sheriffStar:{name:'金色牛仔星',make:collectable(sheriffStar,{height:1.46,width:1.54,grip:[0,.48,0,.28,.20]})},
  guitarBoot:{name:'彩绘牛仔靴',make:collectable(guitarBoot,{height:1.52,width:1.54,grip:[0,.48,0,.26,.24]})},
  // Aquarium
  jellyfish:{name:'发光水母',make:collectable(jellyfish,{height:1.56,width:1.44,grip:[0,.52,0,.26,.26]})},
  mantaRay:{name:'蓝背魔鬼鱼',make:collectable(mantaRay,{height:1.10,width:1.98,grip:[0,.32,0,.34,.34]})},
  seahorse:{name:'卷尾小海马',make:collectable(seahorse,{height:1.62,width:1.32,grip:[0,.52,0,.24,.24]})},
  submarine:{name:'黄色潜水艇',make:collectable(submarine,{height:1.36,width:2.00,grip:[0,.44,0,.34,.24]})},
  hermitCrab:{name:'贝壳寄居蟹',make:collectable(hermitCrab,{height:1.24,width:1.78,grip:[0,.36,0,.32,.26]})},
  clownFish:{name:'橙白小丑鱼',make:collectable(clownFish,{height:1.34,width:1.82,grip:[0,.42,0,.32,.22]})},
};
