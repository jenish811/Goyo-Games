# GOYO Games — Studio Website

A NeoPop editorial site for GOYO Games. Zero dependencies, zero build step:
plain HTML, CSS and JavaScript, deployable to Vercel as-is.

```bash
npm start          # http://127.0.0.1:4180
```

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page — header, hero, games, featured, statement, stats, about, careers, news, footer |
| `styles.css` | Design tokens + the NeoPop component system + responsive rules |
| `app.js` | Header state, mobile menu, scroll reveals, stat count-up, pointer parallax |
| `assets/brand/` | Official GOYO logo variations + the brand guidelines PDF |
| `assets/fonts/` | Lilita One + Quicksand Medium, self-hosted (no external font requests) |
| `scripts/dev-server.js` | Static dev server |
| `vercel.json` | Static deploy config with long-lived caching for fonts and brand assets |

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
| `--cream-hi` | `#FFF8F1` | Raised card surfaces |

**Type** — Lilita One for display (hero, section titles, numbers, game titles,
buttons); Quicksand Medium for body, navigation and metadata. Both are self-hosted
from the brand assets, so there are no Google Fonts requests. All sizes are fluid
`clamp()` values; the hero runs 52px → 152px.

**Shape** — the guidelines call for soft geometry, so every NeoPop surface is
rounded: 32/26px primary radii, 16/12px secondary, pills for stickers and tags.
The NeoPop character comes from 3px purple borders and flat offset shadows rather
than from sharp corners.

**Logo** — used as supplied, never recoloured or restyled, and never given a
shadow, bevel or glow. The header swaps between the approved purple primary and
the cream reverse variation when the purple mobile menu is open.

## Component system

`.btn` (`btn-orange` / `btn-ghost` / `btn-purple`, `btn-sm` / `btn-lg`),
`.sticker`, `.tag`, `.game-card`, `.stat-card`, `.article-card`, `.feat-specs`,
`.eyebrow`, `.sec-title`, `.big-arrow`.

Every interactive surface shares one press model:

```
default   translate(0, 0)         shadow  9px 9px
hover     translate(-2px, -2px)   shadow 12px 12px
active    translate(4px, 4px)     shadow  1px 1px   (compresses under the press)
```

## Motion

Reveals and parallax are hand-rolled — no animation library. Only `transform` and
`opacity` are animated, and looping animations (marquee, floating sticker) idle
while their section is off-screen.

`prefers-reduced-motion: reduce` disables reveals, parallax, the marquee and the
count-up, and renders every element in its final state. The site was QA'd in that
mode and is fully polished without motion.

## Accessibility

Semantic landmarks, one `h1` with an unbroken `h2`/`h3` hierarchy, a skip link,
visible orange focus rings on every control, alt text on the logos and
`aria-label`s on every icon-only link. The mobile menu is a labelled dialog with a
focus trap, Escape to close and focus restored to the burger on close. Game cards
expose a single tab stop each (the CTA), with the whole card as its hit area.

## Content to replace before launch

The brand assets contain no game artwork, so every key image on this site is an
**original SVG composition built from the GOYO palette and shapes** — no stock
imagery, no generated art. They are inline in `index.html` and each sits alone
inside `.game-art` / `.feat-art` / `.article-art`, so swapping one for real key art
is a single element replacement:

```html
<div class="game-art">
  <img src="assets/games/tumble-tower.webp" alt="Tumble Tower key art"
       width="600" height="420" loading="lazy" decoding="async">
  ...
</div>
```

Placeholder copy that needs real values: the six game titles and descriptions, the
featured title, the six statistics, the four job listings, the three news items,
the `goyogames.com` email addresses, and the social links (currently `#contact`).
"# Goyo-Games" 
