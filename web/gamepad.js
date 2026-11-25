const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function deadzone(x, y, inner = 0.16) {
  const len = Math.hypot(x, y);
  if (len < inner) return { x: 0, y: 0 };
  const s = clamp((len - inner) / (1 - inner), 0, 1) / len;
  return { x: x * s, y: y * s };
}

function pressed(pad, index) {
  const b = pad.buttons?.[index];
  return Boolean(b && (b.pressed || b.value > 0.45));
}

function activePad() {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return null;
  const list = navigator.getGamepads();
  if (!list) return null;
  let fallback = null;
  for (const pad of list) {
    if (!pad || !pad.connected) continue;
    if (pad.mapping === 'standard') return pad;
    if (!fallback) fallback = pad;
  }
  return fallback;
}

// Standard W3C Gamepad controller (Xbox / DualSense / Switch Pro / 8BitDo / MFi):
// - Left stick / D-Pad: move crane (or navigate stage cards / win actions)
// - Right stick: peek camera angle (when head-tracking is off); R3: recenter
// - A (0) / RT (7): Grab (or confirm in menu/win)
// - B (1) / Start (9): Back to menu / close modal
// - X (2): Insert coin (when funded needed) or Restock (when available)
// - Y (3): Toggle aim guide ring
// - LB (4) / RB (5): Previous / Next cabinet
// - Select/View (8): Open prize outlet / toy shelf
export function createGamepad({
  onConnect = () => {},
  onDisconnect = () => {},
  onGrab = () => {},
  onCoinOrRestock = () => {},
  onToggleGuide = () => {},
  onPrevBay = () => {},
  onNextBay = () => {},
  onOpenOutlet = () => {},
  onCenter = () => {},
  onBack = () => {},
  onMenuNav = () => {},
  onMenuConfirm = () => {},
  playing = () => false,
  inMenu = () => false,
  inWin = () => false,
  tracking = () => false,
  onPeek = () => {},
}) {
  const move = { x: 0, z: 0 };
  const prev = new Map();
  let lastNav = 0;
  let connectedId = null;

  if (typeof window !== 'undefined') {
    window.addEventListener('gamepadconnected', (e) => {
      connectedId = e.gamepad?.id || 'connected';
      onConnect(connectedId);
    });
    window.addEventListener('gamepaddisconnected', () => {
      move.x = move.z = 0;
      prev.clear();
      if (!activePad()) {
        connectedId = null;
        onDisconnect();
      }
    });
  }

  function edge(pad, index) {
    const down = pressed(pad, index);
    const was = prev.get(index) || false;
    prev.set(index, down);
    return down && !was;
  }

  function poll(now, dt) {
    const pad = activePad();
    if (!pad) {
      move.x = move.z = 0;
      return false;
    }
    if (connectedId === null) {
      connectedId = pad.id || 'connected';
      onConnect(connectedId);
    }

    const ax = pad.axes || [];
    const ls = deadzone(ax[0] || 0, ax[1] || 0, 0.16);
    let dx = ls.x, dz = ls.y;
    if (pressed(pad, 14)) dx -= 1;
    if (pressed(pad, 15)) dx += 1;
    if (pressed(pad, 12)) dz -= 1;
    if (pressed(pad, 13)) dz += 1;
    const mag = Math.hypot(dx, dz);
    if (mag > 1) { dx /= mag; dz /= mag; }

    const a = edge(pad, 0);
    const b = edge(pad, 1);
    const xBtn = edge(pad, 2);
    const yBtn = edge(pad, 3);
    const lb = edge(pad, 4);
    const rb = edge(pad, 5);
    const rt = edge(pad, 7);
    const select = edge(pad, 8);
    const start = edge(pad, 9);
    const r3 = edge(pad, 11);

    if (playing()) {
      move.x = dx;
      move.z = dz;
      // Right stick smoothly pans the 3D camera when head-tracking is off.
      if (!tracking()) {
        const rs = deadzone(ax[2] || 0, ax[3] || 0, 0.18);
        if (rs.x || rs.y) onPeek(rs.x * dt, -rs.y * dt);
      }
      if (a || rt) onGrab();
      else if (xBtn) onCoinOrRestock();
      else if (yBtn) onToggleGuide();
      else if (lb) onPrevBay();
      else if (rb) onNextBay();
      else if (select) onOpenOutlet();
      else if (r3) onCenter();
      else if (b || start) onBack();
      return Boolean(move.x || move.z);
    }

    move.x = move.z = 0;
    if (inMenu() || inWin()) {
      if ((Math.abs(dx) > 0.55 || Math.abs(dz) > 0.55) && now - lastNav >= 200) {
        lastNav = now;
        onMenuNav(Math.abs(dx) >= Math.abs(dz) ? Math.sign(dx) : 0, Math.abs(dz) > Math.abs(dx) ? Math.sign(dz) : 0);
      } else if (Math.abs(dx) < 0.2 && Math.abs(dz) < 0.2) {
        lastNav = 0;
      }
      if (a || rt) onMenuConfirm();
      else if (b || start) onBack();
    } else if (b || start) {
      onBack();
    }
    return false;
  }

  function rumble(duration = 90, weak = 0.25, strong = 0.4) {
    const pad = activePad();
    const actuator = pad?.vibrationActuator;
    if (!actuator || typeof actuator.playEffect !== 'function') return;
    try {
      actuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        weakMagnitude: clamp(weak, 0, 1),
        strongMagnitude: clamp(strong, 0, 1),
      }).catch?.(() => {});
    } catch { /* Ignore unsupported vibration browsers. */ }
  }

  return { move, poll, rumble, connected: () => connectedId !== null };
}
