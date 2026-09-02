/* ============================================================
   THEME — persisted light/dark with a flicker-free cross-fade.
   The theme itself is set in the document head before first paint;
   this module owns the toggle, persistence and the transition.
   ============================================================ */

import { env, onSystemThemeChange } from './env.js';

const STORAGE_KEY = 'goyo-theme';
const CANVAS = { light: '#FFF1E6', dark: '#210B21' };

const root = document.documentElement;

function stored() {
  try { return localStorage.getItem(STORAGE_KEY); }
  catch { return null; }
}

export function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  let swapTimer = null;

  function apply(theme, persist) {
    const next = theme === 'dark' ? 'dark' : 'light';
    const label = next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

    /* `.theme-swap` turns colour transitions on for the length of the
       change only. Outside of it, colours snap — so scroll reveals and
       hovers never drag a 400ms colour tween behind them. */
    if (!env.reducedMotion && root.dataset.theme !== next) {
      root.classList.add('theme-swap');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => root.classList.remove('theme-swap'), 460);
    }

    root.dataset.theme = next;
    if (meta) meta.setAttribute('content', CANVAS[next]);

    if (toggle) {
      toggle.setAttribute('aria-pressed', String(next === 'dark'));
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
      const text = toggle.querySelector('.theme-toggle-text');
      if (text) text.textContent = label;
    }

    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, next); }
      catch { /* the theme still works without storage */ }
    }
  }

  apply(root.dataset.theme || (env.prefersDark ? 'dark' : 'light'), false);

  toggle?.addEventListener('click', () => {
    apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });

  // Follow the system only while the visitor has not chosen for themselves.
  onSystemThemeChange((isDark) => {
    if (!stored()) apply(isDark ? 'dark' : 'light', false);
  });
}
