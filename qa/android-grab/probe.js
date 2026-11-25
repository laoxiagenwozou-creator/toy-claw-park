// Loaded by GrabProbe only, inside the disposable Android test package.
(() => {
  const get = id => document.getElementById(id);
  const probe = window.grabProbe = {arm:null, bayX:0, trace:[], events:[], errors:[], minY:Infinity, start:0, firstDrop:null};
  const names = new WeakMap(), gl = WebGL2RenderingContext.prototype;
  const locate = gl.getUniformLocation, send = gl.uniform4f;
  gl.getUniformLocation = function(program, name) {
    const location = locate.call(this, program, name);
    if (location) names.set(location, name);
    return location;
  };
  gl.uniform4f = function(location, x, y, z, w) {
    if (names.get(location) === 'clawPose' && Math.abs(x - probe.bayX) < 5) {
      probe.arm = {x:x - probe.bayX,y,z};
      if (probe.start) {
        probe.minY = Math.min(probe.minY, y);
        if (y < 6.1 && probe.firstDrop === null) probe.firstDrop = Math.round(performance.now()-probe.start);
      }
    }
    return send.call(this, location, x, y, z, w);
  };
  window.addEventListener('error', e => probe.errors.push(e.message || 'load error'));
  window.addEventListener('unhandledrejection', e => probe.errors.push(String(e.reason)));
  for (const type of ['pointerdown','pointerup','pointercancel','click']) {
    document.addEventListener(type, e => {
      const target=e.target.closest('button,#joystick,.grab-control');
      if(target) probe.events.push([type,target.id || target.className,e.isPrimary ?? null]);
    }, true);
  }
  probe.snapshot = () => ({
    status:get('status').textContent, help:get('help').textContent, button:get('grab').innerText,
    grabDisabled:get('grab').disabled, locked:get('menu-button').disabled, coin:get('coin-action').textContent,
    balance:get('coin-balance').textContent, arm:probe.arm, minY:Number.isFinite(probe.minY)?probe.minY:null,
    firstDrop:probe.firstDrop, errors:probe.errors, trace:probe.trace
  });
  probe.begin = () => {
    probe.start=performance.now();probe.minY=Infinity;probe.firstDrop=null;probe.trace=[];
    probe.events=[];
  };
  probe.timeNextTouch = () => {
    const button=get('grab-control');
    button.addEventListener('pointerup',()=>probe.begin(),{capture:true,once:true});
  };
  // Hold an ordinary read transaction in this disposable wallet. No settings
  // or balances are written. A pending read keeps the store busy until release.
  probe.holdWallet = () => {
    probe.holding=false;probe.release=false;
    const request=indexedDB.open('toy-park-family',1);
    request.onsuccess=()=>{
      const db=request.result,tx=db.transaction('family','readonly'),store=tx.objectStore('family');
      const read=()=>{store.get('local').onsuccess=()=>{probe.holding=true;if(!probe.release)read();};};
      tx.oncomplete=()=>{probe.holding=false;db.close();};read();
    };
  };
  new MutationObserver(() => {
    if (!probe.start) return;
    const row=[Math.round(performance.now()-probe.start),get('status').textContent,get('grab').innerText,get('menu-button').disabled];
    const last=probe.trace.at(-1);
    if (!last || row.slice(1).join()!==last.slice(1).join()) probe.trace.push(row);
  }).observe(get('machine'),{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});
  // This fixture exists only in the test app's private IndexedDB. Notify the live wallet as a second game window would.
  probe.seed = (chance,legacyPrepaid=false) => {
    const req=indexedDB.open('toy-park-family',1);
    req.onsuccess = () => {
      const db=req.result, tx=db.transaction('family','readwrite'), store=tx.objectStore('family');
      const fake={pin:{salt:'a'.repeat(32),hash:'b'.repeat(64)},limited:true,inserted:legacyPrepaid,coins:4,chance};
      if(typeof BudNative.currentCoinSlot==='function')fake.coinRevision=JSON.parse(BudNative.currentCoinSlot())[0]+1;
      for (const key of ['local','last-good']) store.put(fake,key);
      tx.oncomplete=()=>{db.close();document.dispatchEvent(new Event('visibilitychange'));};
    };
  };
})();
