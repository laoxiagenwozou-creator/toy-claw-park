// macOS native WebKit bridge with webcam naked-eye 3D head tracking.
(() => {
  const host = window.webkit.messageHandlers.park;
  Object.defineProperty(window, 'BudNative', {value: Object.freeze({
    ...(parkHasFrontCamera ? {
      setCameraEnabled(enabled) { host.postMessage({action: 'camera', enabled}); }
    } : {}),
    setGameActive(active) { host.postMessage({action: 'game', active}); },
    confirmParent(ticket) { host.postMessage({action: 'parent', ticket}); }
  })});
  document.addEventListener('DOMContentLoaded', () => {
    const note = document.createElement('small');
    note.textContent = parkHasFrontCamera
      ? '裸眼 3D · 正对摄像头停一下自动校准，左右/上下探头看立体纵深；支持方向键/WASD 移爪、空格下爪，关闭探头后可鼠标拖动视角。'
      : '支持方向键/WASD 移爪、空格下爪，鼠标拖动画面可换视角。';
    note.style.cssText = 'max-width:18em;padding:4px 8px;line-height:1.4;color:#31474e';
    document.getElementById('view-options').append(note);
  });
})();
