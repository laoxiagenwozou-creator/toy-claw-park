// Replay exactly the same eye positions through the native bridge of two offline releases.
const {chromium}=require('playwright');
const {qaDir}=require('./paths.cjs');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const round=n=>Number(n.toFixed(3));
async function replay(browser,file,label){
  const page=await browser.newPage({viewport:{width:1008,height:672},hasTouch:true,reducedMotion:'reduce',offline:true});
  try{
    await page.addInitScript(()=>{
      let time=1000,frameId=0,queue=new Map();
      Object.defineProperty(performance,'now',{value:()=>time});
      window.requestAnimationFrame=f=>{queue.set(++frameId,f);return frameId;};
      window.cancelAnimationFrame=id=>queue.delete(id);
      window.frame=dt=>{
        time+=dt;const pending=queue;queue=new Map();
        for(const cb of pending.values())cb(time);
      };
      window.cameraRequests=[];
      window.BudNative={setCameraEnabled(on){cameraRequests.push(on);if(on)window.BudCamera.state('starting');}};
      // Both matrices come from the rendered scene. Skip orthographic shadow passes.
      const gl=WebGL2RenderingContext.prototype,names=new WeakMap();
      const get=gl.getUniformLocation,set=gl.uniformMatrix4fv;
      gl.getUniformLocation=function(program,name){
        const loc=get.call(this,program,name);if(loc)names.set(loc,name);return loc;
      };
      gl.uniformMatrix4fv=function(loc,transpose,data,...more){
        const name=names.get(loc);
        if(name==='projectionMatrix'&&data[11]===-1&&data[15]===0)window.proj=[data[0],data[8]];
        if(name==='viewMatrix'&&data[0]===1&&data[5]===1&&data[10]===1)window.view=[data[12],data[14]];
        return set.call(this,loc,transpose,data,...more);
      };
      window.hold=(x,span,n)=>{
        for(let j=0;j<n;j++){
          window.BudCamera.sample(x,.48,span,90,performance.now());
          // A 12 Hz detector drives a 24 Hz renderer.
          frame(1000/24);frame(1000/24);
        }
        return {projection:window.proj,view:window.view};
      };
    });
    const click=sel=>page.locator(sel).evaluate(el=>el.click());
    async function choose(sel,id){
      await click(sel);
      await page.waitForFunction(id=>document.querySelector('#machine').dataset.stage===id&&document.querySelector('#machine').dataset.mode==='play',id,{polling:50,timeout:120000});
    }
    await page.goto(pathToFileURL(path.resolve(file)).href);
    await choose('[data-stage="snow"]','snow');await click('#camera');
    const poses={};
    for(const [pose,x,span] of [['center',.50,.145],['left',.40,.120],['right',.60,.120],['far',.73,.103],['edge',.94,.09]]){
      poses[pose]=await page.evaluate(([x,span])=>hold(x,span,24),[x,span]);
      if(['center','left','right','edge'].includes(pose))await page.screenshot({path:path.join(qaDir,label+'-'+pose+'.jpg'),type:'jpeg',quality:93});
    }
    function percentAt(p,z){
      const [sx,ox]=p.projection,[vx,vz]=p.view;
      return 50*(1+sx*vx/(-vz-z)-ox);
    }
    const result={};
    for(const [key,p] of Object.entries(poses)){
      const [sx,ox]=p.projection;
      result[key]={eyeAngle:round(Math.atan(-ox/sx)*180/Math.PI),focal:round(sx),
        frontPercent:round(percentAt(p,3.025)),rearPercent:round(percentAt(p,-4.25))};
      assert.ok(Math.abs(percentAt(p,3.025)-50)<.01,'the physical front pane moved');
      assert.equal(p.projection[0],poses.center.projection[0],'lateral sway altered depth');
    }
    if(process.argv.includes('--film')){
      const dir=path.join(qaDir,label+'-sway');fs.mkdirSync(dir,{recursive:true});
      await page.evaluate(()=>hold(.50,.145,26));await click('#center');
      for(let i=0;i<132;i++){
        await page.evaluate(i=>{
          const ease=t=>(1-Math.cos(Math.PI*t))/2;
          let x=0;
          if(i>=12&&i<40)x=-ease((i-12)/28);
          else if(i>=40&&i<51)x=-1;
          else if(i>=51&&i<95)x=-1+2*ease((i-51)/44);
          else if(i>=95&&i<106)x=1;
          else if(i>=106)x=1-ease((i-106)/25);
          if(i%2===0)window.BudCamera.sample(.5+.10*x,.48,.145*(1-.18*Math.abs(x)),90,performance.now());
          frame(1000/24);
        },i);
        await page.screenshot({path:path.join(dir,String(i).padStart(4,'0')+'.jpg'),type:'jpeg',quality:89});
      }
    }
    await click('#menu-button');await choose('[data-stage="town"]','town');
    result.resume=await page.evaluate(()=>({requests:[...cameraRequests],on:document.querySelector('#camera').getAttribute('aria-pressed')}));
    if(label==='v230'){
      assert.deepEqual(result.resume,{requests:[true,false,true],on:'true'});
      await click('#camera');await click('#menu-button');await choose('[data-stage="yard"]','yard');
      assert.deepEqual(await page.evaluate(()=>cameraRequests),[true,false,true,false]);
      await click('#camera');await page.evaluate(()=>BudCamera.state('denied'));
      await click('#menu-button');await choose('[data-stage="town"]','town');
      assert.deepEqual(await page.evaluate(()=>cameraRequests),[true,false,true,false,true]);
    }
    return result;
  }finally{await page.close();}
}
(async()=>{
  if(process.argv.length<4||process.argv.length>5)throw Error('Pass the baseline and candidate HTML paths, optionally followed by --film.');
  const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const baseline=await replay(browser,process.argv[2],'v221');
    const candidate=await replay(browser,process.argv[3],'v230');
    const reach=p=>p.right.rearPercent-p.left.rearPercent;
    const ratio=round(reach(candidate)/reach(baseline));
    assert.ok(ratio>2.2&&ratio<2.65);
    assert.ok(Math.abs(candidate.left.eyeAngle+candidate.right.eyeAngle)<.03);
    assert.ok(candidate.far.eyeAngle>13&&candidate.edge.eyeAngle<17);
    fs.writeFileSync(path.join(qaDir,'view-range.json'),JSON.stringify({baseline,candidate,rearTravelRatio:ratio},null,2));
    console.log(JSON.stringify({baseline,candidate,rearTravelRatio:ratio}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
