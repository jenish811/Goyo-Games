/* ============================================================
   AMBIENT — the hero's floating motes, and the idle guard that
   parks every looping animation while its section is off-screen.

   The motes are generated here rather than authored in the HTML
   so that a touch device or a reduced-motion visitor never even
   receives the nodes.
   ============================================================ */

import { env, $$ } from './env.js';

const MOTE_COUNT = 14;

export function initMotes() {
  const host = document.getElementById('heroMotes');
  if (!host) return;
  if (!env.richMotion) return;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < MOTE_COUNT; i += 1) {
    const mote = document.createElement('span');
    // A deterministic scatter: even coverage, no two motes in step.
    const left = (i * 37 + 11) % 100;
    const top = (i * 53 + 7) % 100;
    mote.style.left = `${left}%`;
    mote.style.top = `${top}%`;
    mote.style.setProperty('--size', `${4 + (i % 4) * 3}px`);
    mote.style.setProperty('--dur', `${11 + (i % 5) * 3}s`);
    mote.style.setProperty('--delay', `${-(i * 1.7).toFixed(1)}s`);
    mote.style.setProperty('--drift', `${(i % 2 ? 1 : -1) * (10 + (i % 3) * 8)}px`);
    if (i % 3 === 0) mote.classList.add('is-ring');
    fragment.appendChild(mote);
  }
  host.appendChild(fragment);
}

/**
 * Looping animations (the marquee, the bobbing sticker, the motes)
 * idle whenever their section leaves the viewport.
 */
export function initIdleGuard() {
  if (!('IntersectionObserver' in window)) return;
  const sections = $$('.hero, .marquee, .footer-mark');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-paused', !entry.isIntersecting);
    });
  }, { rootMargin: '120px 0px' });

  sections.forEach((section) => observer.observe(section));
}
