const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const {qaDir,gameHtml} = require('./paths.cjs');

function observe() {
  const ids = ['snowPenguin','lemonChick','lilacCat','skyPenguin','peachChick','violetCat'];
  localStorage.setItem('toy-park-v2',JSON.stringify({snow:{slots:ids,round:4,total:4,poses:Array(6).fill(null)}}));
  const gl=WebGL2RenderingContext.prototype, names=new WeakMap();
  const find=gl.getUniformLocation, send=gl.uniform4f;
  const obs=window.motion={height:null,start:0,min:Infinity,first:null};
  gl.getUniformLocation=function(program,name){
    const loc=find.call(this,program,name);if(loc)names.set(loc,name);return loc;
  };
  gl.uniform4f=function(loc,x,y,z,w){
    if(names.get(loc)==='clawPose' && Math.abs(x)<5){
      obs.height=y;
      if(obs.start){
        obs.min=Math.min(obs.min,y);
        if(y<5.35 && obs.first===null)obs.first=Math.round(performance.now()-obs.start);
      }
    }
    return send.call(this,loc,x,y,z,w);
  };
  document.addEventListener('pointerup',e=>{
    if(e.target.closest('#grab-control'))Object.assign(obs,{start:performance.now(),min:Infinity,first:null});
  },true);
  const raf=window.requestAnimationFrame.bind(window),caf=window.cancelAnimationFrame.bind(window);
  const held=new Map(),native=new Map();let serial=0;
  function schedule(id,cb){
    native.set(id,raf(t=>{native.delete(id);if(window.holdFrames)held.set(id,cb);else cb(t);}));
  }
  window.requestAnimationFrame=cb=>{const id=++serial;schedule(id,cb);return id;};
  window.cancelAnimationFrame=id=>{caf(native.get(id));native.delete(id);held.delete(id);};
  window.resumeFrames=()=>{window.holdFrames=false;for(const [id,cb] of held)schedule(id,cb);held.clear();};
  window.holdWallet=()=>new Promise(resolve=>{
    window.releaseWallet=false;
    const open=indexedDB.open('toy-park-family',1);
    open.onsuccess=()=>{
      const db=open.result,tx=db.transaction('family','readonly'),store=tx.objectStore('family');
      const read=()=>{store.get('local').onsuccess=()=>{resolve();if(!window.releaseWallet)read();};};
      tx.oncomplete=()=>db.close();read();
    };
  });
}

async function exercise(browser,mode,baseline) {
  const page=await browser.newPage({offline:true,hasTouch:true,reducedMotion:'reduce',viewport:{width:1008,height:672}});
  try{
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(observe);
    await page.goto(pathToFileURL(gameHtml).href);
    const el=s=>page.locator(s), click=s=>el(s).evaluate(b=>b.click());
    const wait=fn=>page.waitForFunction(fn,null,{polling:35,timeout:9000});
    const touch=async s=>{const b=await el(s).boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);};
    const snapshot=()=>page.evaluate(()=>({height:motion.height,min:motion.min,first:motion.first,
      phase:document.querySelector('#grab-label').textContent,status:document.querySelector('#status').textContent,
      coin:document.querySelector('#coin-action').textContent,balance:document.querySelector('#coin-balance').textContent,
      ready:!document.querySelector('#menu-button').disabled,score:document.querySelector('#progress').textContent}));
    await click('#parent-open');await el('#parent-pin').fill('7934');await el('#pin-confirm').fill('7934');
    await click('#pin-submit');await el('#parent-controls').waitFor();
    await click('label[for=coin-limit]');await el('#allowance').fill('25');await click('#parent-save');
    await el('#parent-settings').waitFor({state:'hidden'});await click('[data-stage=snow]');
    await wait(()=>document.querySelector('#machine').dataset.mode==='play' && window.motion.height>5.2);
    const samples={mode};
    if(mode==='blocked'){
      await page.evaluate(()=>holdWallet());await touch('#coin-insert');
      await wait(()=>!document.querySelector('#coin-insert').disabled);
      await page.evaluate(()=>{window.releaseWallet=true;});await page.waitForTimeout(160);
      samples.failedInsert=await snapshot();
      assert.equal(samples.failedInsert.coin,'投币');assert.equal(samples.failedInsert.balance,'余 25 枚');
    }
    await touch('#coin-insert');await wait(()=>!document.querySelector('#grab').disabled);
    if(mode==='no-frames')await page.evaluate(()=>{window.holdFrames=true;});
    else await page.evaluate(()=>holdWallet());
    await touch('#grab');
    await page.waitForTimeout(850);
    samples.waiting=await snapshot();
    if(mode!=='no-frames'){
      assert.equal(samples.waiting.coin,'已投币');assert.equal(samples.waiting.score,'4');
      if(baseline){assert.equal(samples.waiting.phase,'下爪中');assert.equal(samples.waiting.first,null);}
      else{
        assert.equal(samples.waiting.phase,'验币中');
        assert.ok(samples.waiting.first!==null && samples.waiting.first<550 && samples.waiting.min>4.8);
      }
      if(mode==='blocked'){
        await wait(()=>!document.querySelector('#grab').disabled);
        samples.timeout=await snapshot();
        assert.equal(samples.timeout.coin,'已投币');assert.equal(samples.timeout.height,5.48);
      }
      await page.evaluate(()=>{window.releaseWallet=true;});
      if(mode==='blocked'){
        await page.waitForTimeout(180);assert.equal((await snapshot()).coin,'已投币');
        await touch('#grab');
      }
    }
    if(mode==='no-frames')await page.waitForTimeout(3600);
    await wait(()=>!document.querySelector('#menu-button').disabled);
    samples.complete=await snapshot();
    assert.equal(samples.complete.coin,'投币');assert.equal(samples.complete.balance,'余 24 枚');
    assert.equal(samples.complete.score,'4');assert.equal(samples.complete.height,5.48);
    assert.ok(samples.complete.min<1);assert.match(samples.complete.status,/抓空/);
    await page.evaluate(()=>window.resumeFrames());assert.deepEqual(errors,[]);
    return samples;
  }finally{await page.close();}
}

(async()=>{
  const baseline=process.argv.includes('--baseline');
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{
    const rows=[];
    for(const mode of (baseline?['slow']:['slow','blocked','no-frames']))rows.push(await exercise(browser,mode,baseline));
    fs.writeFileSync(path.join(qaDir,'drop-admission.json'),JSON.stringify(rows,null,2));
    console.log(JSON.stringify(rows));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
