import { playBlink, playEyeMove } from './sound.js';

const MOVE_SOUND_COOLDOWN = 900;

export function initLogoEyes() {
  const eyes = Array.from(document.querySelectorAll('[data-logo-eye]'));
  if (!eyes.length) return;

  eyes.forEach((eye) => {
    eye.addEventListener('animationiteration', (event) => {
      if (event.animationName === 'goyo-blink') playBlink();
    });
  });

  let lastMoveSound = 0;
  let wasNearRest = true;

  function track(event) {
    let maxOffsetRatio = 0;
    eyes.forEach((eye) => {
      const rect = eye.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const limit = rect.width * 0.16;
      const offset = Math.min(distance / 26, 1) * limit;

      eye.style.setProperty('--eye-x', `${(dx / distance * offset).toFixed(2)}px`);
      eye.style.setProperty('--eye-y', `${(dy / distance * offset).toFixed(2)}px`);
      maxOffsetRatio = Math.max(maxOffsetRatio, offset / limit);
    });

    // A soft blip the moment the pupils swing into view and settle near
    // their limit, not on every mousemove pixel.
    const now = performance.now();
    if (maxOffsetRatio > 0.75 && wasNearRest && now - lastMoveSound > MOVE_SOUND_COOLDOWN) {
      playEyeMove();
      lastMoveSound = now;
    }
    wasNearRest = maxOffsetRatio < 0.3;
  }

  const reset = () => {
    eyes.forEach((eye) => {
      eye.style.setProperty('--eye-x', '0px');
      eye.style.setProperty('--eye-y', '0px');
    });
  };

  document.documentElement.classList.add('logo-eyes-live');
  window.addEventListener('mousemove', track, { passive: true });
  document.addEventListener('mouseleave', reset, { passive: true });
}
