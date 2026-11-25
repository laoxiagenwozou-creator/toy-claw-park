const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright'),{qaDir,gameHtml}=require('./paths.cjs');
const url=pathToFileURL(gameHtml).href;
(async()=>{
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{
    const ctx=await browser.newContext({hasTouch:true,viewport:{width:1008,height:672},offline:true});
    const p=await ctx.newPage(),errors=[],remote=[];
    p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});
    await p.addInitScript(()=>{
      let time=performance.now(),serial=0,jobs=new Map();
      window.requestAnimationFrame=cb=>{jobs.set(++serial,cb);return serial;};
      window.cancelAnimationFrame=n=>jobs.delete(n);
      window.syncTime=()=>{time=performance.now();};
      window.advance=async ms=>{while(ms>.001){const dt=Math.min(40,ms);ms-=dt;time+=dt;const due=jobs;jobs=new Map();for(const cb of due.values())cb(time);for(let i=0;i<4;i++)await Promise.resolve();}};
      const start=AudioBufferSourceNode.prototype.start;window.voices=[];
      AudioBufferSourceNode.prototype.start=function(...args){if(this.buffer&&!this.loop&&this.buffer.duration>1)voices.push(this.buffer.duration);return start.apply(this,args);};
    });
    const $=id=>p.locator('#'+id),click=id=>$(id).click(),tick=ms=>p.evaluate(n=>advance(n),ms);
    const wait=fn=>p.waitForFunction(fn,null,{polling:30,timeout:25000});
    const shot=name=>p.screenshot({path:path.join(qaDir,name+'.png')});
    const boards=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('toy-park-v2')));
    const enter=async id=>{await p.locator('.stage-card[data-stage="'+id+'"]').click();
      await wait(()=>document.querySelector('#machine').dataset.mode==='travel');await tick(2200);
      await wait(()=>document.querySelector('#machine').dataset.mode==='play'&&!document.querySelector('#menu-button').disabled);};
    const inspect=()=>wait(()=>document.querySelector('#toy-view').dataset.ready==='true'&&!document.querySelector('#room-detail').hidden);
    await p.goto(url);
    await click('parent-open');await $('parent-pin').fill('6541');await $('pin-confirm').fill('6541');await click('pin-submit');
    await $('parent-controls').waitFor();await p.locator('label[for=coin-limit]').click();await $('allowance').fill('1');await $('catch-percent').press('End');await click('parent-save');
    await enter('town');await click('request-open');await click('read-request');await wait(()=>voices.length>0);
    await shot('request-fire');await click('accept-request');await wait(()=>document.querySelector('#mission-card').dataset.state==='accepted');
    await click('room-close');await click('coin-insert');await wait(()=>!document.querySelector('#grab').disabled);
    for(const [key,units] of [['ArrowLeft',.71],['ArrowDown',1.85]]){
      await p.keyboard.down(key);await tick(1000*units/2.05);await p.keyboard.up(key);await tick(240);
    }
    await click('grab');await wait(()=>document.querySelector('#status').textContent==='抓爪下来啦');
    for(let i=0;i<65&&await $('menu-button').isDisabled();i++){await tick(180);await p.waitForTimeout(10);}
    assert.equal((await boards()).town.shelf.pending.fire,1);assert.equal((await boards()).town.shelf.request,'delivery');
    assert.equal(await $('coin-action').innerText(),'币用完了');await shot('outlet-full');
    await click('outlet');await inspect();assert.equal(await $('place-toy').innerText(),'停进消防站');
    await shot('fire-station');await click('room-close');
    // Leave the machine with the final prepaid turn spent, then reopen its unclaimed toy.
    await p.reload();await click('shelf-open');await p.locator('#waiting-toys [data-kind=fire]').click();await inspect();
    await click('park-target');await $('room-shelf').waitFor();
    let b=(await boards()).town;assert.equal(b.total,1);assert.equal(b.shelf.owned.fire,1);assert.ok(!b.shelf.pending.fire);assert.equal(b.shelf.request,'complete');
    await click('room-close');await p.reload();await enter('town');assert.ok(await $('grab').isDisabled());await click('menu-button');await click('shelf-open');
    await p.locator('#owned-toys [data-kind=fire]').click();await inspect();assert.equal(await $('play-toy').innerText(),'点亮警灯');
    const idCell=await p.locator('#toy-view').getAttribute('data-kind');assert.equal(idCell,'fire');
    await click('room-close');
    // Add a second, isolated fixture to inspect all specialty models and other theme shelves.
    await p.evaluate(()=>{
      const b=JSON.parse(localStorage.getItem('toy-park-v2'));
      b.town.shelf.owned={fire:1,racer:1,crane:1};b.town.shelf.order=['fire','racer','crane'];
      b.yard.shelf.owned={bluey:1};b.yard.shelf.order=['bluey'];
      localStorage.setItem('toy-park-v2',JSON.stringify(b));
    });
    await p.reload();await click('shelf-open');await shot('garage-shelf');
    const getSnap=()=>p.locator('#toy-view').screenshot();
    for(const [id,label] of [['racer','让赛车滑行'],['crane','升起吊臂'],['fire','点亮警灯']]){
      await p.locator('#owned-toys [data-kind="'+id+'"]').click();await inspect();assert.equal(await $('play-toy').innerText(),label);
      const initial=await getSnap();await click('play-toy');
      // The renderer uses performance.now as its action origin; align the simulated animation frame clock.
      await p.evaluate(()=>syncTime());await tick(410);const next=await getSnap();
      assert.ok(!next.equals(initial),id+' action did not change its model');
      await click('turn-toy');await tick(40);assert.ok(!(await getSnap()).equals(initial),id+' did not rotate');
      if(id==='crane'){await $('move-left').click();await p.waitForTimeout(60);assert.deepEqual((await boards()).town.shelf.order,['fire','crane','racer']);}
      await click('back-shelf');
    }
    await p.locator('#shelf-stages [data-theme=yard]').click();await p.locator('#owned-toys [data-kind=bluey]').click();await inspect();await shot('bluey-shelf');
    await click('back-shelf');await click('request-tab');const readings=[];
    for(const id of ['snow','town','lookout','yard','garden','reef','space','pony','peppa','sheriff','chicks','spidey']){
      await p.locator('#shelf-stages [data-theme="'+id+'"]').click();const before=await p.evaluate(()=>voices.length);
      await click('read-request');await p.waitForFunction(n=>voices.length>n,before,{polling:25});
      readings.push({stage:id,duration:await p.evaluate(()=>voices.at(-1))});
    }
    await p.setViewportSize({width:640,height:400});await shot('compact-card');
    const buttons=await p.locator('#read-request,#room-close').evaluateAll(ns=>ns.map(el=>{const r=el.getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}));assert.ok(buttons.every(Boolean));
    assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
    fs.writeFileSync(path.join(qaDir,'playroom.json'),JSON.stringify({lastCoin:true,awardOnce:true,pendingSurvivesReload:true,savedOrder:true,allVoices:readings,remoteRequests:remote.length},null,2));
    console.log('PASS last coin, real fire catch, persistent prize door, fire station delivery, shelf after zero coins, free interaction and reordering, '+readings.length+' offline spoken requests, compact window.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
