import {group,oval,rod} from './parts.js';
import {barrel,bead,sweep} from './sculpt.js';
import {collectable} from './models.js';
import {satin,ink,milk,eye,flower,line} from './figure-detail.js';

const chicks={
  chickChip:['麦奇','#edbd53','#ffdf87','#b97738',1.24],
  chickBobby:['大宇','#c38e66','#f5d4a0','#915b44',1.53],
  chickDuri:['朵朵','#e799ac','#fad4cb','#b86d83',1.43],
  chickJack:['欢欢','#76adcd','#b5dfdf','#4c809f',1.40],
  chickMother:['美佳妈妈','#b87c50','#f4cb88','#81503c',1.82],
};
const feet=satin('#d48d47');
function makeBird(root,id,[,color,breast,bands]){
  const coat=satin(color),down=satin(breast),stripe=satin(bands);
  const mother=id==='chickMother',big=id==='chickBobby',swift=id==='chickJack';
  const r=big?.321:mother?.285:.266;
  for(const s of [-1,1]){
    rod(root,feet,[s*.108,.081,.017],[s*.111,.229,0],.027);
    for(const dx of [-.049,0,.055])line(root,feet,[[s*.109,.071,.037],[s*.112+dx,.052,.112],[s*.112+dx*1.14,.046,.146]],.021);
  }
  oval(root,coat,r,mother?.339:.246,r*.94,0,mother?.439:.377,-.015);
  oval(root,down,r*.76,mother?.278:.177,r*.42,0,mother?.431:.343,r*.55);
  const h=group(root,0,mother?.845:big?.683:.643,.069);
  oval(h,coat,r*1.08,r*.93,r*.95,0,0,0);
  for(const s of [-1,1]){
    const patches=bead(h,down,.094,.084,.03,s*r*.59,-r*.21,r*.70);patches.rotation.y=s*.44;
    eye(h,s*r*.425,.029,r*.793,mother?.060:.068,{yaw:s*.32,iris:mother?'#744d36':'#4f4241',stretch:1.18,lash:(mother||id==='chickDuri')?s:0});
    if(!mother&&id!=='chickDuri')line(h,stripe,[[s*r*.28,.123,r*.76],[s*r*.60,.151,r*.58]],.012);
    const wing=group(root,s*r*.85,mother?.478:.398,-.04);
    wing.rotation.z=-s*(swift?.64:.19);wing.rotation.x=-.45;
    oval(wing,coat,.075,mother?.18:.142,.146,0,0,0);
    for(let i=0;i<3;i++)bead(wing,i===1?down:coat,.027,.083,.043,s*.052,-.043+i*.012,-.038+(i-1)*.061);
  }
  const beakRoot=r*.87;
  barrel(h,satin('#efaa49'),[[beakRoot-.035,.072,.045,-.044],[beakRoot+.022,.084,.054,-.043],[beakRoot+.097,.025,.018,-.057],[beakRoot+.108,.005,.007,-.061]],{sides:16});
  bead(h,satin('#cb803d'),.058,.032,.065,0,-.075,beakRoot+.034);
  const crown=big?1:swift?3:2;
  for(let i=0;i<crown;i++){
    const off=(i-(crown-1)/2)*.063;
    sweep(h,i%2?stripe:coat,[[off,.194,.055],[off,.235,0],[off+.015,.273,-.049],[off+.039,.283,-.077]],[.030,.047,.03,.005],{sides:8,segments:10});
  }
  for(let i=-1;i<=1;i++){
    const x=i*.064;
    line(h,stripe,[[x,.194,.125],[x*.87,.226,.071],[x*.73,.235,-.039]],.014);
    const tail=group(root,i*.065,mother?.45:.371,-.221);tail.rotation.x=mother?-.76:-.87;
    bead(tail,i%2?stripe:coat,.045,mother?.258:.103,.047,0,.052,-.032);
  }
  if(id==='chickDuri')flower(h,.194,.133,.148,.089,milk);
  if(mother)for(let i=0;i<7;i++){const x=(i%3-1)*.057;bead(root,stripe,.016,.023,.009,x,.50-Math.floor(i/3)*.048,.245-Math.abs(x)*.14);}
}
function ladybug(root){
  const red=satin('#d8534b'),char=satin('#3c3a41');
  oval(root,char,.30,.176,.366,0,.216,0);
  for(const s of [-1,1]){
    oval(root,red,.166,.156,.307,s*.124,.279,-.051);
    for(const [z,x] of [[-.20,.160],[-.038,.224],[.11,.150]])bead(root,char,.039,.016,.044,s*x,.409-Math.abs(z+.05)*.17,z);
    for(let i=0;i<3;i++)line(root,char,[[s*.232,.18,-.19+i*.145],[s*.303,.137,-.19+i*.145],[s*.346,.084,-.14+i*.145]],.021);
  }
  oval(root,char,.184,.146,.141,0,.238,.251);
  for(const s of [-1,1]){
    eye(root,s*.077,.263,.36,.042,{yaw:s*.2});
    line(root,char,[[s*.084,.305,.29],[s*.129,.40,.317],[s*.134,.423,.346]],.011);
    bead(root,char,.02,.021,.021,s*.134,.424,.346);
  }
}
export const KATURI=Object.fromEntries(Object.entries(chicks).map(([id,spec])=>[id,{name:spec[0],make:collectable(root=>makeBird(root,id,spec),{height:spec[4],width:1.48,grip:[0,.48,.01,.18,.16]})}]));
KATURI.chickLadybug={name:'瓢虫朋友',make:collectable(ladybug,{height:.98,width:1.36,grip:[0,.28,0,.18,.19]})};
