import portraits from './assets/medal-portraits.webp';
import {MEDALS} from './medal-series.js';
import {PRIZES} from './library.js';
import {THEMES} from './themes.js';
import {syncBoards} from './stock.js';
import {medalUrl} from './scene-art.js';

const $=id=>document.getElementById(id);
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const series=Object.keys(MEDALS).sort((a,b)=>MEDALS[a].number-MEDALS[b].number);
const printed=id=>String(MEDALS[id].number).padStart(3,'0');
const toyName=id=>PRIZES[MEDALS[id].kind].name;
function span(className,words){
  const el=document.createElement('span');el.className=className;
  if(words!==undefined)el.textContent=words;
  return el;
}
function tint(el,id){
  const {number,ink,foil}=MEDALS[id],index=number-1;
  el.style.setProperty('--ink',ink);el.style.setProperty('--foil',foil);
  if(number<=12){
    el.classList.remove('custom-medal');
    el.style.setProperty('--atlas-x',(index%4)*100/3+'%');
    el.style.setProperty('--atlas-y',Math.floor(index/4)*50+'%');
  }else{
    el.classList.add('custom-medal');
    el.style.setProperty('--medal-art','url("'+medalUrl(id)+'")');
    el.style.setProperty('--atlas-x',((index%8)*14).toFixed(2)+'%');
    el.style.setProperty('--atlas-y',(Math.floor(index/8)*30).toFixed(2)+'%');
  }
}
function constellation(id){
  const grid=span('medal-dots');
  for(let i=1;i<=series.length;i++)grid.append(span(i===MEDALS[id].number?'lit':''));
  return grid;
}
function face(side){
  const el=span('medal-face medal-'+side);el.setAttribute('aria-hidden','true');return el;
}
function applyPose(card,x,y,gazeMode){
  card.classList.toggle('is-gaze',gazeMode);
  const yawMax=gazeMode?19:13,rollMax=gazeMode?12:9,panX=gazeMode?10.5:6.5,panY=gazeMode?7.5:5;
  card.style.setProperty('--roll',(-y*rollMax).toFixed(2)+'deg');
  card.style.setProperty('--yaw',(x*yawMax).toFixed(2)+'deg');
  card.style.setProperty('--pan-x',(x*panX).toFixed(2)+'px');
  card.style.setProperty('--pan-y',(y*panY).toFixed(2)+'px');
  card.style.setProperty('--glint-x',(50+x*45).toFixed(1)+'%');
  card.style.setProperty('--glint-y',(45+y*40).toFixed(1)+'%');
}
function clearPose(card){
  card.classList.remove('is-gaze');
  for(const v of ['--roll','--yaw','--pan-x','--pan-y','--glint-x','--glint-y'])card.style.removeProperty(v);
}
function makeCard(id,count){
  const card=document.createElement('button');card.type='button';card.className='foil-card';tint(card,id);
  const body=span('medal-body'),front=face('front'),back=face('back');
  const label=span('medal-imprint','通关纪念牌'),name=span('medal-name',toyName(id));
  front.append(span('medal-orbit'),span('medal-sheen'),span('medal-hero'),span('medal-seal','✦'),label,
    name,span('medal-stage',THEMES[id].name),span('medal-serial','No. '+printed(id)),constellation(id));
  back.append(span('medal-sheen'),span('medal-imprint','口袋抓娃乐园'),span('medal-seal','✦'),
    span('medal-back-no','No.'),span('medal-back-number',printed(id)),span('medal-back-name',THEMES[id].name),
    span('medal-back-earned','已通关 '+count+' 次'),constellation(id));
  body.append(front,back);card.append(body);
  let flipped=false,drag=null,hovering=false,ignoreClick=false;
  function describe(){
    card.setAttribute('aria-label',toyName(id)+'通关纪念牌，'+(flipped?'背面，已通关 '+count+' 次，轻点看正面':'正面，轻点看背面'));
    card.setAttribute('aria-pressed',String(flipped));
  }
  describe();
  function aim(event){
    if(reduced.matches)return;
    const box=card.getBoundingClientRect();
    const axis=(p,start,size)=>clamp(2*(p-start)/size-1,-1,1);
    applyPose(card,axis(event.clientX,box.left,box.width),axis(event.clientY,box.top,box.height),false);
  }
  card.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0)return;
    ignoreClick=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY};card.setPointerCapture(e.pointerId);aim(e);
  });
  card.addEventListener('pointermove',e=>{
    if(!e.isPrimary)return;
    if(drag&&drag.id===e.pointerId&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)ignoreClick=true;
    if(drag){aim(e);}else if(e.pointerType==='mouse'){hovering=true;aim(e);}
  });
  function end(e){
    if(drag?.id!==e.pointerId)return;
    if(e.type==='pointercancel')ignoreClick=true;
    drag=null;clearPose(card);
  }
  card.addEventListener('pointerup',end);card.addEventListener('lostpointercapture',end);card.addEventListener('pointercancel',end);
  card.addEventListener('pointerleave',()=>{hovering=false;if(!drag)clearPose(card);});
  card.addEventListener('blur',()=>{hovering=false;clearPose(card);});
  card.addEventListener('click',e=>{
    if(e.detail&&ignoreClick){ignoreClick=false;return;}
    flipped=!flipped;card.classList.toggle('is-flipped',flipped);describe();
  });
  return {
    el:card,
    applyGaze(nx,ny){
      if(reduced.matches||drag||hovering)return;
      applyPose(card,flipped?-nx:nx,ny,true);
    },
    clearGaze(){
      if(!drag&&!hovering&&card.classList.contains('is-gaze'))clearPose(card);
    }
  };
}

