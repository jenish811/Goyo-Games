/* ============================================================
   SCENE ZOOM — Superplay-style pinned headline zoom.

   Each [data-scene] is a tall (200vh) wrapper around a sticky
   100vh inner box. While the wrapper scrolls past, its sticky
   inner stays pinned and its .scene-zoom element grows in place;
   once the wrapper's extra height runs out, the next scene's
   higher z-index panel slides up and covers it.
   ============================================================ */

import { clamp, raf, $$ } from './env.js';

export function initSceneZoom() {
  const targets = $$('.film-scene')
    .map((scene) => ({ scene, zoom: scene.querySelector('.scene-zoom') }))
    .filter((entry) => entry.zoom);

  if (!targets.length) return;

  function render() {
    const viewport = window.innerHeight;
    targets.forEach(({ scene, zoom }) => {
      const rect = scene.getBoundingClientRect();
      const distance = Math.max(rect.height - viewport, 1);
      const progress = clamp(-rect.top / distance, 0, 1);
      scene.style.setProperty('--zoom-scale', (1 + progress * 0.5).toFixed(4));
    });
  }

  const update = raf(render);
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  render();
}
