/* ============================================================
   SOUND — synthesized SFX engine (Web Audio API, no audio files).
   Nothing plays until the listener turns it on via the header
   toggle; that click is also the gesture that unlocks the
   AudioContext, since browsers block audio before one.
   ============================================================ */

let ctx = null;
let masterGain = null;
let noiseBuffer = null;
let enabled = false;

function ensureContext() {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);
    noiseBuffer = buildNoiseBuffer(ctx);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

function buildNoiseBuffer(audioCtx) {
  const length = audioCtx.sampleRate * 1;
  const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(value) {
  enabled = value && ensureContext();
  return enabled;
}

/** A single tone with a lowpass for warmth, envelope shaped in gain. */
function tone({ freq = 440, type = 'sine', duration = 0.15, gain = 0.25, glideTo = null, delay = 0, filterFreq = 2200, detune = 0 }) {
  if (!enabled || !ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  osc.type = type;
  osc.detune.value = detune;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFreq, t0);
  filter.Q.value = 0.7;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(filter).connect(g).connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + duration + 0.03);
}

/** Filtered noise burst — the "air" under whooshes and impacts. */
function noiseSweep({ duration = 0.35, gain = 0.18, delay = 0, startFreq = 300, endFreq = 3200, type = 'bandpass', q = 1.1 }) {
  if (!enabled || !ctx || !noiseBuffer) return;
  const t0 = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  const g = ctx.createGain();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(startFreq, t0);
  filter.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + duration * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter).connect(g).connect(masterGain);
  src.start(t0);
  src.stop(t0 + duration + 0.05);
}

/** A short slap-back echo, used to give the chime some air. */
function echoTap(duration, gain) {
  if (!ctx) return null;
  const delayNode = ctx.createDelay();
  const feedback = ctx.createGain();
  const wet = ctx.createGain();
  delayNode.delayTime.value = duration;
  feedback.gain.value = gain;
  wet.gain.value = 0.5;
  delayNode.connect(feedback).connect(delayNode);
  delayNode.connect(wet).connect(masterGain);
  return delayNode;
}

/** Scene-to-scene crossfade in the pinned film stage. */
export function playWhoosh() {
  noiseSweep({ duration: 0.42, gain: 0.14, startFreq: 200, endFreq: 2600 });
  tone({ freq: 160, glideTo: 480, type: 'sine', duration: 0.4, gain: 0.11, filterFreq: 900 });
  tone({ freq: 70, type: 'sine', duration: 0.32, gain: 0.09, delay: 0.03, filterFreq: 400 });
}

/** Elements popping/bouncing into view (cards, circle, tower pieces). */
export function playPop() {
  tone({ freq: 440, glideTo: 880, type: 'triangle', duration: 0.16, gain: 0.14, detune: -8, filterFreq: 3200 });
  tone({ freq: 440, glideTo: 880, type: 'triangle', duration: 0.16, gain: 0.14, detune: 9, filterFreq: 3200 });
  tone({ freq: 1320, type: 'sine', duration: 0.09, gain: 0.06, delay: 0.03, filterFreq: 4000 });
}

/** Light hover feedback on interactive elements. */
export function playHover() {
  tone({ freq: 1100, type: 'sine', duration: 0.055, gain: 0.04, filterFreq: 3000 });
}

/** Button/link presses. */
export function playClick() {
  tone({ freq: 340, glideTo: 130, type: 'square', duration: 0.09, gain: 0.08, filterFreq: 1800 });
  noiseSweep({ duration: 0.06, gain: 0.05, startFreq: 1200, endFreq: 400, type: 'lowpass' });
}

/** Splash screen resolving into the page — a small rising arpeggio with a tail. */
export function playChime() {
  if (!enabled || !ctx) return;
  const tap = echoTap(0.16, 0.28);
  [523.25, 659.25, 987.77].forEach((freq, i) => {
    tone({ freq, type: 'sine', duration: 0.55, gain: 0.1, delay: i * 0.08, filterFreq: 3500 });
    if (tap) {
      const t0 = ctx.currentTime + i * 0.08;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(0.05, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      osc.connect(g).connect(tap);
      osc.start(t0);
      osc.stop(t0 + 0.55);
    }
  });
}
