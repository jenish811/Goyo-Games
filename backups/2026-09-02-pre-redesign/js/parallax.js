/* ============================================================
   Parallax — two layers, one frame loop.

   [data-par]         pointer depth. Positive follows the cursor,
                      negative opposes it.
   [data-par-scroll]  scroll depth, measured from the element's
                      distance to the middle of the viewport.

   Both write to --px / --py custom properties; the stylesheet
   composes them into a single transform alongside each element's
   own rotation, so nothing here ever fights a CSS transform.
   ============================================================ */

import { env, onEnvChange, addFrameJob, $$ } from './env.js';

const POINTER_X = 0.22;
const POINTER_Y = 0.12;
const EASE = 0.08;

export function initParallax() {
  const nodes = $$('[data-par], [data-par-scroll]').map((el) => ({
    el,
    pointerDepth: parseFloat(el.getAttribute('data-par')) || 0,
    scrollDepth: parseFloat(el.getAttribute('data-par-scroll')) || 0,
    x: 0, y: 0, tx: 0, ty: 0,
    scrollY: 0,
    visible: false
  }));
  if (!nodes.length) return;

  /* Only elements in view are measured — an off-screen node costs
     nothing but a boolean check. */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const node = nodes.find((n) => n.el === entry.target);
        if (node) node.visible = entry.isIntersecting;
      });
    }, { rootMargin: '25% 0px' });
    nodes.forEach((node) => io.observe(node.el));
  } else {
    nodes.forEach((node) => { node.visible = true; });
  }

  let stop = null;
  let running = false;
  let pointerX = 0;
  let pointerY = 0;

  function measureScroll() {
    const mid = window.innerHeight / 2;
    nodes.forEach((node) => {
      if (!node.scrollDepth || !node.visible) return;
      const rect = node.el.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - mid) / mid;
      node.scrollY = -offset * node.scrollDepth * 100;
    });
  }

  function tick() {
    let moving = false;
    nodes.forEach((node) => {
      if (!node.visible) return;
      node.tx = pointerX * node.pointerDepth * POINTER_X;
      node.ty = pointerY * node.pointerDepth * POINTER_Y + node.scrollY;
      node.x += (node.tx - node.x) * EASE;
      node.y += (node.ty - node.y) * EASE;
      if (Math.abs(node.tx - node.x) > 0.05 || Math.abs(node.ty - node.y) > 0.05) moving = true;
      node.el.style.setProperty('--px', `${node.x.toFixed(2)}px`);
      node.el.style.setProperty('--py', `${node.y.toFixed(2)}px`);
    });
    if (!moving) { stop = null; running = false; return false; }
    return true;
  }

  function wake() {
    if (running) return;
    running = true;
    stop = addFrameJob(tick);
  }

  function onPointerMove(event) {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    wake();
  }

  function onScroll() {
    measureScroll();
    wake();
  }

  let bound = false;

  function bind() {
    if (bound) return;
    bound = true;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  function unbind() {
    if (!bound) return;
    bound = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    stop?.();
    stop = null;
    running = false;
    pointerX = pointerY = 0;
    nodes.forEach((node) => {
      node.x = node.y = node.tx = node.ty = node.scrollY = 0;
      node.el.style.removeProperty('--px');
      node.el.style.removeProperty('--py');
    });
  }

  const sync = () => (env.richMotion ? bind() : unbind());
  sync();
  onEnvChange(sync);
}
