import {THREE,bake,box,group,oval,paint,profile,torus,tube} from './parts.js';
import {barrel,bead,loft,sweep} from './sculpt.js';

// The front of every sculpture is +Z. The little backpack handle is both
// visible from behind and the center used by the gripper.
const cream='#fff2d8', white='#f8f4e8', dark='#27242c', steel='#cedde0', gold='#ecb540';
const breeds={
  chase:{name:'阿奇',job:'警察犬',fur:'#aa6637',light:'#dfaa70',muzzle:'#e4b57f',ear:'#7a442d',
    eye:'#885526',vest:'#244375',trim:'#e6b940',pack:'#284f83',h:2.04,wide:1,leg:1,snout:1},
  marshall:{name:'毛毛',job:'消防犬',fur:'#f3f0e5',light:'#fff8e5',muzzle:'#ebe9dd',ear:'#ece8dd',
    eye:'#53829a',vest:'#d93440',trim:'#efbb49',pack:'#c63741',h:1.94,wide:.99,leg:1.03,snout:1.03},
  skye:{name:'天天',job:'飞行员',fur:'#c08b58',light:'#e9bd8a',muzzle:'#e8b986',ear:'#a76e44',
    eye:'#96556d',vest:'#cf4c78',trim:'#ffa8bb',pack:'#bb4774',h:1.66,wide:.97,leg:.93,snout:.88},
  rubble:{name:'小砾',job:'工程犬',fur:'#b48655',light:'#f6e6cc',muzzle:'#f6e7d2',ear:'#8e673f',
    eye:'#926038',vest:'#e8aa30',trim:'#563f38',pack:'#d79728',h:1.69,wide:1.13,leg:.78,snout:.73},
  rocky:{name:'灰灰',job:'回收专家',fur:'#89979f',light:'#c4cdcf',muzzle:'#d0d5d2',ear:'#66757f',
    eye:'#805a39',vest:'#469553',trim:'#c9d96e',pack:'#45875b',h:1.86,wide:.97,leg:.99,snout:1.01},
  zuma:{name:'路马',job:'水上救援犬',fur:'#79503c',light:'#9d6b50',muzzle:'#a47359',ear:'#614235',
    eye:'#91613e',vest:'#df702c',trim:'#414c58',pack:'#d66a30',h:1.78,wide:1.03,leg:.91,snout:1.03},
};

const fur=c=>paint(c,'satin');
const glossy=c=>paint(c,'enamel');
const pip=(p,m,a,b,r)=>sweep(p,m,[a,b],[r,r],{segments:3,sides:8});
const color=c=>new THREE.Color(c);
const inside=(n,lo,hi)=>THREE.MathUtils.smoothstep(n,lo,hi);
const spots=[
  [-.38,.66,.24,.086,.103,.145],[.35,.73,.21,.125,.116,.15],
  [.39,.44,.22,.081,.100,.115],[-.32,.36,.31,.055,.080,.085],
  [.17,.37,-.34,.105,.122,.10],[-.34,.59,-.27,.126,.086,.106],
  [0,.82,-.21,.078,.088,.13],[-.06,.54,-.39,.059,.071,.08],
];

function scalp(root,kind,d) {
  const coat=color(d.fur),lighter=color(d.light),patch=color(kind==='marshall'?'#343138':d.ear);
  const tint=(x,y,z)=>{
    const c=coat.clone();
    if(kind==='marshall') {
      for(const [sx,sy,sz,rx,ry,rz] of spots) {
        const q=((x-sx)/rx)**2+((y-sy)/ry)**2+((z-sz)/rz)**2;
        if(q<1.18)c.lerp(patch,1-inside(q,.77,1.18));
      }
    }else if(kind==='rubble'){
      const blaze=.085+.056*Math.max(0,.62-y)+.028*Math.sin(9*y);
      if(z>0)c.lerp(lighter,(1-inside(Math.abs(x),blaze,blaze+.038))*inside(z,.12,.28));
      c.lerp(lighter,(1-inside(y,.20,.34))*inside(z,.02,.24));
    }else{
      const cheek=(1-inside(y,.27,.54))*inside(z,.0,.33);
      c.lerp(lighter,cheek*(kind==='chase'?.95:.57));
      if(kind==='chase')c.lerp(patch,inside(y+.20*(1-inside(z,.07,.38)),.60,.88)*.85);
    }
    return c;
  };
  loft(root,fur('#ffffff'),[
    [.01,.19,.18,.00],[.12,.31,.28,.015],[.24,.414,.344,.022],
    [.39,.482,.388,.010],[.56,.480,.403,-.004],[.72,.445,.382,-.025],
    [.84,.340,.291,-.036],[.92,.156,.151,-.032],[.941,.011,.016,-.03],
  ],{sides:56,steps:5,tint});
}

