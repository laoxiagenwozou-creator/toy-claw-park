const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const {gameHtml} = require('../../qa/paths.cjs');
const history = require('../../qa/medal-fixture.json');

async function run() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({hasTouch: true, offline: true, viewport: {width: 1100, height: 750}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(history => {
      localStorage.setItem('toy-park-v2', JSON.stringify(history));
      window.cameraRequests = [];
      window.webkit = {messageHandlers: {park: {postMessage(message) {
        if (message.action === 'camera') window.cameraRequests.push(message.enabled);
      }}}};
    }, history);
    const bridge = fs.readFileSync(path.join(__dirname, '../App/Bridge.js'), 'utf8');
    await page.addInitScript({content: 'const parkHasFrontCamera = true;\n' + bridge});
    await page.goto(pathToFileURL(gameHtml).href);
    const tap = selector => page.locator(selector).tap();
    await tap('#wall-open');
    await tap('.medal-slot[data-stage=town]');
    assert.equal(await page.evaluate(() => cameraRequests.at(-1)), true);
    const card = page.locator('#wall-medal .foil-card');
    const yaw = () => card.evaluate(el => parseFloat(el.style.getPropertyValue('--yaw')));
    async function sample(x) {
      await page.evaluate(async x => {
        for (let frame = 0; frame < 18; ++frame) {
          BudCamera.sample(x, .48, .145, 3, performance.now());
          await new Promise(resolve => setTimeout(resolve, 45));
        }
      }, x);
      return yaw();
    }
    await sample(.50);
    const left = await sample(.40);
    const right = await sample(.60);
    assert.ok(left < -5 && right > 5, JSON.stringify({left, right}));
    await tap('#wall-medal .foil-card');
    const back = await sample(.60);
    assert.ok(back < -5);
    await tap('#wall-back');
    assert.equal(await page.evaluate(() => cameraRequests.at(-1)), false);
    await tap('.medal-slot[data-stage=town]');
    await page.evaluate(() => BudCamera.state('denied'));
    assert.equal(await page.locator('#wall-camera').getAttribute('aria-pressed'), 'false');
    await tap('#wall-medal .foil-card');
    assert.equal(await card.getAttribute('aria-pressed'), 'true');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({left, right, back, cameraStopsOnExit:true, denialAllowsFlip:true}));
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
