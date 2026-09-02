import { clamp } from './env.js';
import { playWhoosh, playTick } from './sound.js';

const mix = (from, to, amount) => from + (to - from) * amount;

function smoothstep(from, to, value) {
  const progress = clamp((value - from) / (to - from), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function sceneOpacity(progress, start, end) {
  const enter = smoothstep(start, start + 0.045, progress);
  const leave = 1 - smoothstep(end - 0.05, end, progress);
  return enter * leave;
}

export function initCinematicScroll() {
  const root = document.documentElement;
  const film = document.querySelector('[data-film]');
  const stage = film?.querySelector('.film-stage');
  const opening = document.querySelector('.opening');
  const studio = document.querySelector('.studio');
  const count = document.getElementById('filmCount');

  if (!film || !stage) return;

  const scenes = {
    prologue: film.querySelector('[data-scene="prologue"]'),
    tower: film.querySelector('[data-scene="tower"]'),
    drift: film.querySelector('[data-scene="drift"]'),
    bloom: film.querySelector('[data-scene="bloom"]'),
    finale: film.querySelector('[data-scene="finale"]')
  };
  const towerPieces = Array.from(scenes.tower?.querySelectorAll('.tower-build i') || []);
  let frame = null;
  let lastWorld = null;
  let lastWheelTick = -1;
  let lastWhooshAt = 0;
  const WHOOSH_COOLDOWN = 350;
  let lastTickAt = 0;
  const TICK_COOLDOWN = 70;

  function setScene(scene, progress, start, end) {
    if (!scene) return 0;
    const local = clamp((progress - start) / (end - start), 0, 1);
    const opacity = sceneOpacity(progress, start, end);
    const eased = smoothstep(0, 1, local);

    scene.style.setProperty('--scene-opacity', opacity.toFixed(4));
    scene.style.setProperty('--frame-y', mix(145, -45, eased).toFixed(2) + 'px');
    scene.style.setProperty('--frame-scale', mix(0.72, 1.04, eased).toFixed(4));
    scene.style.setProperty('--copy-y', mix(180, -45, eased).toFixed(2) + 'px');
    scene.style.setProperty('--note-y', mix(-130, 80, eased).toFixed(2) + 'px');
    scene.style.setProperty('--crop-a-x', mix(-240, 115, eased).toFixed(2) + 'px');
    scene.style.setProperty('--crop-b-x', mix(240, -105, eased).toFixed(2) + 'px');
    scene.style.setProperty('--disc-scale', mix(0.22, 1.12, eased).toFixed(4));
    scene.classList.toggle('is-active', opacity > 0.35);
    return local;
  }

  function render() {
    frame = null;

    // --- Read phase: every layout-forcing measurement, all up front. ---
    // Interleaving reads (getBoundingClientRect/offsetHeight) with writes
    // (style.setProperty) forces the browser to flush pending style
    // changes and recompute layout synchronously on *each* read -- this
    // function used to do that three times per scroll frame. Batching
    // every read before any write removes that "layout thrashing"
    // entirely; it's the same fix regardless of browser, just some
    // engines had punished the old pattern harder than others.
    const viewport = window.innerHeight;
    const filmRect = film.getBoundingClientRect();
    const filmOffsetHeight = film.offsetHeight;
    const openingOffsetHeight = opening ? opening.offsetHeight : 0;
    const studioRect = studio ? studio.getBoundingClientRect() : null;
    const studioOffsetHeight = studio ? studio.offsetHeight : 0;

    // --- Compute phase: pure math, no DOM access. ---
    const filmDistance = Math.max(filmOffsetHeight - viewport, 1);
    const progress = clamp(-filmRect.top / filmDistance, 0, 1);
    const filmVisible = filmRect.top <= viewport && filmRect.bottom >= 0;
    const studioVisible = Boolean(studioRect && studioRect.top < viewport && studioRect.bottom > 0);

    // --- Write phase: every DOM mutation, all after the reads above. ---
    stage.style.setProperty('--film-progress', progress.toFixed(4));
    stage.style.setProperty('--paper-radius', (smoothstep(0.075, 0.185, progress) * 155).toFixed(2) + '%');
    if (progress < 0.18) stage.style.backgroundColor = '#090907';
    else if (progress < 0.825) stage.style.backgroundColor = '#fff1e6';
    else stage.style.backgroundColor = '#4d194d';
    root.classList.toggle('film-light', (filmVisible && progress > 0.18 && progress < 0.825) || studioVisible);

    if (opening) {
      const openingDistance = Math.max(openingOffsetHeight - viewport, 1);
      const openingProgress = clamp(window.scrollY / openingDistance, 0, 1);
      opening.style.setProperty('--opening-y', (-openingProgress * 130).toFixed(2) + 'px');
      opening.style.setProperty('--opening-fade', (1 - openingProgress).toFixed(4));
      opening.style.setProperty('--opening-scale', (1 - openingProgress * 0.08).toFixed(4));
    }

    if (scenes.prologue) {
      const opacity = 1 - smoothstep(0.13, 0.19, progress);
      scenes.prologue.style.setProperty('--scene-opacity', opacity.toFixed(4));
      scenes.prologue.style.setProperty('--scene-y', mix(80, -100, smoothstep(0, 0.19, progress)).toFixed(2) + 'px');
      scenes.prologue.style.setProperty('--scene-scale', mix(0.86, 1.12, smoothstep(0, 0.19, progress)).toFixed(4));
      scenes.prologue.style.setProperty('--scene-rotate', (progress * 160).toFixed(2) + 'deg');
    }

    const towerProgress = setScene(scenes.tower, progress, 0.135, 0.415);
    towerPieces.forEach((piece, index) => {
      const built = smoothstep(0.08 + index * 0.085, 0.38 + index * 0.085, towerProgress);
      piece.style.setProperty('--piece-y', ((1 - built) * 230).toFixed(2) + 'px');
      piece.style.setProperty('--piece-r', ((1 - built) * (index % 2 ? 12 : -12)).toFixed(2) + 'deg');
    });

    const driftProgress = setScene(scenes.drift, progress, 0.365, 0.665);
    scenes.drift?.style.setProperty('--car-x', mix(-330, 250, smoothstep(0.05, 0.9, driftProgress)).toFixed(2) + 'px');
    scenes.drift?.style.setProperty('--car-r', mix(-10, 4, driftProgress).toFixed(2) + 'deg');

    const bloomProgress = setScene(scenes.bloom, progress, 0.615, 0.885);
    scenes.bloom?.style.setProperty('--flower-r', (bloomProgress * 210).toFixed(2) + 'deg');

    if (scenes.finale) {
      const opacity = smoothstep(0.825, 0.9, progress);
      scenes.finale.style.setProperty('--scene-opacity', opacity.toFixed(4));
      scenes.finale.style.setProperty('--finale-scale', smoothstep(0.82, 0.97, progress).toFixed(4));
      scenes.finale.classList.toggle('is-active', opacity > 0.5);
    }

    const world = progress < 0.35 ? '01' : progress < 0.61 ? '02' : progress < 0.84 ? '03' : '04';
    if (count) count.textContent = world;
    if (filmVisible && world !== lastWorld) {
      const now = performance.now();
      if (lastWorld !== null && now - lastWhooshAt > WHOOSH_COOLDOWN) {
        playWhoosh();
        lastWhooshAt = now;
      }
      lastWorld = world;
    }

    if (studio) {
      const distance = Math.max(studioOffsetHeight - viewport, 1);
      const local = clamp(-studioRect.top / distance, 0, 1);
      studio.style.setProperty('--studio-line-x', mix(-180, 80, local).toFixed(2) + 'px');
      studio.style.setProperty('--studio-line-x2', mix(180, -80, local).toFixed(2) + 'px');
      studio.style.setProperty('--studio-r', (local * 230).toFixed(2) + 'deg');
      studio.style.setProperty('--studio-scale', mix(0.62, 1.08, smoothstep(0, 1, local)).toFixed(4));

      // A soft tick every ~38° of wheel rotation, like a ratchet.
      const wheelTick = Math.floor((local * 230) / 38);
      if (local > 0 && local < 1 && wheelTick !== lastWheelTick) {
        const now = performance.now();
        if (now - lastTickAt > TICK_COOLDOWN) {
          playTick();
          lastTickAt = now;
        }
      }
      lastWheelTick = wheelTick;
    }
  }

  function update() {
    if (frame === null) frame = requestAnimationFrame(render);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}
