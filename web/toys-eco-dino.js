import {box,group,oval,paint,profile,rod,torus,tube} from './parts.js';
import {bead,loft,sweep} from './sculpt.js';
import {collectable} from './models.js';

const ink=paint('#2c3240','rubber'),white=paint('#fffaf0'),cream=paint('#f6ebd4');
const tire=paint('#2a2e38','rubber'),hub=paint('#cfd9e2','chrome'),steel=paint('#b8c4cf','chrome');
const glass=paint('#a8dff2','glass'),amber=paint('#f6b73c'),gold=paint('#f2c84b','chrome');

function wheel(p,x,y,z,r=.145,w=.095){
  const g=group(p,x,y,z);g.name='wheel';
  const t=tube(g,tire,r,r,w,0,0,0,18);t.rotation.x=Math.PI/2;
  const h=tube(g,hub,r*.52,r*.52,w+.016,0,0,0,14);h.rotation.x=Math.PI/2;
}
function cuteEyes(p,y,z,sep=.11,r=.030){
  for(const s of [-1,1]){
    bead(p,ink,r,r*1.18,r*.7,s*sep,y,z);
    bead(p,white,r*.35,r*.35,r*.3,s*sep-r*.25,y+r*.35,z+r*.55);
  }
}

// 1) Recycle stage: 4 color-coded sorting trash bins + 2 garbage trucks!
function trashBin(p,bodyHex,lidHex,badgeHex,symbol){
  const body=paint(bodyHex),lid=paint(lidHex),dark=paint('#363e4a','satin'),badge=paint(badgeHex);
  // Tapered wheeled bin body
  box(p,body,.58,.68,.50,0,.44,0,.045);
  box(p,body,.64,.10,.56,0,.76,0,.032);
  // Vertical ribs on front & sides
  for(const x of [-.17,0,.17])box(p,lid,.04,.46,.03,x,.44,.255,.01);
  // Sloped hinged lid + rear handle bar
  const top=group(p,0,.84,-.02);
  box(top,lid,.66,.09,.58,0,.04,0,.032);
  box(top,lid,.48,.06,.38,0,.10,-.02,.024);
  box(top,dark,.24,.04,.06,0,.135,.10,.014);
  rod(p,dark,[-.26,.78,-.29],[.26,.78,-.29],.028,10);
  // Two rear bin wheels + front stabilizer foot
  for(const s of [-1,1])wheel(p,s*.31,.115,-.18,.115,.068);
  box(p,dark,.46,.08,.10,0,.05,.18,.02);
  // Sorting emblem plaque + friendly eyes
  box(p,white,.30,.22,.03,0,.49,.26,.024);
  if(symbol==='tri'){
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3;box(p,badge,.10,.036,.025,Math.sin(a)*.06,.49+Math.cos(a)*.055,.276,.008);}
  }else if(symbol==='leaf'){
    oval(p,badge,.085,.055,.022,0,.49,.276).rotation.z=.5;
  }else if(symbol==='warn'){
    box(p,badge,.038,.10,.025,0,.51,.276,.008);oval(p,badge,.025,.025,.02,0,.43,.276);
  }else{
    for(const sx of [-.07,0,.07])oval(p,badge,.024,.024,.02,sx,.49,.276);
  }
  cuteEyes(p,.66,.265,.11,.026);
}

function garbageTruck(p,colorHex,accentHex,style){
  const main=paint(colorHex),acc=paint(accentHex),chassis=paint('#38424f','satin');
  // Chassis & 4 wheels
  box(p,chassis,1.18,.14,.56,0,.19,0,.03);
  for(const x of [-.34,.36])for(const s of [-1,1])wheel(p,x,.15,s*.30,.15,.09);
  // Front cab (facing +X)
  box(p,main,.38,.52,.54,.42,.48,0,.055);
  box(p,glass,.10,.22,.46,.58,.55,0,.02);
  for(const s of [-1,1])box(p,glass,.20,.20,.04,.44,.55,s*.265,.015);
  for(const s of [-1,1])oval(p,amber,.035,.045,.045,.61,.33,s*.18);
  box(p,steel,.06,.08,.52,.61,.23,0,.018);
  oval(p,amber,.06,.055,.06,.42,.77,0);
  if(style==='compactor'){
    // Big enclosed green compactor hopper + rear curved packer tailgate
    box(p,main,.76,.56,.58,-.18,.53,0,.065);
    box(p,acc,.72,.10,.60,-.18,.50,0,.02);
    box(p,white,.28,.18,.60,-.18,.64,0,.02);
    const tail=group(p,-.58,.46,0);tail.rotation.z=-.18;
    box(tail,acc,.22,.44,.54,0,0,0,.05);
    box(tail,chassis,.08,.24,.42,-.10,-.04,0,.02);
  }else{
    // Yellow sorting collector truck carrying mini blue/green/red bins in the bed!
    box(p,acc,.76,.14,.58,-.18,.31,0,.03);
    for(const s of [-1,1])box(p,main,.74,.18,.045,-.18,.44,s*.27,.015);
    box(p,main,.05,.22,.56,-.54,.44,0,.015);
    for(const [bx,c] of [[-.38,'#3a86d8'],[-.18,'#3ea868'],[.02,'#e05548']]){
      box(p,paint(c),.16,.24,.36,bx,.50,0,.025);
      box(p,white,.17,.04,.38,bx,.63,0,.012);
    }
  }
}

