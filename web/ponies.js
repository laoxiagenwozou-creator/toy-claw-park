import {group,oval,tube,torus} from './parts.js';
import {bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';
import {satin,enamel,ink,milk,gold,eye,line,star,badge} from './figure-detail.js';

const ponies={
  ponyTwilight:['紫悦','#bb9ae8',['#2f3b72','#9f4ca8','#ee62a9'],'#6e3e9e','star'],
  ponyDash:['云宝','#72cbf0',['#ef5b5b','#ffbf47','#7ec968','#4595d4','#996ac4'],'#bd3b86','bolt'],
  ponyPie:['碧琪','#f8a4cc',['#ea4d96','#fa74b8'],'#48a9c8','balloons'],
  ponyApple:['苹果嘉儿','#f2b063',['#ffea9e','#f7cc6c'],'#58a363','apples'],
  ponyRarity:['珍奇','#f6f0fd',['#664498','#8f6bc2'],'#478fc2','gems'],
  ponyShy:['柔柔','#fae282',['#f29bc0','#f9b5d5'],'#4baaa9','butterflies'],
};
function cutie(root,s,kind){
  const mark=group(root,s*.296,.68,-.24);mark.rotation.y=s*Math.PI/2;
  if(kind==='star'){star(mark,enamel('#d13f9b'),0,0,.01,.095,6);star(mark,milk,.080,.066,.015,.029,5);return;}
  if(kind==='bolt'){
    for(let i=-1;i<=1;i++)bead(mark,milk,.048,.040,.018,i*.032,.042,.012);
    badge(mark,gold,[[-.045,.02],[.03,.02],[0,-.021],[.044,-.025],[-.066,-.12],[-.026,-.045],[-.054,-.045]],0,0,.026);return;
  }
  for(const [x,y] of [[-.052,.043],[.052,.042],[0,-.051]]){
    if(kind==='apples'){bead(mark,enamel('#df4943'),.037,.038,.018,x,y,.02);line(mark,satin('#4e7d43'),[[x,y+.02,.02],[x+.012,y+.051,.017]],.008);}
    else if(kind==='gems')badge(mark,enamel('#5cbcd8'),[[0,.040],[.035,.012],[.025,-.006],[0,-.044],[-.033,.008]],x,y,.02);
    else if(kind==='balloons'){bead(mark,enamel(x>0?'#f3bc52':'#59bdd8'),.034,.041,.018,x,y,.02);line(mark,ink,[[x,y-.03,.014],[x-.01,y-.066,.013]],.005);}
    else {for(const sign of [-1,1])bead(mark,enamel('#f090b4'),.026,.033,.016,x+sign*.020,y,.022).rotation.z=-sign*.35;bead(mark,enamel('#62b9b0'),.010,.030,.015,x,y,.028);}
  }
}
function sculpt(root,spec){
  const [,coat,hair,iris,kind]=spec,m=satin(coat),mane=hair.map(satin);
  // Plumper sculpted chibi-pony torso with defined chest and rounded haunch.
  oval(root,m,.312,.306,.535,0,.655,0);
  oval(root,m,.262,.250,.220,0,.695,.285);
  oval(root,m,.292,.286,.245,0,.680,-.245);
  // Gracefully flared chibi pony legs/hooves (wider soft hoof base, sleek ankle).
  for(const s of [-1,1])for(const z of [-.31,.28]){
    const leg=group(root,s*.186,0,z);
    loft(leg,m,[[.016,.132,.148,.018],[.125,.118,.134,.012],[.30,.084,.098,-.018],[.52,.106,.118,0],[.65,.128,.142,0]],{sides:22});
  }
  const neck=oval(root,m,.226,.385,.226,0,.91,.30);neck.rotation.x=.21;
  const h=group(root,0,1.21,.39);oval(h,m,.346,.340,.322,0,0,0);
  // Cute petite sculpted pony muzzle & happy smile.
  oval(h,m,.215,.152,.222,0,-.125,.222);
  line(h,satin('#9c5f77'),[[-.068,-.188,.392],[0,-.206,.418],[.068,-.188,.392]],.011);
  for(const s of [-1,1]){
    const e=group(h,s*.190,.216,-.062);e.rotation.z=-s*.24;
    loft(e,m,[[0,.090,.098],[.075,.098,.090],[.176,.056,.048],[.252,.005,.008]],{sides:18});
    bead(e,satin('#f0adc6'),.050,.078,.014,0,.095,.070);
    // Big sparkling glossy anime-pony eyes with graceful outer lash curl.
    eye(h,s*.218,.040,.214,.114,{yaw:s*.58,iris,stretch:1.30,lash:s});
    bead(h,satin('#a56680'),.016,.011,.015,s*.098,-.098,.418);
    cutie(root,s,kind);
  }
  // Lush voluminous flowing tail with multi-strand ribbon highlights.
  const tailBase=[[0,.81,-.40],[.018,.86,-.65],[.082,.62,-.82],[.096,.36,-.86],[.058,.23,-.98]];
  const curls=kind==='balloons'||kind==='gems';
  if(curls){tailBase[3]=[.095,.37,-1.00];tailBase.push([.014,.39,-1.08],[.004,.50,-1.01]);}
  sweep(root,mane[0],tailBase,tailBase.map((_,i)=>[.118,.172,.170,.118,.075,.058,.016][i]),{sides:16,segments:26});
  mane.forEach((color,i)=>{
    const dx=(i-(mane.length-1)/2)*.045;
    sweep(root,color,tailBase.map(([x,y,z])=>[x+dx,y+.012,z-.068]),tailBase.map((_,k)=>k===tailBase.length-1?.012:.068),{sides:10,segments:20});
    const points=[[dx,.82,.025],[dx,1.10,.035],[dx,1.45,.115],[dx,1.585,.34],[dx+.038,1.555,.555],[dx+.135,1.405,.655]];
    sweep(root,color,points,[.042,.130,.144,.122,.098,.024],{sides:12,segments:22});
  });
  const lock=group(h,.214,.082,-.095);
  if(kind==='butterflies'||kind==='gems'||kind==='balloons'){
    const pts=[[0,.20,0],[.110,.096,.014],[.152,-.11,.048],[.145,-.31,.050],[.062,-.40,.095]];
    if(curls)pts.push([-.008,-.30,.135]);
    sweep(lock,mane[0],pts,pts.map((_,i)=>[.076,.132,.116,.086,.050,.018][i]),{sides:16});
  }
  if(kind==='balloons'){
    for(const [x,y,z,r] of [[-.145,.19,.075,.118],[.02,.305,.08,.148],[.16,.24,.07,.125],[.23,.12,-.01,.106],[.25,-.02,-.08,.118],[.23,-.17,-.08,.094]])
      oval(h,mane[0],r,r*1.12,r,x,y,z);
    for(let i=0;i<3;i++)oval(root,mane[i%2],.118,.122,.108,.075,.60-i*.115,-.81-i*.075);
  }else if(kind==='gems'){
    sweep(h,mane[1],[[-.15,.20,.12],[-.07,.30,.235],[.09,.265,.262],[.205,.135,.262],[.245,.120,.205]],[.040,.096,.094,.065,.028],{sides:14});
  }else if(kind==='star'||kind==='bolt'){
    for(let i=0;i<mane.length;i++){
      const x=(i-(mane.length-1)*.5)*.050;
      sweep(h,mane[i],[[x-.082,.275,.046],[x-.036,.300,.172],[x+.046,.222,.260],[x+.096,.135+(i%2)*.026,.282]],[.068,.082,.066,.012],{sides:11,segments:16});
    }
  }else if(kind==='apples'){
    bead(root,enamel('#d85848'),.086,.046,.084,.072,.452,-.875);
  }
  if(kind==='star'||kind==='gems'){
    const horn=group(h,0,.262,.145);horn.rotation.x=.25;tube(horn,m,.007,.080,.268,0,.106,0,22);
    for(let i=0;i<3;i++){const ring=torus(horn,enamel(kind==='star'?'#b58ce2':'#e2daf2'),.062-i*.014,.009,0,.032+i*.058,0);ring.rotation.x=Math.PI/2;}
  }
  if(['star','bolt','butterflies'].includes(kind))for(const s of [-1,1]){
    const wing=group(root,s*.265,.78,-.02);wing.rotation.z=-s*(kind==='bolt'?.66:.30);
    for(let i=0;i<4;i++)bead(wing,m,.068,.158-i*.020,.088,s*(i*.034),.08-i*.018,-i*.076).rotation.x=-.55;
  }
  if(kind==='apples'){
    const brim=oval(h,satin('#b57944'),.368,.044,.306,0,.238,-.044);brim.rotation.z=-.13;
    oval(h,satin('#c58a52'),.226,.128,.192,-.015,.312,-.059);
    const band=oval(h,enamel('#9e4e3a'),.224,.032,.194,-.013,.272,-.052);band.rotation.z=-.10;
    for(const s of [-1,1])for(let i=0;i<3;i++)bead(h,milk,.016,.012,.011,s*(.246+i*.022),-.108+(i%2)*.026,.234-i*.022);
  }
}
export const PONIES=Object.fromEntries(Object.entries(ponies).map(([id,spec])=>[id,{name:spec[0],make:collectable(root=>sculpt(root,spec),{height:1.72,width:1.83,grip:[0,.76,-.03,.20,.27]})}]));
