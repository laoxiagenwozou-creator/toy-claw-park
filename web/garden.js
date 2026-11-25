import {THREE,group,oval,paint,part,torus,tube} from './parts.js';
import {bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';

const leaf=paint('#588867','satin'),soil=paint('#684a39','satin'),cream=paint('#fff0cb','satin');
const flowers={
  fern:['翡翠蕨','#78b98d','#7aab85',0],honey:['蜜蜡花','#f6bc4c','#e1a766',1],
  coralBud:['珊瑚芽','#f18b79','#ce8f7e',2],bells:['雾铃','#bd9fdf','#9c89bf',3],
  moss:['潮汐苔','#6bbab0','#71a9ad',4],moon:['月白苗','#f0dfb1','#d5b777',5],
};
function sprig(p,c,angle,y,size) {
  const stem=group(p,0,y,0);stem.rotation.y=angle;
  const blade=oval(stem,c,.085*size,.162*size,.044*size,.067*size,.075*size,.02);
  blade.rotation.z=-.57;
}
function makePlant(root,accent,potTone,form) {
  const petal=paint(accent,'satin'),ceramic=paint(potTone);
  loft(root,ceramic,[[.02,.27,.27],[.07,.295,.295],[.14,.302,.302],[.32,.342,.342],[.368,.356,.356]],{sides:40});
  tube(root,cream,.36,.355,.035,0,.355,0,40);
  tube(root,soil,.326,.323,.028,0,.381,0,40);
  for(let i=0;i<9;i++){
    const a=i*2.4;bead(root,paint(i%2?'#96725a':'#aa8b6a','satin'),.027,.018,.024,Math.sin(a)*.252,.402,Math.cos(a)*.252);
  }
  if(form===0||form===5){
    sweep(root,leaf,[[0,.38,0],[-.05,.58,-.015],[.014,.79,.009],[.006,.98,.003]],[.025,.019,.012,.005]);
    for(let i=0;i<8;i++)sprig(root,i%3?petal:leaf,i*2.4,.44+i*.062,1-i*.036);
    if(form===5)for(let i=0;i<5;i++){const a=i*1.256;oval(root,petal,.079,.09,.060,Math.sin(a)*.072,.984,Math.cos(a)*.072);}
  }else if(form===1||form===2){
    for(const [x,z,y] of form===1?[[0,0,.85]]:[[-.115,-.008,.72],[.09,.026,.84],[.05,-.10,.65]]){
      sweep(root,leaf,[[0,.385,0],[x*.65,.59,z],[x,y,z]],[.030,.023,.013]);
      const f=group(root,x,y,z);f.rotation.x=.20;
      const n=form===1?8:5,rad=form===1?.128:.081;
      for(let i=0;i<n;i++){const a=i*2*Math.PI/n,o=oval(f,petal,rad*.58,rad*.38,rad,Math.sin(a)*rad*.78,.022,Math.cos(a)*rad*.78);o.rotation.y=a;}
      bead(f,paint('#f1ad43'),rad*.69,.057,rad*.69,0,.044,0);
    }
    for(let i=0;i<4;i++)sprig(root,leaf,i*2.35,.41+i*.047,.91);
  }else if(form===3){
    for(const [x,z,top] of [[-.13,.037,.91],[.13,.037,.78],[.045,-.085,.99]]){
      sweep(root,leaf,[[0,.38,0],[x*.40,top-.19,z],[x*.8,top,z],[x,top-.061,z+.036]],[.019,.016,.012,.008]);
      const bell=group(root,x,top-.142,z+.035);
      loft(bell,petal,[[0,.082,.082],[.031,.087,.087],[.087,.055,.055],[.135,.013,.013]],{sides:20});
      bead(bell,cream,.026,.033,.026,0,.005,0);
    }
    sprig(root,leaf,1,.45,1);sprig(root,leaf,3.2,.48,.92);
  }else{
    for(let i=0;i<12;i++){
      const a=i*2.4,r=i<7?.151:.084,y=i<7?.477:.612;
      const o=oval(root,i%3?petal:leaf,.095,.162,.085,Math.sin(a)*r,y,Math.cos(a)*r);
      o.rotation.set(Math.cos(a)*.50,a,-Math.sin(a)*.46);
    }
    oval(root,petal,.079,.128,.079,0,.74,0);
  }
  // The original terrarium collection had clear cloches and colored foot rings.
  const glass=new THREE.MeshPhysicalMaterial({color:'#d7f6e9',transparent:true,opacity:.115,roughness:.18,clearcoat:1,depthWrite:false});
  loft(root,glass,[[.375,.337,.337],[.45,.341,.341],[.78,.34,.34],[.938,.291,.291],[1.048,.183,.183],[1.092,.03,.03]],{sides:40});
  const rim=torus(root,paint('#a4c4b5'),.334,.015,0,.397,0);rim.rotation.x=Math.PI/2;
  bead(root,ceramic,.059,.052,.059,0,1.106,0);
}
export const PLANTS=Object.fromEntries(Object.entries(flowers).map(([id,[name,accent,pot,form]])=>[
  id,{name,make:collectable(root=>makePlant(root,accent,pot,form),{height:1.66+(form%3)*.06,width:1.19,grip:[0,.83,0,.175,.19]})},
]));