export function createMedalWall(boards,enter,camera={},onWallClose=()=>{}){
  const dialog=$('medal-wall'),grid=$('wall-grid'),display=$('wall-display'),detail=$('wall-detail');
  const winCam=$('win-camera'),wallCam=$('wall-camera');
  for(const mount of [dialog,$('win-medal')])mount.style.setProperty('--medal-atlas','url("'+portraits+'")');
  let selected=null,opener=null,winCard=null,wallCard=null;
  const hasCam=Boolean(camera.hasCamera?.());
  if(hasCam){
    winCam.hidden=false;
    winCam.onclick=()=>camera.toggleTracking?.();
    wallCam.onclick=()=>camera.toggleTracking?.();
    camera.onTrackingChange?.(on=>{
      winCam.setAttribute('aria-pressed',String(on));
      winCam.textContent=on?'◎ 关闭 3D':'◎ 裸眼 3D';
      wallCam.setAttribute('aria-pressed',String(on));
      wallCam.textContent=on?'◎ 关闭裸眼 3D':'◎ 开启裸眼 3D';
      $('win-gesture').textContent=on?'左右挪头看立体悬浮，轻点翻面':'拖动看镭射光，轻点翻面';
      if(selected&&boards[selected].clears){
        $('wall-caption').textContent=THEMES[selected].name+'已通关 '+boards[selected].clears+' 次。'+(on?'左右挪头看立体悬浮，轻点翻面。':'拖动看镭射光，轻点翻面。');
      }
      if(!on){winCard?.clearGaze();wallCard?.clearGaze();}
    });
  }
  function summary(){
    const lit=series.filter(id=>boards[id].clears>0).length,total=series.reduce((n,id)=>n+boards[id].clears,0);
    $('wall-summary').textContent='已点亮 '+lit+' / '+series.length+' 款　·　共 '+total+' 枚';
  }
  function drawGrid(){
    const fragment=document.createDocumentFragment();
    for(const id of series){
      const n=boards[id].clears,slot=document.createElement('button');slot.type='button';slot.className='medal-slot';slot.dataset.stage=id;
      slot.classList.toggle('earned',n>0);tint(slot,id);
      slot.setAttribute('aria-label',THEMES[id].name+'，'+toyName(id)+'，'+(n?'已获得 '+n+' 枚':'待点亮'));
      const miniature=span('small-medal');miniature.setAttribute('aria-hidden','true');
      miniature.append(span('slot-orbit'),span('slot-hero'),span('slot-no',printed(id)),span('slot-seal','✦'));
      if(n>1)miniature.append(span('slot-count','×'+n));
      slot.append(miniature,span('slot-title',THEMES[id].name),span('slot-state',n?toyName(id):'待点亮'));
      slot.addEventListener('click',()=>inspect(id));fragment.append(slot);
    }
    grid.replaceChildren(fragment);summary();
  }
  function inspect(id){
    selected=id;const count=boards[id].clears;display.hidden=true;detail.hidden=false;
    $('wall-title').textContent=count?'查看纪念牌':'待点亮的纪念牌';
    $('wall-edition').textContent='馆藏编号　'+printed(id);
    $('wall-stage').textContent=count?toyName(id):THEMES[id].name;
    $('wall-caption').textContent=count?THEMES[id].name+'已通关 '+count+' 次。'+(camera.isTracking?.()?'左右挪头看立体悬浮，轻点翻面。':'拖动看镭射光，轻点翻面。'):'在这一关抓满 6 件玩具，就能点亮「'+toyName(id)+'」纪念牌。';
    $('wall-play').hidden=false;
    wallCam.hidden=!hasCam||!count;
    if(count){
      wallCard=makeCard(id,count);$('wall-medal').replaceChildren(wallCard.el);
      camera.startMedalTracking?.();
    }else{
      wallCard=null;
      const outline=span('locked-medal');tint(outline,id);outline.setAttribute('aria-hidden','true');
      outline.append(span('slot-hero'),span('locked-number','No. '+printed(id)));$('wall-medal').replaceChildren(outline);
    }
    (count?$('wall-medal').firstElementChild:$('wall-play')).focus({preventScroll:true});
  }
  function list(){
    const prior=selected;selected=null;wallCard=null;$('wall-title').textContent='我的成就墙';
    detail.hidden=true;display.hidden=false;$('wall-medal').replaceChildren();drawGrid();
    onWallClose();
    if(prior)grid.querySelector('[data-stage="'+prior+'"]')?.focus({preventScroll:true});
  }
  function open(button){
    opener=button||document.activeElement;
    syncBoards(boards);selected=null;wallCard=null;list();dialog.showModal();display.scrollTop=0;$('wall-close').focus({preventScroll:true});
  }
  $('wall-open').onclick=()=>open($('wall-open'));$('win-wall').onclick=()=>open($('win-wall'));
  $('wall-back').onclick=list;$('wall-close').onclick=()=>dialog.close();
  $('wall-play').onclick=()=>{const id=selected;dialog.close();enter(id);};
  dialog.addEventListener('cancel',e=>{if(selected){e.preventDefault();list();}});
  dialog.addEventListener('close',()=>{
    $('wall-medal').replaceChildren();selected=null;wallCard=null;
    onWallClose();
    if(opener&&!document.hidden&&opener.isConnected)opener.focus({preventScroll:true});
  });
  window.addEventListener('storage',e=>{
    if(dialog.open&&(e.key==='toy-park-v2'||e.key===null)){
      syncBoards(boards);if(selected){summary();inspect(selected);}else drawGrid();
    }
  });
  function activeCard(){
    if(dialog.open&&!detail.hidden&&wallCard)return wallCard;
    if(!$('win').hidden&&winCard)return winCard;
    return null;
  }
  return {
    celebrate(id,fresh){
      const n=boards[id].clears;
      winCard=makeCard(id,n);
      $('win-medal').replaceChildren(winCard.el);$('win-medal').classList.toggle('just-earned',fresh);
      $('win-note').textContent=fresh?(n===1?'第一次通关！这枚纪念牌已经挂上成就墙。':'又通关啦！这是你获得的第 '+n+' 枚「'+toyName(id)+'」。'):'你已获得 '+n+' 枚「'+toyName(id)+'」纪念牌。';
    },
    clearWin(){winCard=null;},
    isViewing:()=>Boolean(activeCard()),
    updateGaze(gaze,tracking){
      const card=activeCard();
      if(!card)return;
      if(!tracking){card.clearGaze();return;}
      const gain=gaze.depth===3?1.85:gaze.depth===2?1.40:1.0;
      const nx=clamp(gaze.x*gain/4.8,-1,1),ny=clamp(-gaze.y*gain/1.85,-1,1);
      card.applyGaze(nx,ny);
    }
  };
}
