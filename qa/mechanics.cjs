const {qaDir,gameHtml}=require('./paths.cjs');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const file=pathToFileURL(gameHtml).href;
const frameDir=path.join(qaDir,'film');
const filming=process.argv.includes('--film');
(async()=>{
 const args=process.env.TOY_CLAW_QA_HARDWARE?['--use-angle=d3d11']:['--use-angle=swiftshader','--enable-unsafe-swiftshader'];
 const browser=await chromium.launch({headless:true,args});
 try{
  const page=await browser.newPage({viewport:{width:1008,height:672},offline:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
  await page.addInitScript(()=>{
    let callbacks=new Map(),tick=performance.now(),next=0;
    window.requestAnimationFrame=cb=>{callbacks.set(++next,cb);return next;};
    window.cancelAnimationFrame=i=>callbacks.delete(i);
    window.tickGame=async(ms)=>{
      let left=ms;
      while(left>.00001){const step=Math.min(50,left);left-=step;tick+=step;
        const list=callbacks;callbacks=new Map();for(const cb of list.values())cb(tick);
        for(let j=0;j<5;j++)await Promise.resolve();
      }
    };
  });
  await page.goto(file);await page.locator('.stage-card[data-stage="yard"]').waitFor();
  await page.evaluate(()=>tickGame(400));
  let n=0;
  if(filming)fs.mkdirSync(frameDir,{recursive:true});
  const shot=async()=>{if(filming)await page.screenshot({path:path.join(frameDir,String(n++).padStart(4,'0')+'.jpg'),type:'jpeg',quality:86});};
  async function step(ms,capture=false){
    if(!filming||!capture){await page.evaluate(ms=>tickGame(ms),ms);return;}
    for(let t=0;t<ms;t+=100){await page.evaluate(ms=>tickGame(ms),Math.min(100,ms-t));await shot();}
  }
  async function pause(ms){if(filming){for(let i=0;i<ms/100;i++)await shot();}}
  const tap=async id=>{
    if((id==='#guide'||id==='#center')&&!await page.locator(id).isVisible())await page.locator('#view-tools-toggle').tap();
    await page.locator(id).tap();
    if((id==='#guide'||id==='#center')&&await page.locator('#view-options').isVisible())await page.locator('#view-tools-toggle').tap();
  };
  async function enter(id){await tap('.stage-card[data-stage="'+id+'"]');await page.locator('#machine').waitFor();await step(1550);await page.waitForFunction(()=>document.querySelector('#machine').dataset.mode==='play',null,{polling:50});}
  const text=id=>page.locator(id).innerText();
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('toy-park-v2')));
  async function keyboard(code,ms,capture=false){await page.keyboard.down(code);await step(Math.abs(ms),capture);await page.keyboard.up(code);}
  const speed=2.05;
  let arm={x:-.78,z:-.38};
  const home=()=>{arm={x:-.78,z:-.38};};
  async function go(x,z,capture=false){
    await keyboard(x<arm.x?'ArrowLeft':'ArrowRight',1000*Math.abs(x-arm.x)/speed,capture);
    await keyboard(z<arm.z?'ArrowUp':'ArrowDown',1000*Math.abs(z-arm.z)/speed,capture);arm={x,z};
  }
  async function drop(ms=6000,capture=false){
    await tap('#grab');
    // The first 180 ms of cable travel runs concurrently with the wallet.
    // Let that animation and the real IndexedDB task both finish before fast-forwarding.
    await step(200,capture);
    await page.waitForFunction(()=>document.getElementById('status').textContent==='抓爪下来啦',null,{polling:25});
    await step(ms-200,capture);
    if(ms>=5000){
      // Indexed browser tasks (including the prize write lock) run between animation batches.
      for(let i=0;i<30&&await page.locator('#menu-button').isDisabled();i++){await page.waitForTimeout(12);await step(160,capture);}
    }
  }
  async function touchToy(x,y,z){
    const b=await page.locator('#viewport').boundingBox(),aspect=b.width/b.height,h=Math.max(7.94,15.6/aspect),w=h*aspect;
    const k=10.8/(10.8+3.025-z),eye=h/2-.07+2.32;
    await page.touchscreen.tap(b.x+b.width*(.5+x*k/w),b.y+b.height*(.5-((eye+(y-eye)*k)-(h/2-.07))/h));
  }
  async function openSettings(first=false){
    await tap('#parent-open');await page.locator('#parent-pin').fill('4826');
    if(first)await page.locator('#pin-confirm').fill('4826');
    await tap('#pin-submit');await page.locator('#parent-controls').waitFor();
  }
  await openSettings(true);assert.equal(await text('#catch-value'),'30%');
  await tap('#chance-up');assert.equal(await text('#catch-value'),'35%');
  await tap('#parent-cancel');await openSettings();assert.equal(await text('#catch-value'),'30%');
  await page.screenshot({path:path.join(qaDir,'parent-default.png')});
  await page.locator('#catch-percent').press('Home');await tap('#parent-save');
  await page.locator('#parent-settings').waitFor({state:'hidden'});
  await pause(550);await enter('snow');await pause(500);
  const frame=await page.locator('#viewport').boundingBox();
  for(const [name,dx] of [['left',-.245],['right',.52]]){
    const sx=frame.width*.52,sy=frame.height*.50;await page.mouse.move(sx,sy);await page.mouse.down();
    await page.mouse.move(sx+frame.width*dx,sy,{steps:10});await page.mouse.up();await step(760,true);
    await page.screenshot({path:path.join(qaDir,'snow-'+name+'.png')});
  }
  // Cross the physical join, including the last and first cabinets. During transit the grab is disabled.
  async function cross(side,id,record=false){
    const before=await page.locator('#machine').getAttribute('data-stage');
    if(side==='left-glass'||side==='right-glass')await page.touchscreen.tap(frame.width*(side==='left-glass'?.045:.96),frame.height*.47);
    else await tap('#'+side+'-bay');
    await page.waitForFunction(()=>document.querySelector('#machine').dataset.mode==='travel',null,{polling:50});
    assert.equal(await page.locator('#grab').isDisabled(),true);
    await step(330,record);
    if(record)await page.screenshot({path:path.join(qaDir,'aisle-in-motion.png')});
    assert.notEqual(before,id);
    await step(960,record);
    assert.equal(await page.locator('#machine').getAttribute('data-stage'),id);
    assert.equal(await page.locator('#machine').getAttribute('data-mode'),'play');
  }
  await cross('left-glass','superhero');await cross('right-glass','snow');
  await cross('next','town',true);await pause(240);await cross('next','lookout',true);
  await cross('next','yard',true);await pause(400);
  // The pick and grab fixtures below specify cabinet coordinates from straight ahead.
  await tap('#center');await step(700);
  await touchToy(-1.49,.86,1.47);assert.equal(await text('#status'),'布鲁伊');
  await step(730,true);await page.screenshot({path:path.join(qaDir,'bluey-back.png')});await step(830,true);
  const clawClip={x:Math.round(frame.width*.37),y:Math.round(frame.height*.12),width:Math.round(frame.width*.20),height:Math.round(frame.height*.22)};
  const clawImage=()=>page.screenshot({clip:clawClip});
  let homeImage=await clawImage();
  async function verifyClawPose(atHome,label){
    const actual=await clawImage();
    if(actual.equals(homeImage)&&atHome)return;
    const changed=await page.evaluate(async encoded=>{
      const [a,b]=await Promise.all(encoded.map(async data=>{
        const bytes=Uint8Array.from(atob(data),v=>v.charCodeAt(0));
        const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
        const canvas=new OffscreenCanvas(bitmap.width,bitmap.height),ctx=canvas.getContext('2d');
        ctx.drawImage(bitmap,0,0);bitmap.close();
        return ctx.getImageData(0,0,canvas.width,canvas.height).data;
      }));
      let different=0;
      for(let i=0;i<a.length;i+=4){
        if(Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]))>3)different++;
      }
      return different;
    },[homeImage.toString('base64'),actual.toString('base64')]);
    // Ignore isolated GPU rounding at edges. Moving the 3D claw changes hundreds of pixels.
    if(atHome?changed<12:changed>120)return;
    fs.writeFileSync(path.join(qaDir,'expected-home.png'),homeImage);
    fs.writeFileSync(path.join(qaDir,'unexpected-claw.png'),actual);
    assert.fail('Unexpected claw pose after '+label+' ('+changed+' changed pixels)');
  }
  await go(3.65,-.22);await verifyClawPose(false,'aiming at empty space');
  await drop(2500);assert.equal(await page.locator('#grab').isDisabled(),true);
  assert.match(await text('#help'),/回到起点/);await step(1500);home();
  assert.match(await text('#status'),/抓空/);assert.equal(await text('#progress'),'0');
  assert.equal(await page.locator('#grab').isEnabled(),true);await verifyClawPose(true,'empty return');
  const goal={x:-1.49+Math.sin(.42)*.045*1.63,z:1.47+Math.cos(.42)*.045*1.63};
  await go(goal.x+.318,goal.z,true);await verifyClawPose(false,'aiming at the first toy');
  await drop(6800,true);home();assert.match(await text('#status'),/滑下来|滚开/);assert.equal(await text('#progress'),'0');
  assert.equal(await page.locator('#grab').isEnabled(),true);await verifyClawPose(true,'slip return');
  const landed=(await state()).yard.poses[0];
  assert.ok(landed&&Math.abs(landed.angle-.42)>.1);
  const displaced={x:landed.x+Math.sin(landed.angle)*.045*1.63,z:landed.z+Math.cos(landed.angle)*.045*1.63};
  await tap('#menu-button');await openSettings();assert.equal(await text('#catch-value'),'0%');
  await page.locator('#catch-percent').press('End');await tap('#parent-save');
  await enter('yard');homeImage=await clawImage();
  await tap('#guide');await step(130,true);await pause(450);
  assert.equal(await page.locator('#guide-state').innerText(),'关');
  await go(displaced.x,displaced.z,true);await verifyClawPose(false,'aiming at the displaced toy');
  await drop(6500,true);home();await verifyClawPose(true,'delivery return');
  assert.equal(await text('#progress'),'1');let boards=await state();assert.equal(boards.yard.total,1);assert.equal(boards.yard.slots[0],null);
  await tap('#guide');await step(100,true);assert.equal(await page.locator('#guide-state').innerText(),'开');
  await pause(300);await tap('#menu-button');await pause(350);await enter('lookout');await pause(400);
  await touchToy(-1.49,1.05,1.47);assert.equal(await text('#status'),'阿奇');
  await step(720,true);await page.screenshot({path:path.join(qaDir,'chase-back.png')});await step(850,true);
  await tap('#menu-button');await enter('yard');assert.equal(await text('#progress'),'1');
  await page.reload();await openSettings();assert.equal(await text('#catch-value'),'100%');
  await page.keyboard.press('Escape');await enter('yard');assert.equal(await text('#progress'),'1');
  // Use a nearly finished isolated browser board to check the refill and completion paths.
  await page.evaluate(()=>{
    const all=JSON.parse(localStorage.getItem('toy-park-v2')),b=all.yard;
    b.round=5;b.total=11;b.slots=['bluey',null,null,null,null,'socks'];b.generations=[0,0,0,0,0,0];
    localStorage.setItem('toy-park-v2',JSON.stringify(all));
  });
  await page.reload();await enter('yard');await tap('#restock');await page.waitForFunction(()=>!document.querySelector('#restock').isConnected||document.querySelector('#status').textContent==='补给口打开啦',null,{polling:20,timeout:5000});await step(6000);
  boards=await state();assert.equal(boards.yard.slots.filter(Boolean).length,6);assert.equal(new Set(boards.yard.slots).size,6);assert.equal(boards.yard.generations[1],1);
  assert.equal(await page.locator('#restock').isVisible(),false);await go(goal.x,goal.z);await drop(6500);
  assert.equal(await page.locator('#win').isVisible(),true);assert.equal((await state()).yard.clears,1);
  await tap('#again');await page.waitForFunction(()=>document.querySelector('#win').hidden,null,{polling:25});await page.locator('#machine').waitFor();await step(1500);await page.waitForFunction(()=>document.querySelector('#progress').textContent==='0',null,{polling:50});
  assert.equal((await state()).yard.total,12);
  await tap('#menu-button');await tap('.stage-card[data-stage="reef"]');await page.locator('#grab').waitFor();
  await page.evaluate(()=>{
    const all=JSON.parse(localStorage.getItem('toy-park-v2'));all.reef.round=6;all.reef.clears=1;localStorage.setItem('toy-park-v2',JSON.stringify(all));
  });await page.reload();await enter('reef');await tap('#next-stage');await page.waitForFunction(()=>document.querySelector('#machine').dataset.mode==='travel',null,{polling:50});await step(1450);await page.waitForFunction(()=>document.querySelector('#status').textContent==='星空基地',null,{polling:50});
  // Reopen a legacy profile containing only its original PAW save.
  await page.evaluate(()=>{localStorage.removeItem('toy-park-v2');localStorage.setItem('adventure-bay-pup-claw-v1',JSON.stringify({total:17,slots:['chase',null,'skye','rubble',null,null],next:2}));});
  await page.reload();await enter('lookout');await drop(3500);assert.match(await text('#status'),/抓空/);
  // A capture through the real controls writes the migrated previous lifetime total.
  const carafe={x:-1.49+Math.sin(.42)*(-.39),z:1.47+Math.cos(.42)*(-.39)};
  arm={x:-.78,z:-.38};await go(carafe.x,carafe.z);await drop(6500);
  boards=await state();assert.equal(boards.lookout.total,18);assert.equal(boards.lookout.slots[0],null);assert.equal(boards.lookout.slots[1],null);
  assert.deepEqual(errors,[]);
  console.log('PASS visible home pose after empty, slip and delivery; controls locked until return; 0/30/100 parent settings, cancel/save/reload; slipped toy reachable at its new saved pose; linked cabinets, chute, progress, refill, win/replay, legacy progress. film frames',n);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
