const assert=require('node:assert/strict'),path=require('node:path');
const {chromium}=require('playwright'),{qaDir,gameHtml}=require('./paths.cjs');
const assets=path.resolve(process.env.TOY_CLAW_BUILD_DIR||path.join(path.dirname(gameHtml),'..'),'assets');
const local='https://pupclaw.invalid/';

async function run(){
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{
    const page=await browser.newPage({hasTouch:true,reducedMotion:'reduce',viewport:{width:840,height:520}});
    const requested=new Set(),external=[],errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',async route=>{
      const url=route.request().url();
      if(!url.startsWith(local)){if(!/^(data|blob):/.test(url))external.push(url);await route.abort();return;}
      const relative=url.slice(local.length)||'index.html';
      assert.match(relative,/^(index\.html|game\.js|park\.css|media\/[A-Za-z0-9_-]+\.(webp|png|glb|ogg))$/);
      requested.add(relative);
      await route.fulfill({path:path.join(assets,relative),contentType:{
        html:'text/html; charset=utf-8',js:'application/javascript',css:'text/css',
        webp:'image/webp',png:'image/png',ogg:'audio/ogg',glb:'model/gltf-binary'
      }[relative.split('.').pop()]});
    });
    await page.addInitScript(()=>{
      window.BudNative={setCameraEnabled(){}};
      if(!sessionStorage.getItem('audit-fixture')){
        localStorage.setItem('toy-park-v2',JSON.stringify({town:{slots:[null,null,'plane',null,'crane',null],
          total:4,round:4,shelf:{pending:{fire:1},request:'available'}}}));
        sessionStorage.setItem('audit-fixture','1');
      }
      window.lostViewers=0;
    });
    await page.goto(local);
    const el=id=>page.locator('#'+id),tap=id=>el(id).tap();
    const wait=fn=>page.waitForFunction(fn,null,{polling:30,timeout:45000});
    const enter=async id=>{await page.locator('.stage-card[data-stage="'+id+'"]').tap();
      await wait(()=>document.querySelector('#machine').dataset.mode==='play');};
    assert.equal(await page.title(),'口袋抓娃乐园');
    assert.equal(await page.locator('main').count(),1);
    assert.equal(await page.locator('.stage-card').count(),12);
    await wait(()=>[...document.querySelectorAll('.stage-card img,.park-brand img')].every(img=>img.naturalWidth>0));
    await tap('parent-open');await el('parent-pin').fill('2308');await el('pin-confirm').fill('2308');await tap('pin-submit');
    await el('parent-controls').waitFor();await page.locator('label[for=coin-limit]').tap();
    await el('allowance').fill('5');await tap('parent-save');await el('parent-settings').waitFor({state:'hidden'});
    await enter('town');
    const layouts=[];
    for(const [width,height] of [[840,520],[667,375],[568,320]]){
      await page.setViewportSize({width,height});await tap('view-tools-toggle');
      assert.ok(await el('camera').isVisible());
      const layout=await page.evaluate(()=>{
        const rect=s=>document.querySelector(s).getBoundingClientRect(),score=rect('.marquee-score'),tools=rect('.tools');
        const status=document.querySelector('#status'),help=document.querySelector('#help');
        const hit=s=>{const r=rect(s),el=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!el?.closest(s);};
        return {hudGap:tools.top-score.bottom,statusWidth:status.clientWidth,statusText:status.scrollWidth,
          helpWidth:help.clientWidth,assist:hit('#camera'),actions:['#grab-control','#restock','#coin-insert','#request-open'].every(hit)};
      });
      assert.ok(layout.hudGap>5&&layout.assist&&layout.actions,JSON.stringify(layout));
      assert.ok(layout.statusText<=layout.statusWidth+1&&layout.helpWidth>0,JSON.stringify(layout));
      layouts.push({width,height,...layout});
      if(width===840||width===568)await page.screenshot({path:path.join(qaDir,'hud-'+width+'.png')});
      await tap('view-tools-toggle');
    }
    assert.ok(await el('grab').isDisabled());
    assert.equal(await el('grab-label').innerText(),'先投币');
    const grabBox=await el('grab').boundingBox();
    await page.touchscreen.tap(grabBox.x+grabBox.width/2,grabBox.y+grabBox.height/2);
    assert.equal(await el('status').innerText(),'先投一枚币');
    assert.equal(await el('coin-balance').innerText(),'余 5 枚');
    await tap('coin-insert');await wait(()=>!document.querySelector('#grab').disabled);
    assert.ok(await el('grab').evaluate(button=>{
      const r=button.getBoundingClientRect();
      return button.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
    }));
    await tap('request-open');await tap('accept-request');
    await wait(()=>document.querySelector('#mission-card').dataset.state==='delivery');await tap('accept-request');
    await wait(()=>document.querySelector('#toy-view').dataset.ready==='true');
    await page.setViewportSize({width:840,height:520});
    const point=async id=>{const r=await el(id).boundingBox();return [r.x+r.width/2,r.y+r.height/2];};
    const dock=await point('park-target'),toy=await point('toy-view'),handle=await point('carry-toy');
    await page.mouse.move(...toy);await page.mouse.down();await page.mouse.move(toy[0]+18,toy[1]);
    await page.mouse.move(...dock,{steps:4});await page.mouse.up();
    assert.ok(await el('place-toy').isVisible(),'a normal rotation deposited the toy');
    await page.mouse.move(...handle);await page.mouse.down();await page.mouse.move(...dock,{steps:5});
    assert.equal(await el('toy-stage').evaluate(e=>e.classList.contains('over-dock')),true);
    const held=await point('toy-view');
    assert.ok(Math.hypot(held[0]-dock[0],held[1]-dock[1])<2,'the model left the finger during a handle drag');
    await page.screenshot({path:path.join(qaDir,'drag-to-fire-station.png')});
    await page.mouse.up();await el('room-shelf').waitFor();
    const shelf=await page.evaluate(()=>JSON.parse(localStorage.getItem('toy-park-v2')).town.shelf);
    assert.equal(shelf.owned.fire,1);assert.equal(shelf.request,'complete');assert.equal(shelf.pending.fire,undefined);
    // Listen on the canvas itself, including after it has been detached from the document.
    await page.locator('#owned-toys [data-kind=fire]').tap();await wait(()=>document.querySelector('#toy-view').dataset.ready==='true');
    await page.locator('#toy-view canvas').evaluate(c=>c.addEventListener('webglcontextlost',()=>window.lostViewers++));
    await tap('room-close');await wait(()=>window.lostViewers>0);
    await tap('menu-button');await page.setViewportSize({width:568,height:320});await enter('space');await tap('request-open');
    assert.ok(await page.locator('#shelf-stages [aria-pressed=true]').evaluate(b=>{
      const r=b.getBoundingClientRect(),s=b.parentElement.getBoundingClientRect();
      return b.dataset.theme==='space'&&r.right<=s.right+1&&r.left>=s.left-1;
    }));
    await tap('room-close');await tap('menu-button');await enter('yard');
    await wait(()=>document.querySelector('#viewport').hasAttribute('data-ready'));
    assert.ok([...requested].some(x=>x.endsWith('.glb'))&&[...requested].some(x=>x.endsWith('.ogg')));
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    console.log(JSON.stringify({layouts,localFiles:requested.size,model:true,sound:true,
      rotateWithoutDeposit:true,deliberateDrag:true,deliveredOldPrize:true,viewerContextReleased:true,activeTabFullyVisible:true}));
  }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
