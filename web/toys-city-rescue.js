import {box,group,oval,paint,profile,rod,torus,tube} from './parts.js';
import {bead} from './sculpt.js';
import {collectable} from './models.js';

const ink=paint('#272e3a','rubber'),white=paint('#fffaf2'),cream=paint('#f6ebd4');
const tire=paint('#2a2e38','rubber'),hub=paint('#d4dde6','chrome'),steel=paint('#b8c5d0','chrome');
const glass=paint('#a4dff4','glass'),amber=paint('#f6b73c'),gold=paint('#f4c84b','chrome');
const red=paint('#df433b'),blue=paint('#3582d6'),yellow=paint('#f4c133'),green=paint('#45a864');

function wheel(p,x,y,z,r=.135,w=.085){
  const g=group(p,x,y,z);g.name='wheel';
  const t=tube(g,tire,r,r,w,0,0,0,16);t.rotation.x=Math.PI/2;
  const h=tube(g,hub,r*.52,r*.52,w+.016,0,0,0,12);h.rotation.x=Math.PI/2;
}
function cuteEyes(p,y,z,sep=.10,r=.028){
  for(const s of [-1,1]){
    bead(p,ink,r,r*1.16,r*.7,s*sep,y,z);
    bead(p,white,r*.35,r*.35,r*.3,s*sep-r*.25,y+r*.32,z+r*.55);
  }
}

