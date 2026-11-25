import {MAX_COINS} from './wallet.js';

export function bindCatchSettings(wallet,canOpen){
  const $=id=>document.getElementById(id),dialog=$('parent-settings'),opener=$('parent-open');
  const range=$('catch-percent'),value=$('catch-value'),limit=$('coin-limit'),amount=$('allowance');
  const pin=$('parent-pin'),confirm=$('pin-confirm'),form=$('pin-form');
  let screen='unlock',proof=null,session=0,editedAmount=false,deviceRequest=0,deviceVerified=false;
  const groupCode=code=>code.match(/.{1,4}/g).join('-');
  function recoveryNote(code){
    $('recovery-note').textContent=code?'家长请单独保存此恢复码，忘记 PIN 时使用。 '+groupCode(code):'';
    $('recovery-note').hidden=!code;
  }

  function error(message=''){
    $('parent-error').textContent=message;$('parent-error').hidden=!message;
  }
  function chance(){
    value.textContent=range.value+'%';range.setAttribute('aria-valuetext',value.textContent);
    $('chance-down').disabled=range.valueAsNumber===0;$('chance-up').disabled=range.valueAsNumber===100;
  }
  function showLimit(){
    $('allowance-row').hidden=!limit.checked;
    $('coin-help').textContent=limit.checked?'1 枚可抓 1 次，所有机台共用。改次数会替换当前余额，用完后等家长再发。':'关闭时可以自由玩。开启后，每投一枚游戏币可以下爪一次。';
  }
  function gate(next){
    screen=next;error();form.hidden=false;$('parent-controls').hidden=true;
    $('recover-options').hidden=next!=='unlock'&&next!=='damaged';
    $('recover-device').hidden=!window.BudNative?.confirmParent;
    $('recover-code-row').hidden=next!=='reset-code';
    $('recover-code').value='';
    pin.value='';confirm.value='';$('confirm-row').hidden=next==='unlock';
    form.hidden=next==='damaged';
    $('pin-intro').textContent=next==='unlock'?'输入家长的 4 位数字 PIN。':next==='create'?'首次使用，请在这里设一个只有家长知道的 4 位数字 PIN。':'设置新的 4 位数字 PIN。';
    $('pin-label').textContent=next==='unlock'?'家长 PIN':'新的 PIN';
    $('pin-submit').textContent=next==='unlock'?'解锁':'确认 PIN';
    $('pin-submit').disabled=false;pin.focus({preventScroll:true});
  }
  function settings(){
    const state=wallet.info();
    screen='settings';form.hidden=true;$('parent-controls').hidden=false;$('recover-options').hidden=true;pin.value='';confirm.value='';
    recoveryNote(wallet.takeNewCode());
    limit.checked=state.limited;amount.value=String(state.limited?state.coins:5);
    editedAmount=false;range.value=String(state.chance);chance();showLimit();error();
    $('parent-save').disabled=false;limit.focus({preventScroll:true});
  }
  opener.addEventListener('click',async()=>{
    if(!canOpen()||dialog.open)return;
    const ticket=++session;proof=null;
    await wallet.sync();if(ticket!==session||!canOpen()||document.hidden)return;
    dialog.showModal();gate(wallet.info().hasPin?'unlock':'create');
    if(!wallet.info().ready){gate('damaged');error('钱包暂时无法读取。可以重试，或验证家长身份后重设 PIN。玩具收藏单独保存。');}
    if(!globalThis.crypto?.subtle){error('请用本机离线版、localhost 或 HTTPS 打开家长设置。');$('pin-submit').disabled=true;}
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();if($('pin-submit').disabled)return;
    const ticket=session,action=screen;
    if(!/^\d{4}$/.test(pin.value)){error('请输入 4 位数字。');pin.focus();return;}
    if(action!=='unlock'&&pin.value!==confirm.value){error('两次输入不同，请再确认一次。');confirm.select();return;}
    $('pin-submit').disabled=true;error();
    try{
      let token;
      if(action==='unlock')token=await wallet.unlock(pin.value);
      else if(action==='reset-code'||action==='reset-device'){
        if(action==='reset-device'&&!deviceVerified)throw Error('请先验证本机锁屏身份。');
        token=await wallet.recoverPin(pin.value,{code:$('recover-code').value,device:action==='reset-device'&&deviceVerified});
        deviceVerified=false;
      }else token=await wallet.setPin(pin.value,proof);
      if(ticket===session&&dialog.open){proof=token;settings();}
    }catch(e){if(ticket===session&&dialog.open){error(e.message||'暂时无法保存，请重试。');pin.select();}}
    finally{if(ticket===session)$('pin-submit').disabled=false;}
  });
  limit.addEventListener('change',showLimit);amount.addEventListener('input',()=>{editedAmount=true;error();});
  range.addEventListener('input',chance);
  $('chance-down').addEventListener('click',()=>{range.stepDown();chance();});
  $('chance-up').addEventListener('click',()=>{range.stepUp();chance();});
  $('change-pin').addEventListener('click',()=>{if(proof)gate('change');});
  $('renew-recovery').onclick=async()=>{
    const ticket=session;
    try{const code=await wallet.renewRecovery(proof);if(ticket===session)recoveryNote(code);}
    catch{if(ticket===session)error('恢复码暂时无法生成，请重试。');}
  };
  $('recover-key').onclick=()=>gate('reset-code');
  $('recover-retry').onclick=async()=>{
    const ticket=session;await wallet.sync();
    if(ticket===session&&wallet.info().ready)gate(wallet.info().hasPin?'unlock':'create');
    else if(ticket===session)error('仍无法读取钱包，请用恢复码或本机锁屏验证。');
  };
  $('recover-device').onclick=()=>{
    if(!deviceRequest&&dialog.open){deviceRequest=session;window.BudNative?.confirmParent?.(deviceRequest);}
  };
  window.ParkParent={confirmed(ticket,ok){
    if(ticket!==deviceRequest||ticket!==session||!dialog.open)return;
    deviceRequest=0;deviceVerified=!!ok;
    if(ok)gate('reset-device');else error('本机锁屏验证未完成，也可以使用家长恢复码。');
  }};
  $('parent-save').addEventListener('click',async()=>{
    if(!proof||screen!=='settings'||$('parent-save').disabled)return;
    const ticket=session,coins=amount.valueAsNumber;
    if(limit.checked&&(!Number.isInteger(coins)||coins<0||coins>MAX_COINS)){error('次数可以填 0 到 '+MAX_COINS+' 的整数。');amount.focus();return;}
    $('parent-save').disabled=true;
    try{
      await wallet.settings(proof,{limited:limit.checked,chance:range.valueAsNumber,coins,replace:editedAmount});
      if(ticket===session&&dialog.open)dialog.close();
    }catch(e){if(ticket===session)error(e.message||'保存失败，请重试。');}
    finally{if(ticket===session)$('parent-save').disabled=false;}
  });
  for(const id of ['parent-cancel','parent-close'])$(id).addEventListener('click',()=>dialog.close());
  function lock(){++session;proof=null;deviceRequest=0;deviceVerified=false;pin.value='';confirm.value='';$('recover-code').value='';recoveryNote(null);$('parent-controls').hidden=true;}
  dialog.addEventListener('close',()=>{lock();if(!document.hidden)opener.focus({preventScroll:true});});
  function background(){if(dialog.open&&!deviceRequest){lock();dialog.close();}}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)background();});
  window.addEventListener('pagehide',background);
}