function ear(head,kind,d,s) {
  const upright=kind==='chase'||(kind==='rocky'&&s===-1);
  if(upright){
    const e=group(head,s*.290,.62,-.07);
    if(kind==='chase'){e.position.x=s*.342;e.scale.y=1.16;}
    loft(e,fur(d.ear),[[0,.137,.115,0],[.12,.175,.12,-.015,s*.038],
      [.30,.112,.084,-.03,s*.102],[.46,.050,.041,-.043,s*.151],[.535,.006,.007,-.048,s*.166]]);
    const inset=group(e,0,0,.091);
    loft(inset,fur(kind==='chase'?'#c38970':'#c39fa0'),[
      [.095,.058,.018,.007,s*.033],[.17,.105,.031,.004,s*.054],
      [.31,.066,.025,-.031,s*.107],[.431,.008,.009,-.070,s*.145]],{sides:18});
    return;
  }
  if(kind==='rocky'||kind==='rubble') {
    const e=group(head,s*.392,.59,-.06);e.rotation.z=-s*.28;
    loft(e,fur(d.ear),[[-.098,.051,.045,.048,s*.148],[.02,.145,.088,.047,s*.105],
      [.16,.145,.128,0,s*.045],[.314,.041,.067,-.04],[.326,.014,.020,-.05]],{sides:24});
    sweep(e,fur(d.fur),[[s*.16,-.036,.072],[s*.17,.078,.091],[s*.12,.185,.078],[s*.044,.27,.031]],
      [.018,.029,.029,.010],{segments:12});
    return;
  }
  const curl=kind==='skye',e=group(head,s*.415,.36,-.045);
  e.rotation.z=s*(curl?.08:.10);
  loft(e,fur(d.ear),[[-.246,.052,.073,.071,s*.109],[-.19,.127,.117,.057,s*.099],
    [-.047,.155,.142,.03,s*.085],[.15,.142,.162,-.003,s*.073],[.30,.116,.145,-.02,s*.035],
    [.399,.060,.081,-.034,-s*.014],[.410,.011,.018,-.03,-s*.030]]);
  if(curl){
    for(const [y,z] of [[-.10,.112],[-.045,-.10],[.13,.095]]) {
      const lock=oval(e,fur(d.ear),.075,.135,.089,s*.118,y,z);lock.rotation.z=-s*.30;
    }
  }else if(kind==='marshall'){
    for(const [y,z,r] of [[.18,-.018,.068],[-.062,.069,.056],[-.148,-.036,.036]]) {
      bead(e,fur('#38373b'),.025,r,r*.74,s*(y>0?.195:.231),y,z);
    }
  }
}

function eye(head,d,s,kind) {
  const socket=group(head,s*.198,.507,.346);
  socket.rotation.y=s*.43;socket.rotation.x=-.13;socket.rotation.z=s*.065;
  socket.scale.set(.94,.90,.82);
  oval(socket,glossy('#fff7e5'),.142,.164,.077,0,0,0);
  const ix=-s*.016;
  oval(socket,glossy('#43352e'),.105,.137,.030,ix,.005,.061);
  oval(socket,glossy(d.eye),.094,.121,.029,ix,.003,.076);
  oval(socket,glossy('#201e23'),.063,.086,.022,ix,.014,.094);
  bead(socket,glossy('#fffdf3'),.024,.030,.014,ix-.021,.036,.113);
  bead(socket,glossy('#fff3da'),.009,.011,.008,ix+.028,-.036,.112);
  sweep(socket,fur(kind==='skye'?'#5e4345':'#594539'),[
    [-s*.106,.130,.040],[-s*.041,.171,.042],[s*.049,.165,.038],[s*.126,.114,.026]],
    [.005,.014,.014,.005],{segments:13,sides:7});
  const brow=oval(socket,fur(kind==='marshall'?'#a6a095':d.light),.105,.028,.043,0,.193,-.019);
  brow.rotation.z=-s*.04;
  if(kind==='skye'){
    sweep(socket,fur('#654449'),[[s*.093,.139,.038],[s*.126,.156,.046],[s*.150,.158,.040]],
      [.012,.009,.002],{segments:7,sides:6});
  }
}

