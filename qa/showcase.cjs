// Render the actual offline game at fixed frame times for a 24 fps demonstration.
const {qaDir,gameHtml}=require('./paths.cjs');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const page=await browser.newPage({viewport:{width:1008,height:672},offline:true,hasTouch:true});
    const folder=path.join(qaDir,'showcase-221');fs.mkdirSync(folder,{recursive:true});
    await page.addInitScript(()=>{
      let clock=performance.now(),next=0,queue=new Map();
      window.requestAnimationFrame=f=>{queue.set(++next,f);return next;};
      window.cancelAnimationFrame=id=>queue.delete(id);
      window.advance=async(dt)=>{
        clock+=dt;const now=queue;queue=new Map();
        for(const f of now.values())f(clock);
        for(let i=0;i<5;i++)await Promise.resolve();
      };
    });
    let frame=0;
    async function frames(n,mark=-1){
      for(let i=0;i<n;i++){
        await page.evaluate(()=>advance(1000/24));
        const bytes=await page.screenshot({type:'jpeg',quality:88});
        fs.writeFileSync(path.join(folder,String(frame++).padStart(4,'0')+'.jpg'),bytes);
        if(i===mark)fs.writeFileSync(path.join(qaDir,'crossing-221.jpg'),bytes);
      }
    }
    async function choose(index,id,n,mark=-1){
      await page.locator(index).tap();
      await page.waitForFunction(()=>document.querySelector('#machine').dataset.mode==='travel',null,{polling:35,timeout:60000});
      await frames(n,mark);
      assert.equal(await page.locator('#machine').getAttribute('data-stage'),id);
      assert.equal(await page.locator('#grab').isEnabled(),true);
    }
    await page.goto(pathToFileURL(gameHtml).href);await page.locator('.stage-card').last().waitFor();
    await page.evaluate(()=>document.fonts.ready);await frames(17);
    await choose('[data-stage="snow"]','snow',36);await frames(9);
    await choose('#next-bay','town',26);await frames(8);
    await page.locator('#menu-button').tap();await frames(13);
    await choose('[data-stage="yard"]','yard',35);await frames(13);
    await choose('#previous-bay','lookout',28,8);await frames(15);
    console.log('Verified three moving routes including passing the intervening cabinet, '+frame+' frames at 24 fps.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
