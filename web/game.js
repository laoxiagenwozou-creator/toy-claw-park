import {createSound} from './sound.js';
import {createChamber,movementInView} from './chamber.js';
import {CHUTE,FLOOR,GATE,HOME,LIMIT,ROOF,poseFor} from './playfield.js';
import {PRIZES,POOLS} from './library.js';
import {THEMES} from './themes.js';
import {changeBoard,deliver,loadBoards,LOW_STOCK,newRound,remaining,syncBoards} from './stock.js';
import {bindControls} from './input.js';
import {contactAt} from './grip.js';
import {bindCatchSettings} from './catch-settings.js';
import {createWallet} from './wallet.js';
import {interpolatePose,planSlip} from './landing.js';
import {awardToy} from './keepsakes.js';
import {createPlayroom} from './playroom.js';
import {createMedalWall} from './medals.js';
import {hangingAngle,motionType,squash,surfaceSound} from './toy-motion.js';
const $=(id)=>document.getElementById(id);
const clamp=(x,min=0,max=1)=>Math.max(min,Math.min(max,x));
const mix=(a,b,t)=>a+(b-a)*t;
function sameStall(a,b){return a.x===b.x&&a.z===b.z&&Math.abs(Math.sin((a.angle-b.angle)/2))<.00001;}
const ease=(t)=>t*t*(3-2*t);
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const IDLE_OPEN=.22;

function celebrate(outlet) {
  if(reduceMotion.matches) return;
  const holder=$('confetti');
  holder.replaceChildren();
  const colors=['#fd785d','#ffd665','#56c4dd','#ada0ed','#fff3d4'];
  for(let i=0;i<15;i++){
    const piece=document.createElement('i');
    const angle=(i/14)*Math.PI;
    piece.style.setProperty('--start-x',outlet.x+'%');
    piece.style.setProperty('--start-y',outlet.y+'%');
    piece.style.setProperty('--x',`${Math.cos(angle)*(51+i%4*15)}px`);
    piece.style.setProperty('--y',`${-Math.sin(angle)*(48+i%3*20)-16}px`);
    piece.style.setProperty('--spin',`${(i%2?1:-1)*(45+i*23)}deg`);
    piece.style.setProperty('--color',colors[i%colors.length]);
    piece.addEventListener('animationend',()=>piece.remove(),{once:true});
    holder.append(piece);
  }
}


