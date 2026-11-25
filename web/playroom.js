import atlas from './assets/toy-portraits.webp';
import docks from './assets/delivery-docks.webp';
import {POOLS,PRIZES} from './library.js';
import {THEMES} from './themes.js';
import {REQUESTS} from './requests.js';
import {takeToy,moveToy,acceptRequest} from './keepsakes.js';
import {changeBoard,syncShelves} from './stock.js';
import {createToyView,playLabel} from './toy-view.js';

const $=id=>document.getElementById(id);
const catalog=Object.values(POOLS).flat();
function portrait(node,kind){
  const index=catalog.indexOf(kind);
  node.style.backgroundImage='url('+atlas+')';
  node.style.backgroundSize='800% '+Math.ceil(catalog.length/8)*100+'%';
  node.style.backgroundPosition=(index%8)*100/7+'% '+Math.floor(index/8)*100/(Math.ceil(catalog.length/8)-1)+'%';
}
export function createPlayroom(boards,sound,gameStage,available,stopMovement){
  const dialog=$('playroom'),door=$('outlet'),canvas=$('toy-view'),mission=$('request-open');
  let stage='town',tab='shelf',kind=null,pending=false,viewer,origin,showTicket=0,writing=false,drag=null;
  const sel=()=>boards[stage].shelf,recipe=()=>REQUESTS[stage];
  const count=s=>Object.values(s).reduce((a,b)=>a+b,0);
  const notice=msg=>{$('room-note').textContent=msg;$('room-note').hidden=!msg;};
  function sync(){
    const id=gameStage(),s=id&&boards[id].shelf,waiting=s?count(s.pending):0;
    door.classList.toggle('full',waiting>0);door.dataset.count=String(waiting);
    door.disabled=!id||!available();mission.disabled=door.disabled;
    door.setAttribute('aria-label',waiting?'打开取物口，'+waiting+' 件玩具待领':'打开玩具架');
    door.querySelector('.bin-label').textContent=waiting?'领玩具':'取物口';
    if(waiting)portrait(door.querySelector('.bin-toy'),Object.keys(s.pending)[0]);
    $('win-collect').hidden=!waiting;
    mission.querySelector('i').hidden=!s||!['accepted','delivery'].includes(s.request);
    const total=Object.values(boards).reduce((n,b)=>n+count(b.shelf.pending),0);
    const badge=$('shelf-count');badge.textContent=total?'待领 '+total:'';badge.hidden=!total;
    $('shelf-open').setAttribute('aria-label',total?'我的玩具架，'+total+' 件待领':'我的玩具架');
  }
  const stageIds=Object.keys(THEMES);
  const themeButtons=new Map();
  const tierNodes=new Map();
  for(const [id,t] of Object.entries(THEMES)){
    const b=document.createElement('button');b.type='button';b.textContent=t.name;b.dataset.theme=id;
    b.style.setProperty('--theme-color',t.base);
    b.onclick=()=>{
      if(writing)return;
      stage=id;
      if(tab==='shelf'){
        highlightStage();
        scrollToTier(id,true);
      }else{
        screen(tab==='detail'?'shelf':tab);
      }
    };
    $('shelf-stages').append(b);themeButtons.set(id,b);
  }
  function tile(id,n,awaiting,tierStage=stage){
    const b=document.createElement('button');b.type='button';b.className='toy-tile';b.dataset.kind=id;b.dataset.stage=tierStage;
    const img=document.createElement('span');img.className='portrait';portrait(img,id);
    const tag=document.createElement('strong');tag.textContent=PRIZES[id].name;
    b.setAttribute('aria-label',(awaiting?'领取':'玩')+tag.textContent+'，'+n+' 件');
    b.append(img,tag);
    if(n>1){const qty=document.createElement('small');qty.textContent='×'+n;b.append(qty);}
    b.onclick=()=>{stage=tierStage;inspect(id,awaiting);};return b;
  }
  function highlightStage(){
    $('room-theme').textContent=THEMES[stage].name;
    for(const [id,b] of themeButtons){
      b.setAttribute('aria-pressed',String(id===stage));const n=count(boards[id].shelf.pending);
      b.textContent=THEMES[id].name+(n?' · '+n:'');
    }
    for(const [id,tier] of tierNodes)tier.classList.toggle('is-current',id===stage);
    if(tab!=='detail'){
      const strip=$('shelf-stages'),bounds=strip.getBoundingClientRect(),selected=themeButtons.get(stage).getBoundingClientRect();
      if(selected.left<bounds.left+4)strip.scrollLeft+=selected.left-bounds.left-4;
      else if(selected.right>bounds.right-4)strip.scrollLeft+=selected.right-bounds.right+4;
    }
  }
  function scrollToTier(id,smooth=false){
    const tier=tierNodes.get(id),rack=$('owned-toys');
    if(!tier||!rack)return;
    const top=Math.max(0,tier.offsetTop-rack.offsetTop-14);
    if(smooth&&!matchMedia('(prefers-reduced-motion:reduce)').matches)rack.scrollTo({top,behavior:'smooth'});
    else rack.scrollTop=top;
  }
  let scrollRaf=0;
  $('owned-toys').addEventListener('scroll',()=>{
    if(tab!=='shelf'||scrollRaf)return;
    scrollRaf=requestAnimationFrame(()=>{
      scrollRaf=0;
      const rack=$('owned-toys'),anchor=rack.scrollTop+rack.clientHeight*.28;
      let visible=stage;
      for(const [id,tier] of tierNodes){
        const top=tier.offsetTop-rack.offsetTop;
        if(top<=anchor)visible=id;else break;
      }
      if(visible!==stage){stage=visible;highlightStage();}
    });
  },{passive:true});
  function shelf(jump=false){
    const tray=$('waiting-toys'),rack=$('owned-toys');tray.replaceChildren();rack.replaceChildren();tierNodes.clear();
    let totalOwned=0,totalPending=0;
    // Show current stage's pending toys first, followed by any other stages' pending toys.
    const pendingOrder=[stage,...stageIds.filter(id=>id!==stage)];
    for(const sid of pendingOrder){
      for(const [id,n] of Object.entries(boards[sid].shelf.pending)){
        totalPending+=n;tray.append(tile(id,n,true,sid));
      }
    }
    const crown=document.createElement('div');crown.className='bookcase-crown';crown.setAttribute('aria-hidden','true');
    rack.append(crown);
    stageIds.forEach((sid,index)=>{
      const t=THEMES[sid],s=boards[sid].shelf,poolCount=POOLS[sid].length,uniqueOwned=s.order.length,waitingHere=count(s.pending);
      totalOwned+=uniqueOwned;
      const tier=document.createElement('section');tier.className='shelf-tier';tier.dataset.stage=sid;
      tier.style.setProperty('--theme-color',t.base);
      if(sid===stage)tier.classList.add('is-current');
      if(uniqueOwned>=poolCount)tier.classList.add('is-complete');

      const landmark=document.createElement('div');landmark.className='tier-landmark';
      const emblem=document.createElement('span');emblem.className='landmark-icon';emblem.setAttribute('aria-hidden','true');
      emblem.style.backgroundImage='url('+docks+')';
      emblem.style.backgroundSize=stageIds.length*100+'% 200%';
      emblem.style.backgroundPosition=(index*100/(stageIds.length-1))+'% 0%';
      const name=document.createElement('strong');name.className='landmark-name';name.textContent=t.name;
      const meta=document.createElement('span');meta.className='landmark-meta';
      meta.textContent=uniqueOwned>=poolCount?'★ '+uniqueOwned+'/'+poolCount:uniqueOwned+' / '+poolCount;
      landmark.append(emblem,name,meta);
      if(waitingHere){
        const tag=document.createElement('em');tag.className='landmark-pending';tag.textContent='待领 '+waitingHere;
        landmark.append(tag);
      }

      const bay=document.createElement('div');bay.className='tier-toys';
      if(s.order.length){
        for(const id of s.order)bay.append(tile(id,s.owned[id],false,sid));
      }else{
        const empty=document.createElement('div');empty.className='tier-empty';
        empty.innerHTML='<span class="tier-slots" aria-hidden="true"><i></i><i></i><i></i></span><span>去这一关抓玩具来摆满吧</span>';
        bay.append(empty);
      }

      const ledge=document.createElement('div');ledge.className='tier-ledge';ledge.setAttribute('aria-hidden','true');
      tier.append(landmark,bay,ledge);
      rack.append(tier);
      tierNodes.set(sid,tier);
    });
    const base=document.createElement('div');base.className='bookcase-base';base.setAttribute('aria-hidden','true');
    rack.append(base);

    $('waiting-tray').hidden=!totalPending;
    $('empty-shelf').hidden=!!(totalPending||totalOwned);
    rack.hidden=false;
    if(jump)requestAnimationFrame(()=>scrollToTier(stage,false));
  }
  function requestCard(){
    const r=recipe(),state=sel().request,target=r.kind;
    portrait($('mission-toy'),target);$('mission-place').textContent=r.place;
    $('mission-line').textContent=r.line;$('read-request').setAttribute('aria-label','朗读图卡，'+r.line);
    const current={available:'',accepted:'已接下 · 抓到'+PRIZES[target].name+'后送到这里',delivery:'玩具在取物口，等你送达',complete:'已送达 ✓'};
    $('mission-status').textContent=current[state];const accept=$('accept-request');
    accept.hidden=state==='complete'||state==='accepted';
    accept.textContent=state==='delivery'?'打开取物口':'接下任务';
    $('mission-card').dataset.state=state;
  }
  function screen(next){
    ++showTicket;tab=next;endDrag();$('toy-stage').classList.remove('stowing');viewer?.hide();sound.stopSpeech();notice('');
    dialog.dataset.tab=tab;
    for(const part of ['shelf','request','detail'])$('room-'+part).hidden=part!==tab;
    $('room-tabs').hidden=tab==='detail';$('shelf-stages').hidden=tab==='detail';
    $('room-title').textContent=tab==='shelf'?'我的玩具架':'任务图卡';
    $('shelf-tab').setAttribute('aria-pressed',String(tab==='shelf'));$('request-tab').setAttribute('aria-pressed',String(tab==='request'));
    if(tab==='shelf')shelf(true);else if(tab==='request')requestCard();
    highlightStage();
  }
  function open(button,next,id=gameStage()||'town'){
    if(dialog.open||writing)return false;stopMovement();syncShelves(boards);origin=button;stage=id;
    dialog.showModal();screen(next);sync();return true;
  }
  function detailActions(){
    const s=sel(),delivery=pending&&s.request==='delivery'&&kind===recipe().kind;
    $('room-title').textContent=PRIZES[kind].name;$('play-toy').textContent=playLabel(kind);
    $('place-toy').hidden=!pending;$('place-toy').textContent=delivery?recipe().verb:stage==='town'?'停进车库':'摆上玩具架';
    $('carry-toy').hidden=!pending;
    $('toy-stage').dataset.place=delivery?'request':stage;
    $('toy-stage').dataset.theme=stage;$('toy-stage').dataset.parking=pending?'yes':'no';$('park-target').hidden=!pending;
    $('park-label').textContent=delivery?recipe().place:stage==='town'?'车库':'玩具架';
    const dock=$('park-target').querySelector('.dock-model');
    const stages=Object.keys(THEMES);
    dock.style.backgroundImage='url('+docks+')';dock.style.backgroundSize=stages.length*100+'% 200%';
    dock.style.setProperty('--dock-x',stages.indexOf(stage)*100/(stages.length-1)+'%');
    $('park-target').setAttribute('aria-label',$('place-toy').textContent);
    const pos=s.order.indexOf(kind);
    $('move-left').hidden=$('move-right').hidden=pending||s.order.length<2;
    $('move-left').disabled=pos<=0;$('move-right').disabled=pos<0||pos>=s.order.length-1;
  }
  async function inspect(id,awaiting){
    if(writing)return;
    screen('detail');kind=id;pending=awaiting;detailActions();
    const ticket=showTicket;canvas.dataset.ready='false';canvas.dataset.kind=id;
    try{
      if(!viewer){const surface=document.createElement('canvas');surface.setAttribute('aria-hidden','true');canvas.replaceChildren(surface);viewer=createToyView(surface);}
      if(await viewer.show(id)&&ticket===showTicket){canvas.dataset.ready='true';canvas.focus({preventScroll:true});}
    }catch{if(ticket===showTicket)notice('玩具暂时无法转动，仍可领取和摆放。');}
  }
  async function write(change,after){
    if(writing)return;writing=true;
    try{
      const done=await changeBoard(boards,stage,change);sync();await after(done);
    }catch{notice('这次没有存好，请再点一次。');}
    finally{writing=false;}
  }
  function outlet(button,id=gameStage()){
    if(!id||!available()||!open(button,'shelf',id))return;
    const first=Object.keys(sel().pending)[0];if(first){door.classList.add('opening');inspect(first,true);}
  }
  door.onclick=()=>outlet(door);$('win-collect').onclick=()=>outlet($('win-collect'));
  $('shelf-open').onclick=()=>open($('shelf-open'),'shelf',(gameStage()&&count(boards[gameStage()].shelf.pending)?gameStage():Object.keys(boards).find(id=>count(boards[id].shelf.pending)))||gameStage()||'town');
  mission.onclick=()=>{if(available())open(mission,'request');};
  $('shelf-tab').onclick=()=>{if(!writing)screen('shelf');};$('request-tab').onclick=()=>{if(!writing)screen('request');};
  $('room-close').onclick=()=>{if(!writing)dialog.close();};$('back-shelf').onclick=()=>{if(!writing)screen('shelf');};
  dialog.addEventListener('cancel',e=>{if(writing)e.preventDefault();});
  dialog.addEventListener('close',()=>{++showTicket;endDrag();viewer?.dispose();viewer=null;canvas.replaceChildren();sound.stopSpeech();door.classList.remove('opening');origin?.focus({preventScroll:true});});
  $('read-request').onclick=async()=>{const ticket=showTicket,ok=await sound.readRequest(stage);if(!ok&&ticket===showTicket)notice('语音暂时无法播放，请再点一次。');};
  $('accept-request').onclick=()=>{
    if(sel().request==='delivery'){inspect(recipe().kind,true);return;}
    write(b=>acceptRequest(b,stage),()=>requestCard());
  };
  $('place-toy').onclick=()=>{
    if(!pending)return;
    const delivery=sel().request==='delivery'&&kind===recipe().kind;
    write(b=>takeToy(b,stage,kind),async done=>{
      if(done&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
        $('toy-stage').classList.add('stowing');
        const stageRect=$('toy-stage').getBoundingClientRect(),dock=$('park-target').getBoundingClientRect();
        const dx=dock.left+dock.width*.5-(stageRect.left+canvas.offsetLeft+canvas.offsetWidth*.5);
        const transform=getComputedStyle(canvas).transform;
        if(stageRect.width&&canvas.offsetWidth){
          const ride=canvas.animate([{transform},{transform:'translate('+dx+'px,8%) scale(.15)',opacity:.15}],{duration:380,easing:'cubic-bezier(.4,0,.45,1)',fill:'forwards'});
          try{await ride.finished;}finally{ride.cancel();}
        }
      }
      screen('shelf');if(done){sound.effect('dock');notice(delivery?'已送到'+recipe().place+'，也摆进了你的收藏。':'摆好啦！');}
    }).finally(endDrag);
  };
  $('park-target').onclick=()=>$('place-toy').click();
  for(const [id,step] of [['move-left',-1],['move-right',1]])$(id).onclick=()=>write(b=>moveToy(b.shelf,kind,step),()=>{detailActions();notice('已换位置');});
  function play(){if(canvas.dataset.ready==='true'){viewer.play();sound.effect('tap');}}
  $('play-toy').onclick=play;$('turn-toy').onclick=()=>viewer?.rotate(Math.PI/3);
  function endDrag(){
    clearTimeout(drag?.timer);drag=null;
    $('toy-stage').classList.remove('carrying','over-dock');
    for(const property of ['--carry-x','--carry-y','--carry-scale'])canvas.style.removeProperty(property);
  }
  function overDock(x,y){
    const r=$('park-target').getBoundingClientRect();
    return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
  }
  const handle=$('carry-toy');
  for(const control of [canvas,handle]){
    control.onpointerdown=e=>{
      if(e.button!==0||drag||writing||canvas.dataset.ready!=='true')return;
      e.preventDefault();
      const r=canvas.getBoundingClientRect();
      control.setPointerCapture(e.pointerId);
      drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,
        centerX:r.left+r.width/2,centerY:r.top+r.height/2,moved:false,carry:control===handle};
      const lift=()=>{if(drag&&pending){drag.carry=true;$('toy-stage').classList.add('carrying');}};
      if(drag.carry)lift();else if(pending)drag.timer=setTimeout(lift,360);
    };
    control.onpointermove=e=>{
      if(e.pointerId!==drag?.id)return;
      const x=e.clientX-drag.startX,y=e.clientY-drag.startY;
      if(Math.hypot(x,y)>6){drag.moved=true;clearTimeout(drag.timer);}
      if(drag.carry){
        const follow=Math.min(1,Math.hypot(x,y)/48),over=overDock(e.clientX,e.clientY);
        canvas.style.setProperty('--carry-x',((e.clientX-drag.centerX)*follow)+'px');
        canvas.style.setProperty('--carry-y',((e.clientY-drag.centerY)*follow)+'px');
        canvas.style.setProperty('--carry-scale',over?'.64':'1');
        $('toy-stage').classList.toggle('over-dock',over);
      }else if(drag.moved)viewer?.rotate((drag.x-e.clientX)*.012,(e.clientY-drag.y)*.008);
      drag.x=e.clientX;drag.y=e.clientY;
    };
    control.onpointerup=e=>{
      if(e.pointerId!==drag?.id)return;
      const place=drag.carry&&drag.moved&&overDock(e.clientX,e.clientY),tap=!drag.moved&&!drag.carry;
      clearTimeout(drag.timer);drag=null;
      if(place)$('place-toy').click();else {endDrag();if(tap)play();}
    };
    control.onpointercancel=endDrag;
    control.onlostpointercapture=()=>{if(drag)endDrag();};
  }
  handle.onclick=e=>{if(e.detail===0&&pending)$('place-toy').click();};
  canvas.onkeydown=e=>{if(['Enter','Space','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();if(e.code.startsWith('Arrow'))viewer?.rotate(e.code==='ArrowLeft'?-.24:.24);else if(!e.repeat)play();}};
  window.addEventListener('storage',e=>{if(e.key!=='toy-park-v2')return;syncShelves(boards);sync();
    if(dialog.open&&!writing){if(tab==='detail'&&pending&&!sel().pending[kind])screen('shelf');else if(tab==='shelf')shelf();else if(tab==='request')requestCard();}});
  function rattle(){
    door.classList.remove('rattle');void door.offsetWidth;door.classList.add('rattle');
  }
  return {sync,rattle,isOpen:()=>dialog.open};
}
