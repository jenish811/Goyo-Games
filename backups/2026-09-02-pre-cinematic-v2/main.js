import { env, onEnvChange } from './env.js';
import { initReveals, playHeroSequence } from './section-reveal.js';
import { initMagnetic } from './magnetic.js';
import { initParallax } from './parallax.js';
import { initCursor } from './custom-cursor.js';
import { initLogoEyes } from './logo-eyes.js';
import { initMotionExperience } from './motion-experience.js';
import { initHeader, initSectionIndicator, initMobileMenu, initAnchors } from './nav.js';
import { initMotes, initIdleGuard } from './ambient.js';

function safely(label, init) {
  try { return init(); }
  catch (error) { console.error(`[goyo] ${label} failed`, error); return null; }
}

document.documentElement.classList.add('js');
const reveals = safely('reveals', initReveals) || { showAll() {} };

safely('header', initHeader);
safely('section indicator', initSectionIndicator);
safely('mobile menu', initMobileMenu);
safely('anchors', initAnchors);
safely('magnetic controls', initMagnetic);
safely('parallax', initParallax);
safely('cursor', initCursor);
safely('logo eyes', initLogoEyes);
safely('motion experience', initMotionExperience);
safely('ambient motion', initMotes);
safely('animation guard', initIdleGuard);
safely('hero sequence', playHeroSequence);

onEnvChange(() => {
  if (env.reducedMotion) reveals.showAll();
});

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
