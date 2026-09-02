/* ============================================================
   SOUND — tiny synthesized SFX engine (Web Audio API oscillators,
   no audio files). Browsers block audio until a user gesture, so
   nothing plays until the listener explicitly turns it on via the
   header toggle; that toggle is also the gesture that unlocks the
   AudioContext.
   ============================================================ */

let ctx = null;
let masterGain = null;
let enabled = false;

function ensureContext() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.32;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(value) {
  enabled = value && ensureContext();
  return enabled;
}

function tone({ freq = 440, type = 'sine', duration = 0.15, gain = 0.25, glideTo = null, delay = 0 }) {
  if (!enabled || !ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

/** Scene-to-scene crossfade in the pinned film stage. */
export function playWhoosh() {
  tone({ freq: 200, glideTo: 640, type: 'sine', duration: 0.4, gain: 0.1 });
  tone({ freq: 90, type: 'sine', duration: 0.3, gain: 0.08, delay: 0.02 });
}

/** Elements popping/bouncing into view (cards, circle, tower pieces). */
export function playPop() {
  tone({ freq: 480, glideTo: 900, type: 'triangle', duration: 0.14, gain: 0.16 });
}

/** Light hover feedback on interactive elements. */
export function playHover() {
  tone({ freq: 1000, type: 'sine', duration: 0.05, gain: 0.045 });
}

/** Button/link presses. */
export function playClick() {
  tone({ freq: 320, glideTo: 140, type: 'square', duration: 0.09, gain: 0.09 });
}

/** Splash screen resolving into the page. */
export function playChime() {
  tone({ freq: 660, type: 'sine', duration: 0.5, gain: 0.12 });
  tone({ freq: 990, type: 'sine', duration: 0.5, gain: 0.08, delay: 0.06 });
}