// 1) Airport stage
function airliner(p){
  const stripe=paint('#3fa6e8'),wing=paint('#e6eff7'),tail=paint('#ef5a52');
  oval(p,white,.62,.20,.20,0,.34,0);
  box(p,stripe,.88,.045,.39,0,.35,0,.01);
  box(p,glass,.16,.09,.28,.44,.40,0,.02);
  // Swept wings + turbofans
  for(const s of [-1,1]){
    const w=box(p,wing,.28,.04,.64,.02,.29,s*.46,.014);w.rotation.y=-s*.26;
    const eng=tube(p,stripe,.07,.07,.18,.08,.22,s*.34,14);eng.rotation.z=Math.PI/2;
    const st=box(p,tail,.14,.032,.22,-.48,.37,s*.16,.01);st.rotation.y=-s*.22;
  }
  profile(p,tail,[[-.08,0],[.14,0],[.02,.32],[-.12,.32]],.045,-.46,.42,0,.014);
  for(const [x,z] of [[.34,0],[-.14,.14],[-.14,-.14]])wheel(p,x,.08,z,.075,.045);
}
function luggageCart(p){
  const body=paint('#f4c236'),bag1=paint('#e35464'),bag2=paint('#3b86d6'),bag3=paint('#4cb06d');
  box(p,body,.42,.26,.34,.36,.24,0,.04);
  box(p,glass,.18,.18,.30,.40,.42,0,.02);
  box(p,body,.24,.04,.32,.38,.52,0,.015);
  box(p,steel,.62,.08,.40,-.24,.18,0,.02);
  rod(p,steel,[.08,.18,0],[.16,.18,0],.025,8);
  box(p,bag1,.24,.24,.30,-.36,.34,0,.03);
  box(p,bag2,.22,.20,.28,-.10,.32,0,.03);
  box(p,bag3,.22,.16,.24,-.24,.52,0,.025);
  for(const x of [-.42,-.06,.24,.48])for(const s of [-1,1])wheel(p,x,.10,s*.21,.10,.06);
}
function controlTower(p){
  const wall=paint('#e9eef4'),accent=paint('#2f78c4'),radar=paint('#f05d4e');
  tube(p,wall,.26,.34,.18,0,.09,0,18);
  tube(p,wall,.15,.20,.64,0,.48,0,16);
  tube(p,accent,.36,.26,.14,0,.84,0,20);
  tube(p,glass,.35,.32,.18,0,.98,0,20);
  tube(p,white,.39,.34,.08,0,1.10,0,20);
  tube(p,steel,.024,.024,.22,0,1.24,0,10);
  oval(p,radar,.07,.07,.07,0,1.35,0);
}
function boardingStair(p){
  const base=paint('#e8edf2'),trim=paint('#3a88d4'),rail=paint('#f2b632');
  box(p,base,.96,.18,.44,0,.20,0,.03);
  box(p,trim,.30,.28,.40,.34,.38,0,.04);
  box(p,glass,.14,.14,.34,.44,.42,0,.02);
  for(let i=0;i<6;i++){
    box(p,white,.14,.06,.34,.16-i*.11,.32+i*.10,0,.012);
    box(p,trim,.14,.08,.36,.16-i*.11,.26+i*.10,0,.01);
  }
  box(p,trim,.26,.08,.38,-.40,.88,0,.018);
  for(const s of [-1,1])rod(p,rail,[.18,.44,s*.18],[-.36,.96,s*.18],.022,8);
  for(const x of [-.34,.32])for(const s of [-1,1])wheel(p,x,.11,s*.24,.11,.065);
}
function suitcase(p){
  const shell=paint('#3c92d8'),strap=paint('#f6c945'),tag=paint('#ee5b64');
  box(p,shell,.56,.68,.28,0,.44,0,.06);
  for(const x of [-.15,0,.15])box(p,white,.032,.52,.295,x,.44,0,.01);
  box(p,strap,.58,.08,.30,0,.46,0,.015);
  box(p,tag,.12,.10,.02,.14,.62,.15,.01);
  // Telescopic handle & 4 caster wheels
  for(const s of [-1,1])rod(p,steel,[s*.10,.78,0],[s*.10,1.02,0],.022,8);
  box(p,ink,.26,.05,.05,0,1.02,0,.015);
  for(const x of [-.20,.20])for(const z of [-.08,.08])wheel(p,x,.06,z,.055,.04);
  cuteEyes(p,.56,.155,.10,.024);
}
function pilotBear(p){
  const fur=paint('#b87948'),muzzle=paint('#edd4b2'),coat=paint('#263d66');
  oval(p,coat,.28,.30,.24,0,.36,0);
  oval(p,gold,.05,.05,.03,0,.44,.23);
  oval(p,fur,.26,.25,.24,0,.78,0);
  oval(p,muzzle,.11,.085,.08,0,.72,.20);
  oval(p,ink,.042,.032,.03,0,.76,.26);
  for(const s of [-1,1]){
    oval(p,fur,.09,.09,.06,s*.22,.96,-.02);
    oval(p,coat,.08,.16,.08,s*.30,.40,.04).rotation.z=s*.25;
    oval(p,coat,.10,.14,.12,s*.12,.12,.02);
  }
  // Pilot cap & gold wings
  tube(p,coat,.24,.20,.11,0,.99,0,18);
  box(p,ink,.34,.04,.16,0,.95,.14,.015);
  box(p,gold,.14,.04,.03,0,1.00,.21,.01);
  cuteEyes(p,.81,.22,.095,.026);
}

