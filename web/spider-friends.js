import {group,oval,box,torus} from './parts.js';
import {bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';
import {satin,enamel,ink,milk,badge,line} from './figure-detail.js';

const red=satin('#df3f45'),redGloss=enamel('#e54349'),blue=satin('#2f599e'),onyx=satin('#2b2c38'),onyxGloss=enamel('#262835');
const pink=satin('#e9699b'),pinkGloss=enamel('#ee70a2'),white=satin('#f8f5f0'),silver=enamel('#d0dce8'),cyanGlow=enamel('#7ee5ff'),tealBoot=satin('#56bcc4');
function spiderBadge(root,mat,x,y,z,r){
  const g=group(root,x,y,z);
  bead(g,mat,r*.22,r*.33,r*.095,0,-r*.06,0);bead(g,mat,r*.15,r*.18,r*.10,0,r*.28,0);
  for(const s of [-1,1])for(let i=0;i<4;i++){
    const start=(.24-.13*i)*r,elbow=(.68-.30*i)*r,end=(.99-.64*i)*r;
    line(g,mat,[[0,start,.001],[s*r*(.40+i*.032),elbow,-.005],[s*r*(.62+i*.026),end,-.014]],r*.062);
  }
}
function pointOnMask(a,b){
  return [.274*Math.sin(a)*Math.cos(b),.283*Math.sin(b),.245*Math.cos(a)*Math.cos(b)];
}
function maskWeb(h,thread){
  for(const a of [-1.68,-1.12,-.56,0,.56,1.12,1.68]){
    const path=[-1.15,-.7,-.25,.18,.64,1.10,1.48].map(b=>pointOnMask(a,b));
    line(h,thread,path,.0065);
  }
  for(const b of [-.82,-.40,.06,.54,1.02])for(const s of [-1,1]){
    const path=Array.from({length:10},(_,i)=>pointOnMask(s*i*.185,b-.060*Math.sin(i*Math.PI/3)**2));
    line(h,thread,path,.0065);
  }
}
function lens(h,s,edge,cat=false,glow=milk){
  const g=group(h,s*.116,.018,.216);g.rotation.y=s*.43;g.rotation.z=-s*(cat?.12:.17);
  const outline=cat?[[-.104,.014],[-.028,.042],[.110,.082],[.072,-.008],[-.056,-.036]]:
    [[-.102,.010],[-.066,.078],[.008,.112],[.104,.134],[.095,.058],[.064,-.044],[-.006,-.084],[-.072,-.058]];
  const shape=outline.map(([x,y])=>[s*x,y]);
  badge(g,edge,shape,0,0,0,.017);
  badge(g,glow,shape.map(([x,y])=>[x*.76,y*.74]),0,.004,.017,.013);
}
function hero(root,kind){
  const peter=kind==='peter',miles=kind==='miles',gwen=kind==='gwen',cat=kind==='panther';
  const suit=miles||cat?onyx:gwen?white:red,body=gwen||miles||cat?onyx:blue;
  const trim=miles?redGloss:gwen?pinkGloss:cat?silver:ink;
  for(const s of [-1,1]){
    const posed=s===1&&(miles||gwen),kneeX=s*(posed?.176:.126),kneeY=posed?.286:.238;
    const legMat=gwen?onyx:body;
    sweep(root,legMat,[[s*.092,.458,0],[kneeX,kneeY,.036],[kneeX,.118,posed?-.084:.016]],[.090,.070,.062],{sides:14});
    // Boots with cuff band for superhero vinyl-figure finish.
    const bootMat=gwen?tealBoot:miles?red:cat?onyxGloss:red;
    oval(root,bootMat,.083,.063,.134,kneeX,.076,posed?-.044:.050);
    if(peter||miles){
      const cuff=torus(root,peter?red:redGloss,.061,.015,kneeX,.175,posed?-.045:.022);cuff.rotation.x=Math.PI/2;
    }
    if(cat){
      const cuff=torus(root,silver,.064,.011,kneeX,.165,.020);cuff.rotation.x=Math.PI/2;
    }
  }
  // Sculpted athletic torso + belt / waist line.
  loft(root,body,[[.402,.135,.098],[.475,.156,.116],[.558,.150,.108],[.674,.206,.132],[.726,.174,.110],[.756,.092,.082]],{sides:26});
  if(peter){
    // Classic red chest yoke & belt wrap.
    loft(root,red,[[.555,.154,.112],[.672,.209,.135],[.724,.177,.113],[.754,.095,.084]],{sides:26});
    oval(root,red,.145,.038,.112,0,.468,.006);
  }else if(miles){
    // Crimson shoulder V-chevron & subtle belt accent.
    loft(root,red,[[.645,.198,.128],[.722,.179,.114],[.752,.096,.084]],{sides:26});
    badge(root,red,[[-.155,.065],[0,-.065],[.155,.065],[.125,.098],[0,-.012],[-.125,.098]],0,.635,.124,.014);
  }else if(gwen){
    // Iconic white upper jacket torso + teal side panel stripes.
    loft(root,white,[[.548,.154,.112],[.674,.209,.135],[.726,.177,.113],[.755,.095,.084]],{sides:26});
    for(const s of [-1,1])line(root,tealBoot,[[s*.148,.52,.058],[s*.174,.65,.052]],.016);
  }else if(cat){
    // Sculpted Vibranium kinetic chest armor & silver energy ribs.
    for(const s of [-1,1]){
      bead(root,onyxGloss,.082,.068,.038,s*.072,.645,.114);
      line(root,silver,[[s*.032,.678,.134],[s*.124,.642,.124],[s*.142,.578,.110]],.010);
      line(root,silver,[[s*.042,.582,.118],[s*.108,.540,.112]],.009);
    }
    const belt=torus(root,silver,.148,.012,0,.478,.004);belt.rotation.x=Math.PI/2;
    oval(root,satin('#8f6ae8'),.052,.024,.016,0,.478,.154);
  }
  for(const s of [-1,1]){
    const wave=s===-1&&!cat,elbow=[s*(wave?.264:.226),wave?.624:.522,.016],hand=[s*(wave?.330:.172),wave?.760:.435,.096];
    const armMat=peter?blue:gwen?white:body;
    sweep(root,armMat,[[s*.160,.690,0],elbow,hand],[.078,.056,.048],{sides:12,segments:12});
    bead(root,peter?red:miles?onyx:gwen?white:onyxGloss,.056,.063,.046,...hand);
    if(peter||miles){
      const wrist=torus(root,red,.048,.012,hand[0]*.88,hand[1]-.028,hand[2]*.84);wrist.rotation.x=Math.PI/2;
    }
    if(cat){
      const cuff=torus(root,silver,.050,.011,hand[0]*.92,hand[1]+.026,hand[2]*.86);cuff.rotation.x=Math.PI/2;
      for(let i=0;i<3;i++)line(root,silver,[[hand[0]+s*(i-1)*.016,hand[1]-.03,hand[2]+.024],[hand[0]+s*(i-1)*.020,hand[1]-.085,hand[2]+.046]],.008);
    }
    if(wave)for(const i of [-1,1])line(root,peter?red:suit,[[hand[0]+i*.022,hand[1]+.026,hand[2]],[hand[0]+i*.033,hand[1]+.092,hand[2]+.010]],.014);
  }
  const h=group(root,0,.978,.006);oval(h,cat?onyxGloss:suit,.270,.280,.240,0,0,0);
  if(peter||miles)maskWeb(h,miles?satin('#be3d4c'):satin('#4b2938'));
  if(gwen){
    const hood=group(h,0,.010,-.016);
    sweep(hood,white,[[-.212,-.188,.040],[-.272,.050,.034],[-.186,.224,.024],[0,.300,.002],[.186,.224,.026],[.270,.050,.038],[.212,-.188,.038]],[.038,.050,.058,.060,.058,.050,.038],{sides:14,segments:28});
    // Vivid magenta-pink inner hood lining framing Ghost-Spider's mask.
    sweep(hood,pink,[[-.202,-.166,.080],[-.242,.074,.094],[-.158,.224,.098],[0,.266,.100],[.158,.224,.096],[.242,.074,.094],[.202,-.166,.080]],[.018,.024,.025,.025,.025,.024,.018],{sides:10,segments:24});
  }
  if(cat){
    // Sculpted sleek panther brow, pointed ears, and silver Vibranium necklace + mask runes.
    for(const s of [-1,1]){
      const ear=group(h,s*.168,.174,-.038);ear.rotation.z=-s*.22;
      loft(ear,onyxGloss,[[0,.092,.068],[.056,.079,.059],[.176,.010,.012]],{sides:16});
      bead(ear,silver,.026,.064,.014,0,.076,.056);
      line(h,silver,[[s*.236,.126,.076],[s*.204,.014,.152],[s*.206,-.064,.134],[s*.090,-.176,.174]],.011);
      line(h,satin('#9c78f2'),[[s*.075,.142,.202],[s*.148,.168,.160]],.010);
      for(let i=0;i<3;i++){const tooth=badge(root,silver,[[0,-.048],[-.017,.022],[.020,.022]],s*(.038+i*.040),.718-i*.008,.124-i*.012,.016);tooth.rotation.z=s*.25;}
    }
    oval(h,onyxGloss,.112,.072,.075,0,-.095,.202);
    bead(h,silver,.038,.020,.016,0,-.066,.264);
  }
  for(const s of [-1,1])lens(h,s,trim,cat,cat?cyanGlow:milk);
  if(!cat)spiderBadge(root,miles?redGloss:gwen?pinkGloss:ink,0,.628,.138,.076);
}
function hulk(root){
  const skin=satin('#6ea64f'),skinHi=satin('#7bb559'),hair=satin('#26382f'),shorts=satin('#6d518c'),shortsTrim=satin('#5a4077');
  // Powerful sculpted legs & grounded toes instead of stacked ovals.
  for(const s of [-1,1]){
    sweep(root,skin,[[s*.145,.34,.00],[s*.158,.20,.022],[s*.156,.09,.016]],[.116,.106,.094],{sides:14,segments:10});
    oval(root,skin,.126,.064,.154,s*.158,.066,.048);
    for(let i=0;i<3;i++)bead(root,skinHi,.026,.024,.032,s*.158+(i-1)*.048,.048,.182);
    loft(root,shorts,[[.245,.124,.128],[.335,.148,.142],[.405,.152,.140]],{sides:16}).position.x=s*.128;
  }
  // Heroic V-taper muscular torso + sculpted chest pectorals & torn-hem shorts.
  loft(root,shorts,[[.335,.226,.155],[.408,.246,.168],[.452,.232,.158]],{sides:24});
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    badge(root,shortsTrim,[[-.044,.045],[0,-.042],[.044,.045]],Math.sin(a)*.215,.315,Math.cos(a)*.148,.016).rotation.y=a;
  }
  loft(root,skin,[[.432,.218,.150],[.522,.266,.182],[.640,.304,.204],[.718,.274,.180],[.756,.145,.125]],{sides:28});
  for(const s of [-1,1]){
    bead(root,skinHi,.125,.092,.068,s*.108,.622,.166);
    bead(root,skinHi,.074,.052,.042,s*.068,.514,.158);
  }
  // Swept muscular biceps/forearms + clenched power fists.
  for(const s of [-1,1]){
    const pts=[[s*.248,.662,.00],[s*.348,.585,.022],[s*.376,.468,.064],[s*.324,.395,.128]];
    sweep(root,skin,pts,[.132,.114,.106,.092],{sides:14,segments:14});
    oval(root,skinHi,.112,.102,.108,s*.316,.384,.148);
    for(let i=0;i<4;i++)bead(root,skin,.026,.038,.032,s*.316+(i-1.5)*.038,.368,.224);
  }
  // Sculpted heroic cartoon head with brow ridge, expressive glossy eyes, and swept hair tuft.
  const h=group(root,0,.902,.020);
  loft(h,skin,[[-.158,.158,.146],[-.092,.210,.174],[.020,.216,.184],[.124,.202,.174],[.188,.142,.138]],{sides:26});
  // Strong jawline & cheekbones + friendly-fierce brow ridge.
  oval(h,skinHi,.182,.072,.132,0,-.098,.056);
  box(h,skinHi,.318,.064,.095,0,.084,.136,.028);
  // Swept sculpted dark hair cap + dynamic bangs (replacing flat beads).
  loft(h,hair,[[.085,.214,.186],[.152,.222,.192],[.212,.175,.156],[.236,.082,.078]],{sides:24});
  for(let i=-2;i<=2;i++){
    const x=i*.068;
    sweep(h,hair,[[x,.188,.060],[x*.95,.162,.152],[x*1.05,.108+(Math.abs(i)%2)*.022,.194]],[.046,.042,.012],{sides:8,segments:8});
  }
  for(const s of [-1,1]){
    bead(h,skin,.044,.062,.038,s*.218,-.008,-.010);
    // Glossy expressive eyes beneath thick angled brows.
    const socket=group(h,s*.086,.028,.168);socket.rotation.y=s*.22;
    bead(socket,ink,.052,.042,.018,0,0,0);
    bead(socket,milk,.046,.036,.019,0,0,.007);
    bead(socket,enamel('#2b6b38'),.026,.028,.014,0,0,.018);
    bead(socket,ink,.016,.018,.010,0,0,.024);
    bead(socket,milk,.009,.010,.006,-.010,.010,.030);
    sweep(h,hair,[[s*.026,.068,.186],[s*.098,.092,.184],[s*.156,.078,.154]],[.018,.024,.014],{sides:8,segments:8});
  }
  bead(h,skinHi,.048,.036,.038,0,-.024,.182);
  // Determined grin with white teeth strip.
  box(h,milk,.118,.032,.026,0,-.084,.166,.012);
  line(h,ink,[[-.072,-.084,.175],[0,-.094,.184],[.072,-.084,.175]],.011);
}
function traceRobot(root){
  const teal=enamel('#52c2c6'),chrome=enamel('#c8d4de');
  oval(root,teal,.232,.128,.256,0,.262,0);
  oval(root,redGloss,.194,.098,.216,0,.330,-.026);
  spiderBadge(root,onyxGloss,0,.420,-.022,.058);
  for(const s of [-1,1])for(let i=0;i<4;i++){
    const z=(i-1.5)*.115;
    const pts=[[s*.138,.232,z],[s*(.258+.026*(i%2)),.286,z*1.23],[s*.342,.108,z*1.56],[s*.372,.075,z*1.61]];
    sweep(root,i%2?redGloss:teal,pts,[.030,.034,.024,.019],{sides:10,segments:8});
    bead(root,chrome,.032,.032,.032,s*(.258+.026*(i%2)),.286,z*1.23);
    bead(root,onyxGloss,.036,.024,.042,s*.366,.063,z*1.61);
  }
  const h=group(root,0,.292,.196);bead(h,onyxGloss,.146,.088,.078,0,0,0);
  for(const s of [-1,1]){bead(h,cyanGlow,.050,.048,.020,s*.062,0,.068);bead(h,milk,.020,.020,.009,s*.060-.009,.014,.085);}
}
const cast={
  webPeter:['蜘蛛侠',r=>hero(r,'peter'),1.63],webMiles:['迈尔斯',r=>hero(r,'miles'),1.57],webGwen:['幽灵蜘蛛侠',r=>hero(r,'gwen'),1.56],
  webTrace:['蛛蛛机器人',traceRobot,.92],webHulk:['浩克',hulk,1.65],webPanther:['黑豹',r=>hero(r,'panther'),1.59],
};
export const SPIDEY=Object.fromEntries(Object.entries(cast).map(([id,[name,make,height]])=>[id,{name,make:collectable(make,{height,width:1.55,grip:id==='webTrace'?[0,.27,0,.15,.16]:[0,.60,0,.14,.14]})}]));