// 2) Dinosaur Valley stage
function dinoTrex(p){
  const body=paint('#4da866'),belly=paint('#dce8a2'),stripe=paint('#2d7244');
  oval(p,body,.34,.36,.26,0,.48,0);
  oval(p,belly,.23,.26,.16,.14,.44,0);
  // Thick curved tail
  sweep(p,body,[[-.22,.42,0],[-.52,.36,0],[-.82,.42,0]],[.20,.13,.045],{segments:12});
  // Big chunky head & jaw
  box(p,body,.46,.34,.30,.30,.86,0,.11);
  box(p,belly,.34,.10,.24,.36,.71,0,.04);
  for(const x of [.30,.40,.48])for(const s of [-1,1])oval(p,white,.022,.038,.018,x,.755,s*.11);
  for(const s of [-1,1]){
    bead(p,ink,.034,.04,.025,.34,.92,s*.15);
    bead(p,white,.012,.012,.01,.36,.935,s*.16);
    // Chunky hind legs & tiny cute arms
    oval(p,body,.14,.22,.11,-.04,.24,s*.20);
    box(p,body,.20,.10,.13,.02,.08,s*.20,.04);
    oval(p,body,.09,.055,.05,.24,.54,s*.20).rotation.z=-.4;
  }
  for(const [x,y] of [[-.10,.76],[-.22,.64],[-.38,.52]])oval(p,stripe,.065,.05,.04,x,y,0);
}
function dinoTricera(p){
  const body=paint('#e37c4d'),frill=paint('#c65934'),belly=paint('#f8d5a8');
  oval(p,body,.42,.28,.28,-.06,.38,0);
  oval(p,belly,.32,.16,.22,-.04,.27,0);
  sweep(p,body,[[-.40,.38,0],[-.66,.32,0],[-.86,.35,0]],[.15,.09,.03],{segments:10});
  // Iconic crest frill + 3 ivory horns
  const crest=tube(p,frill,.30,.28,.07,.24,.64,0,20);crest.rotation.z=Math.PI/2-.28;
  for(let i=-2;i<=2;i++)oval(p,belly,.04,.055,.04,.22,.64+Math.cos(i*.55)*.27,Math.sin(i*.55)*.27);
  oval(p,body,.24,.19,.20,.44,.52,0);
  for(const s of [-1,1]){
    const h=tube(p,white,.012,.042,.26,.54,.68,s*.11,10);h.rotation.z=-1.15;
    bead(p,ink,.03,.035,.02,.46,.56,s*.18);
  }
  const noseHorn=tube(p,white,.010,.032,.14,.64,.59,0,10);noseHorn.rotation.z=-.7;
  for(const x of [-.28,.16])for(const s of [-1,1])tube(p,body,.095,.10,.26,x,.15,s*.19,14);
}
function dinoBrachio(p){
  const body=paint('#5a9fd6'),spot=paint('#3874ad'),belly=paint('#cfe8fa');
  oval(p,body,.38,.27,.26,-.08,.36,0);
  oval(p,belly,.28,.16,.20,-.06,.26,0);
  sweep(p,body,[[-.38,.36,0],[-.64,.26,0],[-.86,.24,0]],[.14,.08,.03],{segments:10});
  sweep(p,body,[[.18,.44,0],[.30,.72,0],[.36,1.02,0],[.46,1.12,0]],[.16,.115,.095,.09],{segments:14});
  oval(p,body,.17,.12,.13,.50,1.12,0);
  oval(p,body,.09,.09,.09,.44,1.21,0);
  for(const s of [-1,1]){
    bead(p,ink,.025,.03,.018,.52,1.15,s*.11);
    for(const [x,h] of [[-.28,.30],[.14,.38]])tube(p,body,.085,.095,h,x,h/2,s*.18,14);
  }
  for(const [x,y,z] of [[-.12,.56,.18],[-.26,.46,-.18],[.05,.52,.19]])oval(p,spot,.07,.055,.04,x,y,z);
}
function dinoStego(p){
  const body=paint('#459c94'),plate=paint('#f2b644'),belly=paint('#c6ede6');
  oval(p,body,.46,.28,.26,0,.38,0);
  oval(p,belly,.34,.14,.20,0,.25,0);
  sweep(p,body,[[-.40,.36,0],[-.72,.30,0],[-.92,.36,0]],[.14,.08,.03],{segments:10});
  oval(p,body,.18,.13,.14,.52,.36,0);
  for(const s of [-1,1]){
    bead(p,ink,.026,.03,.02,.56,.39,s*.11);
    for(const x of [-.24,.22])tube(p,body,.09,.095,.26,x,.15,s*.18,14);
  }
  // Double row of golden diamond plates
  for(const [x,y,sc] of [[-.32,.58,.75],[-.14,.68,1.0],[.06,.70,1.05],[.24,.62,.85]]){
    for(const s of [-1,1]){
      const pl=box(p,plate,.13*sc,.16*sc,.035,x,y,s*.07,.014);pl.rotation.z=.78;
    }
  }
  for(const [x,s] of [[-.82,1],[-.82,-1],[-.90,1],[-.90,-1]]){
    const sp=tube(p,white,.008,.024,.12,x,.39,s*.06,8);sp.rotation.x=s*.8;
  }
}
function dinoPtero(p){
  const body=paint('#9466c4'),wing=paint('#b88de2'),beak=paint('#f4b448');
  oval(p,body,.22,.16,.18,0,.44,0);
  oval(p,body,.14,.14,.14,.22,.56,0);
  const crest=tube(p,wing,.01,.075,.28,.06,.68,0,12);crest.rotation.z=.95;
  const bill=tube(p,beak,.012,.06,.30,.42,.56,0,12);bill.rotation.z=-Math.PI/2;
  for(const s of [-1,1]){
    bead(p,ink,.026,.03,.02,.26,.60,s*.11);
    const w=box(p,wing,.36,.04,.48,-.04,.50,s*.36,.018);w.rotation.x=s*-.24;w.rotation.y=s*-.18;
    tube(p,body,.04,.045,.28,-.06,.20,s*.10,10);
    box(p,beak,.12,.04,.08,-.02,.04,s*.10,.015);
  }
}
function dinoEgg(p){
  const shell=paint('#f6eedc'),spot=paint('#d8c49b'),baby=paint('#67be74'),belly=paint('#e3f2b6');
  loft(p,shell,[[.04,.20,.20],[.18,.34,.34],[.42,.38,.38],[.54,.35,.35]],{sides:28});
  for(const [x,y,z] of [[.26,.24,.22],[-.28,.30,.18],[.10,.34,-.32],[-.20,.22,-.26]])oval(p,spot,.075,.065,.05,x,y,z);
  // Baby dino head peeking out of shell!
  oval(p,baby,.25,.24,.24,0,.68,0);
  oval(p,belly,.16,.12,.14,0,.58,.14);
  cuteEyes(p,.72,.22,.095,.030);
  for(const y of [.88,.84,.78])oval(p,paint('#3b8a4b'),.045,.06,.045,0,y,-.18);
  for(const s of [-1,1])oval(p,baby,.07,.05,.07,s*.24,.54,.12);
}

