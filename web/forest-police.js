import {group,oval,box,rod,torus,tube} from './parts.js';
import {barrel,bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';
import {satin,enamel,ink,milk,gold,eye,line,badge,star} from './figure-detail.js';

const navy=satin('#2b4782'),shirt=satin('#366db8'),black=enamel('#2b2d3b'),rim=satin('#faf0d4'),glass=enamel('#c2e7ec');
function shield(p,x,y,z,r){
  badge(p,gold,[[-r,r*.70],[-r,-r*.12],[0,-r],[r,-r*.12],[r,r*.70],[0,r]],x,y,z);
  star(p,navy,x,y,z+.020,r*.51);
}
function cap(p,w){
  const peak=group(p,0,.026,-.008);peak.rotation.z=-.13;
  loft(peak,navy,[[.004,w*.76,w*.65],[.055,w*.92,w*.74],[.130,w*1.02,w*.75],[.172,w*.86,w*.62],[.186,w*.40,w*.30]],{sides:28});
  tube(p,gold,w*.84,w*.80,.028,0,.028,0,26);
  oval(p,black,w*.84,.022,w*.66,0,.016,w*.44);
  shield(p,-.018,.124,w*.70,.054);
}
function officer(root,kind){
  const sheriff=kind==='lab',butterfly=kind==='papillon';
  const fur=satin(sheriff?'#f0b335':butterfly?'#ed648b':'#554238');
  const muzzle=satin(sheriff?'#f7ca62':butterfly?'#fff2e6':'#e2aa6c');
  // Smooth lofted uniform trousers & glossy patrol boots.
  for(const s of [-1,1]){
    const leg=group(root,s*.114,0,0);
    loft(leg,navy,[[.11,.078,.082],[.22,.082,.086],[.33,.092,.094]],{sides:18});
    oval(root,black,.104,.076,.160,s*.116,.074,.042);
  }
  loft(root,shirt,[[.295,.208,.146],[.35,.228,.168],[.57,.206,.158],[.66,.176,.134],[.70,.122,.106]],{sides:26});
  // Tailored police tie, belt with gold buckle, breast pockets, and shiny badge.
  oval(root,navy,.228,.058,.172,0,.352,0);box(root,gold,.062,.042,.022,0,.354,.172,.008);
  badge(root,navy,[[-.028,.075],[.028,.075],[.040,-.095],[0,-.135],[-.040,-.095]],0,.565,.156,.014);
  for(const s of [-1,1]){
    box(root,navy,.078,.062,.016,s*.104,.520,.148,.006);
    // Expressive curved sleeves with gold cuffs and friendly hands.
    const salute=sheriff&&s===-1,wave=butterfly&&s===-1;
    const pts=salute?[[s*.175,.615,.01],[s*.282,.600,.06],[s*.225,.725,.14]]:
      wave?[[s*.175,.615,.01],[s*.285,.660,.04],[s*.322,.765,.09]]:
      [[s*.175,.615,.01],[s*.232,.510,.02],[s*.195,.415,.075]];
    sweep(root,shirt,pts,[.074,.058,.052],{sides:12,segments:12});
    bead(root,gold,.056,.020,.056,...pts[2]);
    bead(root,butterfly?milk:fur,.066,.072,.060,pts[2][0],pts[2][1]+(salute||wave?.045:-.052),pts[2][2]+.018);
    box(root,navy,.116,.028,.098,s*.166,.670,.004,.010).rotation.z=-s*.12;
    box(root,gold,.026,.018,.088,s*.186,.688,.004,.005);
    badge(root,navy,[[0,0],[s*.126,.042],[s*.080,-.082]],s*.012,.632,.142);
  }
  shield(root,-.106,.548,.162,.042);
  const h=group(root,0,.926,.016);h.rotation.y=-.24;
  if(sheriff)barrel(h,fur,[[-.232,.045,.072,.013],[-.172,.214,.216,.018],[-.024,.272,.274,.016],[.134,.242,.250,-.004],[.250,.200,.158,-.080],[.338,.142,.102,-.075]],{sides:32});
  else oval(h,fur,.290,.274,.248,0,0,0);
  for(const s of [-1,1]){
    if(sheriff){
      const ear=oval(h,satin('#e6a528'),.094,.192,.102,s*.260,.042,-.054);ear.rotation.z=s*.24;
      bead(h,muzzle,.062,.048,.024,s*.145,-.075,.218);
    }else if(butterfly){
      const ear=group(h,s*.236,.088,-.036);ear.rotation.z=s*.48;
      oval(ear,fur,.122,.186,.110,s*.044,0,0);
      for(let i=0;i<3;i++)sweep(ear,i===1?satin('#f89cb8'):fur,[[s*.04,-.010,-.009],[s*(.086+i*.02),-.108,-.024],[s*(.130+i*.022),-.128,-.050]],[.068,.045,.009],{sides:11});
    }else{
      const e=group(h,s*.174,.136,-.064);e.rotation.z=-s*.15;
      loft(e,fur,[[0,.090,.066],[.095,.092,.062],[.216,.056,.040],[.324,.006,.009]],{sides:18});
      bead(e,satin('#c98e72'),.058,.108,.015,0,.124,.048);
      // Doberman signature tan brow spots above eyes.
      bead(h,muzzle,.036,.024,.018,s*.102,.145,.208);
    }
    eye(h,s*.114,.058,.204,butterfly?.086:.074,{yaw:s*.30,iris:butterfly?'#6d4455':'#6b4b38',stretch:1.22,lash:butterfly?s:0});
    if(!butterfly)sweep(h,satin('#342a28'),[[s*.044,.132,.212],[s*.102,.158,.196],[s*.158,.154,.160]],[.014,.020,.012],{sides:8,segments:8});
  }
  const noseZ=sheriff?.352:butterfly?.242:.302;
  if(!sheriff)oval(h,muzzle,butterfly?.242:.208,.134,.162,0,-.102,.138);
  if(butterfly)sweep(h,milk,[[0,.242,.060],[0,.170,.164],[0,.036,.240],[0,-.068,.234]],[.026,.026,.028,.062],{sides:12});
  bead(h,black,sheriff?.102:butterfly?.046:.086,sheriff?.062:.048,.050,0,-.038,noseZ);
  line(h,ink,[[0,-.076,noseZ],[0,-.105,noseZ-.007],[.086,-.114,noseZ-.014]],.010);
  const hat=group(h,0,.234,-.038);hat.rotation.z=sheriff?-.12:.06;cap(hat,sheriff?.230:.202);
  sweep(root,fur,[[0,.355,-.115],[.036,.332,-.215],[.110,.412,-.286]],[.056,.046,.012],{sides:12});
}
function patrolCar(root){
  box(root,rim,.65,.25,.96,0,.262,0,.098);box(root,navy,.674,.086,.88,0,.248,0,.038);
  box(root,shirt,.53,.258,.53,0,.470,-.048,.098);
  box(root,glass,.444,.140,.032,0,.486,.214,.030);
  shield(root,0,.398,.325,.055);
  for(const s of [-1,1]){
    box(root,glass,.030,.140,.320,s*.256,.484,-.054,.022);
    for(const z of [-.290,.286]){const wheel=tube(root,black,.122,.122,.092,s*.312,.166,z,20);wheel.rotation.z=Math.PI/2;bead(root,rim,.020,.052,.052,s*.362,.166,z);}
    bead(root,gold,.074,.044,.026,s*.200,.276,.478);
    box(root,enamel(s>0?'#eb4d52':'#42b5e6'),.116,.066,.094,s*.070,.622,-.029,.024);
  }
}
function radio(root){
  box(root,navy,.46,.63,.19,0,.323,0,.08);rod(root,black,[-.125,.56,-.01],[-.17,.89,-.004],.036);
  box(root,enamel('#b2e0cf'),.314,.155,.022,0,.456,.096,.017);
  for(let i=0;i<4;i++)box(root,black,.22-i*.014,.018,.016,-.015,.32-i*.043,.102,.006);
  bead(root,gold,.042,.042,.020,.136,.120,.10);
}
function magnifier(root){
  const g=group(root,0,.41,0);g.rotation.z=-.46;torus(g,navy,.208,.040,0,.13,0);
  bead(g,glass,.184,.184,.048,0,.13,0);line(g,milk,[[-.091,.148,.048],[-.058,.206,.049],[.003,.238,.041]],.011);
  rod(g,gold,[0,-.086,0],[0,-.183,0],.036);rod(g,navy,[0,-.158,0],[0,-.398,0],.062);
}
const pieces={
  sheriffLab:['啦咘啦哆警长',r=>officer(r,'lab'),1.67,[0,.58,0,.17,.15]],
  sheriffDobie:['杜兵警员',r=>officer(r,'dobie'),1.69,[0,.58,0,.17,.15]],
  sheriffPapillon:['小蝶警员',r=>officer(r,'papillon'),1.51,[0,.58,0,.17,.15]],
  sheriffCar:['森林巡逻车',patrolCar,1.03,[0,.42,-.02,.19,.23]],
  sheriffGlass:['侦探放大镜',magnifier,1.25,[0,.45,0,.11,.09]],
  sheriffRadio:['巡逻对讲机',radio,1.25,[0,.35,0,.145,.085]],
};
export const POLICE=Object.fromEntries(Object.entries(pieces).map(([id,[name,make,height,grip]])=>[id,{name,make:collectable(make,{height,width:1.8,grip})}]));
