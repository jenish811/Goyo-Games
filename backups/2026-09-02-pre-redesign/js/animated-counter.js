/* ============================================================
   AnimatedCounter — [data-count][data-suffix]
   Counts up once, on entry. The markup already carries the final
   value, so the number is correct with JavaScript off and under
   reduced motion. While it animates, assistive tech reads a
   static copy of the real figure rather than the ticking digits.
   ============================================================ */

import { env, $$ } from './env.js';

const DURATION = 1500;

export function initCounters() {
  const nodes = $$('[data-count]');
  if (!nodes.length) return;
  if (env.reducedMotion || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  nodes.forEach((el) => observer.observe(el));
}

function run(el) {
  const target = parseFloat(el.getAttribute('data-count')) || 0;
  const suffix = el.getAttribute('data-suffix') || '';
  const finalText = el.textContent.trim();

  // Real value for screen readers, ticking value for eyes only.
  el.textContent = '';
  const spoken = document.createElement('span');
  spoken.className = 'sr';
  spoken.textContent = finalText;
  const digits = document.createElement('span');
  digits.setAttribute('aria-hidden', 'true');
  digits.textContent = `0${suffix}`;
  el.append(spoken, digits);

  const startedAt = performance.now();

  function step(now) {
    const progress = Math.min((now - startedAt) / DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    digits.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      digits.textContent = finalText;
      el.classList.add('is-counted');
    }
  }

  requestAnimationFrame(step);
}
