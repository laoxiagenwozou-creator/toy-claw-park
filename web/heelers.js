import {THREE,group,oval,paint} from './parts.js';
import {barrel,bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';

const family={
  bandit:['爸爸','#81b3d6','#384969','#efc775','#768eb2',1.76,1.05],
  chilli:['妈妈','#e99160','#ba674d','#ffda98','#efb185',1.68,.97],
  muffin:['松饼','#afb2bc','#686a7a','#eee5ce','#939aaa',1.43,1.035],
  socks:['小袜子','#809ebc','#555f85','#f1c78e','#9fc1d1',1.24,.94],
};
function eyes(h,x,y,z){
  for(const s of [-1,1]){
    const eye=group(h,s*x,y,z);eye.rotation.y=s*.20;eye.rotation.z=s*.065;
    oval(eye,'#fff5db',.125,.171,.069,0,0,0);
    oval(eye,'#262f3e',.052,.082,.024,-.012,.004,.063);
    bead(eye,'#fffaea',.015,.021,.009,-.028,.041,.083);
  }
}
function ears(h,coat,mark,cream,id){
  for(const s of [-1,1]){
    const ear=group(h,s*.233,1.286,-.066);ear.rotation.z=-s*(id==='muffin'?.28:.21);
    loft(ear,mark,[[0,.118,.105],[.054,.12,.106],[.18,.085,.079],[.294,.044,.036],[.337,.009,.012]],{sides:22});
    loft(ear,id==='muffin'?cream:'#eab994',[[.05,.076,.033,.070],[.099,.077,.032,.074],[.200,.043,.025,.061],[.275,.009,.009,.034]],{sides:20});
  }
}
function socks(root,d){
  const [,coat,mark,cream,soft]=d;
  const base=new THREE.Color(coat),patch=new THREE.Color(mark),light=new THREE.Color(soft);
  const body=group(root);
  barrel(body,paint('#ffffff','satin'),[[-.48,.04,.04,.43],[-.42,.19,.17,.43],
    [-.26,.248,.219,.44],[.01,.24,.215,.45],[.20,.212,.21,.48],[.28,.122,.15,.49]],{
    sides:32,steps:4,tint:(x,along,vertical)=>along<-.13&&vertical<-.46&&x<.10?patch:Math.abs(x)>.18?light:base});
  for(const s of [-1,1])for(const z of [-.275,.139]){
    const foot=group(body,s*.159,0,z);
    bead(foot,coat,.084,.160,.090,0,.244,0);
    loft(foot,cream,[[.047,.065,.074,.008],[.09,.082,.079,.011],[.151,.079,.074],[.188,.073,.065]],{sides:16,steps:2});
    bead(foot,cream,.088,.057,.112,0,.071,.041);
  }
  const head=group(body,0,.510,.205);
  loft(head,paint('#ffffff','satin'),[[0,.13,.145],[.061,.232,.205],[.182,.279,.226],
    [.308,.276,.212],[.397,.242,.184],[.429,.140,.128]],{
    exponent:.74,sides:40,steps:4,tint:(x,y,z)=>z<-.07||x<-.12&&y>.22?patch:base});
  const crown=group(head,0,-.662,-.007);crown.scale.set(.78,.80,.83);
  ears(crown,coat,mark,cream,'socks');
  const face=group(head,0,0,.014);face.scale.set(.78,.78,.78);
  eyes(face,.143,.314,.255);
  for(const s of [-1,1])bead(head,cream,.068,.022,.035,s*.139,.366,.165).rotation.z=s*.12;
  bead(head,cream,.152,.086,.127,0,.143,.227);
  bead(head,'#344658',.073,.053,.060,0,.183,.331);
  sweep(head,'#926e59',[[-.076,.126,.327],[-.046,.115,.344],[0,.111,.346],[.043,.118,.343],[.075,.129,.327]],
    [.004,.006,.006,.006,.003],{sides:7,segments:9});
  sweep(body,mark,[[0,.46,-.366],[.045,.52,-.502],[.088,.62,-.57],[.111,.705,-.588]],
    [.080,.088,.070,.039],{sides:12,segments:12});
  sweep(body,cream,[[.096,.647,-.575],[.112,.707,-.589],[.126,.763,-.578]],
    [.059,.045,.008],{sides:12,segments:8});
}
function sculpt(root,id,d){
  if(id==='socks'){socks(root,d);return;}
  const [,coat,mark,cream,soft,,wide]=d;
  const baby=id==='muffin';
  const h=group(root);h.scale.x=wide;
  const base=new THREE.Color(coat),dark=new THREE.Color(mark),belly=new THREE.Color(cream),pale=new THREE.Color(soft);
  // A rounded rectangular body carries coat patches continuously around the sides and back.
  loft(h,paint('#ffffff','satin'),[[.27,.20,.184],[.32,.294,.237],[.42,.329,.249],[.67,.322,.236],
    [.89,.329,.248],[1.07,.347,.262],[1.235,.33,.25],[1.334,.274,.223],[1.38,.13,.13]],{
    exponent:.66,sides:60,steps:7,tint:(x,y,z,a)=>{
      const front=Math.cos(a);
      if(z>.14 && ((x/.248)**2+((y-.60)/.334)**2)<1)return belly;
      if(front<.05 && y>1.11+.082*Math.cos(a*3))return dark;
      if(y>1.204+.116*Math.cos(a*2+.75) && (x>.034||front<.4))return dark;
      if((x<-.17||front<-.36) && Math.sin(a*3+.8)+Math.cos(y*10-.75)>.40 && y>.44 && y<.98)return id==='chilli'?pale:dark;
      if(x<-.15&&z>.09&&y>.87&&y<1.19)return pale;
      return base;
    }});
  ears(h,coat,mark,cream,id);
  eyes(h,.137,1.113,.234);
  for(const s of [-1,1]){
    const brow=bead(h,cream,.085,.034,.042,s*.162,1.29,.19);brow.rotation.z=s*-.14;
    const leg=group(h,s*.161,.30,0);
    oval(leg,soft,.085,.154,.089,0,-.09,0);
    oval(leg,baby?cream:soft,.097,.073,.144,0,-.205,.041);
    const arm=group(h,s*.293,.827,.013);
    arm.rotation.z=id==='chilli'&&s===1?2.05:s*(baby?1.0:.23);
    sweep(arm,coat,[[0,0,0],[s*.045,-.078,.012],[s*.067,-.18,.056],[s*.088,-.267,.077]],[.079,.080,.067,.052]);
    bead(arm,cream,.072,.091,.085,s*.087,-.270,.080);
  }
  oval(h,cream,.203,.117,.167,0,1.002,.326);
  bead(h,id==='chilli'?'#704744':'#354451',.110,.073,.082,0,1.054,.454);
  sweep(h,'#8f6555',[[-.122,.974,.420],[-.065,.943,.451],[0,.935,.455],[.064,.944,.451],[.122,.974,.42]],[.007,.008,.009,.008,.007],{segments:12,sides:7});
  const tail=group(h,0,.466,-.164);tail.rotation.z=id==='muffin'?-.25:.08;
  sweep(tail,mark,[[0,0,0],[.026,.031,-.126],[.077,.121,-.247],[.132,.212,-.312],[.154,.261,-.322]],[.102,.109,.088,.064,.026],{sides:14});
  sweep(tail,baby?cream:soft,[[.094,.157,-.275],[.132,.218,-.311],[.154,.274,-.320],[.157,.297,-.310]],[.081,.065,.039,.007],{sides:14});
  if(id==='bandit'){
    for(const s of [-1,1])for(let j=0;j<3;j++)bead(h,mark,.009,.012,.011,s*(.073+.026*j),.983+j%2*.013,.467-j*.010);
  }
}
export const HEELERS=Object.fromEntries(Object.entries(family).map(([id,d])=>[id,{
  name:d[0],make:collectable(p=>sculpt(p,id,d),{height:d[5],width:1.65,grip:id==='socks'?[0,.60,-.135,.184,.204]:[0,1.13,-.027,.207,.216]})
}]));
