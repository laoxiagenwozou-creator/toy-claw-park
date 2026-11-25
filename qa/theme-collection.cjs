// The five cabinets share one disposable wallet and a save from the seven-cabinet version.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const {gameHtml, qaDir} = require('./paths.cjs');
const {installProbe} = require('./view-steering.cjs');

const missions = [
  ['pony','ponyTwilight','紫悦'], ['peppa','peppaPig','佩奇'],
  ['sheriff','sheriffLab','啦咘啦哆警长'], ['chicks','chickChip','麦奇'],
  ['spidey','webPeter','蜘蛛侠']
];

async function run() {
  const browser = await chromium.launch({args:['--use-angle=d3d11']});
  try {
    const page = await browser.newPage({offline:true, hasTouch:true, reducedMotion:'reduce',
      viewport:{width:1008,height:672}});
    const errors = [], external = [], layouts = [], receipts = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/^https?:/.test(r.url())) external.push(r.url()); });
    await page.addInitScript(installProbe);
    await page.addInitScript(() => {
      if (localStorage.getItem('toy-park-v2')) return;
      const town = {slots:[null,null,'plane',null,'crane',null],round:4,total:4,clears:0,
        shelf:{owned:{fire:1},order:['fire'],pending:{},request:'complete'}};
      localStorage.setItem('toy-park-v2', JSON.stringify({town}));
    });
    await page.goto(pathToFileURL(gameHtml).href);
    const el = selector => page.locator(selector);
    const click = selector => el(selector).evaluate(button => button.click());
    const tick = ms => page.evaluate(ms => window.advance(ms), ms);
    const until = (fn, arg) => page.waitForFunction(fn, arg, {polling:30,timeout:35000});
    const board = id => page.evaluate(id => JSON.parse(localStorage.getItem('toy-park-v2'))[id], id);
    const old = await board('town');
    for (const [width,height] of [[568,320],[667,375],[1008,672]]) {
      await page.setViewportSize({width,height});
      const sizes = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.stage-card')];
        const footer = document.querySelector('#stages footer').getBoundingClientRect();
        const rects = cards.map(el => el.getBoundingClientRect());
        const shown = cards.every((el,i) => {
          const r=rects[i], pic=el.querySelector('img').getBoundingClientRect();
          return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=footer.top &&
            pic.height>18 && el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
        });
        return {count:cards.length,shown,footerFits:footer.bottom<=innerHeight};
      });
      assert.deepEqual(sizes,{count:12,shown:true,footerFits:true});
      layouts.push({width,height,...sizes});
    }
    await click('#parent-open');
    await el('#parent-pin').fill('2468'); await el('#pin-confirm').fill('2468');
    await click('#pin-submit'); await el('#parent-controls').waitFor();
    await click('label[for=coin-limit]'); await el('#allowance').fill('5');
    await el('#catch-percent').press('End'); await click('#parent-save');
    await el('#parent-settings').waitFor({state:'hidden'});
    for (const [index,[stage,kind,name]] of missions.entries()) {
      await click('.stage-card[data-stage="'+stage+'"]');
      await until(id => document.querySelector('#machine').dataset.stage===id &&
        document.querySelector('#machine').dataset.mode==='play',stage);
      await tick(100);
      await click('#request-open');await click('#accept-request');
      await until(() => document.querySelector('#mission-card').dataset.state==='accepted');
      await click('#room-close');await click('#coin-insert');
      await until(() => !document.querySelector('#grab').disabled);
      for (const [key,units] of [['ArrowLeft',.71],['ArrowDown',1.85]]) {
        await page.keyboard.down(key); await tick(units*1000/2.05);
        await page.keyboard.up(key); await tick(350);
      }
      await click('#grab'); await until(() => document.querySelector('#status').textContent==='抓爪下来啦');
      for (let i=0;i<30 && await el('#menu-button').isDisabled();i++) await tick(450);
      const prize = await board(stage);
      assert.equal(prize?.shelf.pending[kind],1,stage+' '+await el('#status').innerText());
      assert.equal(prize.shelf.request,'delivery');assert.equal(prize.total,1);
      assert.equal(await el('#coin-balance').innerText(),'余 '+(4-index)+' 枚');
      await click('#outlet');
      await until(() => document.querySelector('#toy-view').dataset.ready==='true' &&
        !document.querySelector('#room-detail').hidden);
      assert.equal(await el('#toy-view').getAttribute('data-kind'),kind);
      await click('#place-toy');
      await until(() => !document.querySelector('#room-shelf').hidden);
      const stored = await board(stage);
      assert.equal(stored.shelf.owned[kind],1);assert.equal(stored.shelf.request,'complete');
      assert.deepEqual(stored.shelf.pending,{});
      receipts.push({stage,kind,name,owned:1,request:stored.shelf.request,balance:4-index});
      await click('#room-close');await click('#menu-button');
    }
    await page.reload();
    assert.deepEqual(await board('town'),old);
    for (const {stage,kind} of receipts) assert.equal((await board(stage)).shelf.owned[kind],1);
    assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
    const result={layouts,receipts,oldSavePreserved:true,external,errors};
    fs.writeFileSync(path.join(qaDir,'theme-collection.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify(result));
  } finally {await browser.close();}
}
run().catch(e => {console.error(e);process.exitCode=1;});
