# IDEA SPRINT 2026

**24-hour student ideathon** by IEDC BOOTCAMP, College of Engineering Chengannur.

**20–21 November 2026 · 5:00 PM – 5:00 PM**

Live: https://iedc-idea-sprint-2026-vert.vercel.app/

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` tokens) |
| Animation | GSAP 3 + ScrollTrigger + `@gsap/react` |
| 3D (lazy) | React Three Fiber + three.js (lazy chunk, not in initial bundle) |
| Fonts | Archivo Black (display), Space Grotesk (body) — self-hosted woff2 |
| Deployment | Vercel (auto-deploy on push to `main`) |

## Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--color-cream` | `#F2EBDD` | Primary light background |
| `--color-near-black` | `#171717` | Primary dark background + body text |
| `--color-orange` | `#F05A28` | Fills, shapes, button backgrounds (near-black labels) |
| `--color-lime` | `#D9F36A` | Only on near-black surfaces or as fill behind near-black text |

**Rule:** Orange never carries text on cream. Lime only on near-black.

## Dev setup

```bash
# Requires Node 18+
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # preview dist/ locally
```

> **npm/node must be run via cmd on Windows** — not PowerShell directly.

## Project structure

```
src/
  components/
    art/          Spark.jsx, Fragments.jsx  — SVG art primitives
    nav/          Navbar, MobileMenu
    three/        SparkScene.jsx (lazy R3F), webgl.js
    ui/           SectionShell, Button, Countdown
  config/
    eventConfig.js  — single source of truth for all event facts
  data/
    content.js    — static copy (manifesto, journey, steps, hero text)
    nav.js        — navigation items
    prompts.js    — Idea Spark generator prompts (4 categories × 12)
    schedule.js   — event timeline (Day 1: 7 items, Day 2: 4 items)
  hooks/          useCopy.js
  lib/            pickPrompt.js, time.js
  motion/
    gsap.js       — registers GSAP + ScrollTrigger once
    Loader.jsx    — branded page-load overlay sequence
    SectionWipe.jsx — clip-path scrubbed cream/dark wipes
    useReveal.js  — data-reveal scroll activation hook
  sections/       Hero, About, IdeaSpark, Timeline, Challenge,
                  Registration, Venue, Footer
  styles/
    index.css     — Tailwind v4 @theme tokens + global styles
public/
  favicon/        icon.svg, manifest.json
  fonts/          archivo-black-latin.woff2, space-grotesk-latin.woff2
  images/         og-image.svg
```

## Key constraints

- No new sections, features, or packages beyond plan section C.
- Copy verbatim from plan. Unverified values → `null` + hidden.
- Registration form is in `preview` mode — never shows success state.
- No pinning anywhere. Scrub OK for wipes and rail.
- h1 never revealed from `opacity:0` — transform/clip only.
- 3D scene lazy-loaded via `React.lazy()` only when IdeaSpark is near viewport.
- 3D scene skipped on: no WebGL, `prefers-reduced-motion`, `Save-Data`, slow-2g/2g/3g.
- `prefers-reduced-motion: reduce` → all GSAP durations 0 or skipped.

## Pending from organisers

| Item | Field in `eventConfig.js` |
|---|---|
| Registration form endpoint | `registration.endpoint` |
| Google Maps link | `venue.mapsUrl` |
| Campus photo | `venue.photo` |
| Instagram URL | `social.instagram` |
| LinkedIn URL | `social.linkedin` |
| Contact email | `contact.email` |

Fields marked `provisional: true` are from the implementation plan and should be confirmed.

## Deployment

Vercel auto-deploys on push to `main`. No build command needed in Vercel settings — it reads `vite build` from `package.json`.

Canonical URL: `https://iedc-idea-sprint-2026-vert.vercel.app/`