// 3) Construction Site stage
function excavator(p){
  const yel=paint('#f4be32'),dark=paint('#363d48','satin');
  // Tracks
  for(const s of [-1,1]){
    box(p,dark,.74,.18,.15,0,.11,s*.24,.07);
    for(const x of [-.24,0,.24])oval(p,steel,.055,.055,.08,x,.11,s*.25);
  }
  box(p,yel,.58,.30,.46,-.08,.34,0,.05);
  box(p,glass,.26,.24,.40,.06,.56,0,.04);
  box(p,yel,.30,.05,.44,.06,.69,0,.02);
  // Boom arm + bucket
  rod(p,yel,[.18,.36,0],[.52,.78,0],.055,10);
  rod(p,yel,[.52,.78,0],[.76,.42,0],.048,10);
  box(p,dark,.22,.20,.26,.78,.28,0,.04);
}
function bulldozer(p){
  const yel=paint('#f0ae28'),dark=paint('#353c47','satin');
  for(const s of [-1,1])box(p,dark,.78,.20,.16,0,.12,s*.26,.08);
  box(p,yel,.64,.30,.44,-.04,.34,0,.05);
  box(p,glass,.28,.24,.38,-.12,.58,0,.04);
  box(p,yel,.32,.05,.42,-.12,.71,0,.02);
  // Wide front curved dozer blade
  box(p,steel,.10,.30,.72,.52,.22,0,.03);
  for(const s of [-1,1])rod(p,dark,[.20,.18,s*.22],[.48,.20,s*.24],.035,8);
}
function mixerTruck(p){
  const cab=paint('#f28f32'),drum=paint('#eef3f8'),stripe=paint('#3c8ad4'),ch=paint('#38404d','satin');
  box(p,ch,1.14,.13,.52,0,.18,0,.03);
  for(const x of [-.34,.36])for(const s of [-1,1])wheel(p,x,.145,s*.28,.145,.085);
  box(p,cab,.36,.46,.50,.40,.45,0,.055);
  box(p,glass,.10,.20,.42,.55,.52,0,.02);
  const d=group(p,-.16,.54,0);d.rotation.z=-.24;
  tube(d,drum,.24,.28,.64,0,0,0,22).rotation.z=Math.PI/2;
  tube(d,stripe,.27,.27,.14,0,0,0,22).rotation.z=Math.PI/2;
}
function roadRoller(p){
  const yel=paint('#f5be35'),dark=paint('#39414d','satin');
  const drum=tube(p,steel,.22,.22,.56,.34,.22,0,24);drum.rotation.x=Math.PI/2;
  for(const s of [-1,1])wheel(p,-.32,.18,s*.24,.18,.11);
  box(p,yel,.58,.24,.40,-.10,.38,0,.045);
  box(p,dark,.24,.26,.34,-.18,.62,0,.03);
  box(p,yel,.36,.05,.42,-.18,.76,0,.02);
}
function hardHat(p){
  const yel=paint('#f8c62c'),rim=paint('#e2a518');
  oval(p,yel,.42,.32,.46,0,.22,0);
  box(p,rim,.86,.08,.96,0,.11,0,.04);
  box(p,rim,.14,.14,.74,0,.46,0,.05);
  cuteEyes(p,.28,.43,.13,.032);
}
function coneCart(p){
  const org=paint('#f06d2a'),dark=paint('#38414c','satin');
  box(p,dark,.74,.10,.50,0,.16,0,.025);
  for(const x of [-.24,.24])for(const s of [-1,1])wheel(p,x,.10,s*.26,.10,.06);
  // Two bright traffic cones riding on the cart
  for(const x of [-.16,.16]){
    box(p,org,.24,.04,.24,x,.22,0,.01);
    tube(p,org,.035,.11,.36,x,.40,0,18);
    tube(p,white,.062,.085,.09,x,.42,0,18);
  }
  rod(p,steel,[-.34,.20,-.18],[-.44,.52,-.18],.024,8);
  rod(p,steel,[-.34,.20,.18],[-.44,.52,.18],.024,8);
  rod(p,dark,[-.44,.52,-.18],[-.44,.52,.18],.028,8);
}

