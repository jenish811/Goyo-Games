/* ============================================================
   SectionReveal + AnimatedText
   One observer drives every entrance on the site.

   Markup contract
     .anim[data-anim]   up | fade | scale | clip | left | right
     .anim[data-delay]  0-4, a fixed step in the stylesheet
     [data-stagger]     children inherit an index-based delay so a
                        grid deals itself in rather than popping
     .line > span       AnimatedText: a masked line that slides up
   ============================================================ */

import { env, $$ } from './env.js';

const STAGGER_STEP = 0.06; // seconds between siblings
const STAGGER_CAP = 8;     // never delay a late child into the void

export function initReveals() {
  assignStaggerDelays();

  const targets = $$('.anim, .line');
  const showAll = () => targets.forEach((el) => el.classList.add('in'));

  if (env.reducedMotion || !('IntersectionObserver' in window)) {
    showAll();
    return { showAll };
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  targets.forEach((el) => observer.observe(el));

  return { showAll };
}

/* Children of a [data-stagger] container get a computed delay. Keeping
   it in a custom property means the CSS owns the easing and duration. */
function assignStaggerDelays() {
  $$('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      const step = Math.min(index, STAGGER_CAP) * STAGGER_STEP;
      child.style.setProperty('--reveal-delay', `${step.toFixed(3)}s`);
    });
  });
}

/**
 * The hero cannot wait for an intersection — it is already on screen.
 * Two frames after boot it is painted, so the sequence starts clean:
 * eyebrow, headline lines, lead, buttons, meta, then the stage.
 */
export function playHeroSequence() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    hero.classList.add('is-live');
    $$('.line, .anim', hero).forEach((el) => el.classList.add('in'));
  }));
}