function snout(head,d,kind) {
  const muzzle=group(head,0,0,.04);
  muzzle.scale.z=d.snout;
  oval(muzzle,fur(d.muzzle),.223,.113,.220,0,.165,.406);
  oval(muzzle,fur('#623f3c'),.194,.048,.140,0,.207,.481);
  oval(muzzle,fur('#d68d84'),.069,.025,.056,.015,.187,.560);
  barrel(muzzle,fur(d.muzzle),[
    [.224,.195,.114,.291],[.345,.255,.141,.290],[.464,.232,.125,.295],
    [.576,.176,.107,.311],[.650,.102,.075,.333],[.671,.015,.015,.344]],{sides:32});
  if(kind==='rubble') {
    for(const s of [-1,1])oval(muzzle,fur(d.muzzle),.118,.107,.137,s*.146,.252,.490);
  }
  const nose=group(muzzle,0,.335,.615);
  loft(nose,glossy('#343038'),[[-.077,.039,.035,.036],[-.044,.090,.058,.031],
    [.006,.131,.076,.015],[.057,.123,.061,0],[.080,.068,.032,-.004]]);
  for(const s of [-1,1]) {
    sweep(muzzle,fur('#795447'),[[s*.138,.224,.541],[s*.192,.228,.498],[s*.219,.245,.445],[s*.223,.273,.407]],
      [.007,.011,.009,.002],{segments:10,sides:6});
    const nostril=bead(nose,fur('#241f26'),.027,.014,.010,s*.069,.018,.077);
    nostril.rotation.z=-s*.28;
    for(const [x,y,z] of [[.148,.285,.587],[.187,.310,.545],[.188,.267,.524]]) {
      bead(muzzle,fur(kind==='marshall'?'#766e67':'#9b7258'),.010,.009,.009,s*x,y,z);
    }
  }
}

function badge(parent,x,y,z,accent,size,mark='paw') {
  const b=group(parent,x,y,z);b.scale.setScalar(size);
  const shape=[[-.30,.25],[-.13,.27],[0,.35],[.13,.27],[.30,.25],[.28,-.02],[.18,-.23],[0,-.36],[-.18,-.23],[-.28,-.02]];
  profile(b,glossy(steel),shape,.074,0,0,0,.024);
  const inset=group(b,0,0,.041);inset.scale.setScalar(.82);profile(inset,glossy(accent),shape,.036,0,0,0,.016);
  if(mark==='star'){
    const star=[];for(let i=0;i<10;i++){const r=i%2?.080:.161;star.push([Math.sin(i*Math.PI/5)*r,Math.cos(i*Math.PI/5)*r]);}
    profile(b,glossy(gold),star,.024,0,.022,.074,.007);
  }else if(mark==='flame'){
    const flame=[[-.13,-.074],[-.142,.025],[-.075,.113],[-.060,.026],[.027,.190],[.077,.102],[.087,.053],[.124,.083],[.144,-.017],[.108,-.109],[.008,-.151],[-.079,-.132]];
    profile(b,glossy('#ffe3a1'),flame,.026,0,0,.078,.006);
    profile(b,glossy('#ee913e'),[[-.045,-.105],[-.059,-.05],[.015,.048],[.054,-.044],[.042,-.101],[0,-.122]],.016,0,0,.099,.004);
  }else{
    bead(b,glossy(cream),.094,.074,.018,0,-.044,.073);
    for(const [px,py] of [[-.103,.039],[-.043,.096],[.045,.096],[.106,.038]])
      bead(b,glossy(cream),.028,.041,.017,px,py,.074);
  }
}

