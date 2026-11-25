import assert from 'node:assert/strict';
import { createGamepad } from '../web/gamepad.js';

let mockPad = null;
const origNavigator = globalThis.navigator;
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { getGamepads: () => (mockPad ? [mockPad] : []) },
});

function makePad(axes = [0, 0, 0, 0], pressedIndices = []) {
  const buttons = Array.from({ length: 16 }, (_, i) => ({
    pressed: pressedIndices.includes(i),
    value: pressedIndices.includes(i) ? 1 : 0,
  }));
  let rumbles = 0;
  return {
    id: 'Mock Standard Gamepad',
    connected: true,
    mapping: 'standard',
    axes,
    buttons,
    vibrationActuator: { playEffect: async () => { rumbles++; } },
    get rumbles() { return rumbles; },
  };
}

let mode = 'play', isTracking = false;
const events = [];
const peek = { x: 0, y: 0 };
const gp = createGamepad({
  onConnect: () => events.push('connect'),
  onGrab: () => events.push('grab'),
  onCoinOrRestock: () => events.push('coinOrRestock'),
  onToggleGuide: () => events.push('guide'),
  onPrevBay: () => events.push('prev'),
  onNextBay: () => events.push('next'),
  onOpenOutlet: () => events.push('outlet'),
  onCenter: () => events.push('center'),
  onBack: () => events.push('back'),
  onMenuNav: (dx, dy) => events.push(`nav:${dx},${dy}`),
  onMenuConfirm: () => events.push('confirm'),
  playing: () => mode === 'play',
  inMenu: () => mode === 'menu',
  inWin: () => mode === 'won',
  tracking: () => isTracking,
  onPeek: (dx, dy) => { peek.x += dx; peek.y += dy; },
});

// Deadzone ignores tiny drift.
mockPad = makePad([0.08, -0.05, 0.1, 0.1], []);
assert.equal(gp.poll(100, 0.016), false);
assert.deepEqual(gp.move, { x: 0, z: 0 });
assert.deepEqual(events, ['connect']);

// Analog stick + right-stick camera peek.
mockPad = makePad([1.0, -0.5, 1.0, -1.0], []);
assert.equal(gp.poll(120, 0.1), true);
assert.ok(gp.move.x > 0.8 && gp.move.z < -0.3 && Math.hypot(gp.move.x, gp.move.z) <= 1.001);
assert.ok(peek.x > 0.05 && peek.y > 0.05);

// Edge-triggered A button fires grab once even when held across frames.
mockPad = makePad([0, 0, 0, 0], [0]);
gp.poll(140, 0.016);
gp.poll(160, 0.016);
assert.equal(events.filter(e => e === 'grab').length, 1);

// Release and test LB / RB / Y / X / Select / R3 / B.
mockPad = makePad([0, 0, 0, 0], []); gp.poll(180, 0.016);
for (const [btn, expected] of [[4, 'prev'], [5, 'next'], [3, 'guide'], [2, 'coinOrRestock'], [8, 'outlet'], [11, 'center'], [1, 'back']]) {
  mockPad = makePad([0, 0, 0, 0], [btn]); gp.poll(200 + btn * 20, 0.016);
  mockPad = makePad([0, 0, 0, 0], []); gp.poll(210 + btn * 20, 0.016);
  assert.equal(events.at(-1), expected);
}

// Menu navigation & confirmation.
mode = 'menu';
mockPad = makePad([0.9, 0, 0, 0], []); gp.poll(1000, 0.016);
mockPad = makePad([0.9, 0, 0, 0], []); gp.poll(1050, 0.016); // throttled within 200ms
mockPad = makePad([0.9, 0, 0, 0], []); gp.poll(1250, 0.016); // repeats after 200ms
assert.equal(events.filter(e => e === 'nav:1,0').length, 2);
mockPad = makePad([0, 0, 0, 0], [0]); gp.poll(1300, 0.016);
assert.equal(events.at(-1), 'confirm');

// Rumble invokes vibrationActuator cleanly.
gp.rumble(100, 0.3, 0.5);
assert.equal(mockPad.rumbles, 1);

Object.defineProperty(globalThis, 'navigator', { configurable: true, value: origNavigator });
console.log('PASS gamepad deadzone, analog/dpad, edge-triggered buttons, right-stick peek, menu nav, and dual-rumble.');
