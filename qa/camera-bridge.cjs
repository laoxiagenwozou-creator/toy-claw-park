const {qaDir,gameHtml}=require('./paths.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const p=await browser.newPage({viewport:{width:790,height:520},hasTouch:true,offline:true});
  await p.addInitScript(()=>{
    window.BudNative={setCameraEnabled(on){if(on)window.BudCamera.state('starting');}};
    // Observe the camera's actual WebGL projection. Shadow maps use orthographic matrices.
    const gl=WebGL2RenderingContext.prototype, locations=new WeakMap();
    const get=gl.getUniformLocation,set=gl.uniformMatrix4fv;window.projectionTrace=[];
    gl.getUniformLocation=function(program,name){const loc=get.call(this,program,name);if(loc)locations.set(loc,name);return loc;};
    gl.uniformMatrix4fv=function(loc,transpose,data,...rest){
      if(loc&&locations.get(loc)==='projectionMatrix'&&data[11]===-1&&data[15]===0){
        const last=window.projectionTrace.at(-1);
        if(!last||last[0]!==data[0]||last[1]!==data[8])window.projectionTrace.push([data[0],data[8]]);
      }
      return set.call(this,loc,transpose,data,...rest);
    };
  });
  await p.goto(pathToFileURL(gameHtml).href);
  await p.locator('[data-stage="yard"]').tap();await p.locator('#machine').waitFor();await p.waitForFunction(()=>document.querySelector('#machine').dataset.mode==='play',null,{timeout:90000});
  assert.equal(await p.locator('#camera').getAttribute('aria-pressed'),'true');
  const results=await p.evaluate(async()=>{
    const wait=t=>new Promise(r=>setTimeout(r,t));
    const feed=async(x,y,span)=>{window.BudCamera.sample(x,y,span,90,performance.now());await wait(82);};
    const read=()=>window.projectionTrace.at(-1).slice();
    for(let i=0;i<12;i++)await feed(.5,.48,.145);
    const base=read();const start=window.projectionTrace.length;
    for(let i=0;i<37;i++){
      const a=Math.sin(i*2*Math.PI/15);
      await feed(.5+.113*a,.48+.002*Math.sin(i),.145*(1-.20*Math.abs(a)+.024*Math.sin(i*1.8)));
    }
    for(let i=0;i<15;i++)await feed(.60,.48,.12);
    const end=window.projectionTrace.length,sway=window.projectionTrace.slice(start,end),side=read();
    await wait(1150);const lost=read(),lostUI=document.getElementById('view-label').textContent;
    for(let i=0;i<42;i++)await feed(.5,.48,.180);
    const near=read();
    document.getElementById('center').click();
    const recenterStart=performance.now();
    do {await feed(.5,.48,.18);} while(performance.now()-recenterStart<3500 && Math.abs(read()[0]/base[0]-1)>.006);
    const recenterMs=Math.round(performance.now()-recenterStart);
    const centered=read();window.BudCamera.state('denied');
    return {base,side,lost,lostUI,near,centered,recenterMs,swaySamples:sway.length,
      depthRange:[Math.min(...sway.map(a=>a[0])),Math.max(...sway.map(a=>a[0]))],
      lateralRange:[Math.min(...sway.map(a=>a[1])),Math.max(...sway.map(a=>a[1]))]};
  });
  console.log(JSON.stringify(results));
  assert.ok(results.swaySamples>10);
  assert.ok(results.depthRange[1]-results.depthRange[0]<1e-6);
  assert.ok(results.lateralRange[1]-results.lateralRange[0]>.20);
  assert.ok(Math.abs(results.side[1]-results.lost[1])<.004);
  assert.equal(results.lostUI,'请看向屏幕');
  assert.ok(results.near[0]/results.base[0]<.87);
  assert.ok(Math.abs(results.centered[0]/results.base[0]-1)<.01);
  assert.equal(await p.locator('#camera').getAttribute('aria-pressed'),'false');
  console.log('PASS actual release bridge and WebGL projection, sideways motion has constant depth, missing-face hold, deliberate approach, recenter, fallback.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
