/* ============================================================
   PageTransition — a short branded curtain on first load.
   The wordmark and "Play your way." hold for a beat, then the
   curtain wipes up. Total budget ~760ms, and it never blocks: the
   page underneath is already laid out and interactive.

   Resolves the moment the wipe *starts*, so the hero's entrance
   plays into the reveal rather than finishing behind the curtain.
   ============================================================ */

import { env } from './env.js';

const SEEN_KEY = 'goyo-intro';
const HOLD = 420;   // brand beat
const LIFT = 340;   // curtain wipe

export function initPageTransition() {
  const intro = document.getElementById('intro');
  const root = document.documentElement;

  const clear = () => {
    root.classList.remove('intro-armed');
    root.classList.add('intro-done');
  };

  // `intro-armed` is set in the head only for a motion-friendly first load.
  if (!intro || !root.classList.contains('intro-armed') || env.reducedMotion) {
    intro?.remove();
    clear();
    return Promise.resolve();
  }

  try { sessionStorage.setItem(SEEN_KEY, 'seen'); } catch { /* fine */ }

  return new Promise((resolve) => {
    let lifted = false;

    const lift = () => {
      if (lifted) return;
      lifted = true;
      intro.classList.add('is-lifting');
      clear();
      resolve();
      setTimeout(() => intro.remove(), LIFT);
    };

    // Let one frame paint first so the curtain animates rather than jumping.
    requestAnimationFrame(() => {
      intro.classList.add('is-playing');
      setTimeout(lift, HOLD);
    });

    // A visitor who scrolls or clicks immediately gets the page, not the show.
    window.addEventListener('wheel', lift, { passive: true, once: true });
    window.addEventListener('pointerdown', lift, { passive: true, once: true });
  });
}
