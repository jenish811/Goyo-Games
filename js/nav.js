/* ============================================================
   NAV — header state, active section indicator, mobile overlay
   and smooth anchor scrolling.
   ============================================================ */

import { env, raf, $, $$ } from './env.js';

/* ---------- header: transparent over the hero, floating after ---------- */
export function initHeader() {
  const header = document.getElementById('siteHeader');
  const rail = document.getElementById('scrollRail');
  if (!header) return;

  let scrolled = false;
  let lastY = window.scrollY;

  const update = raf(() => {
    const y = window.scrollY;
    const next = y > 24;
    if (next !== scrolled) {
      scrolled = next;
      header.classList.toggle('is-scrolled', scrolled);
    }
    // Slide the bar away on the way down, bring it back on the way up.
    if (y > 320 && y > lastY + 6) header.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 320) header.classList.remove('is-hidden');
    lastY = y;

    if (rail) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      rail.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1).toFixed(4) : 0})`;
    }
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

/* ---------- active section: a pill that slides between nav items ---------- */
export function initSectionIndicator() {
  const nav = document.getElementById('navDesk');
  const pill = document.getElementById('navPill');
  if (!nav) return;

  const links = $$('a[data-nav]', nav);
  const sections = links
    .map((link) => ({ link, section: $(link.getAttribute('href')) }))
    .filter((pair) => pair.section);
  if (!sections.length) return;

  let active = null;

  function movePill(link) {
    if (!pill) return;
    if (!link) { pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
  }

  function setActive(link) {
    if (link === active) return;
    active = link;
    links.forEach((item) => {
      const on = item === link;
      item.classList.toggle('is-active', on);
      if (on) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
    movePill(link);
  }

  if ('IntersectionObserver' in window) {
    const seen = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => seen.set(entry.target, entry.intersectionRatio));
      // The section occupying most of the band wins.
      let best = null;
      let bestRatio = 0;
      sections.forEach(({ link, section }) => {
        const ratio = seen.get(section) || 0;
        if (ratio > bestRatio) { bestRatio = ratio; best = link; }
      });
      setActive(bestRatio > 0.02 ? best : null);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.02, 0.25, 0.6, 1] });

    sections.forEach(({ section }) => observer.observe(section));
  }

  // Keep the pill glued to its item when the bar resizes or the font lands.
  window.addEventListener('resize', raf(() => movePill(active)), { passive: true });
  document.fonts?.ready.then(() => movePill(active));
}

/* ---------- mobile overlay ---------- */
export function initMobileMenu() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  let lastFocused = null;
  let closeTimer = null;

  const focusables = () => $$('a[href], button:not([disabled])', menu);

  function open() {
    lastFocused = document.activeElement;
    clearTimeout(closeTimer);
    menu.hidden = false;
    menu.classList.remove('is-closing');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('no-scroll', 'menu-open');
    focusables()[0]?.focus();
  }

  function close() {
    if (menu.hidden) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('no-scroll', 'menu-open');

    const finish = () => {
      menu.hidden = true;
      menu.classList.remove('is-closing');
    };
    if (env.reducedMotion) {
      finish();
    } else {
      menu.classList.add('is-closing');
      closeTimer = setTimeout(finish, 320);
    }
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  burger.addEventListener('click', () => (menu.hidden ? open() : close()));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });

  document.addEventListener('keydown', (event) => {
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1200 && !menu.hidden) close();
  });
}

/* ---------- smooth anchors that also move keyboard focus ---------- */
export function initAnchors() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.getAttribute('href') === '#') return;

    const target = $(link.getAttribute('href'));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: env.reducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    // Native anchor jumps move focus; a scripted one has to say so.
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', link.getAttribute('href'));
  });
}
