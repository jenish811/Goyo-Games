# GOYO Games — Studio Website

A NeoPop editorial site for GOYO Games. Zero dependencies, zero build step:
plain HTML, CSS and ES modules, deployable to Vercel as-is.

```bash
npm start          # http://127.0.0.1:4180
```

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page — header, hero, games, featured, statement, scoreboard, studio, careers, news, footer |
| `styles.css` | Design tokens + the NeoPop component system + motion states + responsive rules |
| `js/` | One ES module per behaviour (see below) |
| `assets/brand/` | Official GOYO logo variations + the brand guidelines PDF, plus `*-400.png` display derivatives |
| `assets/fonts/` | Lilita One + Quicksand Medium, self-hosted (no external font requests) |
| `scripts/dev-server.js` | Static dev server |
| `vercel.json` | Static deploy config with long-lived caching for fonts and brand assets |

## JavaScript modules

`js/main.js` is the entry point; everything else is a single-purpose module
with an `init` export. No bundler, no dependencies.

| Module | Component | Responsibility |
| --- | --- | --- |
| `env.js` | — | The one source of truth for `prefers-reduced-motion` and pointer type, plus a **single shared rAF loop** every animator borrows |
| `theme.js` | — | Persisted light/dark, and the cross-fade that only exists while swapping |
| `page-transition.js` | `PageTransition` | The branded curtain on first load (~760ms, skippable) |
| `section-reveal.js` | `SectionReveal`, `AnimatedText` | One observer drives every entrance; masked headline lines; `[data-stagger]` children |
| `magnetic.js` | `MagneticButton` | `[data-magnetic]` leans toward the pointer and springs back |
| `game-card.js` | `GameCard` | 3D tilt on the art frame + counter-shift of the key art; tap state on touch |
| `animated-counter.js` | `AnimatedCounter` | Count-up on entry; the real figure stays in the DOM for screen readers |
| `parallax.js` | `ParallaxImage` | Pointer depth (`data-par`) and scroll depth (`data-par-scroll`) |
| `custom-cursor.js` | `CustomCursor` | Tracking dot + trailing ring with VIEW / PLAY / EXPLORE states |
| `nav.js` | — | Header state, sliding active-section pill, mobile overlay, smooth anchors |
| `panels.js` | — | The studio facet tabs and the Tumble Tower frame gallery |
| `ambient.js` | — | Hero motes, and the idle guard that parks off-screen loops |

Every module that binds pointer work checks `env.richMotion` and **unbinds
itself** when the preference changes at runtime — no listener outlives its
usefulness.

## Design system

Everything below comes from **GOYO Games Brand Guidelines v1.0** (in `assets/brand/`).

**Colour** — the three signature colours only, in the guideline's own balance:
cream is the canvas (~55%), purple owns the brand (~30%), orange is reserved for
action (~15%) — CTAs, links on hover, stickers, accents. No colour appears on this
site that is not in the core palette.

| Token | Value | Role |
| --- | --- | --- |
| `--purple` | `#4D194D` | Brand ink, borders, dark panels |
| `--orange` | `#FF7B00` | Action only — never a general background |
| `--cream` | `#FFF1E6` | Page canvas |
| `--surface` | `#FFF8F1` | Raised card surfaces (dark theme: `#351235`) |

**Type** — Lilita One for display, Quicksand Medium for body, navigation and
metadata. Both are self-hosted from the brand assets, so there are no Google
Fonts requests. The hierarchy runs on five tokens — `--fs-display`, `--fs-h2`,
`--fs-h3`, `--fs-body`, `--fs-meta`. `--fs-display` clamps against *both* axes
(`min(9.8vw, 16.5vh)`) so a wide-but-short screen never gets a headline that
eats the whole hero.

**Shape** — the guidelines call for soft geometry, so every NeoPop surface is
rounded: 32/26px primary radii, 16/12px secondary, pills for stickers and tags.
The NeoPop character comes from 3px purple borders and flat offset shadows,
with one whisper of ambient shadow (`--sh-soft`) underneath for depth — never a
glow.

**Logo** — used as supplied, never recoloured or restyled, and never given a
shadow, bevel or glow. The header swaps between the approved purple primary and
the cream reverse variation over the purple menu and in the dark theme.

The supplied masters are 2981×1462 (~110KB each). Decoding one of those to paint
a 46px header mark is the single most expensive thing the page could do, so the
originals stay in place untouched as the source of truth and **on-screen use
points at `logo_purple-400.png` / `logo_cream-400.png`** — the same artwork,
resampled to 400×196 (~18KB), which covers every on-page size at 2× DPR. The
`og:image` still points at the full-resolution master, where social scrapers
want it.

## Component system

`.btn` (`btn-orange` / `btn-ghost` / `btn-purple`, `btn-sm` / `btn-lg`),
`.btn-arrows`, `.sticker`, `.tag`, `.game-card`, `.stat-card`, `.perk`,
`.article-card`, `.feat-specs`, `.eyebrow`, `.sec-title`, `.big-arrow`.

Every interactive surface shares one press model, expressed as summed offsets so
a magnetic pull and a press can never clobber each other:

```
default   --bx/--by  0,  0     shadow  9px 9px
hover     --bx/--by -2, -2     shadow 12px 12px
active    --bx/--by  4,  4     shadow  1px 1px   (compresses under the press)
```

## Motion

Hand-rolled — no animation library.

**Only** `translate`, `scale`, `rotate`, `transform`, `opacity` and `clip-path`
are animated. The independent `translate` / `rotate` / `scale` properties carry
CSS *state*, which leaves `transform` free for pointer-driven work — so a JS lerp
and a CSS hover never fight over the same declaration.

All pointer animators share **one** rAF loop (`env.addFrameJob`) that parks
itself the moment nothing is moving, so an idle page costs zero frames. Looping
animations (marquee, sticker bob, motes, footer ribbon) idle while their section
is off-screen.

`prefers-reduced-motion: reduce` disables the intro curtain, the custom cursor,
parallax, the motes, every looping animation and the count-up, and renders every
element in its final state. The site was QA'd in that mode and is fully polished
without motion.

## Accessibility

Semantic landmarks, one `h1` with an unbroken `h2`/`h3` hierarchy, a skip link,
visible orange focus rings on every control, alt text on the logos and
`aria-label`s on every icon-only link. The mobile menu is a labelled dialog with a
focus trap, Escape to close and focus restored to the burger on close. The studio
facets and the featured gallery are real tablists with roving tabindex and arrow-key
navigation. Game cards expose a single tab stop each (the CTA, named per game),
with the whole card as its hit area. Counters keep the true figure in the DOM
while the digits tick. Scripted anchor scrolling moves focus the way a native
anchor jump does. The custom cursor never replaces a real one until it is live,
and is disabled entirely on touch and under reduced motion.

## Content to replace before launch

The brand assets contain no game artwork, so every key image on this site is an
**original SVG composition built from the GOYO palette and shapes** — no stock
imagery, no generated art. They are inline in `index.html` and each sits alone
inside `.game-art-inner` / `.feat-frame` / `.about-scene` / `.article-art-inner`,
so swapping one for real key art is a single element replacement:

```html
<div class="game-art-inner">
  <img src="assets/games/tumble-tower.webp" alt="Tumble Tower key art"
       width="600" height="420" loading="lazy" decoding="async">
</div>
```

Placeholder copy that needs real values: the six game titles and descriptions, the
featured title and its three gallery frames, the six statistics, the four job
listings, the three news items, the `goyogames.com` email addresses, and the
social links (currently `#contact`).
