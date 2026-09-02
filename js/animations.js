import { playPop, playHover } from './sound.js';

export function initAnimations() {
  if (typeof gsap === 'undefined' || typeof Lenis === 'undefined' || typeof SplitType === 'undefined') {
    console.error('Animation libraries missing');
    return;
  }
  // 1. Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  gsap.registerPlugin(ScrollTrigger);

  // 2. Text Reveal via GSAP + SplitType
  // .footer-call h2 is excluded: its span/em children are hand-structured
  // as one line each, and SplitType's word-wrapping collapses that layout.
  const headings = Array.from(document.querySelectorAll('h1, h2, .story-copy h3'))
    .filter((heading) => !heading.closest('.footer-call'));

  headings.forEach((heading) => {
    const isTopHeading = heading.tagName.toLowerCase() === 'h1';
    
    // Split into lines, words, chars
    const text = new SplitType(heading, { types: 'lines, words, chars' });
    
    // Masking effect requires overflow hidden on lines
    text.lines.forEach(line => {
      line.style.overflow = 'hidden';
    });

    // Initial state: shifted down, rotated, invisible
    gsap.set(text.chars, {
      y: '100%',
      rotateZ: 4,
      opacity: 0
    });

    const triggerOptions = isTopHeading ? null : {
      trigger: heading,
      start: 'top 85%'
    };

    // If it's the top heading, wait for splash screen (2s) to finish
    const delay = isTopHeading ? 2.2 : 0;

    gsap.to(text.chars, {
      y: '0%',
      rotateZ: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.02,
      ease: 'power4.out',
      delay: delay,
      scrollTrigger: triggerOptions
    });
  });

  // 3. Staggered reveal for cards
  const cards = document.querySelectorAll('.crop-card');
  cards.forEach(card => {
    gsap.from(card, {
      y: 60,
      rotationZ: 5,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      onStart: playPop,
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
      }
    });
    card.addEventListener('pointerenter', playHover);
  });

  // 4. Bouncy Vertical Scene Assemblies (Superplay style)
  const scenes = document.querySelectorAll('.film-scene');
  scenes.forEach(scene => {


    const canvas = scene.querySelector('.canvas-frame');
    if (canvas) {
      gsap.from(canvas, {
        scale: 0.6,
        opacity: 0,
        rotationZ: -2,
        duration: 1.5,
        ease: 'elastic.out(1, 0.7)',
        onStart: playPop,
        scrollTrigger: { trigger: scene, start: 'top 75%' }
      });
    }
    
    const towerPieces = scene.querySelectorAll('.tower-build i');
    if (towerPieces.length) {
      gsap.from(towerPieces, {
        y: -300,
        rotationZ: () => Math.random() * 60 - 30,
        opacity: 0,
        duration: 1.5,
        stagger: 0.15,
        ease: 'bounce.out',
        scrollTrigger: { trigger: scene, start: 'top 60%' }
      });
    }

    const car = scene.querySelector('.drift-machine');
    if (car) {
      gsap.from(car, {
        x: -400,
        rotationZ: -30,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: scene, start: 'top 60%' }
      });
    }

    const flower = scene.querySelector('.bloom-mark');
    if (flower) {
      gsap.from(flower, {
        scale: 0,
        rotationZ: -180,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: { trigger: scene, start: 'top 60%' }
      });
    }
  });

  // 5. Footer entrance: heading lines rise in, the mail circle pops in
  const footerLines = document.querySelectorAll('.footer-call h2 span, .footer-call h2 em');
  if (footerLines.length) {
    gsap.from(footerLines, {
      y: 70,
      opacity: 0,
      duration: 1.1,
      stagger: 0.15,
      ease: 'power4.out',
      onStart: playPop,
      scrollTrigger: { trigger: '.footer-call', start: 'top 85%' }
    });
  }

  const footerCircle = document.querySelector('.footer-call > a');
  if (footerCircle) {
    gsap.from(footerCircle, {
      scale: 0,
      rotationZ: -35,
      opacity: 0,
      duration: 1.4,
      ease: 'elastic.out(1, 0.6)',
      delay: 0.3,
      onStart: playPop,
      scrollTrigger: { trigger: footerCircle, start: 'top 85%' }
    });
    footerCircle.addEventListener('pointerenter', playHover);
  }
}
