const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const {pathToFileURL} = require('node:url');
const {gameHtml} = require('./paths.cjs');
const {installProbe} = require('./view-steering.cjs');

async function exercise(browser, fault) {
  const page = await browser.newPage({offline:true, reducedMotion:'reduce',viewport:{width:1008,height:672}});
  try {
    await page.addInitScript(installProbe);
    await page.addInitScript(() => {
      localStorage.setItem('toy-park-catch-percent','0');
      localStorage.setItem('toy-park-v2',JSON.stringify({snow:{
        slots:['snowPenguin','lemonChick','lilacCat','skyPenguin','peachChick','violetCat'],
        poses:Array(6).fill(null)
      }}));
      const save = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key,value) {
        if (window.failLanding && key === 'toy-park-v2') throw new DOMException('Test storage full','QuotaExceededError');
        return save.call(this,key,value);
      };
    });
    await page.goto(pathToFileURL(gameHtml).href);
    const click = s => page.locator(s).evaluate(el => el.click());
    const advance = ms => page.evaluate(time => window.advance(time),ms);
    const wait = fn => page.waitForFunction(fn,null,{polling:35});
    const status = () => page.locator('#status').textContent();
    await click('[data-stage="snow"]');
    await wait(() => document.querySelector('#machine').dataset.mode === 'play');
    await advance(100);
    const home = await page.evaluate(() => window.probe.arm);
    for (const [key, distance] of [['ArrowLeft',.71],['ArrowDown',1.85]]) {
      await page.keyboard.down(key); await advance(distance/2.05*1000);
      await page.keyboard.up(key); await advance(400);
    }
    const aim = await page.evaluate(() => window.probe.arm);
    assert.ok(Math.hypot(aim.x+1.49,aim.z-1.47)<.02);
    await page.evaluate(()=>{
      window.probe.observeModel=m=>{
        if(Math.abs(m[12]+1.49)<.0001&&Math.abs(m[14]-1.47)<.0001&&m[13]<1.9&&m[5]>.2)
          window.penguinAngle=Math.atan2(m[8],m[10]);
      };
    });
    // A real tap previews the first snow toy. At grab time the preview is mid-turn.
    const view = await page.locator('#viewport').boundingBox();
    const h = Math.max(7.94, 15.6*view.height/view.width), k = 10.8/(10.8+3.025-1.47);
    const eye = h/2-.07+2.32;
    await page.mouse.click(view.x+view.width*.5-1.49*k*view.height/h,
      view.y+view.height*(.5-(eye+(.82-eye)*k-(h/2-.07))/h));
    const toy = await status();
    assert.doesNotMatch(toy,/瞄准|移到/);
    await advance(420);
    const previewAngle=await page.evaluate(()=>window.penguinAngle);
    assert.ok(Math.abs(previewAngle-.38)>.1,'preview actually rotated the rendered penguin');
    await click('#grab');
    await wait(() => document.querySelector('#status').textContent === '抓爪下来啦');
    await advance(50);
    const grabbedAngle=await page.evaluate(()=>window.penguinAngle);
    assert.ok(Math.abs(grabbedAngle-.38)<.001,'rendered model returned to its saved collision angle');
    await advance(900);
    if (fault === 'quota') await page.evaluate(() => { window.failLanding = true; });
    else await page.evaluate(() => {
      const disk=JSON.parse(localStorage.getItem('toy-park-v2'));
      disk.snow.poses[0]={x:-1.1,z:1.2,angle:.77};
      localStorage.setItem('toy-park-v2',JSON.stringify(disk));
    });
    const samples=[];
    for(let i=0;i<110;i++){
      await advance(50);
      samples.push(await page.evaluate(()=>window.probe.arm));
      if(await page.locator('#grab').isEnabled()) break;
    }
    assert.match(await status(),fault==='quota'?/没有存好/:/已更新/);
    assert.ok(samples.some(p=>p.y<home.y-.5),'failed slip actually reached the table');
    const trip=samples.filter(p=>Math.hypot(p.x-aim.x,p.z-aim.z)>.015);
    assert.ok(trip.length>3 && trip.every(p=>Math.abs(p.y-home.y)<.01),'claw crossed table before fully raised');
    const last=trip.at(-1);
    assert.ok(Math.hypot(last.x-home.x,last.z-home.z)<.01 && await page.locator('#grab').isEnabled());
    if(fault==='conflict')assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('toy-park-v2')).snow.poses[0]),{x:-1.1,z:1.2,angle:.77});
    console.log(fault, toy, 'opened and raised before return;', trip.length, 'horizontal samples at home height');
  } finally { await page.close(); }
}
async function run(){
  const browser=await chromium.launch({args:['--use-angle=d3d11']});
  try{for(const fault of ['quota','conflict'])await exercise(browser,fault);}
  finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
