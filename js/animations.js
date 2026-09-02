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
  const headings = document.querySelectorAll('h1, h2, .story-copy h3');

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
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
      }
    });
  });
}
