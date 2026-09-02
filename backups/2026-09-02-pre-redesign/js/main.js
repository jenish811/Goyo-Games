/* ============================================================
   GOYO GAMES — entry point
   Zero dependencies. Transform and opacity only. Every module is
   preference-aware and unbinds itself cleanly when motion or the
   pointer type changes at runtime.
   ============================================================ */

import { env, onEnvChange } from './env.js';
import { initTheme } from './theme.js';
import { initPageTransition } from './page-transition.js';
import { initReveals, playHeroSequence } from './section-reveal.js';
import { initMagnetic } from './magnetic.js';
import { initGameCards } from './game-card.js';
import { initCounters } from './animated-counter.js';
import { initParallax } from './parallax.js';
import { initCursor } from './custom-cursor.js';
import { initHeader, initSectionIndicator, initMobileMenu, initAnchors } from './nav.js';
import { initStudioFacets, initFeaturedGallery } from './panels.js';
import { initMotes, initIdleGuard } from './ambient.js';

/* No enhancement is worth a blank page. Each module is isolated, so one
   throwing only costs its own feature — and the reveal system comes up
   first, because it is the one thing that hides content until it runs. */
function safely(label, fn) {
  try { return fn(); }
  catch (error) { console.error(`[goyo] ${label} failed`, error); return null; }
}

/* `.js` is what arms the hidden-until-revealed states, so it goes on only
   at the moment something exists to reveal them again. Without scripts —
   or with a broken import — the page renders fully, as authored. */
document.documentElement.classList.add('js');
const reveals = safely('reveals', initReveals) || { showAll() {} };

safely('theme', initTheme);

/* The hero's entrance plays into the curtain's wipe, not behind it. The
   race is a safety net: if the curtain ever fails to resolve, the hero
   still arrives rather than sitting at opacity 0. */
const curtain = safely('page transition', initPageTransition) || Promise.resolve();
Promise.race([curtain, new Promise((resolve) => setTimeout(resolve, 1200))])
  .then(() => safely('hero sequence', playHeroSequence));

safely('header', initHeader);
safely('section indicator', initSectionIndicator);
safely('mobile menu', initMobileMenu);
safely('anchors', initAnchors);

safely('game cards', initGameCards);
safely('counters', initCounters);
safely('studio facets', initStudioFacets);
safely('featured gallery', initFeaturedGallery);

safely('magnetic', initMagnetic);
safely('parallax', initParallax);
safely('cursor', initCursor);
safely('motes', initMotes);
safely('idle guard', initIdleGuard);

// Turning reduced motion on mid-session must never strand hidden content.
onEnvChange(() => {
  if (env.reducedMotion) reveals.showAll();
});

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
