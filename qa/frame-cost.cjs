// Exercise both shipped games at the same viewport and count WebGL work per moving frame.
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const {qaDir}=require('./paths.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');

async function measure(browser,file,label){
  const page=await browser.newPage({viewport:{width:906,height:604},reducedMotion:'reduce',offline:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{
    await page.addInitScript(()=>{
      let now=performance.now(),queue=new Map(),id=0,frame;
      window.requestAnimationFrame=cb=>{queue.set(++id,cb);return id;};
      window.cancelAnimationFrame=i=>queue.delete(i);
      const gl=WebGL2RenderingContext.prototype,targets=new WeakMap(),bind=gl.bindFramebuffer;
      gl.bindFramebuffer=function(target,buffer){
        if(target===this.FRAMEBUFFER||target===this.DRAW_FRAMEBUFFER)targets.set(this,buffer);
        return bind.call(this,target,buffer);
      };
      const clear=gl.clear;
      gl.clear=function(mask){
        if(frame && (mask & this.DEPTH_BUFFER_BIT)){
          if(targets.get(this))frame.depthPasses++;else frame.display++;
        }
        return clear.call(this,mask);
      };
      for(const key of ['drawElements','drawArrays']){
        const draw=gl[key];
        gl[key]=function(...args){
          if(frame){frame.calls++;if(this.TRIANGLES===args[0])frame.triangles+=(key==='drawElements'?args[1]:args[2])/3;}
          return draw.apply(this,args);
        };
      }
      window.stepFrames=async count=>{
        const records=[];
        while(count-->0){
          frame={depthPasses:0,display:0,calls:0,triangles:0};now+=1000/120;
          const current=queue;queue=new Map();for(const cb of current.values())cb(now);
          await Promise.resolve();records.push(frame);frame=null;
        }
        return records;
      };
    });
    await page.goto(pathToFileURL(path.resolve(file)).href);
    await page.locator('.stage-card[data-stage="snow"]').click();
    await page.waitForFunction(()=>document.getElementById('machine').dataset.mode==='play',null,{polling:50,timeout:120000});
    const step=n=>page.evaluate(n=>stepFrames(n),n);
    await step(2);
    await page.screenshot({path:path.join(qaDir,'clarity-'+label+'-snow.png')});
    await page.keyboard.down('ArrowRight');
    const movement=await step(24);await page.keyboard.up('ArrowRight');await step(34);
    const b=await page.locator('#viewport').boundingBox(),h=Math.max(7.96,14.65*b.height/b.width),w=h*b.width/b.height;
    const y=h/2-.09+3.58,k=23.8/(23.8+3.025-1.47);
    await page.mouse.click(b.x+b.width*(.5-1.49*k/w),b.y+b.height*(.5-(y+(.83-y)*k-(h/2-.09))/h));
    assert.equal(await page.locator('#status').innerText(),'蓝帽企鹅');
    const rotation=await step(6);
    const avg=(rows,key)=>Math.round(rows.reduce((sum,r)=>sum+r[key],0)/rows.length);
    assert.ok(movement.every(f=>f.display===1),'moving claw presents a scene every requested frame');
    assert.ok(rotation.every(f=>f.depthPasses>=1),'rotating a toy must refresh its silhouette');
    assert.deepEqual(errors,[]);
    return {samples:movement.length,drawsPerFrame:avg(movement,'calls'),trianglesPerFrame:avg(movement,'triangles'),
      staticShadowPasses:avg(movement,'depthPasses'),movingPrizeShadowPasses:avg(rotation,'depthPasses')};
  }finally{await page.close();}
}
(async()=>{
  const [oldFile,newFile]=process.argv.slice(2);if(!oldFile||!newFile)throw Error('Pass the baseline and candidate game HTML files.');
  const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    const before=await measure(browser,oldFile,'before'),after=await measure(browser,newFile,'after');
    assert.ok(before.staticShadowPasses>0);assert.equal(after.staticShadowPasses,0);
    assert.ok(after.drawsPerFrame<before.drawsPerFrame);assert.ok(after.trianglesPerFrame<before.trianglesPerFrame);
    const report={before,after};fs.writeFileSync(path.join(qaDir,'frame-cost.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
