/* Caixota — barra própria de vídeo para Instagram.
 * Não utiliza código das extensões de referência.
 * A barra vive fora das camadas do player, para continuar clicável em Reels.
 */
(() => {
  'use strict';
  if (location.hostname !== 'www.instagram.com' && location.hostname !== 'instagram.com') return;

  const STORAGE_KEY = 'caixotaBrowserFeatures0310';
  const ROOT_ID = 'cx-ig-timeline-root';
  const POLL_MS = 400;
  let enabled = false;
  let root = null;
  let bar = null;
  let track = null;
  let fill = null;
  let knob = null;
  let timeLabel = null;
  let activeVideo = null;
  let dragPointer = null;
  let scanTimer = null;
  let observer = null;
  let pendingScan = 0;
  let pendingLayout = 0;
  let hidden = true;
  let hoverX = null;
  let videoListeners = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function timestamp(value) {
    if (!Number.isFinite(value) || value < 0) return '--:--';
    const seconds = Math.floor(value);
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor(seconds / 60) % 60;
    const ss = seconds % 60;
    return hh
      ? `${hh}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
      : `${mm}:${String(ss).padStart(2,'0')}`;
  }
  function range(video) {
    if (!video) return null;
    const duration = Number(video.duration);
    if (Number.isFinite(duration) && duration > 0) return { start: 0, end: duration };
    // Instagram sometimes uses MediaSource, which can expose Infinity for duration.
    try {
      const seekable = video.seekable;
      if (seekable?.length) {
        const start = seekable.start(0);
        const end = seekable.end(seekable.length - 1);
        if (Number.isFinite(start) && Number.isFinite(end) && end > start) return {start,end};
      }
    } catch {}
    return null;
  }
  function rectangle(video) {
    if (!video || !video.isConnected) return null;
    const rect = video.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth || innerWidth;
    const viewportHeight = document.documentElement.clientHeight || innerHeight;
    const left = clamp(rect.left, 0, viewportWidth);
    const right = clamp(rect.right, 0, viewportWidth);
    const top = clamp(rect.top, 0, viewportHeight);
    const bottom = clamp(rect.bottom, 0, viewportHeight);
    const width = right - left;
    const height = bottom - top;
    if (width < 115 || height < 65) return null;
    try {
      const style = getComputedStyle(video);
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return null;
    } catch {}
    return {left,right,top,bottom,width,height,original:rect};
  }
  function coveredByMediaDialog(video, rect) {
    // Instagram can leave a feed video playing behind its media viewer. The
    // video still has a valid rectangle, but the progress bar must not be
    // drawn over the image or conversation opened in front of it.
    const x = rect.left + rect.width / 2;
    const y = Math.min(rect.bottom - 12, (document.documentElement.clientHeight || innerHeight) - 2);
    for (const overlay of document.querySelectorAll('[role="dialog"], [aria-modal="true"]')) {
      if (overlay === video || overlay.contains(video)) continue;
      const box = overlay.getBoundingClientRect();
      if (x < box.left || x > box.right || y < box.top || y > box.bottom) continue;
      const style = getComputedStyle(overlay);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      return true;
    }
    return false;
  }
  function chooseVideo() {
    let best = null;
    let bestScore = -Infinity;
    const center = (document.documentElement.clientWidth || innerWidth) / 2;
    for (const candidate of document.querySelectorAll('video')) {
      const rect = rectangle(candidate);
      if (!rect) continue;
      const visibleRatio = (rect.width * rect.height) /
        Math.max(1, candidate.getBoundingClientRect().width * candidate.getBoundingClientRect().height);
      // Prefer playing media and central, visible Reels over small preview videos.
      const area = rect.width * rect.height;
      const playing = !candidate.paused && !candidate.ended;
      const centerDistance = Math.abs((rect.left + rect.right) / 2 - center);
      const score = Math.log2(Math.max(1, area)) * 80 +
        (playing ? 2100 : 0) + visibleRatio * 450 - centerDistance * .16 +
        (candidate === activeVideo ? 170 : 0);
      if (score > bestScore) { best = candidate; bestScore = score; }
    }
    return best;
  }
  function build() {
    if (root) return;
    root = document.createElement('div');
    root.id = ROOT_ID;
    root.setAttribute('aria-label', 'Barra de progresso da Caixota para vídeos do Instagram');
    root.innerHTML = `
      <div class="cx-ig-timeline" role="slider" tabindex="0"
           aria-label="Avançar ou voltar o vídeo" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <span class="cx-ig-track"><span class="cx-ig-fill"></span><span class="cx-ig-thumb"></span></span>
        <span class="cx-ig-time" aria-hidden="true">0:00 / --:--</span>
      </div>`;
    document.documentElement.appendChild(root);
    bar = root.querySelector('.cx-ig-timeline');
    track = root.querySelector('.cx-ig-track');
    fill = root.querySelector('.cx-ig-fill');
    knob = root.querySelector('.cx-ig-thumb');
    timeLabel = root.querySelector('.cx-ig-time');
    root.hidden = true;

    const seekFromPointer = (event) => {
      const limits = range(activeVideo);
      if (!limits) return;
      const r = track.getBoundingClientRect();
      if (!(r.width > 0)) return;
      const ratio = clamp((event.clientX - r.left) / r.width, 0, 1);
      const desired = limits.start + ratio * (limits.end - limits.start);
      try { activeVideo.currentTime = desired; } catch {}
      renderTime();
    };
    bar.addEventListener('pointerenter', event => {
      hoverX = event.clientX;
      positionTime();
    });
    bar.addEventListener('pointerleave', () => { if (dragPointer === null) hoverX = null; });
    bar.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      if (!range(activeVideo)) return;
      dragPointer = event.pointerId;
      hoverX = event.clientX;
      bar.classList.add('cx-ig-dragging');
      try { bar.setPointerCapture(event.pointerId); } catch {}
      seekFromPointer(event);
      positionTime();
    });
    bar.addEventListener('pointermove', event => {
      hoverX = event.clientX;
      if (dragPointer === event.pointerId) {
        event.preventDefault();
        event.stopPropagation();
        seekFromPointer(event);
      }
      positionTime();
    });
    const stopDrag = event => {
      if (dragPointer !== event.pointerId) return;
      if (event.type === 'pointerup') seekFromPointer(event);
      dragPointer = null;
      bar.classList.remove('cx-ig-dragging');
      try { if (bar.hasPointerCapture?.(event.pointerId)) bar.releasePointerCapture(event.pointerId); } catch {}
      positionTime();
      event.stopPropagation();
    };
    bar.addEventListener('pointerup', stopDrag);
    bar.addEventListener('pointercancel', stopDrag);
    bar.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); });
    bar.addEventListener('dblclick', event => { event.preventDefault(); event.stopPropagation(); });
    bar.addEventListener('keydown', event => {
      const limits = range(activeVideo);
      if (!limits) return;
      const delta = Math.max(2, (limits.end - limits.start) / 50);
      let next;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowUp': next = activeVideo.currentTime + delta; break;
        case 'ArrowLeft': case 'ArrowDown': next = activeVideo.currentTime - delta; break;
        case 'Home': next = limits.start; break;
        case 'End': next = limits.end; break;
        default: return;
      }
      event.preventDefault();
      event.stopPropagation();
      try { activeVideo.currentTime = clamp(next, limits.start, limits.end); } catch {}
      renderTime();
    });
  }
  function positionTime() {
    if (!bar || !track) return;
    const trackRect = track.getBoundingClientRect();
    if (!(trackRect.width > 0)) return;
    const pointer = hoverX ?? trackRect.left + trackRect.width / 2;
    const px = clamp(pointer - trackRect.left, 48, Math.max(48, trackRect.width - 48));
    timeLabel.style.setProperty('left', `${px + track.offsetLeft}px`, 'important');
  }
  function renderTime() {
    if (!activeVideo || !bar) return;
    const limits = range(activeVideo);
    const current = Number(activeVideo.currentTime) || 0;
    const total = limits ? limits.end : NaN;
    const ratio = limits ? clamp((current - limits.start) / (limits.end - limits.start), 0, 1) : 0;
    fill.style.width = `${ratio * 100}%`;
    knob.style.left = `${ratio * 100}%`;
    const display = `${timestamp(current)} / ${timestamp(total)}`;
    if (timeLabel.textContent !== display) timeLabel.textContent = display;
    bar.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    bar.setAttribute('aria-valuetext', `${timestamp(current)} de ${timestamp(total)}`);
    bar.classList.toggle('cx-ig-unseekable', !limits);
  }
  function hide() {
    if (!root || hidden) return;
    root.hidden = true;
    hidden = true;
  }
  function layout() {
    pendingLayout = 0;
    if (!enabled || !root || !activeVideo) return;
    const rect = rectangle(activeVideo);
    if (!rect || coveredByMediaDialog(activeVideo, rect)) { hide(); return; }
    // Overlay is attached directly to <html>, outside Instagram's player layers.
    // This avoids their transparent buttons swallowing pointer interactions.
    const left = Math.round(rect.left + 4);
    const width = Math.round(rect.width - 8);
    // If the bottom is clipped by the viewport, anchor inside the visible portion.
    const bottom = Math.round(rect.bottom - 2);
    root.style.setProperty('--cx-ig-left', `${left}px`);
    root.style.setProperty('--cx-ig-width', `${width}px`);
    root.style.setProperty('--cx-ig-bottom', `${bottom}px`);
    if (hidden) { root.hidden = false; hidden = false; }
    if (hoverX !== null) positionTime();
  }
  function queueLayout() {
    if (pendingLayout) return;
    pendingLayout = requestAnimationFrame(layout);
  }
  function setVideo(next) {
    if (next === activeVideo) return;
    if (activeVideo && videoListeners) {
      videoListeners.forEach(([name,fn]) => activeVideo.removeEventListener(name,fn));
    }
    if (dragPointer !== null) {
      dragPointer = null;
      bar?.classList.remove('cx-ig-dragging');
    }
    activeVideo = next;
    videoListeners = null;
    if (next) {
      const refresh = () => {renderTime();queueLayout();};
      videoListeners = ['timeupdate','loadedmetadata','durationchange','progress','seeking','seeked','play','pause','emptied']
        .map(name => {next.addEventListener(name,refresh);return [name,refresh];});
      renderTime();
      queueLayout();
    } else hide();
  }
  function scan() {
    if (!enabled) return;
    setVideo(chooseVideo());
    if (activeVideo) { renderTime(); queueLayout(); }
  }
  function queueScan() {
    if (pendingScan) return;
    pendingScan = setTimeout(() => {pendingScan = 0; scan();}, 220);
  }
  function teardown() {
    observer?.disconnect(); observer = null;
    if (scanTimer !== null) {clearInterval(scanTimer);scanTimer = null;}
    if (pendingScan) {clearTimeout(pendingScan);pendingScan=0;}
    if (pendingLayout) {cancelAnimationFrame(pendingLayout);pendingLayout=0;}
    setVideo(null);
    root?.remove();root=null;bar=null;fill=null;knob=null;track=null;timeLabel=null;
    hidden=true;hoverX=null;dragPointer=null;
    document.removeEventListener('scroll',queueLayout,true);
    window.removeEventListener('resize',queueLayout);
    window.removeEventListener('orientationchange',queueScan);
    document.removeEventListener('fullscreenchange',queueScan);
    document.removeEventListener('visibilitychange',queueScan);
  }
  function toggle(on) {
    const next=on===true;
    if (next===enabled) return;
    enabled=next;
    if (!next) { teardown(); return; }
    build();
    // Instagram uses client-side navigation and replaces <video> nodes frequently.
    observer=new MutationObserver(records => {
      // Mutations in Caixota's own overlay do not warrant rescanning the page.
      if (records.some(record => !root || !root.contains(record.target))) queueScan();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    scanTimer=setInterval(scan,POLL_MS);
    document.addEventListener('scroll',queueLayout,true);
    window.addEventListener('resize',queueLayout);
    window.addEventListener('orientationchange',queueScan);
    document.addEventListener('fullscreenchange',queueScan);
    document.addEventListener('visibilitychange',queueScan);
    scan();
  }
  chrome.storage.local.get(STORAGE_KEY)
    .then(data => toggle(data[STORAGE_KEY]?.instagramProgress===true)).catch(() => {});
  chrome.storage.onChanged.addListener((changes,area) => {
    if (area==='local' && changes[STORAGE_KEY])
      toggle(changes[STORAGE_KEY].newValue?.instagramProgress===true);
  });
})();
