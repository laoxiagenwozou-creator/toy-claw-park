import {headTracker} from './head-tracking.js';
import {createGamepad} from './gamepad.js';
const $ = (id) => document.getElementById(id);
const clamp = (value,min,max) => Math.min(max,Math.max(min,value));

// A WebView tap can end without a compatibility click, including a primary tap.
// Match down/up on this control. Keyboard, mouse and accessibility use click.
function bindDeckButton(control, activate) {
  let finger=null, handled=null;
  control.addEventListener('pointerdown',event=>{
    handled=null;
    if(event.pointerType==='touch' && finger===null)finger=event.pointerId;
  });
  for(const type of ['pointercancel','lostpointercapture']){
    control.addEventListener(type,event=>{
      if(event.pointerId===finger)finger=null;
    });
  }
  control.addEventListener('pointerup',event=>{
    if(event.pointerId!==finger)return;
    finger=null;
    handled=event.pointerId;
    if(!control.contains(document.elementFromPoint(event.clientX,event.clientY)))return;
    activate();
  });
  control.addEventListener('click',event=>{
    if(handled!==null&&event.detail>0&&(event.pointerType==='touch'||event.pointerId===handled||event.pointerId===undefined)){
      handled=null;return;
    }
    activate();
  });
}

export function bindControls({
  aim, grab, insertCoin, restock, playing,
  prevBay=()=>{}, nextBay=()=>{}, toggleGuide=()=>{}, openOutlet=()=>{},
  back=()=>{}, inMenu=()=>false, inWin=()=>false, menuNav=()=>{}, menuConfirm=()=>{},
}) {
  const viewport=$('viewport');
  const joystick=$('joystick');
  const knob=$('knob');
  const axes={x:0,z:0};
  const held=new Set();
  let stickPointer=null;

  function steer(event) {
    const rect=joystick.getBoundingClientRect();
    const x=(event.clientX-rect.left-rect.width/2)/(rect.width*0.33);
    const z=(event.clientY-rect.top-rect.height/2)/(rect.height*0.33);
    const length=Math.hypot(x,z);
    const scale=length<0.12 ? 0 : clamp((length-0.12)/0.88,0,1)/length;
    axes.x=x*scale;
    axes.z=z*scale;
    knob.style.setProperty('--knob-x',`${axes.x*rect.width*0.24}px`);
    knob.style.setProperty('--knob-y',`${axes.z*rect.height*0.24}px`);
  }
  function release() {
    stickPointer=null;
    axes.x=axes.z=0;
    knob.style.removeProperty('--knob-x');
    knob.style.removeProperty('--knob-y');
  }
  joystick.addEventListener('pointerdown',(event)=>{
    if(!playing() || stickPointer!==null || event.button!==0) return;
    stickPointer=event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    steer(event);
  });
  joystick.addEventListener('pointermove',(event)=>{ if(event.pointerId===stickPointer) steer(event); });
  for(const name of ['pointerup','pointercancel','lostpointercapture']) {
    joystick.addEventListener(name,(event)=>{ if(event.pointerId===stickPointer) release(); });
  }
  const moves={
    ArrowLeft:[-1,0], KeyA:[-1,0], ArrowRight:[1,0], KeyD:[1,0],
    ArrowUp:[0,-1], KeyW:[0,-1], ArrowDown:[0,1], KeyS:[0,1],
  };
  window.addEventListener('keydown',(event)=>{
    if(!playing())return;
    if(event.code in moves) {
      event.preventDefault();
      if(event.repeat&&!held.has(event.code))return;
      held.add(event.code);
    } else if(event.code==='Space' && event.target.tagName!=='BUTTON') {
      event.preventDefault();
      if(!event.repeat) grab();
    }
  });
  window.addEventListener('keyup',(event)=>held.delete(event.code));
  window.addEventListener('blur',()=>{held.clear();release();cancelDrag();});
  bindDeckButton($('grab-control'),grab);
  bindDeckButton($('coin-insert'),insertCoin);
  bindDeckButton($('restock'),restock);

  const depthKey='toy-park-3d-depth';
  let depthLevel=2;
  try{
    const saved=Number(localStorage.getItem(depthKey));
    if(saved===1||saved===2||saved===3)depthLevel=saved;
  }catch{/* Use default enhanced 3D strength when storage is unavailable. */}
  const gaze={x:0,y:0,distance:1,depth:depthLevel};
  const target={x:0,y:0,distance:1};
  let depthChanged=false;
  const depthLabels={1:'标准',2:'增强',3:'超强'};
  function syncDepthUI(){
    const label=$('depth-level');
    if(label)label.textContent=depthLabels[depthLevel];
    for(const btn of document.querySelectorAll('.depth-pill')){
      const active=Number(btn.dataset.depth)===depthLevel;
      btn.setAttribute('aria-pressed',String(active));
    }
  }
  for(const btn of document.querySelectorAll('.depth-pill')){
    btn.addEventListener('click',()=>{
      const next=Number(btn.dataset.depth);
      if(next!==1&&next!==2&&next!==3)return;
      depthLevel=next;gaze.depth=next;depthChanged=true;
      syncDepthUI();
      try{localStorage.setItem(depthKey,String(next));}catch{}
      if(!tracking)temporaryNotice('3D 灵敏度：'+depthLabels[next]);
    });
  }
  syncDepthUI();
  let tracking=false;
  const hasCamera = typeof window.BudNative?.setCameraEnabled === 'function';
  let trackingWanted=hasCamera;
  const tracker=headTracker();
  let lastSeen=-Infinity;
  let drag=null;
  let requested=0;
  let noticeUntil=0;
  let dismissedOptionsPointer=null;
  const trackingListeners=new Set();
  const notifyTracking=()=>{for(const fn of trackingListeners)fn(tracking);};
  const options=$('view-options'),optionsButton=$('view-tools-toggle');
  function closeOptions(returnFocus=false){
    if(options.hidden)return;
    options.hidden=true;optionsButton.setAttribute('aria-expanded','false');
    if(returnFocus)optionsButton.focus({preventScroll:true});
  }
  optionsButton.onclick=()=>{
    options.hidden=!options.hidden;optionsButton.setAttribute('aria-expanded',String(!options.hidden));
  };
  document.addEventListener('pointerdown',event=>{
    if(!options.hidden&&!options.contains(event.target)&&!optionsButton.contains(event.target)){
      dismissedOptionsPointer=event.pointerId;
      closeOptions();
    }
  },true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!options.hidden){event.stopPropagation();event.preventDefault();closeOptions(true);}
  },true);
  document.addEventListener('focusin',event=>{
    if(!options.contains(event.target)&&event.target!==optionsButton)closeOptions();
  });
  function center() {
    if(tracking && performance.now()-lastSeen<700)tracker.calibrate();
    else {tracker.reset();lastSeen=-Infinity;}
    Object.assign(target,{x:0,y:0,distance:1});
  }
  function viewStatus(message,mode) {
    const badge=$('view-mode');
    badge.hidden=!message;
    badge.dataset.mode=mode;
    if($('view-label').textContent!==message) $('view-label').textContent=message;
  }
  function temporaryNotice(message) {
    noticeUntil=performance.now()+2600;
    viewStatus(message,'manual');
  }
  $('center').addEventListener('click',()=>{
    center();
    if(!tracking) temporaryNotice('视角已回正');
  });
  viewport.addEventListener('pointerdown',(event)=>{
    if(dismissedOptionsPointer===event.pointerId){dismissedOptionsPointer=null;return;}
    if(event.target.closest('button') || drag || event.button!==0) return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,ox:target.x,oy:target.y,moved:false};
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove',(event)=>{
    if(drag?.id!==event.pointerId) return;
    const dx=event.clientX-drag.x, dy=event.clientY-drag.y;
    if(Math.hypot(dx,dy)>7) drag.moved=true;
    if(!drag.moved || tracking) return;
    viewport.classList.add('dragging');
    target.x=clamp(drag.ox+dx/viewport.clientWidth*18.0,-7.0,7.0);
    target.y=clamp(drag.oy-dy/viewport.clientHeight*9.5,-2.6,3.6);
  });
  function cancelDrag() { drag=null; viewport.classList.remove('dragging'); }
  viewport.addEventListener('pointerup',(event)=>{
    if(event.pointerId!==drag?.id) return;
    const wasTap=!drag.moved && Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<=7;
    cancelDrag();
    if(wasTap) aim(event.clientX,event.clientY);
  });
  for(const name of ['pointercancel','lostpointercapture']) {
    viewport.addEventListener(name,(event)=>{ if(event.pointerId===drag?.id) cancelDrag(); });
  }
  function cameraUI() {
    $('camera').setAttribute('aria-pressed',String(tracking));
    $('camera-label').textContent=tracking?'关闭探头':'开启探头';
    const centerLabel=tracking?'校准视角':'视角回正';
    $('center').setAttribute('aria-label',centerLabel);
    $('center').title=centerLabel;
    $('center-label').textContent=centerLabel;
    viewStatus(tracking?'看向屏幕，平板放稳':'',tracking?'wait':'manual');
    notifyTracking();
  }
  function setTracking(enabled) {
    cancelDrag();tracking=enabled;
    tracker.reset();lastSeen=-Infinity;noticeUntil=0;requested=performance.now();
    Object.assign(target,{x:0,y:0,distance:1});cameraUI();
    window.BudNative.setCameraEnabled(enabled);
  }
  if(hasCamera) {
    $('camera').hidden=false;
    $('camera').addEventListener('click',()=>{trackingWanted=!tracking;setTracking(trackingWanted);});
    window.BudCamera={
      sample(x,y,span,rotation,capturedAt) {
        if(!tracking)return;
        const now=performance.now();
        if(tracker.sample(x,y,span,rotation,capturedAt??now))lastSeen=now;
      },
      state(kind) {
        if(!tracking) return;
        if(kind==='unavailable' || kind==='denied') {
          tracking=false;trackingWanted=false;
          tracker.reset();lastSeen=-Infinity;
          center(); cameraUI();
          temporaryNotice('可以用手拖动画面换角度');
        } else if(kind==='starting') {
          tracker.reset();lastSeen=-Infinity;
          Object.assign(target,{x:0,y:0,distance:1});
          requested=performance.now();
          cameraUI();
        }
      },
    };
  }
  function updateView(now,dt) {
    if(tracking) {
      if(now-lastSeen<700) {
        Object.assign(target,tracker.pose);
        if($('view-mode').dataset.mode!=='live') viewStatus('探头视角','live');
      } else if(now-requested>1200 && $('view-mode').dataset.mode!=='lost') {
        Object.assign(target,gaze);
        viewStatus('请看向屏幕','lost');
      }
    } else if(noticeUntil && now>=noticeUntil) {
      noticeUntil=0; viewStatus('','manual');
    }
    let moving=depthChanged;
    depthChanged=false;
    for(const axis of ['x','y','distance']) {
      const delta=target[axis]-gaze[axis];
      if(delta!==0) {
        const speed=tracking?(axis==='x'?72:axis==='y'?62:6.8):28;
        let step=delta*(1-Math.exp(-dt*speed));
        if(tracking){
          const maxStep=dt*(axis==='x'?120:axis==='y'?80:.80);
          step=clamp(step,-maxStep,maxStep);
        }
        gaze[axis]=Math.abs(delta)<0.0003?target[axis]:gaze[axis]+step;
        moving=true;
      }
    }
    return moving;
  }
  const pad=createGamepad({
    onConnect(){if(!tracking)temporaryNotice('手柄已连接');},
    onDisconnect(){if(!tracking)temporaryNotice('手柄已断开');},
    onGrab:grab,
    onCoinOrRestock(){
      if(!$('coin-insert').hidden&&!$('coin-insert').disabled)insertCoin();
      else if(!$('restock').hidden&&!$('restock').disabled)restock();
    },
    onToggleGuide:toggleGuide,
    onPrevBay:prevBay,
    onNextBay:nextBay,
    onOpenOutlet:openOutlet,
    onCenter(){center();if(!tracking)temporaryNotice('视角已回正');},
    onBack:back,
    onMenuNav:menuNav,
    onMenuConfirm:menuConfirm,
    playing,
    inMenu,
    inWin,
    tracking:()=>tracking,
    onPeek(dx,dy){
      target.x=clamp(target.x+dx*11.5,-7.0,7.0);
      target.y=clamp(target.y+dy*6.8,-2.6,3.6);
    },
  });
  let padDrivingKnob=false;
  function pollGamepad(now,dt){
    const active=pad.poll(now,dt);
    if(stickPointer===null){
      if(active){
        const rect=joystick.getBoundingClientRect();
        knob.style.setProperty('--knob-x',`${pad.move.x*rect.width*0.24}px`);
        knob.style.setProperty('--knob-y',`${pad.move.z*rect.height*0.24}px`);
        padDrivingKnob=true;
      }else if(padDrivingKnob){
        knob.style.removeProperty('--knob-x');
        knob.style.removeProperty('--knob-y');
        padDrivingKnob=false;
      }
    }
    return active;
  }
  function movement() {
    let x=axes.x+pad.move.x, z=axes.z+pad.move.z;
    for(const key of held) { x+=moves[key][0]; z+=moves[key][1]; }
    const length=Math.max(1,Math.hypot(x,z));
    return {x:x/length,z:z/length};
  }
  function releaseMovement(){held.clear();release();cancelDrag();}
  function pauseForMenu(){
    closeOptions();
    releaseMovement();
    if(tracking)setTracking(false);
    center();Object.assign(gaze,{x:0,y:0,distance:1});viewStatus('','manual');
  }
  function resumeAfterMenu(){
    if(hasCamera&&trackingWanted&&!tracking)setTracking(true);
  }
  return {
    gaze,updateView,pollGamepad,rumble:pad.rumble,movement,releaseMovement,pauseForMenu,resumeAfterMenu,
    hasCamera:()=>hasCamera,
    isTracking:()=>tracking,
    toggleTracking(){if(hasCamera){trackingWanted=!tracking;setTracking(trackingWanted);}},
    startMedalTracking(){if(hasCamera&&trackingWanted&&!tracking)setTracking(true);},
    stopMenuTracking(){if(tracking){setTracking(false);Object.assign(gaze,{x:0,y:0,distance:1});viewStatus('','manual');}},
    onTrackingChange(fn){trackingListeners.add(fn);fn(tracking);}
  };
}
