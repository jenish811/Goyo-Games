/* ============================================================
   ENV — one shared source of truth for motion + pointer prefs.
   Every module reads from here instead of registering its own
   media queries, so a preference change reaches the whole site
   in one pass.
   ============================================================ */

const reduceMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = matchMedia('(hover: hover) and (pointer: fine)');
const coarsePointerQuery = matchMedia('(pointer: coarse)');
const darkQuery = matchMedia('(prefers-color-scheme: dark)');

const listeners = new Set();

export const env = {
  get reducedMotion() { return reduceMotionQuery.matches; },
  get finePointer() { return finePointerQuery.matches; },
  /** True on touch/coarse-pointer devices (phones, tablets). */
  get isTouch() { return coarsePointerQuery.matches; },
  get prefersDark() { return darkQuery.matches; },
  /** Motion is only "rich" on a fine pointer with motion allowed. */
  get richMotion() { return finePointerQuery.matches && !reduceMotionQuery.matches; }
};

/** Subscribe to any preference change. Returns an unsubscribe function. */
export function onEnvChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function broadcast() {
  listeners.forEach((fn) => fn(env));
}

listen(reduceMotionQuery, broadcast);
listen(finePointerQuery, broadcast);

export function onSystemThemeChange(fn) {
  listen(darkQuery, (event) => fn(event.matches));
}

function listen(query, fn) {
  if (typeof query.addEventListener === 'function') query.addEventListener('change', fn);
  else if (typeof query.addListener === 'function') query.addListener(fn);
}

/* ---------- small shared helpers ---------- */

export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Frame-coalesced callback — many calls in one frame run once. */
export function raf(fn) {
  let queued = false;
  return (...args) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...args);
    });
  };
}

/**
 * A single shared rAF loop. Modules add a per-frame job and get a
 * stop handle back; the loop parks itself whenever nothing is running,
 * so an idle page costs zero frames.
 */
const jobs = new Set();
let loopId = null;

function pump() {
  jobs.forEach((job) => {
    if (job() === false) jobs.delete(job);
  });
  loopId = jobs.size ? requestAnimationFrame(pump) : null;
}

export function addFrameJob(job) {
  jobs.add(job);
  if (loopId === null) loopId = requestAnimationFrame(pump);
  return () => jobs.delete(job);
}