// 4) Steam Train Station stage
function steamEngine(p){
  const red=paint('#d94b43'),dark=paint('#2f3742','satin');
  box(p,dark,1.16,.12,.50,0,.18,0,.03);
  for(const x of [-.38,0,.38])for(const s of [-1,1])wheel(p,x,.14,s*.27,.14,.07);
  const boiler=tube(p,red,.22,.22,.64,.16,.44,0,22);boiler.rotation.z=Math.PI/2;
  tube(p,dark,.08,.06,.26,.34,.74,0,14);
  oval(p,gold,.08,.08,.08,.08,.68,0);
  box(p,red,.38,.52,.52,-.34,.50,0,.04);
  box(p,dark,.44,.06,.56,-.34,.78,0,.02);
  box(p,glass,.20,.20,.54,-.34,.58,0,.02);
  box(p,gold,.10,.16,.38,.54,.16,0,.02);
}
function coachCar(p){
  const grn=paint('#3b8a60'),roof=paint('#e6dfd0'),dark=paint('#353d47','satin');
  box(p,dark,1.14,.10,.48,0,.15,0,.025);
  for(const x of [-.36,.36])for(const s of [-1,1])wheel(p,x,.12,s*.26,.12,.065);
  box(p,grn,1.08,.44,.48,0,.42,0,.04);
  box(p,amber,1.10,.06,.50,0,.32,0,.015);
  box(p,roof,1.12,.10,.52,0,.67,0,.04);
  for(const x of [-.34,-.11,.11,.34])box(p,glass,.16,.16,.50,x,.48,0,.018);
}
function coalCar(p){
  const blu=paint('#4a6e94'),dark=paint('#2a2e36','rubber');
  box(p,dark,1.06,.10,.48,0,.15,0,.025);
  for(const x of [-.32,.32])for(const s of [-1,1])wheel(p,x,.12,s*.26,.12,.065);
  box(p,blu,.98,.34,.48,0,.37,0,.035);
  for(const [x,y,z] of [[-.22,.56,.06],[0,.60,-.04],[.22,.55,.04],[-.10,.58,-.10],[.12,.59,.09]])
    oval(p,dark,.15,.11,.13,x,y,z);
}
function bulletTrain(p){
  const wht=paint('#f3f6fa'),blu=paint('#3482d6'),dark=paint('#2e3642','satin');
  box(p,dark,1.18,.10,.46,0,.14,0,.03);
  for(const x of [-.36,.32])for(const s of [-1,1])wheel(p,x,.11,s*.25,.11,.06);
  box(p,wht,.82,.42,.48,-.16,.40,0,.08);
  oval(p,wht,.38,.20,.23,.32,.35,0);
  box(p,blu,1.04,.08,.50,-.04,.32,0,.02);
  oval(p,glass,.18,.11,.21,.34,.47,0);
  for(const x of [-.38,-.16,.06])box(p,glass,.14,.14,.50,x,.46,0,.02);
}
function railCrane(p){
  const yel=paint('#f2b638'),dark=paint('#363d48','satin');
  box(p,dark,1.04,.11,.48,0,.15,0,.025);
  for(const x of [-.32,.32])for(const s of [-1,1])wheel(p,x,.12,s*.26,.12,.065);
  box(p,yel,.42,.34,.44,-.24,.38,0,.04);
  box(p,glass,.18,.18,.46,-.24,.44,0,.02);
  rod(p,yel,[-.06,.38,0],[.46,.82,0],.05,10);
  rod(p,steel,[.46,.82,0],[.46,.46,0],.018,8);
  oval(p,paint('#d94b43'),.07,.07,.07,.46,.42,0);
}
function signalTower(p){
  const base=paint('#5a6776','satin'),pole=paint('#dce4ec','chrome');
  box(p,base,.50,.14,.46,0,.07,0,.03);
  tube(p,pole,.055,.065,.92,0,.56,0,14);
  box(p,base,.24,.56,.22,0,.84,0,.04);
  oval(p,paint('#e6483e'),.065,.065,.04,0,1.00,.11);
  oval(p,paint('#f5be35'),.065,.065,.04,0,.84,.11);
  oval(p,paint('#3cb86e'),.065,.065,.04,0,.68,.11);
}

