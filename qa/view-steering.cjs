// Exercise the shipped HTML with real touch input. Observe the claw and the view
// in the WebGL uniforms, independently of the game's steering calculation.
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const { gameHtml } = require('./paths.cjs');

function installProbe() {
  const names = new WeakMap();
  const gl = WebGL2RenderingContext.prototype;
  const locate = gl.getUniformLocation, matrix = gl.uniformMatrix4fv, vector = gl.uniform4f;
  const probe = window.probe = {};
  gl.getUniformLocation = function(program, name) {
    const location = locate.call(this, program, name);
    if (location) names.set(location, name);
    return location;
  };
  gl.uniformMatrix4fv = function(location, transpose, m, ...rest) {
    if (probe.observeModel && names.get(location) === 'modelMatrix') probe.observeModel(m);
    if (names.get(location) === 'projectionMatrix' && m[11] === -1) {
      probe.forwardSlope = m[8] / m[0]; // Screen-center ray in the cabinet's X/Z plane.
      probe.focal = m[0];
    }
    return matrix.call(this, location, transpose, m, ...rest);
  };
  gl.uniform4f = function(location, x, y, z, w) {
    // The first machine is centered at world X=0. Exclude its parked neighbors.
    if (names.get(location) === 'clawPose' && Math.abs(x) < 5) probe.arm = {x, y, z};
    return vector.call(this, location, x, y, z, w);
  };
  let now = 1000, next = 0, callbacks = new Map();
  Object.defineProperty(performance, 'now', { value: () => now });
  window.requestAnimationFrame = fn => { callbacks.set(++next, fn); return next; };
  window.cancelAnimationFrame = id => callbacks.delete(id);
  window.advance = async ms => {
    while (ms > .001) {
      const dt = Math.min(50, ms);
      now += dt; ms -= dt;
      const pending = callbacks; callbacks = new Map();
      for (const fn of pending.values()) fn(now);
      await Promise.resolve();
    }
  };
  window.BudNative = {setCameraEnabled(on) { if (on) window.BudCamera.state('starting'); }};
  window.holdPose = async (x, span = .145) => {
    for (let i = 0; i < 20; i++) {
      window.BudCamera.sample(x, .48, span, 90, now);
      await window.advance(80);
    }
  };
}

