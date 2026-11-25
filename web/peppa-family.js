import {group,oval,torus,tube} from './parts.js';
import {bead,barrel,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';
import {satin,enamel,ink,milk,gold,eye,line} from './figure-detail.js';

const family={
  peppaPig:['佩奇','#ee4f48','pig',1.45],peppaGeorge:['乔治','#4689cc','george',1.22],
  peppaMum:['猪妈妈','#f09348','mum',1.65],peppaDad:['猪爸爸','#56a9a1','dad',1.82],
  peppaSuzy:['小羊苏西','#f093bc','sheep',1.44],peppaRebecca:['小兔瑞贝卡','#5ab7bc','rabbit',1.53],
};
function dinosaur(root){
  const g=group(root,.27,.58,.20);g.rotation.y=.48;
  const green=satin('#6cb84e'),belly=satin('#b8e06c'),spike=satin('#e5ee66');
  oval(g,green,.082,.126,.096,0,0,0);
  oval(g,belly,.056,.090,.032,0,-.010,.076);
  bead(g,green,.080,.072,.124,0,.132,.038);
  for(const s of [-1,1]){
    bead(g,milk,.022,.022,.014,s*.048,.148,.110);
    bead(g,ink,.012,.014,.010,s*.050,.148,.120);
    bead(g,green,.036,.056,.056,s*.054,-.098,.016);
  }
  sweep(g,green,[[0,-.06,-.04],[0,-.098,-.13],[.015,-.052,-.21]],[.048,.038,.007],{sides:10});
  for(let i=0;i<4;i++)bead(g,spike,.020,.030,.024,0,.104-i*.046,-.042-i*.014);
}
function make(root,[,color,kind]){
  const sheep=kind==='sheep',rabbit=kind==='rabbit',dad=kind==='dad',mum=kind==='mum',george=kind==='george',pig=!sheep&&!rabbit;
  const skin=satin(sheep?'#fbf4e2':rabbit?'#f8dfb6':'#f7aebc'),shirt=satin(color),shoe=enamel('#2c2a38'),collar=satin('#fff8ec');
  const girth=dad?.372:.284;
  // Soft rounded legs + shiny vinyl Mary Jane shoes with cute socks.
  for(const s of [-1,1]){
    const x=s*(dad?.166:.126);
    tube(root,skin,.036,.038,.17,x,.168,0,14);
    oval(root,milk,.046,.024,.048,x,.102,.004);
    oval(root,shoe,.092,.058,.134,x,.066,.040);
  }
  if(dad||george){
    // Plump cozy sweater/shirt with collar ring and button detail.
    loft(root,shirt,[[.235,girth*.84,.225],[.335,girth,.275],[.495,girth*1.02,.285],[.645,girth*.82,.215],[.745,.135,.122]],{sides:30});
    const neck=torus(root,collar,.132,.018,0,.732,.006);neck.rotation.x=Math.PI/2;
    if(dad)for(let i=0;i<2;i++)bead(root,milk,.022,.022,.014,0,.64-i*.095,girth*.72);
  }else{
    // Sculpted flared A-line dress with neat hemline and cute Peter Pan collar.
    loft(root,shirt,[[.228,girth*1.04,.248],[.265,girth*1.06,.254],[.42,girth*.93,.212],[.62,girth*.72,.164],[.742,.126,.116]],{sides:32});
    const neck=torus(root,collar,.124,.017,0,.730,.005);neck.rotation.x=Math.PI/2;
    if(kind==='pig')bead(root,gold,.032,.024,.016,0,.705,.126);
  }
  // Warm, expressive curved arms with soft rounded hands (replacing straight stick twigs).
  for(const s of [-1,1]){
    const x=s*girth*.62;
    const holdDino=george&&s===1,wave=s===-1&&!dad;
    const p=holdDino?[[x,.625,.01],[s*(girth+.04),.57,.11],[s*.22,.56,.18]]:
      wave?[[x,.632,.01],[s*(girth+.075),.655,.04],[s*(girth+.13),.725,.085]]:
      [[x,.625,.01],[s*(girth+.072),.55,.03],[s*(girth+.105),.495,.075]];
    sweep(root,skin,p,[.038,.034,.032],{sides:10,segments:12});
    oval(root,skin,.044,.040,.042,...p[2]);
    // Cute short puffed sleeve cuff on dresses/shirts.
    oval(root,shirt,.064,.058,.058,x*1.04,.636,.01);
  }
  const h=group(root,0,.885,.015);h.rotation.y=pig?-.40:.04;
  if(pig){
    // Plump smooth Peppa silhouette with soft snout tip and rounded pink cheeks.
    barrel(h,skin,[[-.248,.045,.062,.014],[-.186,.234,.228,.019],[-.056,.304,.284,.030],[.084,.280,.256,.038],[.186,.206,.182,.062],[.265,.152,.124,.096],[.352,.146,.118,.110]],{sides:32});
    oval(h,satin('#ee94a8'),.148,.118,.046,0,.112,.354);
    for(const s of [-1,1]){
      bead(h,satin('#b05c78'),.024,.032,.013,s*.060,.124,.394);
      const ear=oval(h,skin,.072,.132,.056,s*.134,.280,-.088);ear.rotation.z=-s*.14;
      bead(h,satin('#ec8fa6'),.038,.080,.022,s*.142,.300,-.050);
    }
  }else{
    oval(h,skin,.274,.256,.238,0,.026,0);
    oval(h,skin,.166,.118,.168,0,-.068,.138);
    if(sheep){
      // Fluffy sculpted cloud crown of white wool curls.
      for(let i=0;i<9;i++){const a=i*(Math.PI*2/9);bead(h,milk,.094,.082,.094,.188*Math.sin(a),.208,.146*Math.cos(a));}
      bead(h,milk,.135,.088,.125,0,.252,.010);
    }
    if(rabbit)bead(h,satin('#f095a4'),.034,.024,.022,0,-.028,.296);
    for(const s of [-1,1]){
      const e=oval(h,skin,rabbit?.068:.094,rabbit?.232:.068,.052,s*(rabbit?.112:.248),rabbit?.356:.115,-.034);e.rotation.z=-s*(rabbit?.08:.36);
      if(rabbit)bead(h,satin('#eb9ea8'),.038,.160,.022,s*.115,.368,.004);
    }
  }
  for(const s of [-1,1]){
    const yaw=s*(pig?.50:.34),x=s*(pig?.182:.116),y=pig?.145:.106,z=pig?.176:.206;
    eye(h,x,y,z,dad?.050:.060,{yaw,iris:pig?'#392d3d':'#4d3c3a',stretch:1.06,lash:(mum||sheep||kind==='pig'||rabbit)?s:0});
    if(dad){
      const g=group(h,x,y,z+.028);g.rotation.y=yaw;torus(g,ink,.076,.010,0,0,0);
      line(h,ink,[[s*.226,y,.172],[s*.288,y+.014,0]],.009);
    }
    const cheek=bead(h,satin(pig?'#ee7d9c':'#ee9ea4'),.072,.058,.020,s*(pig?.268:.206),-.022,pig?.096:.132);cheek.rotation.y=s*.78;
    if(dad)for(let i=0;i<5;i++){const a=i*.5;bead(h,ink,.006,.011,.006,s*(.135+.058*Math.sin(a)),-.112+i%2*.026,.132+.035*Math.cos(a));}
  }
  if(dad)line(h,ink,[[-.12,.152,.226],[0,.160,.260],[.12,.152,.226]],.008);
  const mz=pig?.252:.268;
  line(h,satin('#b84f67'),[[-.102,-.058,mz],[0,-.104,mz+.016],[.100,-.060,mz]],.014);
  if(pig){
    const pts=Array.from({length:12},(_,i)=>{const a=i*.56;return [.036*Math.sin(a),.45+.036*Math.cos(a),-.225-.012*i];});
    line(root,skin,pts,.020);
  }else if(rabbit)bead(root,milk,.092,.092,.092,0,.362,-.218);
  if(george)dinosaur(root);
}
export const PEPPA=Object.fromEntries(Object.entries(family).map(([id,spec])=>[id,{name:spec[0],make:collectable(root=>make(root,spec),{height:spec[3],width:1.42,grip:[0,.59,0,.175,.165]})}]));
