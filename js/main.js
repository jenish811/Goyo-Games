import { initCursor } from './custom-cursor.js';
import { initLogoEyes } from './logo-eyes.js';
import { initHeader, initAnchors } from './nav.js';
import { initCinematicScroll } from './cinematic-scroll.js';
import { initAnimations } from './animations.js';
import { initMagnetic } from './magnetic.js';
import { env } from './env.js';
import { setSoundEnabled, isSoundEnabled, isAudioRunning, playClick, playChime, playScroll, playElectric, playTabHover } from './sound.js';

function initParticles() {
  // Decorative-only canvas animation; skip it on touch devices where
  // it's just extra continuous main-thread cost for no interaction
  // payoff (the repulse-on-hover it exists for needs a real cursor).
  if (env.isTouch) return;
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

  // Sound defaults to "on": the icon starts unmuted, and the first
  // qualifying gesture anywhere on the page (not just this button)
  // unlocks the AudioContext, since browsers block audio before one.
  // Scrolling does NOT count as a qualifying gesture in Chrome's
  // autoplay policy, so this only listens for click/tap/key -- on a
  // scroll-driven site a visitor's first move is often a scroll, and
  // wiring that in made the icon show "on" while audio stayed silent.
  // The listeners stay attached (resume() is cheap and idempotent)
  // until isAudioRunning() actually confirms it, since resume() is
  // async and can be rejected on the first try.
  let userMuted = false;
  button.setAttribute('aria-pressed', 'true');
  button.setAttribute('aria-label', 'Turn sound off');

  function tryUnlock() {
    if (userMuted || isAudioRunning()) return;
    setSoundEnabled(true);
    if (isAudioRunning()) {
      window.removeEventListener('pointerdown', tryUnlock);
      window.removeEventListener('keydown', tryUnlock);
      window.removeEventListener('touchstart', tryUnlock);
    }
  }
  window.addEventListener('pointerdown', tryUnlock, { passive: true });
  window.addEventListener('keydown', tryUnlock, { passive: true });
  window.addEventListener('touchstart', tryUnlock, { passive: true });

  button.addEventListener('click', () => {
    const next = !isSoundEnabled();
    userMuted = !next;
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

function initElectricHover() {
  // Nav tabs get a soft click on hover; crop-cards get the electric zap
  // (wired in animations.js, replacing the synthesized hover tick there).
  const tabs = document.querySelectorAll('.film-nav a');
  tabs.forEach((el) => el.addEventListener('pointerenter', playTabHover));
}

function initScrollSound() {
  const COOLDOWN = 700;
  let lastY = window.scrollY;
  let lastPlayed = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const now = performance.now();
    if (now - lastPlayed > COOLDOWN) {
      playScroll(y >= lastY ? 1 : -1);
      lastPlayed = now;
    }
    lastY = y;
  }, { passive: true });
}

function safely(label, init) {
  try { return init(); }
  catch (error) { console.error(`[goyo] ${label} failed`, error); return null; }
}

safely('header', initHeader);
safely('anchors', initAnchors);
safely('sound toggle', initSoundToggle);
safely('click sounds', initClickSounds);
safely('electric hover', initElectricHover);
safely('scroll sound', initScrollSound);
safely('cursor', initCursor);
safely('logo eyes', initLogoEyes);
safely('magnetic buttons', initMagnetic);
safely('cinematic scroll', initCinematicScroll);
safely('splash', initSplash);
safely('premium animations', initAnimations);
safely('particles', initParticles);

const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