// 2) Hospital stage
function ambulance(p){
  const stripe=paint('#e64545'),siren=paint('#3895f0');
  box(p,white,.98,.52,.50,0,.42,0,.065);
  box(p,stripe,1.00,.08,.52,0,.34,0,.015);
  box(p,glass,.16,.20,.42,.44,.50,0,.02);
  // Red cross on sides
  for(const s of [-1,1]){
    box(p,stripe,.20,.06,.025,-.10,.49,s*.255,.008);
    box(p,stripe,.06,.20,.025,-.10,.49,s*.255,.008);
  }
  box(p,siren,.14,.09,.28,.16,.72,0,.025);
  for(const x of [-.30,.32])for(const s of [-1,1])wheel(p,x,.14,s*.27,.14,.08);
}
function nurseRabbit(p){
  const fur=paint('#fff7f4'),pink=paint('#f7a4b8'),dress=paint('#f2f8fb');
  oval(p,dress,.27,.30,.24,0,.34,0);
  box(p,pink,.30,.06,.26,0,.42,0,.02);
  oval(p,fur,.24,.23,.22,0,.72,0);
  for(const s of [-1,1]){
    oval(p,fur,.075,.24,.06,s*.11,1.02,-.02).rotation.z=-s*.12;
    oval(p,pink,.04,.17,.03,s*.11,1.01,.025).rotation.z=-s*.12;
    oval(p,fur,.07,.14,.07,s*.28,.38,.04).rotation.z=s*.28;
    oval(p,fur,.09,.11,.12,s*.11,.10,.03);
  }
  box(p,white,.24,.10,.06,0,.95,.11,.02);
  box(p,red,.09,.028,.02,0,.95,.145,.006);box(p,red,.028,.09,.02,0,.95,.145,.006);
  cuteEyes(p,.74,.20,.085,.025);
  oval(p,pink,.032,.022,.02,0,.69,.22);
}
function medKit(p){
  box(p,white,.78,.54,.36,0,.32,0,.06);
  box(p,red,.80,.06,.38,0,.46,0,.015);
  for(const s of [-1,1]){
    box(p,red,.24,.075,.03,0,.30,s*.185,.01);
    box(p,red,.075,.24,.03,0,.30,s*.185,.01);
  }
  const h=torus(p,red,.14,.032,0,.60,0);h.scale.set(1.2,.8,1);
  for(const s of [-1,1])box(p,steel,.08,.10,.04,s*.24,.46,.19,.01);
}
function stethoscope(p){
  const tubeM=paint('#3ca4b8'),ear=paint('#2d4a5e');
  const ring=torus(p,tubeM,.34,.055,0,.36,0);ring.rotation.x=Math.PI/2-.22;
  for(const s of [-1,1]){
    rod(p,steel,[s*.16,.44,-.10],[s*.28,.90,-.04],.028,10);
    oval(p,ear,.065,.065,.065,s*.25,.92,-.04);
  }
  tube(p,steel,.14,.14,.07,0,.14,.32,20);
  tube(p,blue,.10,.10,.08,0,.145,.32,16);
}
function thermometer(p){
  const body=paint('#f4f9fc'),cap=paint('#4cb5a8'),screen=paint('#cceee4');
  const tip=tube(p,steel,.065,.035,.22,0,.12,0,14);tip.position.y=.12;
  box(p,body,.24,.76,.14,0,.58,0,.06);
  box(p,cap,.26,.18,.16,0,.96,0,.06);
  box(p,screen,.16,.28,.03,0,.58,.075,.015);
  box(p,red,.035,.18,.02,0,.56,.09,.008);
  cuteEyes(p,.82,.08,.06,.022);
}
function capsuleToy(p){
  const top=paint('#f25c5c'),bot=paint('#fff7e8');
  oval(p,bot,.28,.34,.28,0,.36,0);
  oval(p,top,.285,.34,.285,0,.62,0);
  tube(p,white,.29,.29,.05,0,.49,0,20);
  for(const s of [-1,1]){
    oval(p,top,.07,.12,.07,s*.30,.46,0).rotation.z=s*.35;
    oval(p,amber,.09,.08,.12,s*.12,.09,.02);
  }
  cuteEyes(p,.62,.27,.09,.026);
}

