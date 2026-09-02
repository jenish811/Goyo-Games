import { clamp, env } from './env.js';

export function initMotionExperience() {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const scenes = Array.from(document.querySelectorAll('[data-motion-scene]'));
  const items = Array.from(document.querySelectorAll('[data-motion-item]'));
  const counter = document.getElementById('motionCounter');

  root.classList.add('motion-enabled');

  if (!env.reducedMotion) {
    document.body.classList.add('motion-lock');
    window.setTimeout(() => document.body.classList.remove('motion-lock'), 1550);
  }

  if (counter && !env.reducedMotion) {
    const started = performance.now();
    const count = (now) => {
      const progress = clamp((now - started) / 1050, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(eased * 100)).padStart(2, '0');
      if (progress < 1) requestAnimationFrame(count);
    };
    requestAnimationFrame(count);
  } else if (counter) {
    counter.textContent = '100';
  }

  if (env.reducedMotion) return;

  let previousY = window.scrollY;
  let smoothVelocity = 0;
  let frame = null;
  let settleFrames = 0;

  function render() {
    const viewport = window.innerHeight;
    const y = window.scrollY;
    const rawVelocity = clamp((y - previousY) / 42, -1, 1);
    smoothVelocity += (rawVelocity - smoothVelocity) * 0.18;
    previousY = y;

    root.style.setProperty('--scroll-velocity', smoothVelocity.toFixed(3));

    if (hero) {
      const heroProgress = clamp(y / Math.max(hero.offsetHeight, 1), 0, 1);
      hero.style.setProperty('--scene-progress', heroProgress.toFixed(4));
      hero.style.setProperty('--hero-y', `${(-heroProgress * 110).toFixed(2)}px`);
      hero.style.setProperty('--hero-scale', (1 - heroProgress * 0.08).toFixed(4));
      hero.style.setProperty('--hero-fade', (1 - heroProgress * 0.78).toFixed(4));
    }

    scenes.forEach((scene) => {
      const rect = scene.getBoundingClientRect();
      const progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      const centered = (progress - 0.5) * 2;
      scene.style.setProperty('--scene-progress', progress.toFixed(4));
      scene.style.setProperty('--scene-center', centered.toFixed(4));
      scene.style.setProperty('--scene-y', `${(centered * -72).toFixed(2)}px`);
      scene.style.setProperty('--scene-x', `${(centered * 110).toFixed(2)}px`);
      scene.style.setProperty('--scene-reveal', `${(clamp(progress * 1.75, 0, 1) * 100).toFixed(2)}%`);
    });

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const progress = clamp((viewport - rect.top) / (viewport + rect.height), 0, 1);
      item.style.setProperty('--item-progress', progress.toFixed(4));
      item.style.setProperty('--item-center', ((progress - 0.5) * 2).toFixed(4));
      item.style.setProperty('--item-y', `${((progress - 0.5) * -90).toFixed(2)}px`);
      item.style.setProperty('--item-x', `${((progress - 0.5) * 36).toFixed(2)}px`);
      item.style.setProperty('--item-scale', (0.94 + progress * 0.08).toFixed(4));
    });

    smoothVelocity *= 0.84;
    settleFrames += 1;
    if (Math.abs(smoothVelocity) > 0.002 || settleFrames < 14) frame = requestAnimationFrame(render);
    else frame = null;
  }

  function wake() {
    settleFrames = 0;
    if (frame === null) frame = requestAnimationFrame(render);
  }

  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake, { passive: true });
  wake();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('motion-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  items.forEach((item) => revealObserver.observe(item));
}
