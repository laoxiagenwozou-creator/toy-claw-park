// All PINs, balances and scores in this test belong to an isolated browser profile.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {qaDir,gameHtml}=require('./paths.cjs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{
    const ctx=await browser.newContext({viewport:{width:1008,height:672},offline:true,hasTouch:true,reducedMotion:'reduce'});
    const first=await ctx.newPage(),url=pathToFileURL(gameHtml).href;
    const failures=[];
    ctx.on('page',p=>p.on('pageerror',e=>failures.push(e.message)));first.on('pageerror',e=>failures.push(e.message));
    const button=(p,id)=>p.locator('#'+id);
    const wait=(p,fn,arg)=>p.waitForFunction(fn,arg,{polling:35,timeout:35000});
    async function enter(p,id){
      await p.locator('.stage-card[data-stage="'+id+'"]').click();
      await wait(p,id=>document.querySelector('#machine').dataset.mode==='play'&&document.querySelector('#machine').dataset.stage===id,id);
    }
    async function gate(p){await button(p,'parent-open').click();await button(p,'parent-pin').waitFor();}
    async function auth(p,pin){await gate(p);await button(p,'parent-pin').fill(pin);await button(p,'pin-submit').click();await button(p,'parent-controls').waitFor();}
    const setup='4831',newPin='7264';
    await first.goto(url);
    await first.evaluate(()=>{localStorage.setItem('toy-park-catch-percent','45');});
    await first.reload();await gate(first);
    await button(first,'parent-pin').fill(setup);await button(first,'pin-confirm').fill('0001');await button(first,'pin-submit').click();
    assert.match(await button(first,'parent-error').innerText(),/两次/);
    await button(first,'pin-confirm').fill(setup);await button(first,'pin-submit').click();await button(first,'parent-controls').waitFor();
    assert.equal(await button(first,'catch-value').innerText(),'45%');assert.equal(await button(first,'coin-limit').isChecked(),false);
    await first.locator('label[for=coin-limit]').click();await button(first,'allowance').fill('2');
    await first.screenshot({path:path.join(qaDir,'family-settings.png')});
    await button(first,'parent-save').click();await button(first,'parent-settings').waitFor({state:'hidden'});
    await gate(first);await button(first,'parent-pin').fill('1234');await button(first,'pin-submit').click();
    await wait(first,()=>!document.querySelector('#parent-error').hidden);assert.match(await button(first,'parent-error').innerText(),/不正确/);
    assert.equal(await button(first,'parent-controls').isVisible(),false);await button(first,'parent-close').click();
    await enter(first,'snow');await wait(first,()=>!document.querySelector('#coin-insert').disabled);
    assert.ok(await button(first,'grab').isDisabled());
    await first.evaluate(()=>document.activeElement.blur());
    await first.keyboard.press('Space');assert.equal(await button(first,'coin-balance').innerText(),'余 2 枚');
    await button(first,'coin-insert').click();await wait(first,()=>document.querySelector('#coin-action').textContent==='已投币');
    assert.equal(await button(first,'coin-balance').innerText(),'余 1 枚');
    await first.screenshot({path:path.join(qaDir,'credited-cabinet.png')});
    await button(first,'menu-button').click();await enter(first,'yard');await first.reload();await enter(first,'town');
    assert.equal(await button(first,'coin-action').innerText(),'已投币');
    await button(first,'grab').click();await wait(first,()=>document.querySelector('#status').textContent==='抓爪下来啦');
    await first.keyboard.press('Space');await wait(first,()=>!document.querySelector('#menu-button').disabled);
    assert.match(await button(first,'status').innerText(),/抓空/);
    assert.equal(await button(first,'coin-balance').innerText(),'余 1 枚');await button(first,'coin-insert').click();
    await wait(first,()=>document.querySelector('#coin-action').textContent==='已投币');
    const other=await ctx.newPage();await other.goto(url);await enter(other,'snow');
    await wait(other,()=>!document.querySelector('#grab').disabled);
    // Both normal buttons request the same already-inserted final credit together.
    await Promise.all([first,other].map(p=>p.locator('#grab').evaluate(el=>el.click())));
    await wait(first,()=>document.querySelector('#coin-action').textContent==='币用完了');
    await wait(other,()=>document.querySelector('#coin-action').textContent==='币用完了');
    await Promise.all([first,other].map(p=>wait(p,()=>!document.querySelector('#menu-button').disabled)));
    const statuses=await Promise.all([first,other].map(p=>button(p,'status').innerText()));
    assert.equal(statuses.filter(s=>s.includes('这次抓空')).length,1);
    for(const p of [first,other]){assert.ok(await button(p,'grab').isDisabled());assert.ok(await button(p,'coin-insert').isDisabled());}
    await other.close();await first.reload();await enter(first,'reef');assert.equal(await button(first,'coin-action').innerText(),'币用完了');
    await button(first,'menu-button').click();await auth(first,setup);
    assert.equal(await button(first,'allowance').inputValue(),'0');
    await button(first,'allowance').fill('3');await button(first,'parent-cancel').click();await auth(first,setup);
    assert.equal(await button(first,'allowance').inputValue(),'0');
    await button(first,'change-pin').click();await button(first,'parent-pin').fill(newPin);await button(first,'pin-confirm').fill(newPin);await button(first,'pin-submit').click();
    await button(first,'parent-controls').waitFor();await button(first,'parent-cancel').click();
    await gate(first);await button(first,'parent-pin').fill(setup);await button(first,'pin-submit').click();await button(first,'parent-error').waitFor();await button(first,'parent-close').click();
    await auth(first,newPin);await button(first,'allowance').fill('3');await button(first,'parent-save').click();
    await enter(first,'yard');assert.equal(await button(first,'coin-balance').innerText(),'余 3 枚');await button(first,'menu-button').click();
    await auth(first,newPin);await first.locator('label[for=coin-limit]').click();await button(first,'parent-save').click();
    await enter(first,'yard');assert.ok(await button(first,'coin-insert').isHidden());assert.ok(await button(first,'grab').isEnabled());
    await first.setViewportSize({width:667,height:375});await button(first,'menu-button').click();await auth(first,newPin);
    await first.locator('label[for=coin-limit]').click();await button(first,'allowance').fill('2');await button(first,'parent-save').click();
    await enter(first,'snow');await first.screenshot({path:path.join(qaDir,'compact-coin.png')});
    const bounds=await first.evaluate(()=>['joystick','coin-insert','grab'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return [r.left,r.right,r.bottom];}));
    assert.ok(bounds[0][1]<=bounds[1][0]&&bounds[1][1]<=bounds[2][0]&&bounds[2][1]<=667&&bounds.every(b=>b[2]<=375));
    assert.deepEqual(failures,[]);console.log('PASS migrated 45% chance; personal PIN setup, confirmation, wrong PIN, relock and change; 2 coins = 2 starts across cabinets, reload and two concurrent windows; prepaid survives; zero blocks touch/keyboard; parent refill/cancel/free play; compact controls fit.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