// 3) Firehouse stage
function ladderTruck(p){
  box(p,red,1.18,.44,.52,0,.38,0,.055);
  box(p,white,1.20,.07,.54,0,.34,0,.015);
  box(p,glass,.16,.20,.44,.52,.46,0,.02);
  box(p,amber,.12,.08,.28,.40,.64,0,.02);
  // Diagonal extendable ladder
  const lad=group(p,-.08,.68,0);lad.rotation.z=.36;
  for(const s of [-1,1])box(lad,steel,.92,.045,.045,0,0,s*.12,.01);
  for(let i=-4;i<=4;i++)box(lad,steel,.035,.035,.24,i*.10,0,0,.008);
  for(const x of [-.38,.02,.40])for(const s of [-1,1])wheel(p,x,.14,s*.28,.14,.08);
}
function fireBoat(p){
  const hull=paint('#d93b34'),deck=paint('#fff5e4'),water=paint('#4ca8e0');
  box(p,hull,1.10,.26,.54,0,.18,0,.06);
  box(p,white,1.12,.06,.56,0,.28,0,.015);
  box(p,deck,.48,.30,.42,-.10,.44,0,.04);
  box(p,glass,.14,.14,.34,.12,.48,0,.02);
  tube(p,amber,.07,.07,.14,-.14,.66,0,14);
  // Water cannon nozzle at bow
  tube(p,steel,.05,.04,.20,.34,.40,0,12);
  const jet=rod(p,water,[.36,.48,0],[.66,.64,0],.036,10);jet.name='jet';
}
function fireHydrant(p){
  tube(p,red,.24,.28,.12,0,.06,0,18);
  tube(p,red,.18,.20,.56,0,.38,0,18);
  tube(p,red,.24,.24,.08,0,.68,0,18);
  oval(p,red,.20,.16,.20,0,.76,0);
  tube(p,gold,.06,.06,.09,0,.92,0,12);
  for(const s of [-1,1]){
    const side=tube(p,steel,.075,.075,.16,s*.22,.48,0,12);side.rotation.z=Math.PI/2;
  }
  cuteEyes(p,.48,.195,.075,.024);
}
function fireHelmet(p){
  const brim=paint('#c9342c'),shield=paint('#f4c438');
  oval(p,red,.38,.28,.40,0,.34,0);
  tube(p,brim,.48,.52,.07,0,.16,-.04,24);
  box(p,red,.12,.14,.46,0,.56,0,.04);
  box(p,shield,.20,.22,.05,0,.38,.36,.025);
  box(p,red,.08,.10,.03,0,.38,.39,.01);
}
function extinguisher(p){
  tube(p,red,.22,.22,.64,0,.34,0,20);
  oval(p,red,.22,.14,.22,0,.66,0);
  tube(p,steel,.06,.08,.14,0,.80,0,14);
  box(p,ink,.22,.04,.05,.08,.86,0,.012);
  box(p,white,.24,.22,.03,0,.38,.215,.01);
  // Side hose & nozzle
  rod(p,ink,[.05,.76,0],[.26,.54,.08],.028,8);
  rod(p,ink,[.26,.54,.08],[.28,.24,.10],.028,8);
  tube(p,ink,.035,.065,.12,.28,.18,.10,12);
}
function fireDog(p){
  const spot=paint('#2b303a');
  oval(p,white,.30,.24,.24,0,.30,0);
  oval(p,white,.24,.24,.24,.24,.58,0);
  oval(p,white,.12,.09,.10,.42,.52,0);
  oval(p,ink,.045,.035,.04,.50,.55,0);
  // Dalmatian spots
  for(const [x,y,z] of [[-.08,.34,.22],[.06,.28,-.22],[-.12,.40,-.18],[.08,.40,.20]])oval(p,spot,.065,.055,.04,x,y,z);
  for(const s of [-1,1]){
    oval(p,spot,.06,.14,.05,.18,.56,s*.22);
    oval(p,white,.07,.16,.07,-.18,.12,s*.13);
    oval(p,white,.07,.16,.07,.16,.12,s*.13);
  }
  // Mini red fire hat
  oval(p,red,.19,.12,.19,.24,.79,0);
  tube(p,red,.25,.26,.04,.24,.73,0,16);
  box(p,gold,.09,.09,.03,.39,.79,0,.01);
  for(const s of [-1,1])bead(p,ink,.024,.028,.024,.36,.63,s*.16);
}

