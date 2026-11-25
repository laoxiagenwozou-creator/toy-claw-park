const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const {gameHtml,qaDir}=require('./paths.cjs'),seed=require('./medal-fixture.json');
(async()=>{
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{
    const ctx=await browser.newContext({viewport:{width:1100,height:690},offline:true,hasTouch:true});
    const page=await ctx.newPage(),errors=[],remote=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url());});
    await page.addInitScript(()=>localStorage.setItem('toy-park-catch-percent','100'));
    const one=s=>page.locator(s),tap=s=>one(s).tap();
    const shot=name=>page.screenshot({path:path.join(qaDir,name+'.png')});
    const stored=()=>page.evaluate(()=>localStorage.getItem('toy-park-v2'));
    const count=async id=>JSON.parse(await stored())[id].clears;
    await page.goto(pathToFileURL(gameHtml).href);
    await tap('#wall-open');assert.match(await one('#wall-summary').innerText(),/0 \/ 32 款.*共 0 枚/);
    assert.equal(await one('.medal-slot').count(),32);await tap('.medal-slot[data-stage=spidey]');
    assert.match(await one('#wall-caption').innerText(),/抓满 6 件/);await tap('#wall-play');
    await one('#menu-button:enabled').waitFor();assert.equal(await one('#machine').getAttribute('data-stage'),'spidey');
    assert.equal(await stored(),null);await tap('#menu-button');
    await page.evaluate(seed=>localStorage.setItem('toy-park-v2',JSON.stringify(seed)),seed);await page.reload();
    await tap('#wall-open');assert.match(await one('#wall-summary').innerText(),/5 \/ 32 款.*共 6 枚/);
    const before=await stored();await tap('.medal-slot[data-stage=town]');
    await tap('#wall-medal button');assert.equal(await one('#wall-medal button').getAttribute('aria-pressed'),'true');
    assert.match(await one('#wall-medal .medal-back-earned').innerText(),/2 次/);
    await page.keyboard.press('Escape');await one('#wall-display').waitFor();await tap('#wall-close');assert.equal(await stored(),before);
    await tap('.stage-card[data-stage=snow]');await one('#grab:enabled').waitFor();await tap('#grab');
    await one('#win').waitFor({timeout:30000});assert.equal(await count('snow'),1);assert.match(await one('#win-note').innerText(),/第一次通关/);
    await page.waitForTimeout(650);await shot('first-medal');
    await tap('#win-wall');assert.match(await one('#wall-summary').innerText(),/6 \/ 32 款.*共 7 枚/);await shot('achievement-wall');
    await tap('.medal-slot[data-stage=snow]');const card=one('#wall-medal button'),r=await card.boundingBox();
    const x=r.x+r.width*.5,y=r.y+r.height*.48;await page.mouse.move(x,y);await page.mouse.down();
    await page.mouse.move(x+r.width*.34,y-r.height*.27,{steps:8});
    assert.ok(parseFloat(await card.evaluate(c=>c.style.getPropertyValue('--yaw')))>5);await page.waitForTimeout(220);await shot('medal-tilt');
    await page.mouse.up();assert.equal(await card.getAttribute('aria-pressed'),'false');
    await tap('#wall-medal button');await page.waitForTimeout(410);await shot('medal-reverse');
    await page.keyboard.press('Space');assert.equal(await card.getAttribute('aria-pressed'),'false');
    await tap('#wall-close');await one('#win').waitFor();await tap('#win-collect');await one('#room-detail').waitFor();
    await tap('#room-close');await tap('#win-menu');await page.reload();
    await tap('.stage-card[data-stage=snow]');await one('#win').waitFor();assert.equal(await count('snow'),1);
    assert.doesNotMatch(await one('#win-note').innerText(),/第一次通关/);await tap('#again');await one('#grab:enabled').waitFor();
    assert.equal(JSON.parse(await stored()).snow.round,0);assert.equal(await count('snow'),1);
    // Exercise another actual sixth catch with the previous medal already saved.
    await page.evaluate(seed=>{const data=JSON.parse(localStorage.getItem('toy-park-v2'));
      data.snow={...data.snow,...seed.snow,clears:1,total:11};localStorage.setItem('toy-park-v2',JSON.stringify(data));},seed);
    await page.reload();await tap('.stage-card[data-stage=snow]');await one('#grab:enabled').waitFor();await tap('#grab');await one('#win').waitFor({timeout:30000});
    assert.equal(await count('snow'),2);assert.match(await one('#win-note').innerText(),/第 2 枚/);
    await tap('#win-menu');await page.setViewportSize({width:568,height:320});await page.emulateMedia({reducedMotion:'reduce'});
    await tap('#wall-open');await tap('.medal-slot[data-stage=snow]');await tap('#wall-medal button');
    assert.equal(await one('#wall-medal .medal-body').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
    await tap('#wall-back');await tap('.medal-slot[data-stage=spidey]');await tap('#wall-back');await tap('#wall-close');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    // Every design must resolve to a distinct named mascot and sprite cell.
    await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('toy-park-v2'));
      for(const b of Object.values(data))b.clears=1;localStorage.setItem('toy-park-v2',JSON.stringify(data));});
    await page.reload();await tap('#wall-open');const rows=await one('.medal-slot').evaluateAll(els=>els.map(e=>[
      e.dataset.stage,e.querySelector('.slot-state').textContent,getComputedStyle(e).getPropertyValue('--atlas-x')+','+getComputedStyle(e).getPropertyValue('--atlas-y')]));
    assert.equal(new Set(rows.map(r=>r[1])).size,32);assert.equal(new Set(rows.map(r=>r[2])).size,32);
    assert.match(await one('#wall-summary').innerText(),/32 \/ 32 款.*共 32 枚/);
    await page.setViewportSize({width:1100,height:690});await shot('all-designs');
    assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
    fs.writeFileSync(path.join(qaDir,'medal-tests.json'),JSON.stringify({designs:rows,initial:'0/12',history:'5 designs, 6 medals',
      first:'6 designs, 7 medals',repeat:'snow ×2',reload:true,keyboard:true,reducedMotion:true,offline:true,errors},null,2));
    console.log('PASS 12 unique offline medals, old clears, two actual sixth catches, drag, flip, award-once, re-entry, outlet, small landscape and reduced motion.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
