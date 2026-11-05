/* Caixota: PiP opcional sem controles sobre os vídeos + modo escuro de páginas. */
(() => {
  'use strict';
  const KEY = 'caixotaBrowserFeatures0310';
  const DARK_CLASS = 'cx0310-force-dark';
  let pipOn = false;
  let lastAttempt = 0;
  // Closing the native PiP window is an explicit user choice. Keep that choice
  // for the lifetime of this document; a page reload starts a fresh session.
  let dismissedUntilReload = false;

  function playingVideo() {
    return [...document.querySelectorAll('video')]
      .filter(video => !video.paused && !video.ended && video.readyState >= 2 && !video.disablePictureInPicture)
      .sort((a,b) => {
        const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
        return (y.width*y.height) - (x.width*x.height);
      })[0] || null;
  }
  async function enterPiP(video) {
    if (!pipOn || dismissedUntilReload || !video || !document.pictureInPictureEnabled || typeof video.requestPictureInPicture !== 'function') return false;
    try {
      if (document.pictureInPictureElement === video) return true;
      // Do not close one video to replace it with another. That exit would be
      // indistinguishable from the user's X click on some Chromium builds.
      if (document.pictureInPictureElement) return false;
      await video.requestPictureInPicture();
      return true;
    } catch {
      // Automatic PiP can be refused without a recent user gesture.
      // Intentionally do not place any button over the website video.
      return false;
    }
  }
  function attemptAuto() {
    if (!pipOn || dismissedUntilReload || document.pictureInPictureElement || Date.now()-lastAttempt < 1800) return;
    if (document.visibilityState === 'visible' && document.hasFocus()) return;
    lastAttempt = Date.now();
    void enterPiP(playingVideo());
  }
  document.addEventListener('leavepictureinpicture', event => {
    const video = event.target;
    if (!video || String(video.tagName).toLowerCase() !== 'video') return;
    // The native PiP close button dispatches this event. Pause the source and
    // suppress automatic re-entry until this document is reloaded.
    dismissedUntilReload = true;
    try { video.pause(); } catch {}
  }, true);
  function setPiP(prefs) {
    const next = prefs?.pip === true;
    if (next === pipOn) return;
    pipOn = next;
    try {
      if (next) navigator.mediaSession?.setActionHandler?.('enterpictureinpicture', () => {void enterPiP(playingVideo());});
      else navigator.mediaSession?.setActionHandler?.('enterpictureinpicture', null);
    } catch {}
    if (next && document.visibilityState === 'hidden') attemptAuto();
  }
  document.addEventListener('visibilitychange', attemptAuto, {passive:true});
  window.addEventListener('blur', attemptAuto, {passive:true});
  chrome.storage.local.get(KEY).then(data => setPiP(data[KEY])).catch(() => {});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[KEY]) setPiP(changes[KEY].newValue);
  });
  function forceDark(on) {
    document.documentElement.classList.toggle(DARK_CLASS, on);
    if (on) document.documentElement.dataset.cx0310Dark = 'on';
    else delete document.documentElement.dataset.cx0310Dark;
    return on;
  }
  chrome.runtime.onMessage.addListener((message,_sender,reply) => {
    if (message?.type !== 'CAIXOTA_PAGE_DARK_0310') return;
    const enabled = forceDark(message.enabled === true);
    reply({ok:true,enabled});
  });
})();
