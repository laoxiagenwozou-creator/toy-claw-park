import {THREE,canvasTexture,group,oval,paint} from './parts.js';
import {loft,sweep,bead} from './sculpt.js';
import {collectable} from './models.js';

const bolts=new Map();
let weave;
function felt(color){
  if(!weave){
    weave=canvasTexture(96,96,ctx=>{
      ctx.fillStyle='#f9f9f9';ctx.fillRect(0,0,96,96);
      let n=74;const random=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};
      for(let i=0;i<3100;i++){const v=Math.round(215+39*random());ctx.fillStyle='rgb('+v+','+v+','+v+')';ctx.fillRect(random()*96,random()*96,1.4,.8);}
    });
    weave.wrapS=weave.wrapT=THREE.RepeatWrapping;weave.repeat.set(5,4);
  }
  if(!bolts.has(color)){
    const cloth=new THREE.MeshStandardMaterial({color,map:weave,roughness:.98,metalness:0});
    cloth.userData.finish='plush-felt';
    bolts.set(color,cloth);
  }
  return bolts.get(color);
}
const plushies={
  snowPenguin:['蓝帽企鹅','penguin','#628acc','#ffecce',1.48],
  lemonChick:['柠檬小鸡','chick','#f5c74f','#ffe18b',1.39],
  lilacCat:['葡萄小猫','cat','#ab86c9','#ddbadf',1.53],
  skyPenguin:['冰蓝企鹅','penguin','#84abcd','#fff2d8',1.43],
  peachChick:['蜜桃小鸡','chick','#efae68','#ffd59a',1.38],
  violetCat:['蓝莓小猫','cat','#9385ba','#d2bfe2',1.50],
};
function winterHat(p){
  const cap=group(p,0,.725,-.008);
  cap.rotation.z=-.085;
  const wool=felt('#3c828d'),rib=felt('#6dafb2'),yarn=felt('#f1d298');
  loft(cap,wool,[[0,.385,.329],[.088,.358,.307],[.174,.257,.229,-.008,.020],
    [.224,.132,.124,-.017,.049],[.243,.035,.042,-.024,.080]],{sides:32});
  loft(cap,rib,[[-.030,.373,.326],[-.015,.397,.349],[.035,.396,.345],[.056,.381,.33]],{sides:36});
  for(let j=0;j<26;j++){
    const a=j*Math.PI/13;
    sweep(cap,wool,[[.389*Math.sin(a),-.013,.341*Math.cos(a)],
      [.394*Math.sin(a+.023),.016,.344*Math.cos(a+.023)],
      [.385*Math.sin(a+.043),.044,.334*Math.cos(a+.043)]],[.006,.009,.006],{sides:5,segments:4});
  }
  bead(cap,yarn,.078,.073,.071,.083,.267,-.025);
}
function earmuffs(p){
  const band=felt('#57678c'),pad=felt('#edaa86');
  sweep(p,band,[[-.416,.62,0],[-.370,.803,-.005],[-.211,.909,-.014],[0,.955,-.016],
    [.211,.909,-.014],[.370,.803,-.005],[.416,.62,0]],[.033,.033,.033,.034,.033,.033,.033],{segments:24});
  for(const s of [-1,1]){
    bead(p,pad,.101,.138,.116,s*.407,.628,.003);
    bead(p,felt('#ffcf9d'),.041,.090,.080,s*.484,.63,.003);
  }
}
function build(p,type,tone,accent,id){
  const cloth=felt(tone),patch=felt(accent),ink=paint('#363345','rubber'),beak=felt('#e9a044');
  const round=type==='cat'?.505:.48;
  loft(p,cloth,[[.085,.242,.224],[.13,.353,.32],[.25,round*.94,.397],[.44,round,.415],
    [.62,round*.916,.384],[.786,.335,.301],[.884,.211,.19],[.914,.046,.055]],{sides:40,steps:4});
  if(type==='penguin'){
    oval(p,patch,.306,.300,.118,0,.432,.316);
    for(const s of [-1,1])oval(p,patch,.149,.148,.074,s*.11,.554,.326);
  }
  for(const s of [-1,1]){
    oval(p,type==='cat'?patch:beak,.141,.078,.176,s*.185,.091,.18);
    const arm=oval(p,cloth,.087,.175,.104,s*(round-.012),.399,-.011);
    arm.rotation.z=s*.45;arm.rotation.x=-.18;
    const ex=.117*s;
    bead(p,paint('#343344','glass'),.034,.041,.023,ex,.568,.413);
    bead(p,'#fff9ee',.010,.012,.006,ex-.009,.581,.431);
    if(type!=='penguin')bead(p,felt(type==='cat'?'#d6a0bf':'#ebad73'),.065,.031,.023,s*.235,.475,.347);
  }
  if(type==='cat'){
    for(const s of [-1,1]){
      const ear=group(p,s*.28,.746,-.015);ear.rotation.z=-s*.26;
      loft(ear,cloth,[[0,.137,.119],[.054,.143,.115],[.154,.084,.079],[.242,.014,.018]],{sides:22});
      loft(ear,felt('#efc6db'),[[.044,.060,.021,.108],[.081,.076,.026,.109],[.131,.048,.022,.089],[.185,.012,.011,.059]],{sides:18});
      bead(p,patch,.075,.048,.042,s*.051,.461,.397);
      sweep(p,ink,[[0,.470,.437],[s*.030,.438,.436],[s*.067,.442,.426]],[.007,.008,.004],{segments:6,sides:6});
      for(const k of [-1,1])sweep(p,ink,[[s*.171,.459+k*.019,.401],[s*.254,.455+k*.037,.378],[s*.349,.456+k*.051,.312]],[.006,.008,.004],{sides:6,segments:7});
    }
    bead(p,ink,.036,.025,.024,0,.491,.433);
    sweep(p,cloth,[[.18,.26,-.29],[.34,.35,-.46],[.47,.53,-.45],[.47,.62,-.37]],[.093,.093,.079,.059]);
    sweep(p,patch,[[.472,.592,-.404],[.47,.625,-.365],[.448,.653,-.318],[.410,.651,-.280]],[.064,.058,.045,.016],{segments:11});
  }else{
    if(type==='chick'){
      bead(p,felt('#cc813f'),.077,.035,.074,0,.448,.423);
      for(const [x,top,z] of [[-.065,.958,-.045],[.023,1.025,-.009],[.078,.957,.006]]){
        sweep(p,patch,[[x*.48,.826,.005],[x*.72,.897,z],[x,top-.016,z-.039],[x+.009,top,z-.065]],
          [.048,.057,.031,.008],{sides:10,segments:9});
      }
      for(const s of [-1,1]){
        sweep(p,patch,[[s*.466,.465,.040],[s*.503,.411,.076],[s*.522,.352,.047],[s*.493,.323,-.011]],
          [.038,.044,.036,.010],{sides:9,segments:9});
      }
    }else if(id==='snowPenguin')winterHat(p);
    else earmuffs(p);
    const bill=bead(p,beak,.092,.052,type==='chick'?.088:.071,0,.478,.42);
    bill.rotation.x=.1;
    bead(p,cloth,.106,.101,.141,0,.306,-.399);
  }
  // A quiet stitch down the back is visible when the toy turns.
  for(let j=0;j<5;j++)bead(p,felt(accent),.009,.021,.009,.002,.31+j*.076,-(.409-Math.abs(j-2)*.015));
}
export const PLUSH=Object.fromEntries(Object.entries(plushies).map(([id,[name,type,c,a,h]])=>
  [id,{name,make:collectable(p=>build(p,type,c,a,id),{height:h,width:1.68,grip:[0,.67,.01,.18,.18]})}]));
