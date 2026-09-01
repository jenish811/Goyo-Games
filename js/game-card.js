/* ============================================================
   GameCard — [data-card]
   Desktop: a slight 3D tilt toward the pointer plus a counter
   shift of the artwork inside its frame, so the key art reads as
   sitting behind the card rather than printed on it.
   Touch: the tilt is dropped entirely and a tap lights the card
   up, so nothing is hover-only.
   ============================================================ */

import { env, onEnvChange, addFrameJob, clamp, $$ } from './env.js';

const TILT = 5;      // max degrees on either axis
const SHIFT = 12;    // max px the artwork slides inside the frame
const EASE = 0.14;

export function initGameCards() {
  const cards = $$('[data-card]');
  if (!cards.length) return;

  const states = cards.map((el) => ({
    el,
    art: el.querySelector('.game-art-inner'),
    rx: 0, ry: 0, ax: 0, ay: 0,
    trx: 0, try_: 0, tax: 0, tay: 0,
    stop: null
  }));

  let bound = false;

  function start(state) {
    if (state.stop) return;
    state.stop = addFrameJob(() => {
      state.rx += (state.trx - state.rx) * EASE;
      state.ry += (state.try_ - state.ry) * EASE;
      state.ax += (state.tax - state.ax) * EASE;
      state.ay += (state.tay - state.ay) * EASE;

      const settled =
        Math.abs(state.trx - state.rx) < 0.02 &&
        Math.abs(state.try_ - state.ry) < 0.02 &&
        Math.abs(state.tax - state.ax) < 0.05 &&
        Math.abs(state.tay - state.ay) < 0.05;

      state.el.style.setProperty('--rx', `${state.rx.toFixed(2)}deg`);
      state.el.style.setProperty('--ry', `${state.ry.toFixed(2)}deg`);
      if (state.art) {
        state.art.style.setProperty('--ax', `${state.ax.toFixed(2)}px`);
        state.art.style.setProperty('--ay', `${state.ay.toFixed(2)}px`);
      }

      if (settled) { state.stop = null; return false; }
      return true;
    });
  }

  function onMove(state) {
    return (event) => {
      const rect = state.el.getBoundingClientRect();
      const nx = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      const ny = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      state.try_ = nx * TILT;
      state.trx = -ny * TILT;
      // Art moves against the tilt — the parallax that sells the depth.
      state.tax = -nx * SHIFT;
      state.tay = -ny * SHIFT;
      start(state);
    };
  }

  function onLeave(state) {
    return () => {
      state.trx = state.try_ = state.tax = state.tay = 0;
      start(state);
    };
  }

  function bind() {
    if (bound) return;
    bound = true;
    states.forEach((state) => {
      state.move = onMove(state);
      state.leave = onLeave(state);
      state.el.addEventListener('pointermove', state.move);
      state.el.addEventListener('pointerleave', state.leave);
    });
  }

  function unbind() {
    if (!bound) return;
    bound = false;
    states.forEach((state) => {
      state.el.removeEventListener('pointermove', state.move);
      state.el.removeEventListener('pointerleave', state.leave);
      state.stop?.();
      state.stop = null;
      state.rx = state.ry = state.ax = state.ay = 0;
      state.trx = state.try_ = state.tax = state.tay = 0;
      ['--rx', '--ry'].forEach((prop) => state.el.style.removeProperty(prop));
      ['--ax', '--ay'].forEach((prop) => state.art?.style.removeProperty(prop));
    });
  }

  const sync = () => (env.richMotion ? bind() : unbind());
  sync();
  onEnvChange(sync);

  /* Touch: first tap reveals the card's active state, and only one
     card holds it at a time. The CTA link still works on that tap. */
  cards.forEach((card) => {
    card.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse') return;
      cards.forEach((other) => other !== card && other.classList.remove('is-tapped'));
      card.classList.add('is-tapped');
    }, { passive: true });
  });
}
