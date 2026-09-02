/* ============================================================
   CustomCursor — a dot that tracks exactly and a ring that
   trails behind it. Hovering anything with [data-cursor] swells
   the ring into a labelled disc: VIEW, PLAY, EXPLORE.

   Never runs on touch or under reduced motion, and the native
   cursor is only hidden once this one is actually live, so a
   failure here can never leave the page without a pointer.
   ============================================================ */

import { env, onEnvChange, addFrameJob } from './env.js';

const LABELS = {
  view: 'View',
  play: 'Play',
  explore: 'Explore',
  read: 'Read',
  apply: 'Apply',
  mail: 'Write',
  top: 'Top'
};

const EASE = 0.18;

export function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  const ring = cursor.querySelector('.cursor-ring');
  const label = cursor.querySelector('.cursor-label');
  const root = document.documentElement;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;
  let stop = null;
  let bound = false;

  function tick() {
    rx += (x - rx) * EASE;
    ry += (y - ry) * EASE;
    cursor.style.setProperty('--cx', `${x.toFixed(1)}px`);
    cursor.style.setProperty('--cy', `${y.toFixed(1)}px`);
    ring.style.setProperty('--rx', `${rx.toFixed(1)}px`);
    ring.style.setProperty('--ry', `${ry.toFixed(1)}px`);
    cursor.style.setProperty('--rx', `${rx.toFixed(1)}px`);
    cursor.style.setProperty('--ry', `${ry.toFixed(1)}px`);
    return true;
  }

  function onMove(event) {
    x = event.clientX;
    y = event.clientY;
    if (!cursor.classList.contains('is-live')) cursor.classList.add('is-live');
  }

  function onOver(event) {
    const hit = event.target.closest?.('[data-cursor], a, button');
    if (!hit) {
      cursor.dataset.state = '';
      label.textContent = '';
      return;
    }
    const key = hit.getAttribute('data-cursor');
    if (key && LABELS[key]) {
      cursor.dataset.state = 'label';
      label.textContent = LABELS[key];
    } else {
      cursor.dataset.state = 'link';
      label.textContent = '';
    }
  }

  const onDown = () => cursor.classList.add('is-down');
  const onUp = () => cursor.classList.remove('is-down');
  const onOut = () => cursor.classList.remove('is-live');

  function bind() {
    if (bound) return;
    bound = true;
    root.classList.add('has-cursor');
    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onOut, { passive: true });
    stop = addFrameJob(tick);
  }

  function unbind() {
    if (!bound) return;
    bound = false;
    root.classList.remove('has-cursor');
    cursor.classList.remove('is-live', 'is-down');
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerdown', onDown);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointerleave', onOut);
    stop?.();
    stop = null;
  }

  const sync = () => (env.richMotion ? bind() : unbind());
  sync();
  onEnvChange(sync);
}