function helmet(head,d,kind) {
  const cap=group(head,0,.725,-.034),shell=glossy(d.vest),band=glossy(d.trim);
  if(kind==='skye'){
    loft(cap,glossy('#ca5178'),[[.008,.434,.362,0],[.045,.455,.386,0],[.113,.419,.359,-.005]]);
    for(const s of [-1,1]){
      const g=group(cap,s*.168,.103,.278);g.rotation.set(-.54,s*.31,-s*.10);
      oval(g,glossy('#bc496a'),.174,.134,.082,0,0,0);
      oval(g,glossy('#ffd1ca'),.148,.113,.066,0,.005,.055);
      oval(g,glossy('#a9466c'),.123,.088,.049,0,.006,.087);
      bead(g,glossy('#ffd8d3'),.043,.014,.008,-.027,.043,.131).rotation.z=.24;
    }
    box(cap,band,.128,.047,.050,0,.092,.36,.019);
    for(const s of [-1,1])sweep(head,fur(d.light),[[s*.04,.82,.11],[s*.10,.90,.11],[s*.16,.925,.078]],
      [.063,.045,.005],{segments:9});
    return;
  }
  if(kind==='chase'||kind==='rocky') {
    const police=kind==='chase';
    const visor=oval(cap,glossy(police?'#23354f':'#367644'),.407,.044,.275,0,.042,.279);
    visor.rotation.x=.080;
    loft(cap,shell,[[.025,.405,.331,0],[.075,.438,.36,-.008],[.14,.465,.385,-.019],
      [.235,.454,.363,-.038],[.315,.357,.274,-.046],[.354,.065,.062,-.042]]);
    loft(cap,glossy(police?'#303c58':'#52965b'),[[.045,.434,.358,-.006],[.091,.446,.368,-.007],[.107,.446,.367,-.011]]);
    if(police){
      sweep(cap,band,[[-.388,.111,.120],[-.238,.103,.301],[0,.100,.367],[.238,.103,.301],[.388,.111,.120]],
        [.011,.018,.018,.018,.011],{segments:24});
    }else{oval(cap,glossy('#f1efdc'),.252,.135,.060,0,.201,.321);}
    badge(cap,0,.185,.367,police?'#345581':'#53995a',.36,police?'star':'paw');
    return;
  }
  const firefighter=kind==='marshall',construction=kind==='rubble';
  if(firefighter||construction){
    const rim=oval(cap,shell,firefighter?.543:.510,.054,firefighter?.522:.443,0,.040,firefighter?-.008:.022);
    rim.rotation.x=-.028;
    loft(cap,shell,[[.035,.433,.370,0],[.092,.447,.384,-.005],[.21,.417,.350,-.020],
      [.335,.303,.257,-.028],[.386,.131,.115,-.026],[.398,.025,.023,-.020]]);
    for(const s of construction?[-1,0,1]:[0]){
      const a=s*.153;
      sweep(cap,glossy(construction?'#ffc349':'#ba303a'),[[a,.115,-.359],[a,.279,-.240],[a,.385,-.044],[a,.349,.151],[a,.205,.291]],
        [.024,.036,.043,.040,.020],{segments:22});
    }
    if(firefighter)loft(cap,band,[[.069,.446,.383,-.003],[.094,.449,.386,-.005]]);
    badge(cap,0,.185,.354,firefighter?'#b62f35':'#d59c2b',firefighter?.42:.34,firefighter?'flame':'paw');
  }else{
    loft(cap,shell,[[-.055,.395,.339,-.020],[.018,.457,.395,-.012],[.14,.458,.398,-.022],
      [.262,.392,.322,-.030],[.345,.257,.229,-.040],[.375,.028,.025,-.035]]);
    oval(cap,shell,.39,.039,.206,0,.025,.288);
    for(const s of [-1,1]){
      oval(cap,band,.059,.095,.151,s*.420,-.008,-.024);
      for(let j=0;j<2;j++)bead(cap,fur('#55575d'),.015,.046,.019,s*.422,.128,-.049+j*.09);
    }
    badge(cap,0,.145,.378,'#bd5e2a',.36);
  }
}

function leg(body,d,kind,s,hind) {
  const root=group(body,s*(hind?.254:.226),0,hind?-.535:.263);
  const middle=hind?.079:.009;
  loft(root,fur(d.fur),[[.093,.101,.100,.028],[.204,.100,.106,0],[.350,.100,.113,hind?-.047:.006],
    [.492,.122,.143,middle],[.65,hind?.174:.139,hind?.218:.139,middle],[.76,.106,.125,.036]],{sides:22});
  const sock=kind==='rubble'||kind==='rocky'?d.muzzle:kind==='chase'?d.light:d.fur;
  oval(root,fur(sock),.135,.105,.184,0,.107,.059);
  for(let i=-1;i<=1;i++)bead(root,fur(sock),.052,.060,.080,i*.060,.065,.155-Math.abs(i)*.014);
  if(kind==='marshall'){
    bead(root,fur('#37343a'),.019,.056,.041,s*.105,.401,.035);
    if(!hind)bead(root,fur('#37343a'),.036,.031,.012,-s*.038,.284,.102);
  }
}

