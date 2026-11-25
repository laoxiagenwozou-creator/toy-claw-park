import {DEFAULT_CATCH_PERCENT} from './grip.js';

const dbName='toy-park-family',storeName='family',key='local';
const mirror='last-good',recovery='parent-recovery';
const MAX_COINS=999;
const coinTimeoutMs=2200;
const maxTurn=2147483647;
export {MAX_COINS};

function firstAccount(){
  let raw;
  try{raw=localStorage.getItem('toy-park-catch-percent');}catch{/* Older settings may be unavailable. */}
  const chance=raw!==null&&raw!==undefined&&/^(100|[0-9]{1,2})$/.test(raw)&&Number(raw)%5===0?Number(raw):DEFAULT_CATCH_PERCENT;
  return {pin:null,chance,limited:false,coins:0,inserted:false};
}
function validate(account){
  if(typeof account.limited!=='boolean'||typeof account.inserted!=='boolean'||
     (account.coinRevision!==undefined&&(!Number.isInteger(account.coinRevision)||account.coinRevision<0||account.coinRevision>maxTurn))||
     (account.turnNumber!==undefined&&(!Number.isInteger(account.turnNumber)||account.turnNumber<1||account.turnNumber>maxTurn))||
     !Number.isInteger(account.coins)||account.coins<0||account.coins>MAX_COINS||
     !Number.isInteger(account.chance)||account.chance<0||account.chance>100||account.chance%5||
     (account.pin!==null&&(!/^[a-f0-9]{32}$/.test(account.pin?.salt)||!/^[a-f0-9]{64}$/.test(account.pin?.hash)))||
     (account.limited&&!account.pin)||(account.inserted&&(!account.limited||!account.coins)))throw Error('无法读取本机游戏币，请重新打开游戏。');
}
const hex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
const usable=value=>{try{validate(value);return true;}catch{return false;}};
function secure(){
  if(!globalThis.crypto?.subtle)throw Error('请用本机离线版、localhost 或 HTTPS 打开家长设置。');
  return globalThis.crypto;
}
const salt=()=>hex(secure().getRandomValues(new Uint8Array(16)));
const recoveryKey=()=>hex(secure().getRandomValues(new Uint8Array(10))).toUpperCase();
const recoveryHash=code=>secure().subtle.digest('SHA-256',new TextEncoder().encode(code)).then(hex);
async function pinHash(pin,salt){
  if(!/^\d{4}$/.test(pin))throw Error('请输入 4 位数字。');
  const material=await secure().subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
  const bytes=new Uint8Array(salt.match(/../g).map(pair=>parseInt(pair,16)));
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:bytes,iterations:180000},material,256));
}
function authorize(account,proof){
  if(!proof||account.pin?.hash!==proof)throw Error('请重新输入家长 PIN。');
}