// 4) Harbor stage
function cargoShip(p){
  const hull=paint('#2d5a82'),lower=paint('#c9443a'),c1=paint('#e3544a'),c2=paint('#3894d6'),c3=paint('#f2b832'),c4=paint('#46a868');
  box(p,lower,1.16,.14,.46,0,.10,0,.04);
  box(p,hull,1.22,.16,.50,0,.22,0,.04);
  // White bridge tower at stern
  box(p,white,.24,.46,.42,-.40,.52,0,.03);
  box(p,glass,.08,.12,.34,-.27,.64,0,.015);
  tube(p,red,.05,.05,.18,-.42,.82,0,12);
  // Colorful stacked containers
  box(p,c1,.26,.16,.20,.02,.38,-.11,.015);
  box(p,c2,.26,.16,.20,.02,.38,.11,.015);
  box(p,c3,.26,.16,.20,.32,.38,-.11,.015);
  box(p,c4,.26,.16,.20,.32,.38,.11,.015);
  box(p,c2,.26,.16,.20,.16,.54,0,.015);
}
function tugBoat(p){
  const hull=paint('#2d4054'),cabin=paint('#e65245');
  box(p,hull,.88,.24,.50,0,.16,0,.06);
  box(p,amber,.92,.06,.54,0,.26,0,.02);
  box(p,cabin,.42,.28,.38,-.04,.40,0,.04);
  box(p,white,.36,.20,.32,-.02,.60,0,.03);
  box(p,glass,.10,.10,.26,.14,.62,0,.015);
  tube(p,amber,.075,.085,.22,-.10,.80,0,14);
  tube(p,ink,.078,.078,.06,-.10,.89,0,14);
  for(const s of [-1,1])for(const x of [-.22,.18])torus(p,tire,.065,.022,x,.18,s*.26).rotation.y=Math.PI/2;
}
function lighthouse(p){
  const rock=paint('#7a8c99');
  tube(p,rock,.34,.40,.14,0,.07,0,16);
  tube(p,white,.22,.28,.22,0,.24,0,18);
  tube(p,red,.19,.22,.20,0,.44,0,18);
  tube(p,white,.16,.19,.20,0,.64,0,18);
  tube(p,red,.22,.22,.05,0,.76,0,18);
  tube(p,amber,.14,.14,.18,0,.88,0,18);
  tube(p,red,.02,.20,.16,0,1.04,0,18);
}
function harborCrane(p){
  const main=paint('#3886c9'),beam=paint('#f4be36'),boxC=paint('#e3544a');
  for(const sx of [-.34,.34])for(const sz of [-.22,.22])box(p,main,.08,.78,.08,sx,.42,sz,.015);
  box(p,beam,1.08,.10,.48,0,.84,0,.02);
  box(p,white,.20,.16,.18,.12,.72,0,.02);
  rod(p,steel,[.12,.64,0],[.12,.36,0],.018,8);
  box(p,boxC,.30,.20,.24,.12,.22,0,.02);
  for(const sx of [-.34,.34])box(p,ink,.14,.08,.56,sx,.06,0,.015);
}
function lifeBuoy(p){
  const ring=torus(p,white,.36,.12,0,.48,0);ring.scale.set(1,1,1.05);
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2;
    const band=box(p,red,.14,.26,.26,Math.cos(a)*.36,.48+Math.sin(a)*.36,0,.04);
    band.rotation.z=a;
  }
  box(p,paint('#6688a6'),.46,.08,.24,0,.04,0,.02);
}
function sailBoat(p){
  const hull=paint('#2f78c4'),sail1=paint('#fff9eb'),sail2=paint('#f4be36');
  box(p,hull,.88,.20,.40,0,.14,0,.06);
  box(p,white,.92,.05,.44,0,.24,0,.015);
  tube(p,paint('#8a5a32'),.028,.028,.86,0,.64,0,10);
  profile(p,sail1,[[.03,0],[.40,0],[.03,.66]],.04,0,.32,0,.01);
  profile(p,sail2,[[-.03,0],[-.32,0],[-.03,.54]],.035,0,.32,0,.01);
}

