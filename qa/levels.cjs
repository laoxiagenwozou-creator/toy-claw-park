const {qaDir,gameHtml}=require('./paths.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true,args:process.env.TOY_CLAW_QA_HARDWARE?['--use-angle=d3d11']:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:1008,height:672},deviceScaleFactor:1,offline:true,hasTouch:true});
    const errors=[],external=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
    await page.goto(pathToFileURL(gameHtml).href);
    await page.locator('.stage-card').last().waitFor();assert.equal(await page.locator('.stage-card').count(),32);
    await page.screenshot({path:path.join(qaDir,'menu.png')});
    await page.locator('#credits-button').tap();assert.match(await page.locator('.credits').innerText(),/DonaldDucc/);await page.locator('#credits-close').tap();
    for(const id of ['yard','lookout','town','garden','reef','space','pony','peppa','sheriff','chicks','spidey','snow']){
      await page.locator('[data-stage="'+id+'"]').tap();
      await page.waitForFunction(id=>document.querySelector('#machine').dataset.stage===id && document.querySelector('#machine').dataset.mode==='play',id,{timeout:90000});
      await page.waitForTimeout(200);
      await page.screenshot({path:path.join(qaDir,id+'.png')});
      assert.equal(await page.locator('#guide').getAttribute('aria-checked'),id==='yard'?'true':'false');
      if(id==='yard'){
        const b=await page.locator('#viewport').boundingBox();
        const clip={x:Math.round(b.width*.39),y:Math.round(b.height*.75),width:Math.round(b.width*.16),height:Math.round(b.height*.20)};
        const on=await page.screenshot({clip});
        await page.locator('#view-tools-toggle').tap();
        await page.getByRole('switch',{name:'瞄准圈'}).tap();await page.waitForTimeout(130);
        const off=await page.screenshot({clip});assert.notDeepEqual(on,off);
        await page.screenshot({path:path.join(qaDir,'guide-off.png')});
        await page.locator('#guide').tap();await page.waitForTimeout(130);assert.deepEqual(on,await page.screenshot({clip}));
        await page.locator('#guide').tap();
      }
      if(id==='town')assert.match(await page.locator('#help').innerText(),/把抓爪移到/);
      console.log('entered',id,await page.locator('#status').innerText(),await page.locator('#help').innerText());
      await page.locator('#menu-button').tap();
    }
    await page.setViewportSize({width:720,height:480});
    await page.reload();
    await page.locator('[data-stage="yard"]').tap();await page.locator('#machine').waitFor();
    await page.waitForFunction(()=>document.querySelector('#machine').dataset.mode==='play',null,{timeout:90000});await page.waitForTimeout(200);assert.equal(await page.locator('#guide-state').innerText(),'关');
    await page.locator('#view-tools-toggle').tap();await page.locator('#guide').tap();assert.equal(await page.locator('#guide').getAttribute('aria-checked'),'true');
    await page.locator('#view-tools-toggle').tap();
    await page.screenshot({path:path.join(qaDir,'compact.png')});
    await page.locator('#grab').tap();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('抓空'));
    assert.equal(await page.locator('#progress').innerText(),'0');assert.equal(external.length,0);assert.deepEqual(errors,[]);
    console.log('all twelve stages, credits, compact, offline, switch changes actual pixels and survives every stage and reload OK');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
