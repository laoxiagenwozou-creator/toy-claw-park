const {chromium}=require('playwright'),{qaDir,gameHtml}=require('./paths.cjs');
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url');
const film=process.argv.includes('--film');
async function replay(browser,stage,lift){
  const p=await browser.newPage({viewport:{width:720,height:480},offline:true});
  const name=lift?'carried':'rolled',dir=path.join(qaDir,'drop-'+name);
  if(film)fs.mkdirSync(dir,{recursive:true});
  try{
    await p.addInitScript(()=>{
      localStorage.setItem('toy-park-catch-percent','0');localStorage.setItem('toy-park-show-guide','off');
      localStorage.setItem('toy-park-audio',JSON.stringify({music:false,effects:false}));
      let time=performance.now(),id=0,q=new Map();
      window.requestAnimationFrame=f=>{q.set(++id,f);return id;};window.cancelAnimationFrame=i=>q.delete(i);
      window.advance=async ms=>{while(ms>.00001){const dt=Math.min(50,ms);ms-=dt;time+=dt;const a=q;q=new Map();for(const cb of a.values())cb(time);await Promise.resolve();}};
    });
    const step=ms=>p.evaluate(ms=>advance(ms),ms),click=id=>p.locator(id).evaluate(el=>el.click());
    const wait=fn=>p.waitForFunction(fn,null,{polling:35,timeout:45000});
    async function choose(){
      await click('.stage-card[data-stage="'+stage+'"]');await wait(()=>document.querySelector('#machine').dataset.mode==='travel');
      await step(1700);await wait(()=>document.querySelector('#machine').dataset.mode==='play'&&!document.querySelector('#grab').disabled);
    }
    await p.goto(pathToFileURL(gameHtml).href);await choose();
    for(const [key,units] of [['ArrowLeft',.71],['ArrowDown',1.85]]){
      await p.keyboard.down(key);await step(1000*units/2.05);await p.keyboard.up(key);await step(270);
    }
    await p.evaluate(lift=>{
      const original=Math.random;const seq=[.90,lift?.05:.95];
      Math.random=()=>{if(!seq.length){Math.random=original;return original();}return seq.shift();};
    },lift);
    await click('#grab');await wait(()=>document.querySelector('#status').textContent==='抓爪下来啦');
    const states=new Set();for(let i=0;i<144;i++){
      await step(1000/24);states.add(await p.locator('#status').innerText());
      if(film)await p.screenshot({path:path.join(dir,String(i).padStart(3,'0')+'.jpg'),type:'jpeg',quality:85});
    }
    assert.ok(states.has(lift?'半路滑下来了':'玩具滚开了'),[...states].join(','));
    assert.equal(await p.locator('#grab').isEnabled(),true);assert.equal(await p.locator('#progress').innerText(),'0');
    const read=()=>p.evaluate(id=>JSON.parse(localStorage.getItem('toy-park-v2'))[id].poses[0],stage);
    const settled=await read();assert.ok(Math.hypot(settled.x+1.49,settled.z-1.47)>.05);assert.ok(Math.abs(settled.angle-(stage==='snow'?.38:.42))>.1);
    const viewport=await p.locator('#viewport').boundingBox();const crop={x:Math.round(viewport.width*.19),y:Math.round(viewport.height*.57),width:Math.round(viewport.width*.62),height:Math.round(viewport.height*.405)};
    const picture=()=>p.screenshot({clip:crop});const first=await picture();
    await p.reload();await choose();await step(120);
    assert.deepEqual(await read(),settled);assert.deepEqual(await picture(),first);
    return {stage,result:name,settled,states:[...states],sameSceneAfterReload:true};
  }finally{await p.close();}
}
(async()=>{const b=await chromium.launch({args:['--use-angle=d3d11']});try{
  const rows=[await replay(b,'snow',false),await replay(b,'yard',true)];fs.writeFileSync(path.join(qaDir,'slips.json'),JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