// 5) School stage
function schoolBus(p){
  box(p,yellow,1.16,.48,.52,0,.40,0,.06);
  box(p,ink,1.18,.05,.54,0,.32,0,.01);
  box(p,glass,.14,.18,.44,.52,.48,0,.02);
  for(const s of [-1,1])for(const x of [-.34,-.08,.18])box(p,glass,.18,.16,.04,x,.48,s*.255,.012);
  for(const s of [-1,1])oval(p,red,.035,.045,.045,.58,.24,s*.16);
  for(const x of [-.36,.36])for(const s of [-1,1])wheel(p,x,.14,s*.28,.14,.08);
}
function schoolBag(p){
  const bag=paint('#e65865'),pocket=paint('#ffd15c'),strap=paint('#2f5d96');
  box(p,bag,.58,.66,.34,0,.38,0,.08);
  box(p,pocket,.44,.28,.12,0,.24,.18,.04);
  box(p,white,.24,.06,.03,0,.36,.245,.01);
  const h=torus(p,strap,.11,.028,0,.72,0);h.scale.set(1.1,.85,1);
  for(const s of [-1,1])box(p,strap,.09,.48,.06,s*.18,.38,-.19,.02);
  cuteEyes(p,.54,.18,.10,.026);
}
function globeToy(p){
  const sea=paint('#3b98db'),land=paint('#5ab862'),base=paint('#b87842');
  tube(p,base,.24,.28,.10,0,.05,0,18);
  tube(p,gold,.04,.04,.16,0,.16,0,12);
  const arc=torus(p,gold,.36,.032,0,.56,0);arc.rotation.z=.35;
  oval(p,sea,.30,.30,.30,0,.56,0);
  for(const [x,y,z] of [[.16,.64,.20],[-.14,.56,.22],[.06,.44,-.24],[-.16,.68,-.14]])oval(p,land,.11,.08,.07,x,y,z);
}
function crayonBox(p){
  const boxM=paint('#f4c438'),cols=['#e84a43','#f49a2e','#4bb55a','#3b8be0','#9856d6'];
  box(p,boxM,.68,.46,.28,0,.24,0,.035);
  box(p,white,.54,.18,.03,0,.24,.145,.01);
  cols.forEach((c,i)=>{
    const m=paint(c),x=-.24+i*.12;
    tube(p,m,.044,.044,.42,x,.56,0,12);
    tube(p,m,.008,.044,.12,x,.82,0,12);
  });
}
function deskLamp(p){
  const body=paint('#4cb5a4'),shade=paint('#ffd668');
  tube(p,body,.24,.26,.09,0,.045,0,18);
  rod(p,steel,[-.04,.08,0],[-.16,.52,0],.032,10);
  rod(p,steel,[-.16,.52,0],[.08,.82,0],.032,10);
  const s=tube(p,shade,.12,.24,.22,.16,.74,0,18);s.rotation.z=-.48;
  oval(p,white,.09,.09,.09,.19,.66,0);
}
function owlTeacher(p){
  const body=paint('#8a6246'),belly=paint('#eddab8'),cap=paint('#28344a');
  oval(p,body,.32,.38,.28,0,.42,0);
  oval(p,belly,.21,.25,.14,0,.38,.18);
  for(const s of [-1,1]){
    oval(p,body,.09,.22,.10,s*.32,.40,0).rotation.z=s*.22;
    oval(p,white,.10,.10,.06,s*.11,.56,.23);
    torus(p,gold,.105,.018,s*.11,.56,.25);
    oval(p,amber,.07,.04,.10,s*.11,.04,.06);
  }
  oval(p,amber,.05,.06,.08,0,.49,.28);
  cuteEyes(p,.56,.275,.11,.028);
  // Graduation cap
  box(p,cap,.46,.045,.46,0,.82,0,.015);
  rod(p,gold,[.22,.82,0],[.26,.66,0],.016,6);
}

