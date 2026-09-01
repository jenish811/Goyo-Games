/* ============================================================
   MagneticButton — [data-magnetic]
   The control leans toward the pointer while it is nearby and
   springs back on leave. Pure transform, lerped on the shared
   frame loop, and only ever on a fine pointer.
   ============================================================ */

import { env, onEnvChange, addFrameJob, clamp, $$ } from './env.js';

const PULL = 0.32;      // how far the element follows the pointer
const MAX = 14;         // px cap, so it never detaches from its slot
const EASE = 0.16;      // lerp toward the target each frame

export function initMagnetic() {
  const items = $$('[data-magnetic]').map((el) => ({
    el, x: 0, y: 0, tx: 0, ty: 0, stop: null
  }));
  if (!items.length) return;

  let bound = false;

  function follow(item) {
    return (event) => {
      const rect = item.el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      item.tx = clamp(dx * PULL, -MAX, MAX);
      item.ty = clamp(dy * PULL, -MAX, MAX);
      start(item);
    };
  }

  function release(item) {
    return () => { item.tx = 0; item.ty = 0; start(item); };
  }

  function start(item) {
    if (item.stop) return;
    item.stop = addFrameJob(() => {
      item.x += (item.tx - item.x) * EASE;
      item.y += (item.ty - item.y) * EASE;
      const settled = Math.abs(item.tx - item.x) < 0.1 && Math.abs(item.ty - item.y) < 0.1;
      if (settled) { item.x = item.tx; item.y = item.ty; }
      item.el.style.setProperty('--mx', `${item.x.toFixed(2)}px`);
      item.el.style.setProperty('--my', `${item.y.toFixed(2)}px`);
      if (settled) { item.stop = null; return false; }
      return true;
    });
  }

  function bind() {
    if (bound) return;
    bound = true;
    items.forEach((item) => {
      item.onMove = follow(item);
      item.onLeave = release(item);
      item.el.addEventListener('pointermove', item.onMove);
      item.el.addEventListener('pointerleave', item.onLeave);
      item.el.addEventListener('blur', item.onLeave);
    });
  }

  function unbind() {
    if (!bound) return;
    bound = false;
    items.forEach((item) => {
      item.el.removeEventListener('pointermove', item.onMove);
      item.el.removeEventListener('pointerleave', item.onLeave);
      item.el.removeEventListener('blur', item.onLeave);
      item.stop?.();
      item.stop = null;
      item.x = item.y = item.tx = item.ty = 0;
      item.el.style.removeProperty('--mx');
      item.el.style.removeProperty('--my');
    });
  }

  const sync = () => (env.richMotion ? bind() : unbind());
  sync();
  onEnvChange(sync);
}
