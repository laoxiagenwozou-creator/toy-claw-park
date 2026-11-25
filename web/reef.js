import {THREE,group,oval,paint} from './parts.js';
import {loft,barrel,sweep,bead} from './sculpt.js';
import {collectable} from './models.js';

const eye='#233841',cream='#fff0c7';
function eyes(p,x,y,z,r=.074) {
  for(const s of [-1,1]){
    bead(p,eye,r,r*1.06,r*.77,s*x,y,z);
    bead(p,'#fff9ec',r*.29,r*.29,r*.23,s*x-.012,y+r*.30,z+r*.69);
  }
}
function turtle(p){
  const jade='#76b79b';
  for(const s of [-1,1])for(const front of [true,false]){
    const flipper=oval(p,jade,front?.36:.24,.089,front?.21:.17,s*(front?.51:.38),.19,front?.21:-.38);
    flipper.rotation.y=s*(front?-.60:.56);
  }
  oval(p,'#f0cf92',.51,.18,.63,0,.26,-.04);
  oval(p,'#438a77',.51,.34,.62,0,.33,-.07);
  for(const [x,z,rx,rz,y] of [[0,-.04,.20,.20,.637],[-.265,.13,.17,.15,.565],[.265,.13,.17,.15,.565],[-.24,-.23,.17,.18,.553],[.24,-.23,.17,.18,.553],[0,.33,.15,.14,.553],[0,-.43,.15,.14,.52]]){
    const plate=oval(p,'#86bb88',rx,.033,rz,x,y,z);plate.rotation.z=-x*1.44;plate.rotation.x=z*.75;
  }
  oval(p,jade,.255,.25,.30,0,.37,.57);eyes(p,.175,.43,.766,.047);
  sweep(p,jade,[[0,.26,-.54],[.03,.26,-.70],[.04,.29,-.77]],[.13,.063,.009]);
}
function clown(p){
  const orange=new THREE.Color('#f08647'),white=new THREE.Color('#fff0d6'),black=new THREE.Color('#453e47');
  barrel(p,'#ffffff',[[-.59,.055,.09,.40],[-.47,.14,.26,.45],[-.23,.24,.35,.48],[.09,.29,.38,.48],[.36,.22,.295,.48],[.55,.04,.12,.45]],{steps:12,tint:(x,z,h)=>{
    const a=z+.045*Math.sin(h*9);
    const d=Math.min(Math.abs(a+.39), Math.abs(a-.04)*.74,Math.abs(a-.32));
    return d<.036?white:d<.062?black:orange;
  }});
  const fin=(x,y,z,rx,ry,rz,c)=>oval(p,c,rx,ry,rz,x,y,z);
  fin(0,.46,-.674,.09,.24,.22,'#ee8752');fin(0,.805,-.05,.056,.13,.23,'#d76643');
  for(const s of [-1,1])fin(s*.255,.39,-.035,.12,.13,.14,'#ffb562').rotation.z=s*.32;
  eyes(p,.182,.572,.363,.071);bead(p,'#ffba86',.118,.052,.062,0,.413,.527);
}
function octopus(p){
  const coral='#e89090';
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,dx=Math.sin(a),dz=Math.cos(a),cx=Math.cos(a),cz=-Math.sin(a);
    const pts=[[.14,.28,0],[.33,.15,0],[.49,.087,.065],[.57,.126,.16],[.55,.194,.21]].map(([d,y,t])=>[dx*d+cx*t,y,dz*d+cz*t]);
    sweep(p,coral,pts,[.125,.132,.098,.061,.016],{segments:16});
    bead(p,'#ffccae',.046,.022,.048,pts[2][0],.033,pts[2][2]);
  }
  oval(p,coral,.39,.40,.36,0,.545,0);eyes(p,.167,.548,.313,.061);
  for(const s of [-1,1])bead(p,'#e56f85',.065,.032,.027,s*.258,.452,.258);
  sweep(p,'#9c586a',[[-.049,.462,.347],[0,.443,.363],[.049,.462,.347]],[.012,.017,.011]);
}
function whale(p){
  barrel(p,'#799fc9',[[-.84,.06,.08,.46],[-.57,.17,.17,.36],[-.28,.32,.30,.37],[.12,.42,.38,.40],[.45,.36,.33,.42],[.62,.17,.23,.40],[.68,.018,.08,.39]]);
  oval(p,'#d8e8de',.32,.12,.49,0,.18,.10);eyes(p,.327,.42,.422,.047);
  for(const s of [-1,1]){
    oval(p,'#7294bc',.24,.063,.149,s*.18,.49,-.85).rotation.y=-s*.55;
    oval(p,'#8dadd1',.25,.07,.145,s*.34,.28,-.04).rotation.y=s*.54;
  }
  bead(p,'#527d9c',.041,.014,.059,0,.767,.11);
}
function ray(p){
  const c='#7caebf';oval(p,c,.30,.15,.46,0,.22,.04);
  for(const s of [-1,1]){
    const fin=group(p);fin.rotation.z=s*.09;
    loft(fin,c,[[.12,.025,.04,0,s*.26],[.15,.39,.28,0,s*.43],[.18,.45,.34,.025,s*.41],[.222,.30,.25,.05,s*.38],[.26,.08,.10,.05,s*.27]],{sides:24});
    bead(p,'#b3d4d0',.052,.017,.056,s*.33,.254,.07);
  }
  sweep(p,'#6294ab',[[0,.22,-.26],[.01,.19,-.59],[.11,.23,-.84],[.23,.33,-.95]],[.105,.062,.031,.01]);
  eyes(p,.156,.318,.31,.041);
}
function seal(p){
  const c='#a6bec7';oval(p,c,.30,.32,.50,0,.32,-.07);
  oval(p,c,.30,.30,.29,0,.65,.22);eyes(p,.134,.70,.453,.053);
  for(const s of [-1,1]){
    oval(p,cream,.115,.083,.088,s*.073,.58,.465);
    oval(p,c,.23,.067,.17,s*.30,.16,.05).rotation.y=s*.52;
    oval(p,'#8daeb9',.165,.068,.25,s*.112,.17,-.52).rotation.y=-s*.38;
    for(let j=0;j<3;j++)bead(p,'#687e87',.013,.012,.011,s*(.062+.024*j),.586,.542-j*.005);
  }
  bead(p,'#384b59',.077,.048,.039,0,.635,.520);
}
const specs={
  turtle:['小海龟',turtle,1.88,[0,.49,-.06,.157,.179]],
  clown:['小丑鱼',clown,1.79,[0,.69,.0,.126,.16]],
  octopus:['小章鱼',octopus,1.74,[0,.72,0,.15,.148]],
  whale:['小蓝鲸',whale,2.00,[0,.56,.11,.164,.19]],
  ray:['蝠鲼',ray,2.0,[0,.23,.07,.158,.19]],
  seal:['小海豹',seal,1.80,[0,.50,.08,.144,.165]],
};
export const REEF=Object.fromEntries(Object.entries(specs).map(([id,[name,maker,width,grip]])=>
  [id,{name,make:collectable(maker,{height:1.39,width,grip})}]));