// IndexedDB serializes read/modify/write of both the prepaid turn and the balance,
// including two tabs racing to spend the same last coin.
export function createWallet(onUpdate){
  let account=null,connection,message=null,newCode=null,hasRecovery=false;
  const native=globalThis.BudNative;
  const slot=typeof native?.currentCoinSlot==='function'?native:null;
  const channel=typeof BroadcastChannel==='function'?new BroadcastChannel(dbName):null;
  function slotState(raw){
    const state=JSON.parse(raw);
    if(!Array.isArray(state)||state.length!==5)throw Error('本机暂时无法读取游戏币。');
    const [revision,coins,limited,serial,applied]=state;
    return {revision,coins,limited,serial,applied};
  }
  function applySlot(a,state){
    if(state.revision<(a.coinRevision??0))return;
    a.coinRevision=state.revision;a.coins=state.coins;a.limited=state.limited;a.inserted=state.serial>0;
    if(state.serial)a.turnNumber=Math.abs(state.serial);
  }
  function open(){
    if(!connection)connection=new Promise((resolve,reject)=>{
      const request=indexedDB.open(dbName,1);
      request.onupgradeneeded=()=>request.result.createObjectStore(storeName);
      request.onsuccess=()=>{
        const db=request.result;
        db.onversionchange=()=>{db.close();connection=null;};
        db.onclose=()=>{connection=null;};
        resolve(db);
      };
      request.onerror=()=>reject(request.error);
    }).catch(error=>{connection=null;throw error;});
    return connection;
  }
  function transaction(edit,repair=false,timeoutMs=0){
    let timer,tx,expired=false;
    return new Promise((resolve,reject)=>{
      if(timeoutMs)timer=setTimeout(()=>{
        // Do not report a retry if a debit has already entered its commit phase.
        // Before that point a successful abort rolls back both wallet records.
        if(tx){try{tx.abort();}catch{return;}}
        expired=true;reject(Error('投币口暂时忙，请重试。'));
      },timeoutMs);
      open().then(db=>{
        if(expired)return;
        tx=db.transaction(storeName,'readwrite');
        const store=tx.objectStore(storeName);
        const read=store.get(key),copy=store.get(mirror),secret=store.get(recovery);
        let next,result,changed=false,problem,nextRecovery;
        secret.onsuccess=()=>{
          try{
            const disk=read.result,backup=copy.result;
            const security={hash:secret.result};hasRecovery=typeof security.hash==='string';
            let damaged=false;
            if(usable(disk))next=disk;
            else if(usable(backup))next=backup;
            else if(disk===undefined&&backup===undefined&&secret.result===undefined)next=firstAccount();
            else if(repair){next={...firstAccount(),limited:true,coins:0,inserted:false};damaged=true;}
            else throw Error('钱包需要由家长恢复。');
            const prior=JSON.stringify(next);
            if(slot){
              const state=slotState(slot.currentCoinSlot());
              if(damaged)next.coinRevision=state.revision+1;
              else applySlot(next,state);
            }
            if(edit){
              result=edit(next,security);
            }
            validate(next);
            const value=JSON.stringify(next);changed=value!==prior||security.hash!==secret.result;
            const initialized=disk!==undefined||backup!==undefined||changed;
            if(initialized&&(changed||value!==JSON.stringify(disk)))store.put(next,key);
            if(initialized&&(changed||value!==JSON.stringify(backup)))store.put(next,mirror);
            if(security.hash!==secret.result)store.put(security.hash,recovery);
            nextRecovery=typeof security.hash==='string';
          }catch(error){problem=error;tx.abort();}
        };
        tx.onabort=()=>reject(problem||tx.error||Error('游戏币保存失败，请重试。'));
        tx.oncomplete=()=>{
          // A parent's new allowance takes effect only after the protected edit
          // commits. An older database snapshot can never replace the live slot.
          if(slot){
            try{applySlot(next,slotState(slot.configureCoinSlot(next.coinRevision??0,next.coins,next.limited,next.inserted,next.turnNumber||0)));}
            catch(error){reject(error);return;}
          }
          account=next;hasRecovery=nextRecovery;message=null;
          resolve(result);
          onUpdate();
          if(changed)channel?.postMessage('update');
        };
      }).catch(reject);
    }).finally(()=>clearTimeout(timer));
  }
  async function sync(){
    try{await transaction();}catch{account=null;message='本机游戏币暂时无法读取';onUpdate();}
  }
  let mirroring=false,dirty=false;
  async function mirrorCoins(){
    dirty=true;if(mirroring)return;
    mirroring=true;
    do{
      dirty=false;
      try{await transaction();}catch{/* Durable slot is reconciled again on the next edit or restart. */}
    }while(dirty);
    mirroring=false;
  }
  function coinAction(insert){
    if(!account)return false;
    const revision=account.coinRevision??0;
    const raw=insert?slot.insertClawCoin(revision):slot.takeClawCoin(revision,account.inserted?account.turnNumber:0);
    const state=slotState(raw);
    applySlot(account,state);onUpdate();
    if(state.applied&&state.limited){channel?.postMessage('update');void mirrorCoins();}
    return state.applied;
  }
  if(channel)channel.onmessage=()=>{if(!slot||!document.hidden)void sync();};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
  const info=()=>({ready:!!account,error:message,hasPin:!!account?.pin,hasRecovery,limited:account?.limited??true,
    coins:account?.coins??0,inserted:account?.inserted??false,chance:account?.chance??DEFAULT_CATCH_PERCENT});
  return {
    sync,info,
    async unlock(pin){
      await sync();const credential=account?.pin;
      if(!credential)throw Error('请先设置家长 PIN。');
      const proof=await pinHash(pin,credential.salt);
      return transaction(current=>{
        if(current.pin?.hash!==proof)throw Error('PIN 不正确，再试一次。');
        return proof;
      });
    },
    async setPin(pin,proof){
      const pinSalt=salt(),hash=await pinHash(pin,pinSalt);
      const code=recoveryKey(),digest=await recoveryHash(code);
      const token=await transaction((current,security)=>{
        if(current.pin||proof)authorize(current,proof);
        current.pin={salt:pinSalt,hash};
        if(!security.hash){security.hash=digest;return {hash,created:true};}
        return {hash,created:false};
      });
      newCode=token.created?code:null;return token.hash;
    },
    takeNewCode(){const code=newCode;newCode=null;return code;},
    async renewRecovery(proof){
      const code=recoveryKey(),digest=await recoveryHash(code);
      await transaction((current,security)=>{authorize(current,proof);security.hash=digest;});
      return code;
    },
    async recoverPin(pin,{code,device}){
      const normalized=(code||'').replace(/[-\s]/g,'').toUpperCase();
      if(!device&&!/^[A-F0-9]{20}$/.test(normalized))throw Error('请输入完整的家长恢复码。');
      const digest=device?null:await recoveryHash(normalized);
      const pinSalt=salt(),hash=await pinHash(pin,pinSalt);
      const replacement=recoveryKey(),nextDigest=await recoveryHash(replacement);
      await transaction((current,security)=>{
        if(!device&&(!digest||digest!==security.hash))throw Error('恢复码不正确。');
        current.pin={salt:pinSalt,hash};security.hash=nextDigest;
      },true);
      newCode=replacement;return hash;
    },
    settings(proof,{limited,chance,coins,replace}){
      return transaction(a=>{
        authorize(a,proof);
        if(slot&&(a.limited!==limited||(limited&&replace)))a.coinRevision=(a.coinRevision??0)+1;
        if(limited&&(!a.limited||replace)){a.coins=coins;a.inserted=false;}
        if(!limited){a.coins=0;a.inserted=false;}
        a.limited=limited;a.chance=chance;
      });
    },
    async insert(){
      if(slot)return coinAction(true);
      return transaction(a=>{
        if(!a.limited||!a.coins||a.inserted)return false;
        a.inserted=true;return true;
      },false,coinTimeoutMs);
    },
    async spend(){
      if(slot)return coinAction(false);
      return transaction(a=>{
        if(!a.limited)return true;
        if(!a.inserted||!a.coins)return false;
        a.coins--;a.inserted=false;return true;
      },false,coinTimeoutMs);
    }
  };
}
