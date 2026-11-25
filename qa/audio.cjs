const {chromium}=require('playwright'),{pathToFileURL}=require('node:url'),{qaDir,gameHtml}=require('./paths.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{
    const page=await browser.newPage({viewport:{width:1008,height:672},offline:true,reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{
      let ctx,analyser;const signals=[];window.signals=signals;
      const connect=AudioNode.prototype.connect;
      AudioNode.prototype.connect=function(target,...args){
        const result=connect.call(this,target,...args);
        if(target===this.context.destination&&!analyser){
          ctx=this.context;analyser=ctx.createAnalyser();analyser.fftSize=2048;connect.call(this,analyser);
        }
        return result;
      };
      const bufferStart=AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start=function(...args){
        signals.push({type:this.loop&&this.buffer.duration>30?'music':'noise',duration:this.buffer.duration});
        return bufferStart.apply(this,args);
      };
      const note=OscillatorNode.prototype.start;
      OscillatorNode.prototype.start=function(...args){signals.push({type:'note',freq:Math.round(this.frequency.value)});return note.apply(this,args);};
      window.meter=async ms=>{
        const end=performance.now()+ms;let peak=0,frames=0;
        const buf=new Float32Array(2048);
        while(performance.now()<end){
          if(analyser){analyser.getFloatTimeDomainData(buf);let sum=0;for(const v of buf)sum+=v*v;peak=Math.max(peak,Math.sqrt(sum/buf.length));frames++;}
          await new Promise(r=>setTimeout(r,15));
        }
        return {rms:+peak.toFixed(6),frames,state:ctx?.state};
      };
    });
    await page.goto(pathToFileURL(gameHtml).href);
    const rms=ms=>page.evaluate(ms=>meter(ms),ms),click=id=>page.locator('#'+id).click();
    const wait=fn=>page.waitForFunction(fn,null,{polling:30,timeout:30000});
    await page.locator('.stage-card[data-stage="snow"]').click();await wait(()=>document.getElementById('machine').dataset.mode==='play');
    await wait(()=>signals.some(s=>s.type==='music'));
    await page.waitForTimeout(450);const music=await rms(430);assert.ok(music.rms>.006,'music is silent');
    await click('game-sound');await page.locator('label[for=music-on]').click();await click('sound-close');
    await page.waitForTimeout(380);const silence=await rms(230);assert.ok(silence.rms<.001,'music mute did not settle');
    await page.keyboard.down('ArrowRight');const motor=await rms(480);await page.keyboard.up('ArrowRight');
    assert.ok(motor.rms>.0015,'motor is silent');
    await page.waitForTimeout(500);const stopped=await rms(180);assert.ok(stopped.rms<.001,'motor kept running');
    await click('grab');const grab=await rms(1500);assert.ok(grab.rms>.006,'claw is silent');
    await wait(()=>!document.getElementById('menu-button').disabled);
    await click('game-sound');await page.locator('label[for=effects-on]').click();await click('sound-close');
    await page.waitForTimeout(300);await page.keyboard.down('ArrowLeft');const muted=await rms(350);await page.keyboard.up('ArrowLeft');assert.ok(muted.rms<.001);
    await click('request-open');assert.ok(await page.locator('#read-request').isDisabled());
    assert.ok((await rms(200)).rms<.001);await click('room-close');
    await page.reload();await click('menu-sound');assert.equal(await page.locator('#music-on').isChecked(),false);assert.equal(await page.locator('#effects-on').isChecked(),false);
    await page.locator('label[for=music-on]').click();await page.locator('label[for=effects-on]').click();const coin=await rms(200);assert.ok(coin.rms>.002,'coin did not sound');
    await click('sound-close');await page.locator('.stage-card[data-stage="yard"]').click();await wait(()=>document.querySelector('#machine').dataset.mode==='play');
    await wait(()=>signals.some(s=>s.type==='music'));
    await page.evaluate(()=>window.BudSound.setForeground(false));await wait(async()=> (await meter(35)).state==='suspended');
    await page.evaluate(()=>window.BudSound.setForeground(true));await wait(async()=> (await meter(35)).state==='running');
    const resumed=await rms(400);assert.ok(resumed.rms>.005);
    await click('menu-button');await page.waitForTimeout(380);const menu=await rms(150);assert.ok(menu.rms<.001);
    assert.deepEqual(errors,[]);
    const report={music,silence,motor,stopped,grab,muted,coin,resumed,menu,loopSeconds:40};
    fs.writeFileSync(path.join(qaDir,'audio-levels.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