function rescueTools(sack,kind){
  const metal=glossy(steel),graphite=fur('#374755');
  if(kind==='chase'){
    const radio=group(sack,-.278,.113,-.162);
    radio.rotation.x=-.14;
    box(radio,graphite,.145,.207,.097,0,0,0,.021);
    pip(radio,graphite,[-.045,.093,0],[-.069,.273,0],.012);
    box(radio,glossy('#88cec6'),.101,.046,.013,0,.038,-.051,.005);
    for(let j=0;j<3;j++)box(radio,metal,.077,.010,.013,0,-.011-.021*j,-.052,.004);
  }else if(kind==='marshall'){
    for(const s of [-1,1]){
      const nozzle=group(sack,s*.280,.048,-.261);
      nozzle.rotation.x=-Math.PI/2;
      tube(nozzle,glossy(gold),.073,.061,.074,0,.037,0,16);
      tube(nozzle,metal,.058,.071,.037,0,.092,0,16);
      tube(nozzle,graphite,.039,.039,.006,0,.113,0,16);
    }
  }else if(kind==='rubble'){
    for(const s of [-1,1]){
      pip(sack,graphite,[s*.156,.105,-.168],[s*.156,.219,-.229],.028);
      pip(sack,glossy('#f3bb47'),[s*.156,.219,-.229],[s*.156,.087,-.332],.033);
      bead(sack,metal,.039,.030,.030,s*.163,.215,-.230);
    }
    const bucket=group(sack,0,.088,-.329);bucket.rotation.x=.25;
    box(bucket,glossy('#e3a43c'),.365,.143,.054,0,-.034,0,.018);
    box(bucket,metal,.373,.045,.102,0,-.088,-.031,.011);
  }else if(kind==='rocky'){
    const tool=group(sack,.370,.084,-.038);
    tool.rotation.order='YXZ';tool.rotation.y=Math.PI/2;tool.rotation.z=-.58;
    profile(tool,metal,[[-.028,-.186],[.031,-.186],[.032,.045],[.084,.098],[.079,.164],[.032,.185],[.029,.116],
      [-.009,.099],[-.046,.127],[-.048,.184],[-.089,.141],[-.081,.080],[-.030,.044]],.038,0,0,0,.006);
    box(tool,glossy('#50845d'),.092,.041,.052,0,-.083,.006,.010);
  }else if(kind==='zuma'){
    const buoy=group(sack,0,.074,-.273);
    torus(buoy,glossy('#f4804b'),.133,.038,0,0,0);
    for(let j=0;j<4;j++){
      const a=Math.PI*(j*.5+.25);
      const arc=[-.18,0,.18].map(t=>[.133*Math.cos(a+t),.133*Math.sin(a+t),0]);
      sweep(buoy,glossy(cream),arc,[.040,.040,.040],{sides:10,segments:5});
    }
  }
}
function equipment(body,kind,d,legScale) {
  const vest=glossy(d.vest),trim=glossy(d.trim),pack=glossy(d.pack);
  const shoulder=.78*legScale;
  barrel(body,fur(d.fur),[[-.828,.030,.051,shoulder],[-.733,.231,.253,shoulder],
    [-.524,.340,.337,shoulder],[-.245,.344,.282,shoulder],[.065,.350,.329,shoulder+.013],
    [.282,.345,.344,shoulder+.023],[.436,.245,.269,shoulder+.067],[.489,.04,.08,shoulder+.07]]);
  barrel(body,vest,[[-.400,.321,.288,shoulder],[-.34,.360,.310,shoulder],[-.21,.361,.301,shoulder],
    [.039,.372,.350,shoulder+.012],[.252,.369,.366,shoulder+.036],[.404,.296,.309,shoulder+.063]]);
  barrel(body,trim,[[-.374,.353,.305,shoulder],[-.345,.364,.314,shoulder],[-.314,.361,.314,shoulder]]);
  const sack=group(body,0,shoulder+.30,-.346);
  box(sack,pack,.558,.270,.539,0,.072,0,.105);
  box(sack,trim,.448,.048,.408,0,.194,-.021,.023);
  sweep(sack,glossy(d.pack),[[-.111,.199,.008],[-.105,.282,.008],[0,.298,.008],[.105,.282,.008],[.111,.199,.008]],
    [.030,.037,.038,.037,.030],{segments:16});
  for(const s of [-1,1]){
    if(kind==='marshall'||kind==='zuma'){
      const tank=oval(sack,pack,.119,.133,.296,s*.274,.010,-.005);
      for(const z of [-.156,.132])box(sack,trim,.159,.216,.047,s*.308,.008,z,.022);
      bead(sack,glossy(steel),.075,.080,.062,s*.281,.019,-.269);
      if(kind==='marshall')sweep(sack,glossy(steel),[[s*.266,.068,-.21],[s*.299,.155,-.17],[s*.299,.154,.028]],
        [.027,.033,.027],{segments:10});
    }else if(kind==='skye'){
      const wing=group(sack,s*.215,.106,-.005);wing.rotation.y=s*.15;
      const foil=oval(wing,glossy('#eb9daf'),.258,.042,.158,s*.139,0,-.046);foil.rotation.z=s*.18;
      bead(wing,glossy('#b84d77'),.072,.038,.094,s*.338,.039,-.056);
    }else{
      box(sack,pack,.170,.261,.451,s*.287,-.012,-.020,.062);
      box(sack,trim,.039,.049,.351,s*.373,.040,-.013,.017);
      if(kind==='rocky') {
        const tool=box(sack,glossy(steel),.052,.113,.184,s*.295,.117,-.149,.023);tool.rotation.x=-.22;
      }else if(kind==='rubble'){
        for(let j=0;j<2;j++)box(sack,glossy('#664d34'),.018,.082,.030,s*.375,-.056,-.107+.117*j,.009).rotation.x=-.46;
      }else bead(sack,glossy(gold),.022,.036,.033,s*.385,-.030,.111);
    }
  }
  rescueTools(sack,kind);
  tube(body,trim,.235,.255,.082,0,shoulder+.294,.286,32);
  badge(body,0,shoulder+.075,.491,d.vest,.40,kind==='chase'?'star':kind==='marshall'?'flame':'paw');
  return [0,shoulder+.60,-.342];
}