// 5) Sunny Farm stage
function farmCow(p){
  const wht=paint('#fffaf2'),spot=paint('#353944'),pink=paint('#f4a8b8');
  oval(p,wht,.40,.28,.28,0,.38,0);
  for(const [x,y,z] of [[-.14,.48,.22],[.12,.42,-.23],[-.22,.34,-.18]])oval(p,spot,.12,.10,.06,x,y,z);
  oval(p,wht,.21,.20,.20,.40,.56,0);
  oval(p,pink,.13,.10,.15,.54,.48,0);
  for(const s of [-1,1]){
    bead(p,ink,.028,.034,.02,.46,.61,s*.14);
    oval(p,wht,.08,.04,.06,.34,.68,s*.20);
    tube(p,cream,.015,.032,.10,.36,.76,s*.10,10);
    for(const x of [-.24,.22])tube(p,wht,.07,.075,.24,x,.14,s*.17,12);
  }
}
function farmSheep(p){
  const wool=paint('#fff9ee'),face=paint('#5c524c');
  for(const [x,y,z,r] of [[0,.42,0,.28],[-.22,.44,.12,.18],[.18,.45,.12,.18],[-.20,.44,-.12,.18],[.18,.45,-.12,.18],[0,.58,0,.20]])
    oval(p,wool,r,r*.92,r,x,y,z);
  oval(p,face,.18,.16,.16,.38,.50,0);
  oval(p,wool,.12,.09,.12,.34,.64,0);
  for(const s of [-1,1]){
    bead(p,white,.030,.034,.02,.46,.53,s*.11);
    bead(p,ink,.018,.022,.02,.48,.53,s*.115);
    oval(p,face,.07,.04,.04,.32,.56,s*.17);
    for(const x of [-.20,.16])tube(p,face,.055,.055,.22,x,.13,s*.14,10);
  }
}
function farmPig(p){
  const pink=paint('#f6a6b6'),snout=paint('#e8839a');
  oval(p,pink,.38,.28,.28,0,.36,0);
  oval(p,pink,.22,.21,.22,.34,.48,0);
  const sn=tube(p,snout,.085,.095,.09,.54,.44,0,16);sn.rotation.z=Math.PI/2;
  for(const s of [-1,1]){
    bead(p,ink,.028,.034,.02,.44,.54,s*.14);
    oval(p,snout,.07,.09,.04,.28,.66,s*.14).rotation.z=-.3;
    for(const x of [-.20,.18])tube(p,pink,.068,.062,.20,x,.12,s*.16,12);
  }
}
function farmRooster(p){
  const wht=paint('#fff8ea'),red=paint('#de463c'),tail=paint('#2e7a6d');
  oval(p,wht,.28,.24,.22,0,.34,0);
  oval(p,wht,.17,.18,.16,.24,.56,0);
  oval(p,amber,.09,.055,.06,.41,.54,0);
  for(const [x,y] of [[.20,.74],[.26,.76],[.31,.72]])oval(p,red,.045,.06,.03,x,y,0);
  oval(p,red,.04,.055,.04,.35,.46,0);
  sweep(p,tail,[[-.22,.42,0],[-.40,.58,0],[-.48,.46,0]],[.09,.07,.035],{segments:10});
  for(const s of [-1,1]){
    bead(p,ink,.025,.03,.02,.30,.60,s*.12);
    tube(p,amber,.03,.03,.18,0,.09,s*.09,8);
  }
}
function farmTractor(p){
  const red=paint('#d8443c'),dark=paint('#343c47','satin');
  for(const s of [-1,1]){
    wheel(p,-.24,.23,s*.28,.23,.12);
    wheel(p,.32,.13,s*.24,.13,.08);
  }
  box(p,red,.72,.28,.40,.08,.36,0,.05);
  box(p,glass,.34,.30,.40,-.22,.60,0,.04);
  box(p,red,.40,.06,.46,-.22,.77,0,.02);
  tube(p,dark,.035,.035,.26,.34,.60,.14,10);
}
function farmBarn(p){
  const red=paint('#c9433a'),roof=paint('#505966','satin');
  box(p,red,.72,.52,.62,0,.26,0,.03);
  profile(p,roof,[[-.42,0],[0,.34],[.42,0]],.68,0,.51,0,.02);
  box(p,white,.28,.34,.04,0,.18,.31,.015);
  box(p,red,.22,.28,.05,0,.18,.315,.01);
  rod(p,white,[-.11,.05,.34],[.11,.31,.34],.018,6);
  rod(p,white,[.11,.05,.34],[-.11,.31,.34],.018,6);
}

