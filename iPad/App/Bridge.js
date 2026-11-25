// Android installs its own BudNative. WebKit uses the game's IndexedDB wallet.
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
    note.textContent = parkHasFrontCamera ? '裸眼 3D · 横放 iPad，正对屏幕停一下，再左右探头。关闭探头后可拖动换角度。' : '可拖动换角度。此设备没有可用的前置摄像头。';
    note.style.cssText = 'max-width:16em;padding:4px 8px;line-height:1.4;color:#31474e';
    document.getElementById('view-options').append(note);
  });
})();