const templates=new Map();
function buildPup(kind) {
  const d=breeds[kind],root=new THREE.Group(),body=group(root);
  for(const s of [-1,1]){
    const pair=group(body);pair.scale.y=d.leg;
    leg(pair,d,kind,s,false);leg(pair,d,kind,s,true);
  }
  const anchor=equipment(body,kind,d,d.leg);
  const tail=group(body,0,.80*d.leg,-.665);
  const short=kind==='rubble';
  sweep(tail,fur(d.fur),short?[[0,0,0],[.10,.045,-.114],[.16,.14,-.11],[.12,.19,-.08]]:
    [[0,0,0],[.077,.063,-.222],[.143,.240,-.403],[.158,.377,-.506],[.122,.427,-.562]],
    short?[.106,.085,.056,.012]:[.107,.112,.084,.052,.008],{segments:21,sides:14});
  const h=group(body,0,.78*d.leg+.205,.284);
  h.rotation.x=-.045;
  scalp(h,kind,d);snout(h,d,kind);
  for(const s of [-1,1]){ear(h,kind,d,s);eye(h,d,s,kind);}
  helmet(h,d,kind);
  body.scale.x=d.wide;
  bake(root);
  const bounds=new THREE.Box3().setFromObject(root);
  for(const mesh of root.children) mesh.position.y-=bounds.min.y;
  const scale=d.h/(bounds.max.y-bounds.min.y);
  root.scale.setScalar(scale);root.userData.height=d.h;
  root.userData.grip={x:anchor[0]*scale,z:anchor[2]*scale,y:(anchor[1]-bounds.min.y)*scale,
    rx:.235*scale*d.wide,rz:.285*scale};
  return root;
}
export const PUPS=Object.fromEntries(Object.entries(breeds).map(([id,d])=>[id,{name:d.name,detail:d.job}]));
export function pupModel(kind) {
  if(!templates.has(kind))templates.set(kind,buildPup(kind));
  return templates.get(kind).clone();
}
