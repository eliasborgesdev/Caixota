// Shared intrinsic-height measurement for the legacy workbench iframe.
// The legacy processors are kept isolated to preserve their DOM/event contracts;
// the iframe itself has no visual frame or independent page scrolling.
// Deliberately do NOT use documentElement.scrollHeight: its value may grow with
// the iframe viewport, producing a resize feedback loop.
const SCREEN_SELECTOR = [
  '.local-tool-screen', '.pdf-tool-screen', '.video-tool-screen',
  '.converter-tool-screen', '.productivity-tool-screen',
  '.generator-data-screen', '.tool-detail-screen', '.tool-screen'
].join(',');

function visible(node, view) {
  if (!node?.getBoundingClientRect || !node?.getClientRects?.().length) return false;
  const css = view?.getComputedStyle?.(node);
  return css?.display !== 'none' && css?.visibility !== 'hidden';
}

export function measureWorkbenchHeight(doc) {
  const page = doc?.querySelector?.('.app-main');
  if (!page) return 0;
  const view = doc.defaultView;
  const active = page.querySelector('.app-view.is-active') || page;
  let screens = [...active.querySelectorAll(SCREEN_SELECTOR)].filter(node => visible(node, view));
  if (!screens.length) {
    // Fallback for engines whose screen class is different. Take the visible
    // children of the selected tools group instead of the iframe viewport.
    const group = active.querySelector('.tools-group.is-active') || active;
    screens = [...group.children].filter(node => visible(node, view));
  }
  if (!screens.length) return 0;
  const scrollY = view?.scrollY || 0;
  let contentBottom = 0;
  for (const node of screens) {
    const rect = node.getBoundingClientRect();
    const css = view?.getComputedStyle?.(node);
    const bottomMargin = Number.parseFloat(css?.marginBottom) || 0;
    // scrollHeight catches deliberately overflown panels where their CSS box
    // has a fixed height, without depending on the current iframe height.
    const fullBottom = rect.top + Math.max(rect.height, node.scrollHeight || 0);
    contentBottom = Math.max(contentBottom, rect.bottom, fullBottom + bottomMargin);
  }
  // Use the original document's scroll origin, not the current iframe scroll
  // position: frame scrolling is intentionally disabled by the parent.
  return Math.min(48000, Math.ceil(Math.max(240, contentBottom + scrollY + 40)));
}
