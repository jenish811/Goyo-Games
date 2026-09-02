/* ============================================================
   PANELS — two small tab controllers built on the same helper.

   · Studio facets  (Creative / Play / Tech / Community)
   · Featured gallery (Tumble Tower frames)

   Both are real tablists: arrow keys move, the visual swap is a
   cross-fade, and the default panel is already correct in the
   markup so nothing depends on this script to be readable.
   ============================================================ */

import { $, $$ } from './env.js';

function wireTabs(tabs, panel, activate) {
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = (index + step + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus();
    });
  });

  function select(index) {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    // The panel is named by whichever tab is showing.
    if (tabs[index].id) panel.setAttribute('aria-labelledby', tabs[index].id);
    activate(tabs[index]);
  }

  select(Math.max(0, tabs.findIndex((tab) => tab.classList.contains('is-active'))));
}

/* ---------- Studio: each facet swaps the supporting visual ---------- */
export function initStudioFacets() {
  const list = document.getElementById('aboutTabs');
  const panel = document.getElementById('aboutPanel');
  if (!list || !panel) return;

  const tabs = $$('[data-facet]', list);
  const scenes = $$('.about-scene', panel);
  if (!tabs.length || !scenes.length) return;

  wireTabs(tabs, panel, (tab) => {
    const facet = tab.getAttribute('data-facet');
    panel.dataset.facet = facet;
    scenes.forEach((scene) => {
      scene.classList.toggle('is-active', scene.getAttribute('data-facet') === facet);
    });
  });
}

/* ---------- Featured: the Tumble Tower frame gallery ---------- */
export function initFeaturedGallery() {
  const gallery = $('.feat-gallery');
  const frames = $('#featFrames');
  if (!gallery || !frames) return;

  const tabs = $$('.feat-thumb', gallery);
  const slides = $$('.feat-frame', frames);
  if (!tabs.length || !slides.length) return;

  wireTabs(tabs, frames, (tab) => {
    const index = tab.getAttribute('data-frame');
    slides.forEach((slide) => {
      slide.classList.toggle('is-active', slide.getAttribute('data-frame') === index);
    });
  });
}
