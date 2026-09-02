import { initCursor } from './custom-cursor.js';
import { initLogoEyes } from './logo-eyes.js';
import { initHeader, initAnchors } from './nav.js';
import { initCinematicScroll } from './cinematic-scroll.js';
import { initAnimations } from './animations.js';
import { setSoundEnabled, isSoundEnabled, playClick, playChime } from './sound.js';

function initParticles() {
  if (typeof tsParticles === 'undefined') return;
  tsParticles.load("tsparticles", {
    fpsLimit: 60,
    background: { color: "transparent" },
    interactivity: {
      events: { onHover: { enable: true, mode: "repulse" }, resize: true },
      modes: { repulse: { distance: 100, duration: 0.4 } }
    },
    particles: {
      color: { value: "#ff7b00" },
      links: { color: "#ff7b00", distance: 150, enable: true, opacity: 0.4, width: 1 },
      move: { enable: true, speed: 1.5, outModes: { default: "bounce" } },
      number: { density: { enable: true, area: 800 }, value: 60 },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } }
    },
    detectRetina: true
  });
}

function initSoundToggle() {
  const button = document.getElementById('soundToggle');
  if (!button) return;
  button.addEventListener('click', () => {
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    button.setAttribute('aria-pressed', String(next));
    button.setAttribute('aria-label', next ? 'Turn sound off' : 'Turn sound on');
    if (next) playClick();
  });
}

function initSplash() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    document.body.classList.add('no-scroll');
    setTimeout(() => {
      splash.classList.add('is-hidden');
      document.body.classList.remove('no-scroll');
      playChime();
    }, 2000);
  }
}

function initClickSounds() {
  const targets = document.querySelectorAll('.film-nav a, .enter-link, .header-index, .scene-finale > a, .studio-wheel');
  targets.forEach((el) => el.addEventListener('click', playClick));
}

function safely(label, init) {
  try { return init(); }
  catch (error) { console.error(`[goyo] ${label} failed`, error); return null; }
}

safely('header', initHeader);
safely('anchors', initAnchors);
safely('sound toggle', initSoundToggle);
safely('click sounds', initClickSounds);
safely('cursor', initCursor);
safely('logo eyes', initLogoEyes);
safely('cinematic scroll', initCinematicScroll);
safely('splash', initSplash);
safely('premium animations', initAnimations);
safely('particles', initParticles);

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
