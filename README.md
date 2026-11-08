# IDEA SPRINT 2026

**24-hour student ideathon** by IEDC BOOTCAMP CEC, College of Engineering Chengannur.
**20–21 November 2026 · 5:00 PM to 5:00 PM IST · SPDK Room, 5th Floor**

**Live:** https://iedc-idea-sprint-2026-vert.vercel.app/
<!-- TODO(owner): confirm this is the final public URL. It is copied from index.html (canonical / og:url); nothing was invented. -->

![IDEA SPRINT 2026 hero](doc/hero.png)
<!-- doc/hero.png is generated, not committed by default: see "Hero screenshot" below. -->

A single-page event site: countdown, Idea Spark prompt generator, live schedule, four-step challenge, registration form, venue and footer.

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Motion | GSAP 3 + ScrollTrigger + `@gsap/react` (no other animation library) |
| 3D (lazy) | React Three Fiber + three.js, loaded only when Idea Spark nears the viewport; SVG fallback for no WebGL, reduced motion or Save-Data |
| Fonts | Archivo Black (display), Space Grotesk (body), self-hosted woff2 |
| Hosting | Vercel |

## Run it

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ at http://localhost:4173
```

On Windows run npm from `cmd`, not PowerShell.

Testing the event states: append `?now=` with an ISO time to see the countdown and schedule at that moment, for example
`?now=2026-11-20T18:45:00+05:30` (live: "Now" and "Next" appear) or `?now=2026-11-21T18:00:00+05:30` (ended).

## Design system

| Token | Hex | Use |
|---|---|---|
| `--color-cream` | `#F2EBDD` | Light surfaces |
| `--color-near-black` | `#171717` | Dark surfaces, body text on cream |
| `--color-orange` | `#F05A28` | Fills, blocks, buttons (near-black labels) |
| `--color-orange-deep` | `#D94A1A` | Large display text on cream only |
| `--color-lime` | `#D9F36A` | Near-black surfaces, or as a fill behind near-black text |

Interaction: one `.brutal` utility in `src/styles/index.css` (hard offset block that lifts on hover and focus, collapses on press; hover only where a real hover exists). Motion animates `transform`, `opacity` and `clip-path` only, and every animation has a reduced-motion path.

## Brand assets

Generated with scripts that depend only on `sharp` (already a devDependency):

```bash
node scripts/gen-favicon.mjs                                  # public/favicon/favicon-32.png, apple-touch-icon.png (180)
python scripts/og-build-svg.py && node scripts/gen-og.mjs    # public/images/og-image.svg -> og-image.png (1200x630)
```

`og-build-svg.py` converts the OG text to outlines using the site fonts (`pip install fonttools brotli`, dev-only), so the PNG renders identically on any machine.

### Hero screenshot

```bash
npm run build && npm run preview     # one terminal
npx playwright install chromium      # once
node scripts/shot-hero.mjs           # writes doc/hero.png, then commit it
```

## Where things live

```
src/
  components/  nav/ (Navbar, MobileMenu), ui/ (Button, Countdown, SectionShell ...), art/, three/ (lazy scene)
  config/eventConfig.js   single source of truth for event facts (null = unverified, UI hidden)
  data/                   nav.js, schedule.js, prompts.js (4 x 12), content.js
  hooks/                  useScrollSpy, useCountdown, useEventClock, useCopy, useRegistrationForm
  lib/                    calendar.js (.ics), scheduleClock.js (Now/Next), pickPrompt.js, time.js, validation.js
  motion/                 gsap.js, Loader.jsx, SectionWipe.jsx, useReveal.js
  sections/               Hero, About, IdeaSpark, Timeline, Challenge, Registration, Venue, Footer
scripts/                  image, favicon and OG generators, contrast check
```

## Status of event data

| Item | Field in `eventConfig.js` | State |
|---|---|---|
| Registration endpoint | `registration.endpoint` | pending: form runs as a frontend-only demo and does not submit anywhere |
| Google Maps link | `venue.mapsUrl` | pending |
| Contact email | `contact.email` | pending, hidden in the footer until verified |
| Instagram, LinkedIn, website | `social.*`, `contact.website` | set |

Values flagged `provisional_*` (registration deadline, semesters, divisions) come from the plan and should be confirmed by the organisers.
