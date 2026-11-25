// All PINs, damaged records and credits in this test belong to a new browser profile.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{gameHtml}=require('./paths.cjs');
async function run(){
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({offline:true,viewport:{width:840,height:520}});
    await page.addInitScript(()=>{
      window.BudNative={confirmParent(id){window.ParkParent.confirmed(id,!!window.mockDeviceAccept);}};
      window.familyRow=async(key,write,value)=>{
        const db=await new Promise((res,rej)=>{const r=indexedDB.open('toy-park-family',1);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
        try{return await new Promise((res,rej)=>{
          const tx=db.transaction('family',write?'readwrite':'readonly'),s=tx.objectStore('family');
          const request=write?s.put(value,key):s.get(key);tx.oncomplete=()=>res(request.result);tx.onabort=()=>rej(tx.error);
        });}finally{db.close();}
      };
    });
    await page.goto(pathToFileURL(gameHtml).href);
    const el=id=>page.locator('#'+id),open=()=>el('parent-open').click();
    const submit=async(pin,second=false)=>{
      await el('parent-pin').fill(pin);if(second)await el('pin-confirm').fill(pin);await el('pin-submit').click();
    };
    const row=(key,write=false,value)=>page.evaluate(([k,w,v])=>window.familyRow(k,w,v),[key,write,value]);
    await open();await submit('6381',true);await el('parent-controls').waitFor();
    const recovery=(await el('recovery-note').innerText()).match(/[A-F0-9]{4}(?:-[A-F0-9]{4}){4}/)[0];
    await page.locator('label[for=coin-limit]').click();await el('allowance').fill('4');await el('parent-save').click();
    await el('parent-settings').waitFor({state:'hidden'});
    await page.evaluate(()=>localStorage.setItem('toy-park-v2',JSON.stringify({town:{round:3,total:9}})));
    const original=await row('local');
    assert.equal(original.coins,4);assert.deepEqual(await row('last-good'),original);
    await row('local',true,{coins:-2});await page.reload();
    await open();await submit('6381');await el('parent-controls').waitFor();
    assert.deepEqual(await row('local'),original);await el('parent-cancel').click();
    await open();await el('recover-device').click();await el('parent-error').waitFor();
    assert.match(await el('parent-error').innerText(),/未完成/);
    await page.evaluate(()=>{window.mockDeviceAccept=true;});
    await el('recover-device').click();await submit('4163',true);await el('parent-controls').waitFor();
    const secondCode=(await el('recovery-note').innerText()).match(/[A-F0-9]{4}(?:-[A-F0-9]{4}){4}/)[0];
    assert.notEqual(secondCode,recovery);assert.equal((await row('local')).coins,4);
    await el('parent-cancel').click();
    await row('local',true,{bad:1});await row('last-good',true,{bad:2});
    await page.reload();await open();await el('recover-key').click();
    await el('recover-code').fill(recovery);await submit('5247',true);await el('parent-error').waitFor();
    assert.match(await el('parent-error').innerText(),/恢复码不正确/);assert.deepEqual(await row('local'),{bad:1});
    await el('recover-code').fill(secondCode);await submit('5247',true);await el('parent-controls').waitFor();
    const repaired=await row('local');
    assert.equal(repaired.coins,0);assert.equal(repaired.inserted,false);assert.equal(repaired.limited,true);
    assert.deepEqual(await row('last-good'),repaired);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('toy-park-v2')).town.total),9);
    await el('parent-cancel').click();
    await row('local',true,undefined);await row('last-good',true,undefined);
    await page.reload();await open();assert.match(await el('parent-error').innerText(),/钱包暂时无法读取/);
    assert.ok(await el('pin-form').isHidden());await el('parent-close').click();
    await page.addInitScript(()=>Object.defineProperty(crypto,'subtle',{value:undefined}));
    await page.reload();await open();assert.match(await el('parent-error').innerText(),/HTTPS/);
    console.log('PASS single-copy wallet recovery; old PIN and coins retained; simulated device authentication rejects/accepts; one-time recovery rotates; damaged wallet fails closed with zero credit, toy data retained; secure-context guidance.');
  }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