export const CITY_RESCUE={
  // Airport
  airliner:{name:'彩虹大客机',make:collectable(airliner,{height:1.22,width:2.06,grip:[0,.38,0,.34,.36]})},
  luggageCart:{name:'行李牵引车',make:collectable(luggageCart,{height:1.24,width:2.00,grip:[0,.36,0,.34,.24]})},
  controlTower:{name:'机场塔台',make:collectable(controlTower,{height:1.70,width:1.30,grip:[0,.56,0,.24,.24]})},
  boardingStair:{name:'登机梯车',make:collectable(boardingStair,{height:1.42,width:1.98,grip:[0,.44,0,.32,.24]})},
  suitcase:{name:'贴纸行李箱',make:collectable(suitcase,{height:1.54,width:1.36,grip:[0,.48,0,.26,.20]})},
  pilotBear:{name:'机长小熊',make:collectable(pilotBear,{height:1.56,width:1.40,grip:[0,.50,0,.26,.24]})},
  // Hospital
  ambulance:{name:'急救救护车',make:collectable(ambulance,{height:1.36,width:2.02,grip:[0,.44,0,.34,.24]})},
  nurseRabbit:{name:'护士小兔',make:collectable(nurseRabbit,{height:1.62,width:1.36,grip:[0,.50,0,.24,.22]})},
  medKit:{name:'红十字医药箱',make:collectable(medKit,{height:1.28,width:1.68,grip:[0,.38,0,.30,.22]})},
  stethoscope:{name:'彩色听诊器',make:collectable(stethoscope,{height:1.42,width:1.56,grip:[0,.42,0,.28,.26]})},
  thermometer:{name:'乖乖体温计',make:collectable(thermometer,{height:1.56,width:1.18,grip:[0,.52,0,.22,.20]})},
  capsuleToy:{name:'微笑维生素',make:collectable(capsuleToy,{height:1.46,width:1.36,grip:[0,.48,0,.26,.26]})},
  // Firehouse
  ladderTruck:{name:'云梯消防车',make:collectable(ladderTruck,{height:1.42,width:2.06,grip:[0,.46,0,.34,.24]})},
  fireBoat:{name:'水上消防艇',make:collectable(fireBoat,{height:1.32,width:2.02,grip:[0,.42,0,.34,.24]})},
  fireHydrant:{name:'红色消防栓',make:collectable(fireHydrant,{height:1.52,width:1.28,grip:[0,.50,0,.24,.24]})},
  fireHelmet:{name:'英雄消防盔',make:collectable(fireHelmet,{height:1.18,width:1.68,grip:[0,.32,0,.32,.32]})},
  extinguisher:{name:'迷你灭火器',make:collectable(extinguisher,{height:1.56,width:1.28,grip:[0,.50,0,.24,.24]})},
  fireDog:{name:'消防斑点狗',make:collectable(fireDog,{height:1.44,width:1.78,grip:[0,.46,0,.28,.24]})},
  // Harbor
  cargoShip:{name:'集装箱货轮',make:collectable(cargoShip,{height:1.30,width:2.06,grip:[0,.40,0,.34,.24]})},
  tugBoat:{name:'大力拖船',make:collectable(tugBoat,{height:1.40,width:1.90,grip:[0,.44,0,.30,.24]})},
  lighthouse:{name:'红白灯塔',make:collectable(lighthouse,{height:1.68,width:1.30,grip:[0,.56,0,.24,.24]})},
  harborCrane:{name:'港口龙门吊',make:collectable(harborCrane,{height:1.52,width:1.96,grip:[0,.52,0,.32,.24]})},
  lifeBuoy:{name:'橙白救生圈',make:collectable(lifeBuoy,{height:1.38,width:1.54,grip:[0,.44,0,.28,.22]})},
  sailBoat:{name:'蓝帆小游艇',make:collectable(sailBoat,{height:1.56,width:1.78,grip:[0,.46,0,.28,.22]})},
  // School
  schoolBus:{name:'黄色校车',make:collectable(schoolBus,{height:1.34,width:2.04,grip:[0,.42,0,.34,.24]})},
  schoolBag:{name:'卡通小书包',make:collectable(schoolBag,{height:1.44,width:1.48,grip:[0,.46,0,.28,.22]})},
  globeToy:{name:'旋转地球仪',make:collectable(globeToy,{height:1.54,width:1.38,grip:[0,.52,0,.26,.26]})},
  crayonBox:{name:'彩虹蜡笔盒',make:collectable(crayonBox,{height:1.46,width:1.52,grip:[0,.44,0,.28,.20]})},
  deskLamp:{name:'护眼小台灯',make:collectable(deskLamp,{height:1.54,width:1.36,grip:[0,.48,0,.24,.24]})},
  owlTeacher:{name:'猫头鹰老师',make:collectable(owlTeacher,{height:1.52,width:1.44,grip:[0,.50,0,.28,.24]})},
};