export const ECO_DINO={
  // Recycle stage
  binBlue:{name:'蓝色可回收桶',make:collectable(p=>trashBin(p,'#3484d6','#246bb8','#3484d6','tri'),{height:1.46,width:1.45,grip:[0,.50,0,.26,.24]})},
  binGreen:{name:'绿色厨余桶',make:collectable(p=>trashBin(p,'#3ea868','#2d8c52','#3ea868','leaf'),{height:1.46,width:1.45,grip:[0,.50,0,.26,.24]})},
  binRed:{name:'红色有害桶',make:collectable(p=>trashBin(p,'#e05246','#bf3c31','#e05246','warn'),{height:1.46,width:1.45,grip:[0,.50,0,.26,.24]})},
  binGray:{name:'灰色其他桶',make:collectable(p=>trashBin(p,'#6e7887','#525b68','#525b68','dots'),{height:1.46,width:1.45,grip:[0,.50,0,.26,.24]})},
  truckGreen:{name:'绿色垃圾车',make:collectable(p=>garbageTruck(p,'#3da666','#f2c84b','compactor'),{height:1.38,width:2.05,grip:[0,.48,0,.34,.24]})},
  truckYellow:{name:'分类清运车',make:collectable(p=>garbageTruck(p,'#f4be36','#3882c8','sorter'),{height:1.36,width:2.05,grip:[0,.46,0,.34,.24]})},
  // Dino stage
  dinoTrex:{name:'霸王龙',make:collectable(dinoTrex,{height:1.60,width:1.95,grip:[.05,.52,0,.28,.22]})},
  dinoTricera:{name:'三角龙',make:collectable(dinoTricera,{height:1.36,width:1.95,grip:[0,.42,0,.32,.24]})},
  dinoBrachio:{name:'长颈腕龙',make:collectable(dinoBrachio,{height:1.72,width:1.90,grip:[0,.48,0,.30,.22]})},
  dinoStego:{name:'剑龙',make:collectable(dinoStego,{height:1.34,width:2.00,grip:[0,.42,0,.34,.22]})},
  dinoPtero:{name:'小翼龙',make:collectable(dinoPtero,{height:1.32,width:1.90,grip:[0,.44,0,.26,.34]})},
  dinoEgg:{name:'恐龙蛋宝宝',make:collectable(dinoEgg,{height:1.46,width:1.45,grip:[0,.48,0,.28,.28]})},
  // Construction stage
  excavator:{name:'黄色挖掘机',make:collectable(excavator,{height:1.44,width:2.02,grip:[0,.42,0,.32,.24]})},
  bulldozer:{name:'履带推土机',make:collectable(bulldozer,{height:1.36,width:1.95,grip:[0,.42,0,.32,.28]})},
  mixerTruck:{name:'水泥搅拌车',make:collectable(mixerTruck,{height:1.38,width:2.05,grip:[0,.46,0,.34,.24]})},
  roller:{name:'压路机',make:collectable(roadRoller,{height:1.38,width:1.95,grip:[0,.42,0,.30,.26]})},
  hardHat:{name:'安全小黄帽',make:collectable(hardHat,{height:1.18,width:1.68,grip:[0,.30,0,.32,.34]})},
  coneCart:{name:'路障小推车',make:collectable(coneCart,{height:1.28,width:1.80,grip:[0,.34,0,.30,.24]})},
  // Train stage
  steamEngine:{name:'红色蒸汽机车',make:collectable(steamEngine,{height:1.42,width:2.05,grip:[0,.46,0,.36,.24]})},
  coachCar:{name:'绿皮客车厢',make:collectable(coachCar,{height:1.34,width:2.05,grip:[0,.42,0,.36,.22]})},
  coalCar:{name:'煤炭货车',make:collectable(coalCar,{height:1.26,width:2.00,grip:[0,.38,0,.34,.22]})},
  bulletTrain:{name:'流线高铁头',make:collectable(bulletTrain,{height:1.28,width:2.08,grip:[0,.38,0,.36,.22]})},
  railCrane:{name:'轨道检修车',make:collectable(railCrane,{height:1.46,width:2.02,grip:[0,.44,0,.34,.22]})},
  signalTower:{name:'铁路信号塔',make:collectable(signalTower,{height:1.66,width:1.30,grip:[0,.56,0,.22,.22]})},
  // Farm stage
  farmCow:{name:'斑点小奶牛',make:collectable(farmCow,{height:1.40,width:1.85,grip:[0,.42,0,.30,.24]})},
  farmSheep:{name:'云朵小绵羊',make:collectable(farmSheep,{height:1.36,width:1.75,grip:[0,.42,0,.28,.26]})},
  farmPig:{name:'粉红小猪仔',make:collectable(farmPig,{height:1.28,width:1.75,grip:[0,.38,0,.30,.24]})},
  farmRooster:{name:'红冠大公鸡',make:collectable(farmRooster,{height:1.48,width:1.62,grip:[0,.44,0,.24,.22]})},
  farmTractor:{name:'红色拖拉机',make:collectable(farmTractor,{height:1.44,width:1.88,grip:[0,.44,0,.30,.26]})},
  farmBarn:{name:'红顶小谷仓',make:collectable(farmBarn,{height:1.46,width:1.68,grip:[0,.42,0,.30,.28]})},
};