function run(){
  const boards=loadBoards(),sound=createSound(),arm={...HOME,open:IDLE_OPEN,marker:true,showGuide:true,swayX:0,swayZ:0};
  const soundArm={x:arm.x,y:arm.y,z:arm.z};
  const pendulum={x:0,z:0,vx:0,vz:0,prevX:arm.x,prevZ:arm.z,prevVx:0,prevVz:0};
  function resetPendulum(){
    pendulum.x=pendulum.z=pendulum.vx=pendulum.vz=pendulum.prevVx=pendulum.prevVz=0;
    pendulum.prevX=arm.x;pendulum.prevZ=arm.z;arm.swayX=0;arm.swayZ=0;
  }
  function kickPendulum(ix,iz){
    if(reduceMotion.matches)return;
    pendulum.vx=clamp(pendulum.vx+ix,-2.6,2.6);
    pendulum.vz=clamp(pendulum.vz+iz,-2.6,2.6);
  }
  function stepPendulum(dt){
    if(reduceMotion.matches||dt<=0){resetPendulum();return false;}
    const vx=(arm.x-pendulum.prevX)/dt,vz=(arm.z-pendulum.prevZ)/dt;
    const ax=clamp((vx-pendulum.prevVx)/dt,-26,26),az=clamp((vz-pendulum.prevVz)/dt,-26,26);
    pendulum.prevX=arm.x;pendulum.prevZ=arm.z;pendulum.prevVx=vx;pendulum.prevVz=vz;
    const free=clamp((arm.y-1.3)/2.7,.18,1),omega=7.6,zeta=.25;
    pendulum.vx+=(-ax*.016*free-omega*omega*pendulum.x-2*zeta*omega*pendulum.vx)*dt;
    pendulum.vz+=(-az*.016*free-omega*omega*pendulum.z-2*zeta*omega*pendulum.vz)*dt;
    pendulum.x=clamp(pendulum.x+pendulum.vx*dt,-.25,.25);
    pendulum.z=clamp(pendulum.z+pendulum.vz*dt,-.25,.25);
    if(Math.abs(pendulum.x)<.0005&&Math.abs(pendulum.vx)<.002){pendulum.x=0;pendulum.vx=0;}
    if(Math.abs(pendulum.z)<.0005&&Math.abs(pendulum.vz)<.002){pendulum.z=0;pendulum.vz=0;}
    arm.swayX=pendulum.x;arm.swayZ=pendulum.z;
    return Math.abs(pendulum.x)>.0005||Math.abs(pendulum.z)>.0005||Math.abs(pendulum.vx)>.002||Math.abs(pendulum.vz)>.002;
  }
  let room;
  const guideKey='toy-park-show-guide';
  try{arm.showGuide=localStorage.getItem(guideKey)!=='off';}catch{/* Use the default when storage is unavailable. */}
  let garage,stage=null,board=null,mode='menu',busy=false,tween=null,spin=null,mustDraw=true,announced=false;
  let coinPending=false,grabPhase='';
  const wallet=createWallet(refresh);
  bindCatchSettings(wallet,()=>mode==='menu'&&!busy);
  function navigateUI(dx,dy){
    if(mode==='menu'){
      const buttons=[...$('stage-grid').querySelectorAll('.stage-card')];
      if(!buttons.length)return;
      const cur=buttons.indexOf(document.activeElement);
      const cols=Math.max(1,Math.round($('stage-grid').clientWidth/Math.max(1,buttons[0].getBoundingClientRect().width)));
      const next=cur<0?0:(cur+dx+dy*cols+buttons.length)%buttons.length;
      buttons[next].focus({preventScroll:false});
    }else if(mode==='won'){
      const buttons=[...$('win').querySelectorAll('button:not([hidden]):not(:disabled)')];
      if(!buttons.length)return;
      const cur=buttons.indexOf(document.activeElement);
      const step=(dx||dy)||1;
      buttons[(cur<0?0:cur+step+buttons.length)%buttons.length].focus({preventScroll:true});
    }
  }
  function confirmUI(){
    const el=document.activeElement;
    if(mode==='menu'){
      const target=el?.classList?.contains('stage-card')?el:$('stage-grid').querySelector('.stage-card');
      target?.click();
    }else if(mode==='won'){
      const target=el&&$('win').contains(el)&&el.tagName==='BUTTON'?el:$('next-stage');
      target?.click();
    }
  }
  function gamepadBack(){
    const openDialog=document.querySelector('dialog[open]');
    if(openDialog){openDialog.close();return;}
    if(!$('credits').hidden){$('credits-close').click();return;}
    if((mode==='play'||mode==='won')&&!busy)menu();
  }
  const controls=bindControls({
    aim,grab,insertCoin,restock,
    playing:()=>mode==='play'&&!busy&&!$('sound-settings').open&&!room?.isOpen(),
    prevBay:()=>{if(mode==='play'&&!busy)enter(adjacent(-1));},
    nextBay:()=>{if(mode==='play'&&!busy)enter(adjacent(1));},
    toggleGuide:()=>{if(mode==='play'&&!busy)$('guide').click();},
    openOutlet:()=>{if(mode==='play'&&!busy)$('outlet').click();},
    back:gamepadBack,
    inMenu:()=>mode==='menu'&&!busy&&!document.querySelector('dialog[open]')&&$('credits').hidden,
    inWin:()=>mode==='won'&&!busy&&!$('win').hidden&&!document.querySelector('dialog[open]'),
    menuNav:navigateUI,
    menuConfirm:confirmUI,
  });
  room=createPlayroom(boards,sound,()=>stage,()=>!busy&&(mode==='play'||mode==='won'),()=>{controls.releaseMovement();stopCarriage();});
  const medals=createMedalWall(boards,enter,controls,()=>{if(mode==='menu')controls.stopMenuTracking();});
  function showGuideSetting(){
    $('guide').setAttribute('aria-checked',String(arm.showGuide));
    $('guide-state').textContent=arm.showGuide?'开':'关';
  }
  const stageHint=()=> (arm.showGuide?'把圈移到':'把抓爪移到')+THEMES[stage].aimAt;
  $('guide').addEventListener('click',()=>{
    const oldHint=stage&&stageHint();
    arm.showGuide=!arm.showGuide;showGuideSetting();
    try{localStorage.setItem(guideKey,arm.showGuide?'on':'off');}catch{/* Keep this choice in memory. */}
    if(!busy&&stage){
      const previous=$('help').textContent;
      if(previous.startsWith(oldHint))$('help').textContent=stageHint()+previous.slice(oldHint.length);
    }
    mustDraw=true;
  });
  showGuideSetting();
  const cards=new Map();
  for(const [id,theme] of Object.entries(THEMES)){
    const button=document.createElement('button');button.className='stage-card';button.type='button';button.dataset.stage=id;
    const img=document.createElement('img');img.alt='';img.src=typeof theme.card==='function'?theme.card():theme.card;
    button.style.setProperty('--theme-color',theme.base);
    const label=document.createElement('span');label.className='card-label';
    const title=document.createElement('strong');title.textContent=theme.name;
    const score=document.createElement('small');const arrow=document.createElement('i');arrow.textContent='›';arrow.setAttribute('aria-hidden','true');
    const stars=document.createElement('span');stars.className='card-stars';stars.setAttribute('aria-hidden','true');
    for(let i=0;i<6;i++){const star=document.createElement('i');star.textContent='★';stars.append(star);}
    label.append(title,stars,score,arrow);button.append(img,label);
    button.addEventListener('click',()=>enter(id));$('stage-grid').append(button);cards.set(id,{button,score,stars});
  }
  function menuCounts(){
    for(const [id,{score,button,stars}] of cards){
      const b=boards[id];score.textContent=b.clears?'★ '+b.clears:b.round?b.round+' / 6':b.total?'累计 '+b.total:'';
      Array.from(stars.children).forEach((star,i)=>star.classList.toggle('filled',i<b.round));
      button.setAttribute('aria-label',THEMES[id].name+(b.clears?'，已通关 '+b.clears+' 次':b.round?'，已抓 '+b.round+' 个':''));
    }
  }
  function say(title,hint=''){$('status').textContent=title;$('help').textContent=hint;}
  const coinHint=family=>!family.ready?'正在读取本机游戏币':family.coins?'点「投币」，再按「抓！」':'可以去玩具架，或请家长发币';
  function retryHint(freePlayHint){
    const family=wallet.info();
    return family.limited&&!family.inserted?coinHint(family):freePlayHint;
  }
  function refresh(){
    const count=board?remaining(board):0;
    $('progress').textContent=board?String(board.round):'0';
    if(stage&&board){
      $('marquee-stage').textContent=THEMES[stage].name;
      const badge=$('marquee-medal'),clears=board.clears||0;
      badge.textContent=clears?`✦ 通关 ${clears} 次`:'待获纪念牌';
      badge.classList.toggle('earned',clears>0);
    }
    const family=wallet.info(),locked=mode!=='play'||busy||coinPending||!count||!family.ready;
    const needsCoin=family.ready&&family.limited&&!family.inserted;
    const grabButton=$('grab'),label=grabPhase||(coinPending?'投币中':!locked&&needsCoin?(family.coins?'先投币':'币用完啦'):'抓！');
    grabButton.disabled=locked||needsCoin;
    $('grab-control').classList.toggle('needs-coin',!locked&&needsCoin);
    grabButton.classList.toggle('has-caption',label!=='抓！');
    grabButton.setAttribute('aria-label',label==='抓！'?'下爪抓玩具':label);
    $('grab-label').textContent=label;
    const slot=$('coin-insert');slot.hidden=family.ready&&!family.limited;
    slot.disabled=locked||family.inserted||!family.coins;
    slot.classList.toggle('funded',family.inserted);
    $('coin-action').textContent=!family.ready?'等一下':family.inserted?'已投币':coinPending?'投币中':family.coins?'投币':'币用完了';
    $('coin-balance').textContent=family.error?'读取失败':!family.ready?'读取中':'余 '+Math.max(0,family.coins-Number(family.inserted))+' 枚';
    if(mode==='play'&&family.ready&&!busy&&$('help').textContent==='正在读取本机游戏币'){
      $('help').textContent=needsCoin?coinHint(family):stageHint()+'，再按「抓！」';
    }
    slot.setAttribute('aria-label',$('coin-action').textContent+'，'+$('coin-balance').textContent);
    $('restock').hidden=!board||count>LOW_STOCK;
    $('machine').classList.toggle('has-coin-and-refill',!slot.hidden&&!$('restock').hidden);
    $('restock').disabled=busy||mode!=='play';$('menu-button').disabled=busy;
    for(const id of ['previous-bay','next-bay'])$(id).disabled=busy||mode!=='play';
    room?.sync();
    mustDraw=true;
  }
  function menu(){
    if(busy||mode==='loading')return;
    window.BudNative?.setGameActive?.(false);sound.setGame(false);
    stopCarriage();mode='menu';if(spin)spin.toy.model.rotation.y=spin.from;spin=null;controls.pauseForMenu();
    $('win').hidden=true;medals.clearWin();$('machine').hidden=true;$('stages').hidden=false;
    $('load-note').hidden=true;menuCounts();
    if(stage)cards.get(stage).button.focus({preventScroll:true});
  }
  const stageIds=Object.keys(THEMES);
  const faces=stageIds.map(key=>{
    const face=document.createElement('div');face.className='cabinet-face';
    face.style.setProperty('--paint',THEMES[key].base);
    const bin=document.createElement('i'),stick=document.createElement('i'),button=document.createElement('i');
    face.append(bin,stick,button);$('fascias').append(face);return face;
  });
  function alignDeck(position,width){
    faces.forEach((face,index)=>{
      const offset=index+Math.round((position-index)/stageIds.length)*stageIds.length-position;
      face.hidden=Math.abs(offset)>1.9;
      if(face.hidden)return;
      face.style.width=width+'%';
      face.style.transform='translateX('+((offset*100)-50)+'%)';
      face.classList.toggle('under-controls',Math.abs(offset)<.001);
    });
  }
  function adjacent(direction){
    return stageIds[(stageIds.indexOf(stage)+direction+stageIds.length)%stageIds.length];
  }
  function nameNeighbors(){
    for(const [key,direction] of [['previous-bay',-1],['next-bay',1]]){
      const id=adjacent(direction),button=$(key);
      button.querySelector('span').textContent=THEMES[id].name;
      button.setAttribute('aria-label','前往'+THEMES[id].name);
    }
  }
  for(const [key,direction] of [['previous-bay',-1],['next-bay',1]]){
    $(key).addEventListener('click',()=>{if(mode==='play'&&!busy)enter(adjacent(direction));});
  }
  async function enter(id){
    if(mode==='loading'||mode==='travelling'||busy)return;
    const machine=$('machine'),viewport=$('viewport');
    window.BudNative?.setGameActive?.(true);sound.unlock();sound.setGame(true);sound.effect('aisle');
    mode='loading';busy=true;$('win').hidden=true;medals.clearWin();
    if(spin){spin.toy.model.rotation.y=spin.from;spin=null;}
    controls.releaseMovement();stopCarriage();refresh();
    $('load-note').textContent='玩具进场中…';$('load-note').hidden=false;
    try{
      if(!garage){garage=createChamber($('scene'),viewport);garage.track(alignDeck);}
      syncBoards(boards);const {from,to}=await garage.route(id,boards);
      stage=id;board=boards[id];announced=false;
      Object.assign(arm,HOME,{open:IDLE_OPEN,marker:true,swayX:0,swayZ:0});resetPendulum();nameNeighbors();
      $('stages').hidden=true;machine.hidden=false;machine.dataset.mode='travel';
      $('load-note').hidden=true;$('render-error').hidden=true;viewport.dataset.ready='true';
      garage.setSize();garage.draw(arm,controls.gaze,true);
      const distance=Math.abs(to-from);
      if(distance>.001&&!reduceMotion.matches){
        mode='travelling';
        await animate(.48+Math.min(3,distance)*.23,t=>garage.move(mix(from,to,t)));
      }
      garage.dock(to);garage.draw(arm,controls.gaze,true);sound.effect('dock');
      Object.assign(soundArm,{x:arm.x,y:arm.y,z:arm.z});
      viewport.setAttribute('aria-label',THEMES[stage].name+'。轻点玩具转一圈，点两侧机台换关，拖动空处换视角');
      mode='play';busy=false;machine.dataset.mode='play';machine.dataset.stage=id;
      controls.resumeAfterMenu();
      const family=wallet.info();
      say(THEMES[id].name,remaining(board)<=LOW_STOCK?'点「补充玩具」打开补给口':
        family.limited&&!family.inserted?coinHint(family):stageHint()+'，再按「抓！」');
      refresh();($('grab').disabled&&!$('coin-insert').disabled?$('coin-insert'):$('grab')).focus({preventScroll:true});
      if(board.round===6)showWin();
    }catch(err){
      window.BudNative?.setGameActive?.(false);sound.setGame(false);
      console.error('Could not load the toy stage',id,err);mode='menu';busy=false;machine.hidden=true;$('stages').hidden=false;
      $('load-note').textContent='这一关的 3D 画面暂时打不开，点选关卡可以重试。';$('load-note').hidden=false;
      controls.pauseForMenu();menuCounts();
    }
  }
  function aim(x,y){
    if(mode!=='play'||busy)return;
    const neighbor=garage.neighborAt(x);if(neighbor){enter(adjacent(neighbor));return;}
    const id=garage.pick(x,y),toy=garage.toys[id];
    if(!toy)return;
    if(spin)spin.toy.model.rotation.y=spin.from;
    spin={toy,from:toy.model.rotation.y,elapsed:0};sound.effect('tap');
    say(PRIZES[toy.kind].name,stageHint());mustDraw=true;
  }
  function animate(seconds,update,easing=ease) {
    return new Promise((resolve,reject)=>{
      tween={duration:seconds,elapsed:0,update,easing,resolve,reject};
      watchTween();
    });
  }
  async function travel(x,z,seconds,onMove) {
    const sx=arm.x, sz=arm.z;
    await animate(seconds,(t)=>{
      arm.x=mix(sx,x,t); arm.z=mix(sz,z,t);
      if(onMove) onMove(t);
    });
  }

  const carriageSpeed={x:0,z:0};
  function stopCarriage(){carriageSpeed.x=0;carriageSpeed.z=0;}
  function steer(dt){
    if(busy||!remaining(board))return false;
    const stick=controls.movement();
    if(!stick.x&&!stick.z&&!carriageSpeed.x&&!carriageSpeed.z)return false;
    const direction=movementInView(stick,controls.gaze);
    // Integrate the quick motor response in seconds so a tap travels the same
    // distance at 60 and 144 Hz, including the short settling distance.
    const decay=Math.exp(-28*dt);
    for(const axis of ['x','z']){
      const target=direction[axis]*2.05,delta=carriageSpeed[axis]-target;
      arm[axis]=clamp(arm[axis]+target*dt+delta*(1-decay)/28,
        axis==='x'?LIMIT.left:LIMIT.back,axis==='x'?LIMIT.right:LIMIT.front);
      carriageSpeed[axis]=Math.abs(delta*decay)<.003?target:target+delta*decay;
    }
    if(!announced){say('对准再下爪',stageHint());announced=true;}
    return true;
  }
  function placeShadow(toy,x,z,angle,scaleFactor=1){
    const ca=Math.cos(angle),sa=Math.sin(angle);
    const sx=x+toy.shape.cx*ca+toy.shape.cz*sa,sz=z-toy.shape.cx*sa+toy.shape.cz*ca-.10;
    toy.shadow.position.set(sx,.016,sz);
    toy.shadow.rotation.y=angle;
    toy.shadow.scale.set(toy.shadowScale.x*scaleFactor,1,toy.shadowScale.z*scaleFactor);
  }
  function poseToy(toy,p,height,tilt=0){
    const model=toy.model;
    model.position.set(p.x,FLOOR+height+Math.abs(Math.sin(tilt))*.18,p.z);
    model.rotation.set(0,p.angle,tilt,'YXZ');
    toy.shadow.visible=true;
    placeShadow(toy,p.x,p.z,p.angle,1/(1+.26*height));
  }
  // Size the closed jaw angle to each toy's actual silhouette so fingertips hug
  // the exterior without stabbing through wide plushies or vehicles.
  function closedGripOpen(toy){
    const minR=Math.min(toy.shape.hx,toy.shape.hz),maxR=Math.max(toy.shape.hx,toy.shape.hz);
    const bodyR=minR*.65+maxR*.35,gripR=Math.max(toy.grip.rx,toy.grip.rz);
    const soft=motionType(toy.kind)==='soft';
    const targetR=clamp(Math.max(gripR*1.12,bodyR*(soft?.80:.86)),.32,.64);
    const sinA=clamp((targetR/1.68-.245)/.66,-.32,.52);
    return clamp((Math.asin(sinA)+.34)/.92,.24,.84);
  }
  const pivotY=ROOF-.52;
  // Lock a held toy rigidly to the pendulum claw frame (Rx(-swayZ) * Rz(swayX))
  // so lifting and carrying never shear the prongs through the toy.
  function attachToClaw(toy,ox,oz,level,yaw,extraTilt=0){
    const sx=arm.swayX||0,sz=arm.swayZ||0;
    const drop=Math.max(.55,pivotY-arm.y);
    const cx=Math.cos(sx),snx=Math.sin(sx),cz=Math.cos(sz),snz=Math.sin(sz);
    const hubX=arm.x+drop*snx,hubY=pivotY-drop*cx*cz,hubZ=arm.z+drop*cx*snz;
    const dy=-(level-FLOOR);
    const rx1=ox*cx-dy*snx,ry1=ox*snx+dy*cx;
    const ry2=ry1*cz+oz*snz,rz2=-ry1*snz+oz*cz;
    toy.model.position.set(hubX+rx1,hubY+ry2,hubZ+rz2);
    toy.model.rotation.set(-sz,yaw,sx+extraTilt,'XZY');
  }
  async function slip(toy,index,level,closed){
    const type=motionType(toy.kind),soft=type==='soft',wheels=type==='wheels',pitch=hangingAngle(toy,arm);
    const start={x:toy.model.position.x,z:toy.model.position.z,angle:toy.model.rotation.y};
    const plan=planSlip(toy,garage.toys,arm),{release,impact,end,lift}=plan;
    // Commit the landing before playback. Switching away mid-fall cannot restore the old stall.
    const generation=board.generations[index];
    try{
      const saved=await changeBoard(boards,stage,b=>{
        if(b.slots[index]!==toy.kind||b.generations[index]!==generation)return false;
        if(!sameStall(b.poses[index]??poseFor(stage,index,generation),toy.stall))return false;
        b.poses[index]={...end,angle:end.angle%(Math.PI*2)};return true;
      });
      if(!saved){squash(toy,0);garage.sync(board);say('机台已更新','再选一件玩具');return;}
    }catch{squash(toy,0);say('这次位置没有存好','玩具留在原位');return;}
    const height=Math.min(plan.height,HOME.y-level),tilt=reduceMotion.matches?0:plan.lean;
    say(lift?'夹起来了…':'碰到了…');
    await animate(lift?.78:.22,t=>{
      arm.y=level+height*t;poseToy(toy,start,height*t,(pitch+tilt*.08)*t);
      if(soft)squash(toy,.14*(1-.28*t));
    });
    if(lift){
      const dx=release.x-start.x,dz=release.z-start.z;
      await travel(arm.x+dx,arm.z+dz,clamp(Math.hypot(dx,dz)/3.75,.29,1.25),t=>{
        poseToy(toy,interpolatePose(start,release,t),height,pitch+tilt*(.08+.055*Math.sin(Math.PI*2*t)));
      });
    }
    const releaseY=arm.y;sound.effect('slip',surfaceSound(toy.kind));controls.rumble(110,.35,.22);
    kickPendulum(-plan.lean*.95,((index%2?1:-1)*.55));
    say(lift?'半路滑下来了':'玩具滚开了');
    await animate(Math.max(.20,Math.sqrt(2*height/10)),t=>{
      arm.y=mix(releaseY,HOME.y,ease(t)*.58);
      arm.open=mix(closed,.88,t);
      poseToy(toy,interpolatePose(release,impact,t),height*(1-t*t),pitch*(1-.4*t)+tilt*(.10+.18*t));
      if(wheels)toy.model.rotation.x=tilt*.68*t;
      if(soft)squash(toy,.10*(1-t));
    },t=>t);
    sound.effect('land',surfaceSound(toy.kind),lift?1.12:.55);sound.effect('roll',surfaceSound(toy.kind),lift?.85:.65);
    const lastY=arm.y;
    await animate(lift?.62:.55,t=>{
      const u=1-Math.pow(1-t,3),bounce=reduceMotion.matches?0:Math.abs(Math.sin(Math.PI*t*1.7))*(1-t)*Math.min(.28,.10+height*.065);
      arm.y=mix(lastY,HOME.y,ease(t));arm.open=mix(.88,1,t);
      poseToy(toy,interpolatePose(impact,end,u),wheels?bounce*.25:bounce,tilt*(1-t)*(.28+.16*Math.sin(t*Math.PI*2)));
      if(wheels)toy.model.rotation.x=tilt*.68*(1-t)*Math.cos(Math.PI*t);
      if(soft)squash(toy,.18*Math.sin(Math.PI*Math.min(t*3,1))*(1-t));
    },t=>t);
    toy.stall=board.poses[index];toy.baseAngle=toy.stall.angle;poseToy(toy,toy.stall,0);
    say(lift?'玩具滑下来了':'玩具滚开了',retryHint('看看它停在哪里，再瞄一次'));
  }
  async function insertCoin(){
    if(mode!=='play'||busy||coinPending||!remaining(board))return;
    coinPending=true;say('正在投币');refresh();sound.unlock();
    try{
      if(await wallet.insert()){sound.effect('coin');say('投币成功','瞄准玩具，再按「抓！」');}
      else say('游戏币已更新',retryHint('瞄准玩具，再按「抓！」'));
    }catch{say('投币口暂时忙','请再点一次「投币」');}
    finally{coinPending=false;refresh();}
  }
  async function grab(){
    if(mode!=='play'||busy||coinPending||room.isOpen()||!remaining(board))return;
    const family=wallet.info();
    if(!family.ready)return;
    if(family.limited&&!family.inserted){
      say(family.coins?'先投一枚币':'游戏币用完啦',coinHint(family));
      if(family.coins)$('coin-insert').focus({preventScroll:true});
      return;
    }
    busy=true;
    let earnedMedal=false;
    try{
      controls.releaseMovement();stopCarriage();
      if(spin){spin.toy.model.rotation.y=spin.from;spin=null;}
      grabPhase='下爪中';say('抓爪下来啦');refresh();
      let checking=true;
      const admission=wallet.spend().catch(()=>null).finally(()=>{checking=false;});
      sound.unlock();sound.effect('start');
      // Take up the cable immediately and begin spreading the fingers open.
      await animate(.18,t=>{arm.y=HOME.y-.43*t;arm.open=mix(IDLE_OPEN,.85,t);},t=>t);
      if(checking){grabPhase='验币中';say('正在确认游戏币','马上就好');refresh();}
      const paid=await admission;
      if(!paid){
        grabPhase='回位中';
        if(paid===null)say('投币口暂时忙','稍后再点「抓！」');
        else say('游戏币已更新',retryHint('请重新瞄准'));
        refresh();
        const fromY=arm.y,fromOpen=arm.open;
        await animate(.18,t=>{arm.y=mix(fromY,HOME.y,t);arm.open=mix(fromOpen,IDLE_OPEN,t);});
        return;
      }
      grabPhase='下爪中';say('抓爪下来啦');refresh();
      earnedMedal=await completeDrop();
    }catch(error){
      console.error('Claw cycle interrupted',error);
      // A partial animation never becomes the saved position of a toy.
      garage.sync(board);
      for(const toy of garage.toys)if(toy){squash(toy,0);poseToy(toy,toy.stall,0);}
      say('夹爪已归位','可以重新瞄准');
    }finally{
      Object.assign(arm,HOME,{open:IDLE_OPEN,marker:true,swayX:0,swayZ:0});resetPendulum();
      busy=false;grabPhase='';announced=false;refresh();
      if(garage&&mode==='play'){garage.draw(arm,controls.gaze,true);mustDraw=false;}
      if(board.round===6)showWin(earnedMedal);
    }
  }
  async function completeDrop(){
    let earnedMedal=false;
    const hit=contactAt(arm,garage.toys,wallet.info().chance),toy=hit&&garage.toys[hit.id];
    const rest=toy&&{x:toy.model.position.x,z:toy.model.position.z,yaw:toy.model.rotation.y};
    const tilt=toy&&!reduceMotion.matches?hangingAngle(toy,arm):0,soft=toy&&motionType(toy.kind)==='soft';
    const generation=hit?board.generations[hit.id]:0;
    // Keep the claw housing cleanly above the toy's top and fingers above the floor.
    const level=hit?Math.min(HOME.y-.35,Math.max(1.34,FLOOR+toy.height+.22,hit.height+.86)):1.34;
    const holdOpen=hit?closedGripOpen(toy):0;
    const closed=hit?(hit.hold?holdOpen:Math.max(.28,holdOpen-.08)):0;
    let holdX=rest?rest.x:0,holdZ=rest?rest.z:0;
    if(toy&&hit.hold){
      const cy=Math.cos(rest.yaw),sy=Math.sin(rest.yaw);
      const centerX=rest.x+toy.shape.cx*cy+toy.shape.cz*sy;
      const centerZ=rest.z-toy.shape.cx*sy+toy.shape.cz*cy;
      // Closing prongs naturally nudge an off-center toy toward the claw axis.
      holdX=rest.x+(arm.x-centerX)*.88;
      holdZ=rest.z+(arm.z-centerZ)*.88;
    }
    const fromY=arm.y,fromOpen=arm.open;
    await animate(.72,t=>{arm.y=mix(fromY,level,t);arm.open=mix(fromOpen,1,Math.min(1,t*2.6));});
    await animate(.32,t=>{
      arm.open=mix(1,closed,t);
      if(toy&&hit.hold){
        const nx=mix(rest.x,holdX,t),nz=mix(rest.z,holdZ,t);
        toy.model.position.x=nx;toy.model.position.z=nz;
        placeShadow(toy,nx,nz,rest.yaw,1);
      }
      if(soft)squash(toy,.14*t);
    });sound.effect('jaw');controls.rumble(hit?85:45,hit?.30:.12,hit?.45:.15);
    if(hit&&hit.hold)kickPendulum(tilt*.55,(hit.id%2?1:-1)*.22);
    arm.marker=false;grabPhase='提爪中';refresh();
    if(hit&&!hit.hold){
      await slip(toy,hit.id,level,closed);
    }else{
      const ox=toy?holdX-arm.x:0,oz=toy?holdZ-arm.z:0;
      await animate(.86,t=>{
        arm.y=mix(level,HOME.y,t);
        if(toy){
          attachToClaw(toy,ox,oz,level,rest.yaw,tilt*t);
          placeShadow(toy,toy.model.position.x,toy.model.position.z,rest.yaw,1-t*.58);
          if(t>.93)toy.shadow.visible=false;
        }
      });
      if(toy){
        say('夹住了！',PRIZES[toy.kind].name+'要到领奖口啦');
        await travel(CHUTE.x,CHUTE.z,clamp(Math.hypot(CHUTE.x-arm.x,CHUTE.z-arm.z)/3.75,.52,1.76),t=>{
          const swing=reduceMotion.matches?0:Math.sin(t*Math.PI*2)*(1-t);
          attachToClaw(toy,ox,oz,level,rest.yaw,tilt+.05*swing);
        });
        await animate(.19,t=>{arm.open=mix(closed,1,t);});
        const y=toy.model.position.y;await animate(.47,t=>{toy.model.position.y=mix(y,-1.65,t*t);toy.model.scale.setScalar(toy.size*(1-.35*t*t));},t=>t);
        try{
          const awarded=await changeBoard(boards,stage,b=>
            sameStall(b.poses[hit.id]??poseFor(stage,hit.id,generation),toy.stall)&&awardToy(b,stage,hit.id,toy.kind,generation));
          if(awarded){
            earnedMedal=board.round===6;
            garage.remove(hit.id);refresh();room.rattle();celebrate(garage.prizeOutlet());sound.effect('prize');controls.rumble(180,.55,.70);
            say('抓到'+PRIZES[toy.kind].name+'啦！','点开取物口，把玩具带回家');
          }else{
            garage.remove(hit.id);
            if(board.slots[hit.id])garage.put(hit.id,board.slots[hit.id],board.poses[hit.id]||poseFor(stage,hit.id,board.generations[hit.id]));
            say('机台已更新','可以打开取物口看看');
          }
        }catch{
          squash(toy,0);poseToy(toy,toy.stall,0);say('玩具没能存好','玩具已经放回台面');
        }
      }else{sound.effect('empty');say('这次抓空了',retryHint('把夹爪移到玩具上方，再试一次'));}
    }
    grabPhase='回位中';refresh();
    if(!hit)await animate(.20,t=>{arm.open=mix(closed,1,t);});
    if(arm.y<HOME.y-.001){
      const fromY=arm.y,fromOpen=arm.open;
      await animate(.72,t=>{arm.open=mix(fromOpen,1,Math.min(1,3*t));arm.y=mix(fromY,HOME.y,t);});
    }
    const distanceHome=Math.hypot(arm.x-HOME.x,arm.z-HOME.z);
    if(distanceHome>.01){
      const hint=$('help').textContent;
      $('help').textContent='夹爪正在回到起点';
      const startOpen=arm.open;
      await travel(HOME.x,HOME.z,clamp(distanceHome/3.9,.40,1.54),t=>{
        arm.open=mix(startOpen,IDLE_OPEN,ease(t));
      });
      $('help').textContent=hint;
    }else if(Math.abs(arm.open-IDLE_OPEN)>.01){
      const startOpen=arm.open;
      await animate(.22,t=>{arm.open=mix(startOpen,IDLE_OPEN,t);});
    }
    sound.effect('home');return earnedMedal;
  }
  function supply(b){
    const toys=[];
    for(const {id,kind} of deliver(b,POOLS[stage])){
      const toy=garage.put(id,kind,poseFor(stage,id,b.generations[id]),true,b);if(toy)toys.push(toy);
    }
    return toys;
  }
  async function restock(){
    if(mode!=='play'||busy||remaining(board)>LOW_STOCK)return;
    busy=true;if(spin){spin.toy.model.rotation.y=spin.from;spin=null;}
    sound.unlock();sound.effect('gate');
    controls.releaseMovement();stopCarriage();
    const items=[];
    try{
      await changeBoard(boards,stage,b=>{
        garage.sync(b);
        for(const toy of supply(b)){
          toy.model.visible=false;toy.shadow.visible=false;
          items.push({toy,stall:toy.stall,landed:false});
        }
        return true;
      });
    }catch{for(const {toy} of items)garage.remove(toy.model.userData.slot);garage.sync(board);busy=false;say('补货没有存好','请再试一次');refresh();return;}
    refresh();
    if(!items.length){busy=false;say('台面有点挤','先抓走一件玩具，再试补货');refresh();return;}
    say('补给口打开啦','看，新玩具要落下来了');
    await animate(.30,t=>garage.setGate(t));
    const gap=reduceMotion.matches?0.18:0.53;
    const duration=reduceMotion.matches?0.59:1.47;
    const total=duration+gap*(items.length-1);
    await animate(total,(t)=>{
      const elapsed=t*total;
      items.forEach((item,index)=>{
        const phase=clamp((elapsed-index*gap)/duration);
        if(phase<=0 || item.landed) return;
        const {toy,stall}=item;
        const model=toy.model;
        model.visible=true;
        if(phase<0.33) {
          const run=ease(phase/0.33);
          const hop=reduceMotion.matches ? 0 : Math.abs(Math.sin(run*Math.PI*2))*0.085;
          model.scale.setScalar(toy.size*mix(0.23,0.74,run));
          model.position.set(GATE.x,GATE.y+0.04+hop,mix(GATE.z-0.35,GATE.lip+0.22,run));
          model.rotation.set(0,-0.15,0);
        } else if(phase<0.80) {
          const air=(phase-0.33)/0.47;
          const drift=ease(air);
          model.scale.setScalar(toy.size*mix(0.74,1,drift));
          model.position.set(mix(GATE.x,stall.x,drift),
            mix(GATE.y+0.04,FLOOR,air*air)+Math.sin(Math.PI*air)*(reduceMotion.matches?0:0.52),
            mix(GATE.lip+0.22,stall.z,drift));
          model.rotation.y=mix(-0.15,stall.angle,drift);
          model.rotation.z=reduceMotion.matches?0:0.15*Math.sin(air*Math.PI);
          toy.shadow.visible=air>0.56;
          placeShadow(toy,stall.x,stall.z,stall.angle,mix(0.27,1,drift));
        } else {
          const settle=(phase-0.80)/0.20;
          const lift=reduceMotion.matches?0:Math.sin(Math.PI*settle)*(1-settle)*0.19;
          model.position.set(stall.x,FLOOR+lift,stall.z);
          model.rotation.set(0,stall.angle,0);
          model.scale.setScalar(toy.size);
          toy.shadow.visible=true;
          placeShadow(toy,stall.x,stall.z,stall.angle,1);
        }
        if(phase>=1) {
          item.landed=true;
          sound.effect('land',surfaceSound(toy.kind),.72);
        }
      });
    },(t)=>t);
    await animate(0.24,(t)=>garage.setGate(1-t));

    busy=false;announced=false;say('玩具到齐啦！',stageHint());refresh();
  }
  function showWin(fresh=false){
    mode='won';if(fresh)sound.effect('win');$('win-title').textContent=THEMES[stage].name+'通关！';$('win').hidden=false;
    medals.celebrate(stage,fresh);refresh();$('next-stage').focus({preventScroll:true});
  }
  async function playAgain(){
    if(mode!=='won'||busy)return;
    busy=true;refresh();
    try{
      await changeBoard(boards,stage,b=>{if(b.round!==6)return false;garage.sync(b);newRound(b);supply(b);return true;});
    }catch{busy=false;garage.sync(board);say('没有开启新一轮','请再试一次');refresh();return;}
    busy=false;enter(stage);
  }
  $('menu-button').addEventListener('click',menu);$('win-menu').addEventListener('click',menu);
  $('again').addEventListener('click',playAgain);
  $('next-stage').addEventListener('click',()=>{const ids=Object.keys(THEMES);enter(ids[(ids.indexOf(stage)+1)%ids.length]);});
  $('credits-button').addEventListener('click',()=>{$('credits').hidden=false;$('credits-close').focus();});
  $('credits-close').addEventListener('click',()=>{$('credits').hidden=true;$('credits-button').focus();});
  window.addEventListener('keydown',e=>{if(e.code==='Escape'&&!document.querySelector('dialog[open]')){if(!$('credits').hidden)$('credits-close').click();else if(mode==='play'||mode==='won')menu();}});
  let last=performance.now(),frameId=0,wakeTimer=0;
  // Some WebViews stop delivering vsync while a stationary cabinet is on
  // screen. Only an active, visible animation needs this secondary wake-up.
  function watchTween(){
    if(wakeTimer||!tween||document.hidden)return;
    wakeTimer=setTimeout(()=>{
      wakeTimer=0;
      if(!tween||document.hidden)return;
      const now=performance.now();
      if(now-last>=120){cancelAnimationFrame(frameId);frame(now);}
      watchTween();
    },140);
  }
  document.addEventListener('visibilitychange',()=>{
    last=performance.now();
    if(document.hidden){clearTimeout(wakeTimer);wakeTimer=0;}else watchTween();
  });
  function frame(now){
    const viewDt=clamp((now-last)/1000,0,.25);last=now;
    const dt=Math.min(viewDt,.10);
    if(!document.hidden){
      controls.pollGamepad(now,dt);
      const viewingMedal=medals.isViewing();
      if(mode==='play'||mode==='won'||mode==='travelling'){
        const cameraMoved=controls.updateView(now,viewDt),active=Boolean(tween);
        if(tween){
          const step=tween;
          step.elapsed+=viewDt;const t=Math.min(1,step.elapsed/step.duration);
          try{step.update(step.easing(t));if(t===1){tween=null;step.resolve();}}
          catch(error){tween=null;step.reject(error);}
        }
        const turning=Boolean(spin);
        if(spin){spin.elapsed+=dt;const t=Math.min(1,spin.elapsed/(reduceMotion.matches?2.3:1.48));
          spin.toy.model.rotation.y=spin.from+Math.PI*2*ease(t);
          if(t===1){spin.toy.model.rotation.y=spin.from;spin=null;}}
        const moved=mode==='play'&&!room.isOpen()&&steer(dt);
        const swaying=mode==='play'&&stepPendulum(dt);
        const moving=mode==='play'&&dt>0&&(active||moved);
        sound.drive(moving?Math.hypot(arm.x-soundArm.x,arm.z-soundArm.z)/dt:0,moving?(arm.y-soundArm.y)/dt:0);
        soundArm.x=arm.x;soundArm.y=arm.y;soundArm.z=arm.z;
        garage.draw(arm,controls.gaze,mustDraw||active||turning||moved||swaying||cameraMoved);mustDraw=false;
        if(viewingMedal)medals.updateGaze(controls.gaze,controls.isTracking());
      }else if(viewingMedal){
        controls.updateView(now,viewDt);
        medals.updateGaze(controls.gaze,controls.isTracking());
      }
    }
    frameId=requestAnimationFrame(frame);
  }
  menuCounts();room.sync();wallet.sync();frameId=requestAnimationFrame(frame);
}
try{run();}catch(error){console.error(error);$('load-note').textContent='游戏暂时打不开，请重新打开。';$('load-note').hidden=false;}
