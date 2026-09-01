/* ============================================================
   GOYO GAMES — interactions
   Zero dependencies. Transform/opacity only. Respects reduced motion.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
  var isReduced = function () { return reduceMotion.matches; };

  /* ---------------------------------------------------------
     Theme — system-aware, user-controlled and persisted
     --------------------------------------------------------- */
  var themeToggle = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function savedTheme() {
    try { return window.localStorage.getItem('goyo-theme'); }
    catch (e) { return null; }
  }

  function applyTheme(theme, persist) {
    var nextTheme = theme === 'dark' ? 'dark' : 'light';
    var nextLabel = nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    root.dataset.theme = nextTheme;
    if (themeMeta) themeMeta.setAttribute('content', nextTheme === 'dark' ? '#210B21' : '#FFF1E6');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(nextTheme === 'dark'));
      themeToggle.setAttribute('aria-label', nextLabel);
      themeToggle.setAttribute('title', nextLabel);
      var label = themeToggle.querySelector('.theme-toggle-text');
      if (label) label.textContent = nextLabel;
    }
    if (persist) {
      try { window.localStorage.setItem('goyo-theme', nextTheme); }
      catch (e) { /* Theme still works when storage is unavailable. */ }
    }
  }

  applyTheme(root.dataset.theme || (darkPreference.matches ? 'dark' : 'light'), false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ---------------------------------------------------------
     1. Header — shrink + solidify on scroll
     --------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var scrolled = false;

  function onScrollHeader() {
    var next = window.scrollY > 24;
    if (next !== scrolled) {
      scrolled = next;
      header.classList.toggle('is-scrolled', scrolled);
    }
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------------------------------------------------
     2. Mobile menu — full-screen panel, focus trap, ESC to close
     --------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  var lastFocused = null;

  function focusables() {
    return Array.prototype.slice.call(
      menu.querySelectorAll('a[href], button:not([disabled])')
    );
  }

  function openMenu() {
    lastFocused = document.activeElement;
    menu.hidden = false;
    menu.classList.remove('is-closing');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('no-scroll', 'menu-open');
    var f = focusables();
    if (f.length) f[0].focus();
  }

  function closeMenu() {
    if (menu.hidden) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('no-scroll', 'menu-open');

    var finish = function () {
      menu.hidden = true;
      menu.classList.remove('is-closing');
    };
    if (isReduced()) {
      finish();
    } else {
      menu.classList.add('is-closing');
      window.setTimeout(finish, 300);
    }
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      if (menu.hidden) openMenu(); else closeMenu();
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (menu.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    // Close the panel if the viewport grows back to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1200 && !menu.hidden) closeMenu();
    });
  }

  /* ---------------------------------------------------------
     3. Scroll reveals
     --------------------------------------------------------- */
  var revealTargets = document.querySelectorAll('.anim, .line');

  function revealAll() {
    Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add('in'); });
  }

  if (isReduced() || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(revealTargets, function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------
     4. Hero load sequence — lines reveal after paint
     --------------------------------------------------------- */
  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      var hero = document.querySelector('.hero');
      if (!hero) return;
      hero.querySelectorAll('.line, .anim').forEach(function (el) { el.classList.add('in'); });
    });
  });

  /* ---------------------------------------------------------
     5. Stat count-up
     --------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');

  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (isReduced()) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(counters, runCount);
    } else {
      var countIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          countIo.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { countIo.observe(el); });
    }
  }

  /* ---------------------------------------------------------
     6. Pointer parallax — desktop only, GPU transforms, lerped
     --------------------------------------------------------- */
  var parallaxNodes = Array.prototype.map.call(
    document.querySelectorAll('[data-par]'),
    function (el) {
      return {
        el: el,
        depth: parseFloat(el.getAttribute('data-par')) || 0,
        x: 0, y: 0, tx: 0, ty: 0
      };
    }
  );

  var parallaxOn = false;
  var rafId = null;

  function onPointerMove(e) {
    var nx = (e.clientX / window.innerWidth) * 2 - 1;
    var ny = (e.clientY / window.innerHeight) * 2 - 1;
    parallaxNodes.forEach(function (n) {
      n.tx = nx * n.depth * 0.22;
      n.ty = ny * n.depth * 0.12;
    });
    if (rafId === null) rafId = window.requestAnimationFrame(tick);
  }

  function tick() {
    var moving = false;
    parallaxNodes.forEach(function (n) {
      n.x += (n.tx - n.x) * 0.08;
      n.y += (n.ty - n.y) * 0.08;
      if (Math.abs(n.tx - n.x) > 0.05 || Math.abs(n.ty - n.y) > 0.05) moving = true;
      n.el.style.setProperty('--px', n.x.toFixed(2) + 'px');
      n.el.style.setProperty('--py', n.y.toFixed(2) + 'px');
    });
    rafId = moving ? window.requestAnimationFrame(tick) : null;
  }

  function clearParallax() {
    if (rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
    parallaxNodes.forEach(function (n) {
      n.x = n.y = n.tx = n.ty = 0;
      n.el.style.removeProperty('--px');
      n.el.style.removeProperty('--py');
    });
  }

  function syncParallax() {
    var want = finePointer.matches && !isReduced() && parallaxNodes.length > 0;
    if (want === parallaxOn) return;
    parallaxOn = want;
    if (want) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    } else {
      window.removeEventListener('pointermove', onPointerMove);
      clearParallax();
    }
  }
  syncParallax();

  /* ---------------------------------------------------------
     6b. Idle the looping animations while their section is off-screen
     --------------------------------------------------------- */
  var loopSections = document.querySelectorAll('.hero');
  if (loopSections.length && 'IntersectionObserver' in window) {
    var loopIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-paused', !entry.isIntersecting);
      });
    }, { rootMargin: '120px 0px' });
    Array.prototype.forEach.call(loopSections, function (el) { loopIo.observe(el); });
  }

  /* ---------------------------------------------------------
     7. Game cards — tap interaction on touch devices
     --------------------------------------------------------- */
  var gameCards = document.querySelectorAll('.game-card');
  Array.prototype.forEach.call(gameCards, function (card) {
    card.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      Array.prototype.forEach.call(gameCards, function (other) {
        if (other !== card) other.classList.remove('is-tapped');
      });
      card.classList.add('is-tapped');
    }, { passive: true });
  });

  /* ---------------------------------------------------------
     8. Preference changes at runtime
     --------------------------------------------------------- */
  function onPrefChange() {
    syncParallax();
    if (isReduced()) revealAll();
  }
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', onPrefChange);
    finePointer.addEventListener('change', syncParallax);
    darkPreference.addEventListener('change', function (event) {
      if (!savedTheme()) applyTheme(event.matches ? 'dark' : 'light', false);
    });
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(onPrefChange);
    finePointer.addListener(syncParallax);
    darkPreference.addListener(function (event) {
      if (!savedTheme()) applyTheme(event.matches ? 'dark' : 'light', false);
    });
  }

  /* ---------------------------------------------------------
     9. Footer year
     --------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
