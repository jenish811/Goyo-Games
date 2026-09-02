import { initCursor } from './custom-cursor.js';
import { initLogoEyes } from './logo-eyes.js';
import { initHeader, initAnchors } from './nav.js';
import { initCinematicScroll } from './cinematic-scroll.js';
import { initAnimations } from './animations.js';

function initSplash() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    document.body.classList.add('no-scroll');
    setTimeout(() => {
      splash.classList.add('is-hidden');
      document.body.classList.remove('no-scroll');
    }, 2000);
  }
}

function safely(label, init) {
  try { return init(); }
  catch (error) { console.error(`[goyo] ${label} failed`, error); return null; }
}

safely('header', initHeader);
safely('anchors', initAnchors);
safely('cursor', initCursor);
safely('logo eyes', initLogoEyes);
safely('cinematic scroll', initCinematicScroll);
safely('splash', initSplash);
safely('premium animations', initAnimations);

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
