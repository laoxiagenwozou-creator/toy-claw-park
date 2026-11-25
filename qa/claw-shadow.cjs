// Render matched poses with the aiming ring off in the old and new standalone games.
const {chromium}=require('playwright'),{qaDir}=require('./paths.cjs');
const path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');

async function shoot(browser,file,label){
  const page=await browser.newPage({viewport:{width:1008,height:672},hasTouch:true,offline:true,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.addInitScript(()=>{
    const queue=new Map();let next=0,time=performance.now();
    window.requestAnimationFrame=fn=>{queue.set(++next,fn);return next;};
    window.cancelAnimationFrame=id=>queue.delete(id);
    window.stepScene=async ms=>{
      while(ms>.00001){
        const dt=Math.min(50,ms);time+=dt;ms-=dt;
        const current=[...queue.values()];queue.clear();for(const fn of current)fn(time);
        await Promise.resolve();
      }
    };
  });
  try{
    await page.goto(pathToFileURL(path.resolve(file)).href);
    const click=s=>page.locator(s).evaluate(el=>el.click());
    const step=ms=>page.evaluate(ms=>stepScene(ms),ms);
    const shot=name=>page.screenshot({path:path.join(qaDir,'shadow-'+label+'-'+name+'.png')});
    await click('.stage-card[data-stage="yard"]');
    await page.waitForFunction(()=>!document.querySelector('#machine').hidden&&document.querySelector('#machine').dataset.mode==='play',null,{polling:40,timeout:100000});
    await click('#guide');await step(50);assert.equal(await page.locator('#guide-state').innerText(),'关');
    await shot('home');
    async function move(key,units){
      await page.keyboard.down(key);await step(1000*units/2.65);await page.keyboard.up(key);await step(50);
    }
    await move('ArrowRight',1.8);await shot('across');
    await click('#grab');await step(630);await shot('low');
    await step(4000);
    // Re-enter so both releases start from home even if the older one stayed in place.
    await click('#menu-button');await click('.stage-card[data-stage="yard"]');
    await page.waitForFunction(()=>!document.querySelector('#machine').hidden&&document.querySelector('#machine').dataset.mode==='play',null,{polling:40});
    await move('ArrowLeft',.68);await move('ArrowDown',1.88);await shot('toy');
    assert.deepEqual(errors,[]);
  }finally{await page.close();}
}
(async()=>{
  if(process.argv.length!==4)throw Error('Pass a baseline and candidate HTML.');
  const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{await shoot(browser,process.argv[2],'before');await shoot(browser,process.argv[3],'after');}
  finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