async function run() {
  const browser = await chromium.launch({args:['--use-angle=d3d11']});
  try {
    const page = await browser.newPage({offline:true, hasTouch:true, reducedMotion:'reduce',
      viewport:{width:1008, height:672}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(installProbe);
    await page.goto(pathToFileURL(gameHtml).href);
    const click = async selector => {
      const button=page.locator(selector);
      const viewOption=['#guide','#camera','#center'].includes(selector);
      if(viewOption && !await button.isVisible())await page.locator('#view-tools-toggle').tap();
      await button.evaluate(el => el.click());
      if(viewOption && await page.locator('#view-options').isVisible())await page.locator('#view-tools-toggle').tap();
    };
    const wait = fn => page.waitForFunction(fn, null, {polling:40, timeout:60000});
    const advance = ms => page.evaluate(ms => window.advance(ms), ms);
    const state = () => page.evaluate(() => window.probe);
    const hold = (x, span) => page.evaluate(([x, span]) => window.holdPose(x, span), [x, span]);
    // Guaranteed contact outcome only in this new, isolated browser profile.
    await click('#parent-open');
    await page.locator('#parent-pin').fill('2468');
    await page.locator('#pin-confirm').fill('2468');
    await click('#pin-submit');
    await page.locator('#parent-controls').waitFor();
    await page.locator('#catch-percent').press('End');
    await click('#parent-save');
    await page.locator('#parent-settings').waitFor({state:'hidden'});
    await click('[data-stage="snow"]');
    await wait(() => document.querySelector('#machine').dataset.mode === 'play');
    await advance(100);
    await click('#guide');
    assert.equal(await page.locator('#guide-state').innerText(), '关');
    const home = (await state()).arm;
    assert.ok(home && Math.abs(home.x + .78) < .01, 'recorded the active claw at home');
    assert.equal(await page.locator('#camera').getAttribute('aria-pressed'), 'true');
    await hold(.50);
    const neutral = await state(), samples = [];
    const box = await page.locator('#joystick').boundingBox();
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints:points});
    const pressStick = (x, z) => touch('touchStart', [{
      x:box.x + box.width / 2 + box.width * .39 * x,
      y:box.y + box.height / 2 + box.width * .39 * z
    }]);
    async function push(label, x, z, ms = 500, key = null) {
      const before = await state();
      if (key) await page.keyboard.down(key); else await pressStick(x, z);
      await advance(ms);
      if (key) await page.keyboard.up(key); else await touch('touchEnd', []);
      await advance(420); // Include the carriage's deceleration on release.
      const after = await state();
      const dx = after.arm.x - before.arm.x, dz = after.arm.z - before.arm.z;
      const length = Math.hypot(dx, dz);
      const h = Math.atan(before.forwardSlope);
      const observation = {label, headingDeg:+(h*180/Math.PI).toFixed(2), dx:+dx.toFixed(3), dz:+dz.toFixed(3)};
      console.log(JSON.stringify(observation));
      samples.push(observation);
      assert.ok(Math.abs(length - 2.05 * ms / 1000) < .024, label + ': speed changed');
      assert.ok(Math.hypot(dx / length - x, dz / length - z) < .025, label + ': travel left the orthogonal gantry rails');
    }
    const roundTrip = async label => {
      await push(label + ' forward', 0, -1);
      await push(label + ' back', 0, 1);
    };
    await roundTrip('center');
    await hold(.60, .12);
    const right = await state();
    assert.ok(right.forwardSlope < -.10 && right.focal === neutral.focal);
    assert.ok(Math.hypot(right.arm.x-home.x, right.arm.z-home.z) < .001, 'looking alone moved the claw');
    await roundTrip('lean right');
    await push('lean right strafe', 1, 0);
    await push('lean right keyboard left', -1, 0, 500, 'ArrowLeft');
    await hold(.40, .12);
    const left = await state();
    assert.ok(Math.abs(left.forwardSlope + right.forwardSlope) < .002 && left.focal === neutral.focal);
    await roundTrip('lean left');
    await push('lean left diagonal', Math.SQRT1_2, -Math.SQRT1_2);
    await push('lean left opposite diagonal', -Math.SQRT1_2, Math.SQRT1_2);
    await click('#center');
    await hold(.40, .12);
    assert.ok(Math.abs((await state()).forwardSlope) < .001);
    await roundTrip('recalibrated');
    await click('#camera');
    const view = await page.locator('#viewport').boundingBox();
    const cy = view.y + view.height * .54;
    await page.mouse.move(view.x + view.width * .45, cy);
    await page.mouse.down();
    await page.mouse.move(view.x + view.width * .71, cy, {steps:8});
    await page.mouse.up();
    await advance(700);
    assert.ok((await state()).forwardSlope < -.07);
    await roundTrip('dragged view');

    // Keep a finger down as the view turns. The claw must stay strictly locked
    // to the physical X/Z gantry rail while you peek sideways to judge depth.
    await click('#camera');
    await hold(.50);
    await pressStick(1, 0);
    await advance(130);
    await hold(.65, .12);
    const turning = await state();
    await advance(220);
    const turned = await state();
    assert.ok(turning.forwardSlope < -.20 && Math.abs(turned.arm.z - turning.arm.z) < .005 && turned.arm.x > turning.arm.x + .25);
    await touch('touchEnd', []);
    await advance(420);

    // Approach the first snow toy with the camera still on and actually deliver it.
    const pose = await state();
    const dx = -1.49 - pose.arm.x, dz = 1.47 - pose.arm.z;
    await push('aim across', Math.sign(dx), 0, Math.abs(dx)*1000/2.05);
    await push('aim in depth', 0, Math.sign(dz), Math.abs(dz)*1000/2.05);
    await click('#grab');
    await wait(() => document.querySelector('#status').textContent === '抓爪下来啦');
    for (let i = 0; i < 24 && (await page.locator('#progress').innerText() !== '1' ||
      await page.locator('#grab').isDisabled()); i++) await advance(550);
    assert.equal(await page.locator('#progress').innerText(), '1');
    assert.equal(await page.locator('#grab').isEnabled(), true);
    const end = (await state()).arm;
    assert.ok(Math.hypot(end.x-home.x, end.z-home.z) < .005 && Math.abs(end.y-home.y)<.005, 'return to home');
    assert.deepEqual(errors, []);
    console.log('PASS', samples.length, 'movements, no-input stability, same focal length, angled catch and return.');
  } finally { await browser.close(); }
}
module.exports = {installProbe};
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });
