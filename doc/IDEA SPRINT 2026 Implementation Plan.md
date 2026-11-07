# IDEA SPRINT 2026: Implementation Plan

Nov 7, 2026 · @Harsh C Hari

The approved design is buildable by the 8 Nov, 11:59 PM IST deadline (about 34 hours away) with two adjustments: the hero artwork becomes a layered SVG spark instead of a WebGL scene, and registration stays honest about where data goes until organizers name a destination.

## A. Project understanding and the calls I'm making

This is a single-page React microsite for a 24-hour student ideathon (20–21 Nov 2026, College of Engineering Chengannur). Its identity is warm cream, near-black, orange and lime; Archivo Black display type at poster scale; one recurring geometric spark; purposeful GSAP motion; and one real 3D moment (Idea Spark). Of the 100 scoring points, 85 go to creativity, web fundamentals, performance and UX, so a distinctive, fast, fully working page beats a heavy 3D one.

The approved direction is untouched. These are the places where the spec collides with its own targets, each with the smallest fix:

| Spec item | Problem | Adjustment |
| --- | --- | --- |
| 3D explosion in the hero | three.js + React Three Fiber is on the order of 150 kB gzip plus a WebGL context on the LCP path; it threatens the 95+ mobile Performance target | Hero spark is a layered inline SVG (gradient-shaded cubes, rings, discs) assembled with GSAP. Real 3D appears only in Idea Spark, lazy-loaded. A 3D hero is a stretch goal after QA |
| Hero type scale | "POSSIBILITIES." is the longest word in the approved headline (about 10–11 em wide in Archivo Black), so it caps the headline size; IDEA + SPRINT on one line would also cap near 175 px at 1440 px | Size the headline by that word, measured at 320, 390 and 1440 px. IDEA SPRINT 2026 stays oversized display type inside the composition (150–220 px where space permits, stacked and staggered), with the spark at the IDEA/SPRINT transition |
| Hero hierarchy and SEO | Search optimisation must not change the approved visual hierarchy | The approved headline stays dominant and is the `h1`; IDEA SPRINT 2026 is the integrated wordmark. SEO comes from `<title>`, meta description, Open Graph tags, landmarks and one `h1`, never from visual changes |
| Section transitions | Full-screen wipes on every nav action would block scrolling | Scroll-scrubbed geometric wipes only at the 3–4 cream/dark boundaries; everything else is a CSS fade. Anchor links use native smooth scroll |
| Loader 1.5–2 s | Can hurt Speed Index and perceived speed | Overlay painted from `index.html` with CSS only and hidden by a pure-CSS timer no later than 2.0 s, even if React or GSAP never run; non-interactive (`pointer-events: none`), hidden for reduced motion and without JS; hero already rendered and usable underneath |
| Map preview | An embedded Google iframe adds third-party requests and cookies, which cost Performance and Best Practices | Click-to-load map facade plus an "Open in Google Maps" link |
| Registration success | No confirmed destination | Submission adapter with a `preview` mode that never shows a fake success (section B) |

**Palette rules, from computed contrast.** Orange on cream is only about 2.9:1 and lime on cream about 1.04:1, so both fail on cream. Near-black on orange is about 5.3:1, lime on near-black about 14.5:1, near-black on lime about 14.5:1, near-black on cream about 15:1. Therefore: orange never carries text or input borders on cream (use it for fills and shapes, with near-black labels on orange buttons); lime appears only on near-black or as a fill behind near-black text; form borders and focus rings are near-black. Accessibility 95+ depends on this.

## B. Final implementation architecture

The project is plain React state plus one config file; there is no router, store or form library. The spec's folder tree is kept and gains `motion/`, `lib/` and `art/`, which hold the animation system, pure logic and the SVG spark.

```text
idea-sprint-2026/
├── index.html                 # meta/OG tags, font preload, CSS-only loader shell
├── public/                    # og-image.png, favicon/, images/ (optimised), robots.txt, sitemap.xml
├── scripts/optimize-images.mjs
└── src/
    ├── main.jsx, App.jsx
    ├── config/eventConfig.js  # single source of truth (dates, status, venue, links)
    ├── data/                  # schedule.js, prompts.js, content.js (steps, manifesto, journey, facts), nav.js
    ├── motion/                # gsap.js, useReveal.js, Loader.jsx, SectionWipe.jsx
    ├── components/
    │   ├── art/               # Spark.jsx, Fragments.jsx (cube, ring, disc, sphere as SVG)
    │   ├── three/             # SparkScene.jsx (lazy), webgl.js (capability check)
    │   ├── nav/               # Navbar.jsx, MobileMenu.jsx
    │   └── ui/                # Button, Field, Select, Stepper, Countdown, SectionShell
    ├── sections/              # Hero, About, IdeaSpark, Timeline, Challenge, Registration, Venue, Footer
    ├── hooks/                 # useCountdown, useRegistrationForm, useCopy
    ├── lib/                   # time.js, validation.js, submitRegistration.js, pickPrompt.js
    └── styles/index.css       # Tailwind import, @theme tokens, base, focus styles
```

**Component hierarchy.** `App` renders a skip link, `Loader`, `Navbar`, then `<main>` with the seven sections in the approved order, then `Footer`. `SectionWipe` components sit on the cream/dark boundaries between sections. `Spark` and `Fragments` are the only artwork primitives and are reused by Loader, Hero, About, Idea Spark fallback, Challenge, and Footer.

**Central config (`eventConfig.js`).** Fields: name, tagline, organizer, college, `timezone: 'Asia/Kolkata'`, `startISO: '2026-11-20T17:00:00+05:30'`, `endISO: '2026-11-21T17:00:00+05:30'`, `registration { status, deadlineISO, mode, endpoint }`, `team { min: 1, max: 4 }`, eligibility, `semesters`, `divisions`, `venue { college, room, mapsUrl, photo }`, `social { instagram, linkedin }`, `contact { email }`. Any unverified value is `null` and its UI is hidden, never filled with a placeholder. Using the explicit +05:30 offset makes the countdown correct on any device timezone.

**State.** Local React state only:

- `useCountdown` runs one 1-second ticker, pauses when the tab is hidden, and derives `before | live | after`. A dev-only `?now=` override lets all three states be tested.
- `useRegistrationForm` is a `useReducer` holding step, team, a four-slot participants array, touched flags and errors.
- Idea Spark keeps the selected category plus a shuffle-bag per category in a ref, so a prompt never repeats until the bag is empty and never repeats back-to-back across refills.

**Animation architecture.**

- GSAP and ScrollTrigger are registered once in `motion/gsap.js`. Each section animates inside `useGSAP` (from `@gsap/react`) scoped to its own ref, so cleanup is correct under React StrictMode.
- `gsap.matchMedia()` provides two conditions: reduced motion (no timelines, final states applied instantly) and desktop pointer (`min-width: 1024px` with `hover: hover`, which enables cursor parallax).
- **Fail-safe:** content is visible by default in CSS. GSAP applies hidden start states itself, so a JS or animation failure never hides content. `ScrollTrigger.refresh()` runs after `document.fonts.ready`.
- No pinning anywhere. Scrub is used only for wipes, the timeline line and spark drift; reveals are one-shot.
- A single `useReveal` hook (driven by `data-reveal` attributes) covers fades and staggers. Bespoke timelines exist only for Loader, Hero, Timeline line and the Challenge spark.
- **Loader:** `index.html` paints the near-black screen and "IEDC BOOTCAMP CEC" with CSS alone. It is independently fail-safe: a pure-CSS animation fades and hides it (`visibility: hidden`, `pointer-events: none`) no later than 2.0 s after first paint, so it cannot stay visible if React or GSAP never run. It is `pointer-events: none` and `aria-hidden` from the start, so the hero beneath is always clickable and focusable. A `prefers-reduced-motion: reduce` rule and a `<noscript>` rule hide it entirely. When React mounts, one GSAP timeline (blocks rearrange, "IDEA SPRINT 2026", spark assembles) of at most 1.6 s plays inside the overlay and removes it early as the hero entrance begins; reduced motion skips the timeline. It runs on each full document load (initial load or intentional reload) and never on anchor navigation, so no `sessionStorage` is needed.
- **Wipes:** `SectionWipe` is a band at a section boundary whose `clip-path` is scrubbed by ScrollTrigger. It uses transform and clip-path only, is expressive on desktop and a simple single band on mobile.

**Registration architecture.** Four steps (Team, Participants, Review, Submit), with Next disabled until the step validates and errors shown on blur and on attempted submit.

| Field | Rule |
| --- | --- |
| Team name | 2–40 characters, trimmed; any script, digits and punctuation allowed |
| Team size | 1–4, chosen with radio buttons; participant data is kept if size shrinks and later grows |
| Full name | At least 2 and at most 100 characters after trimming and Unicode (NFC) normalisation, containing at least one Unicode letter (`\p{L}`). No character whitelist: accents, non-Latin scripts, apostrophes, hyphens, periods and mononyms are accepted; only control characters are rejected |
| Email | Pragmatic format check, lowercased |
| Phone | Strip spaces, dashes, `+91` and a leading 0; require 10 digits starting 6–9 (confirm no international numbers) |
| Semester / Division | Must be in the config lists |
| Duplicates | Within one team, no repeated email or phone |
| Leader | Participant 1, labelled "TEAM LEAD" in text, not colour alone |

All validation lives in `lib/validation.js` as pure functions. Every `Field` has a visible label, `aria-invalid`, and an error linked by `aria-describedby`, plus one `aria-live` summary on failed submit.

`lib/submitRegistration.js` is the only place that knows the destination:

- **`mode: 'preview'` (default until organizers answer):** nothing is sent. The Review step says plainly that registrations are not yet connected, offers "Copy summary" (and a `mailto:` only if an organizer email is approved), and never shows a success screen.
- **`mode: 'endpoint'`:** POST JSON to the configured URL with a 10 s timeout, honeypot field, and a disabled button while sending. Success is shown only on a 2xx response; on failure the data is kept with a retry. Any destination fits (Apps Script web app, a form service, or a Supabase Edge Function).
- **If Supabase is approved:** write through an Edge Function that validates server-side, rate-limits and checks duplicates, rather than inserting from the browser. Use RLS with no public read, only the publishable key in the frontend, and a privacy line plus consent checkbox on Review. Nothing is created until organizers approve.

## C. Dependency plan

Thirteen packages cover the whole site. Versions are the latest on npm as of 7 Nov 2026; pin them with `npm install` at scaffold time and do not upgrade mid-project. React Three Fiber 9.8 requires React `>=19 <19.4`, which React 19.3.1 satisfies.

| Package | Version | Why it is needed |
| --- | --- | --- |
| `react`, `react-dom` | 19.3.1 | Approved framework |
| `vite`, `@vitejs/plugin-react` | 8.3.6, 6.2.1 | Approved build tool; check Vite's `engines` field and use Node 22 LTS |
| `tailwindcss`, `@tailwindcss/vite` | 4.3.5 | Approved styling. v4 is CSS-first: tokens live in `@theme` inside `styles/index.css`, with no `tailwind.config.js` |
| `gsap` | 3.15.1 | Entrance, reveals, ScrollTrigger and the loader. ScrollTrigger ships inside the same package |
| `@gsap/react` | 2.1.2 | `useGSAP` hook for scoped, StrictMode-safe cleanup |
| `three` | 0.187.0 | Idea Spark scene only, in a lazy chunk |
| `@react-three/fiber` | 9.8.2 | Declarative scene for Idea Spark, same lazy chunk |
| `@fontsource/archivo-black`, `@fontsource-variable/space-grotesk` | 5.3.0 | Source of the self-hosted font files (OFL licensed, so availability and licensing are settled) |
| `sharp` (dev only) | 0.35.5 | `scripts/optimize-images.mjs` to produce AVIF/WebP and responsive sizes |

**Deliberately not installed:** `@react-three/drei` (build the scene from three's own geometries instead: core `TorusGeometry`, `SphereGeometry` and `BoxGeometry`, plus the `RoundedBoxGeometry` addon imported from `three/addons/geometries/RoundedBoxGeometry.js`, which ships inside the `three` package and adds no dependency; this avoids drei's large transitive tree and its CDN environment-map fetch), Framer Motion, Lenis or other smooth-scroll libraries (native scroll is more comfortable and cheaper), React Router, React Hook Form, Zod, icon libraries (inline SVG), and the Supabase client (added only if organizers approve it). GSAP's SplitText is not needed: a 15-line word/letter splitter in `motion/` keeps full control of `aria-label` so screen readers read each headline once.

**Font loading.** Copy the two Latin-subset `.woff2` files into `public/fonts/`, write the `@font-face` rules by hand with `font-display: swap`, and `<link rel="preload">` only Archivo Black (it carries the LCP headline). Define a metric-adjusted Arial fallback (`size-adjust`, `ascent-override`) so the swap causes almost no layout shift. Archivo Black has one weight, so never use `font-bold` on it; the browser would synthesise a fake bold.

**Setup commands.**

```bash
npm create vite@latest idea-sprint-2026 -- --template react
cd idea-sprint-2026
npm i gsap @gsap/react three @react-three/fiber @fontsource/archivo-black @fontsource-variable/space-grotesk
npm i -D tailwindcss @tailwindcss/vite sharp
```

**Bundle budget.** Initial JS under about 120 kB gzip (React, GSAP core, ScrollTrigger, app code). `three` and R3F stay out of that: `SparkScene` loads through `React.lazy` only when Idea Spark nears the viewport and WebGL is available. Check the real numbers in the `vite build` output and stop adding features if the budget is exceeded.

## D. Section implementation plan

All copy comes verbatim from the approved spec. Every section is a `<section id="…" aria-labelledby="…">` with one `h2`. Everything uses GSAP unless noted; only Idea Spark uses three.js.

### Navbar, skip link and anchors (global)

- **Components:** `Navbar`, `MobileMenu`, skip-to-content link.
- **Layout:** fixed minimal bar with the IEDC BOOTCAMP CEC wordmark left, section links centre (hidden below 1024 px), Register button right and always visible, including on mobile.
- **Behaviour:** mobile menu is a disclosure button (`aria-expanded`) opening a near-black overlay; Esc or a link click closes it and focus returns to the button. Anchors use CSS `scroll-behavior: smooth` and `scroll-margin-top`. The active link is set by ScrollTrigger. Smooth scrolling is disabled under reduced motion.

### 1. Hero

- **Components:** `Hero`, `Spark`, `Fragments`, `Countdown`, `Button`.
- **Layout:** the approved headline "24 HOURS. ONE IDEA. ENDLESS POSSIBILITIES." is the `h1` and the dominant element: highest contrast, first in reading order, set in stacked lines sized by its longest word ("POSSIBILITIES.", about 10–11 em wide in Archivo Black; measure in the browser). "IDEA SPRINT 2026" is oversized display type integrated into the same composition, stacked and staggered, with the spark at the IDEA/SPRINT transition. It is a wordmark (`p`) that supports the headline and does not outrank it; balance comes from tonal or outlined fill, scale and layering, and is judged visually in T13 at 360 and 1440 px. Below sit supporting copy, countdown, two CTAs and a metadata row (IEDC BOOTCAMP CEC, College of Engineering Chengannur, 20–21 November 2026, 24 hours). Fragments sit in two layers: most behind the type, one or two crossing letter boundaries without hurting legibility. All artwork is `aria-hidden`. SEO is handled by `<title>`, meta description, Open Graph tags and landmarks, never by changing the visual hierarchy.
- **Countdown:** `before` shows days, hours, minutes, seconds; `live` shows LIVE and time left to 5:00 PM on 21 Nov; `after` shows SPRINT COMPLETED. It is a `<time>` element without a per-second live region. The primary CTA label follows `registration.status` (Register Now, Opening Soon, or Registration Closed); the secondary CTA scrolls to About.
- **Motion:** entrance of 1.2 s or less (staggered word reveal, fragments flying into the assembled spark, then copy, countdown and CTA fade up); ambient float on 2–3 fragments (CSS, transform only); desktop-only cursor parallax on three layers through `gsap.quickTo` (about 12 px); a light scroll-scrubbed shift of the artwork.
- **Mobile:** headline stacked over as many lines as needed so "POSSIBILITIES." fits at 320 px (smaller than desktop, so dominance comes from contrast and position), IDEA / SPRINT wordmark stacked and simplified, four fragments instead of nine, full-width CTA, no parallax.

### 2. About

- **Components:** `About`, `Manifesto`, `Journey`, `JourneyStage`.
- **Layout:** cream introduction (headline wide, copy offset); near-black manifesto with QUESTION. IMAGINE. EXPERIMENT. CREATE. as four oversized lines; cream journey of DISCOVER, IDEATE, DEVELOP, PRESENT as four numbered stages (a horizontal rule with nodes on desktop, a vertical list on mobile).
- **Motion:** word reveals; manifesto words toggle to lime and scale up as they cross the viewport centre (`toggleClass`, not scrub); journey stages become active one by one as they enter; fragments drift slightly on scroll. Wipes mark cream to dark and dark to cream. No pinning.
- **Mobile:** same order stacked, reveals shortened, no drift.

### 3. Idea Spark

- **Components:** `IdeaSpark`, `CategoryPicker` (radio group), `PromptCard`, `SparkScene` (lazy), `SparkFallback` (the SVG `Spark`), `useCopy`.
- **Logic:** four categories, target 12 prompts each (the spec's 12 starters plus 8 more per category in the same "How might we…" voice). `pickPrompt` uses a shuffle-bag per category. States: nothing selected, selected, prompt shown. Buttons: Generate, Copy, Another one. The card is `aria-live="polite"`. Copy uses `navigator.clipboard` with a textarea fallback and a text "Copied" state.
- **Layout:** desktop is asymmetric: giant "WHAT IF...?" plus the scene on one side, picker and prompt card on the other. Mobile stacks headline, compact spark (about 220 px), category chips, full-width Generate, card, then actions.
- **3D scene:** one orange semi-gloss rounded cube, one matte lime torus, a cream sphere and a dark reflective disc around a small asterisk made of three crossed rounded boxes; lights are ambient plus two directional, with no environment-map download. `RoundedBoxGeometry` is a three.js addon, not core: import it with `import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'` (it ships inside the `three` package, so there is no new dependency) and register it with R3F's `extend`; if that causes any build or size problem, use core `BoxGeometry`. Torus and sphere are core. `dpr` capped at `[1, 1.5]`, rendering on demand, paused off-screen, about 12 meshes on desktop and 6 on mobile. Pressing Generate eases the pieces to new positions.
- **Fallback:** the SVG spark replaces the scene when WebGL is missing, reduced motion is on, Save-Data is on, or the lazy chunk errors (Suspense plus an error boundary). It still rotates and pulses on Generate. The generator never depends on the scene.

### 4. Event Timeline

- **Components:** `Timeline`, `DayPanel`, `TimelineItem`, `TimelineRail`.
- **Data:** `data/schedule.js` holds two days, each with a label ("THE SPARK BEGINS.", "BRING IT TO LIFE.") and items of `{ time, title }`, using the provisional schedule from the spec.
- **Layout:** Day 1 on a near-black panel with lime markers; Day 2 on cream with orange node fills and near-black text. Oversized Archivo Black time markers, bold activity names, a central rail with ring or clock nodes and items alternating sides on desktop; a single left rail on mobile. Each day is an `<ol>` with `<time>` elements.
- **Motion:** rail `scaleY` scrubbed to scroll progress through each panel; items slide and fade in; time markers scale 0.9 to 1 and gain their accent colour; day headings reveal.
- **Note:** show a small "Schedule subject to change" line until organizers confirm it.

### 5. The Challenge

- **Components:** `Challenge`, `StepList`, `Step`, `FactStrip`, reused `Spark`.
- **Layout:** two-line headline with the supporting headline and copy; four steps (01 to 04) in an offset 2×2 grid on desktop; a near-black fact strip with 24 HOURS, TEAM SIZE 1–4, ELIGIBILITY COLLEGE STUDENTS and ONE IDEA, read from `eventConfig` so one correction updates both here and the form.
- **Motion:** staggered step reveals; one small spark scrubbed between step positions (desktop only, static at the top on mobile); facts clip-reveal.
- **Photography:** only real organizer-supplied photos with meaningful alt text. If none arrive, the section stays typographic. No stock photos of students.

### 6. Registration

- **Components:** `Registration`, `RegistrationInfo`, `RegistrationForm`, `Stepper`, `TeamStep`, `ParticipantsStep`, `ReviewStep`, `ParticipantCard`, `Field`, `SegmentedControl`.
- **Layout:** desktop is a 5/7 split with a sticky identity panel on the left (heading, deadline, team size, dates, small spark) and the form on the right. Mobile is a single column with "Step 2 of 3" text plus a progress bar, inputs at least 48 px tall, and correct `type`, `inputmode` and `autocomplete` attributes (`email`, `tel`, `name`).
- **Interaction:** rules and submit behaviour are in section B. Review is a read-only summary with an Edit link per block. Focus moves to the step heading on every step change and to the error summary on a failed Next.
- **Motion:** only a 150 ms CSS cross-fade between steps and button hover. No 3D, no scroll animation inside the form.
- **Status:** if `registration.status` is not `open`, the form is replaced by a clear closed or opening-soon message.

### 7. Venue

- **Components:** `Venue`, `VenueInfo`, `MapFacade`, `LocationPin` (SVG).
- **Content:** headline and copy from the spec; College of Engineering Chengannur; SPDK Room, 5th Floor; "20 Nov, 5:00 PM to 21 Nov, 5:00 PM" written out in full rather than "5:00 PM – 5:00 PM".
- **Layout:** large campus photo in a `<picture>` (AVIF/WebP, `srcset`, explicit width and height, lazy, not the LCP element) with the info block overlapping it asymmetrically; the map beside or below.
- **MapFacade:** a static preview panel with an animated pin and a "Load interactive map" button that injects the iframe only on click, plus an "Open in Google Maps" link (`target="_blank" rel="noopener noreferrer"`). Copy keeps the room in text and never implies the pin marks the room itself.
- **Fallbacks:** no photo yet means a geometric panel built from the fragments, not a stock image. No verified Maps link means a Google Maps search URL from the college name, labelled "Search on Google Maps".

### 8. Footer

- **Components:** `Footer`, `FooterNav`, `SocialLinks`, `BackToTop`.
- **Content:** the closing headline; IEDC BOOTCAMP CEC wordmark (typographic unless an official logo is supplied); IDEA SPRINT 2026; links to About, Idea Spark, Timeline, Challenge, Register, Venue; Instagram and LinkedIn only when verified in config; email only when approved; © 2026 IEDC BOOTCAMP CEC.
- **Layout:** near-black, headline in two or three oversized lines, a large spark cropped at the bottom edge in orange and lime, links in three columns on desktop and stacked on mobile.
- **Motion:** headline clip reveal, CSS link hover underline; Back to top scrolls to the hero (instant under reduced motion) and moves focus to the `h1`.

## E. Implementation phases

About 18 focused hours fit before the deadline, around sleep. The order is: a complete, working, deployed site first (Priority 1), brand and motion second (Priority 2), then QA and submission (Priority 3). Deploying in phase 0 means the Lighthouse number is measured early and tracked, not discovered at the end. All times are IST.

| Window | Phase | Output | Gate to pass |
| --- | --- | --- | --- |
| Sat 1:30–2:30 PM | 0. Kickoff | Organizer questions sent (section F); Vite + Tailwind scaffold; GitHub repo; first Vercel deploy; tokens, fonts, `eventConfig`, `schedule`, `prompts` | Empty shell live on Vercel, `npm run build` green |
| Sat 2:30–7:30 PM | 1. Essential site | All 8 sections with real copy and layout; Navbar; 3-state Countdown; Timeline; full Registration with validation in preview mode; Idea Spark generator without 3D | **M1:** whole site working and deployed at 360, 768 and 1280 px, no animation needed |
| Sat 7:30–11:30 PM | 2. Identity and motion | `Spark` and `Fragments` SVG; hero composition and type scale; cream/dark section treatments; hero entrance; reveals; 3 wipes; Timeline rail | Hero reads as the brand on a real phone; committed and deployed |
| Sun 9:00 AM–12:00 PM | 3. Loader and extras | Loader; About and Challenge motion; 3D Idea Spark, time-boxed to 12:00 PM | If the 3D scene is not stable on a phone at noon, ship the SVG fallback (already built) and move on |
| Sun 1:00 PM | **Feature freeze** | No new features after this point |  |
| Sun 1:00–5:00 PM | 4. QA and optimise | Responsive, keyboard, screen-reader and reduced-motion passes; WebGL-off test; all three countdown states; images; bundle check; SEO assets; README; Lighthouse loop on the deployed URL | Mobile Lighthouse target 95+ in all four categories. Fix the largest measured bottleneck first; never cut brand elements or core features to chase a score |
| Sun 5:00–7:00 PM | 5. Submit | Genuine Lighthouse screenshot; ≤100-word note; README check; repo public; submission sent | Everything delivered about 5 hours early |
| Sun 7:00–11:59 PM | Buffer | Bug fixes only |  |

**Dependencies.** `eventConfig` and `data/` come first because every section reads them. `Spark` and `Fragments` come before Hero, Loader, Footer and the Idea Spark fallback. Fonts load before any ScrollTrigger measurement (`ScrollTrigger.refresh()` after `document.fonts.ready`). Late organizer answers (links, photo, schedule fixes) enter only through config and image files, so they never block code.

**Cut order if behind schedule** (first item goes first): the 3D scene (keep the SVG), cursor parallax, the travelling spark in Challenge, progressive journey activation (use a plain reveal), the loader's rearrangement (use a wordmark fade only), then reduce wipes from three to two. **Never cut:** responsive layout, registration validation, the countdown, the timeline, accessibility, the README, or the real Lighthouse run.

## F. Risks and unresolved details

Send the organizer questions in the first hour. None of them blocks coding, because each has a safe fallback that uses only verified information, but each answer improves the result.

**Ask organizers now (in this order)**

| # | Question | Fallback if unanswered by Sun 12:00 PM |
| --- | --- | --- |
| 1 | Where should registrations go (endpoint, Sheet or Supabase), who manages them, and what privacy wording is approved? | `preview` mode: full validated flow, honest "not connected yet" message, Copy summary, no success screen |
| 2 | Confirm start and end (20 Nov 5:00 PM to 21 Nov 5:00 PM), the registration deadline of 18 Nov (and its time of day), and the full schedule, including whether the music session ends at 10:30 or 11:00 PM | Publish the spec's schedule with a visible "subject to change" note; assume end of day for the deadline |
| 3 | Confirm team size 1–4, individual entry, same-institution rule, eligibility wording, and the semester and division lists | Use the spec's values; show "College students" without extra rules |
| 4 | Confirm SPDK Room, 5th Floor; send the Google Maps link and entrance; send a campus photo | Search-link fallback, geometric panel instead of a photo (section D) |
| 5 | Official IEDC BOOTCAMP CEC logo, Instagram URL, LinkedIn URL, contact email | Typographic wordmark; hide social and contact items until verified. Nothing is invented |

**Spec ambiguities and how I resolved them**

- The registration flow lists four items but calls them "two data-entry steps followed by a review". I show three visible steps (Team, Participants, Review) and treat Submit as the action on Review.
- A team of one has its single participant as the leader, so "exactly one leader" always holds.
- The venue time "5:00 PM – 5:00 PM" is written with both dates so it reads correctly.
- The secondary hero CTA is labelled "Explore".

**Technical risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Mobile Lighthouse Performance below 95 | Performance is 20 points of the score | SVG hero, lazy 3D, initial JS budget, preloaded display font, no third-party requests (no CDN fonts, analytics or map iframe). Deploy early and run Lighthouse every phase, then fix the largest measured bottleneck from the report's diagnostics first (LCP element, unused JS, layout shift, long tasks). Never remove brand elements or core features to chase a score. Scores vary by a few points between runs and mobile throttles CPU heavily, so report a genuine run |
| Hero LCP delayed by the entrance animation | An element at `opacity: 0` is not an LCP candidate until it becomes visible | Reveal the `h1` with transform or clip inside an overflow mask, never from opacity 0; only secondary copy fades |
| Layout shift | CLS penalty | Font fallback metrics, `tabular-nums` with fixed width for countdown digits, explicit image dimensions, no pinning |
| Oversized type overflows at 320 px | Clipped headline, broken first impression | Fluid `clamp()` sizes tested at 320, 360, 390; `svh`/`dvh` instead of `vh`; check "POSSIBILITIES." and "SPRINT" first |
| ScrollTrigger positions wrong after fonts or lazy content | Misfired reveals and wipes | `ScrollTrigger.refresh()` after fonts and after the lazy chunk mounts; no pins; `ignoreMobileResize` |
| iOS Safari WebGL limits or context loss | Blank Idea Spark scene | Error boundary and the SVG fallback; one WebGL context only |
| Loader slows perceived speed | UX and Speed Index | CSS-first shell with a pure-CSS 2.0 s hide timer that works without JS, non-interactive, no replay on anchor navigation, skipped for reduced motion |
| Countdown wrong in another timezone | Wrong event time | Fixed `+05:30` ISO strings; test with the device timezone set to UTC |
| Clipboard unavailable | Copy button fails silently | Textarea fallback plus a visible "Copied" or "Press Ctrl+C" state |
| Time overrun on 3D and loader | Missed deadline | Both are time-boxed and sit at the front of the cut order (section E) |

## G. Testing and deployment checklist

Run the Functional and Responsive items at the end of phase 1, then everything again in phase 4 on the deployed URL.

### Functional

- [ ] Countdown shows the correct state for before, during and after, using `?now=` overrides, and is still correct with the device timezone set to UTC
- [ ] Hero CTA label and availability follow `registration.status`
- [ ] Idea Spark: all four categories work; no back-to-back repeat over 30 clicks; Copy works on https and in the fallback path; the whole feature works with WebGL disabled
- [ ] Timeline shows all 11 schedule items with the exact times from `schedule.js`, in both day panels
- [ ] Registration: team sizes 1–4 produce the right participant fields; blank, bad email, bad phone and duplicate entries are each blocked with a clear message; the leader label shows on participant 1 only
- [ ] Registration: shrinking then growing the team keeps entered data; Edit on Review returns to the right step without losing data
- [ ] Preview mode never shows a success screen; endpoint mode (if enabled) shows success only on a 2xx response, keeps data on failure, and cannot double-submit
- [ ] Every nav anchor lands with its heading visible below the header; mobile menu opens, closes on Esc and link click, and returns focus; Back to top works
- [ ] Loader shows on each full page load only, never on anchor navigation; it never blocks clicks or keyboard access to the hero; with JavaScript disabled, with reduced motion, and with React or GSAP blocked, it is gone by 2.0 s at the latest (test each)

### Responsive

- [ ] Widths 320, 360, 390, 768, 1024, 1280, 1536 and 1920 px: no horizontal scroll (`scrollWidth <= innerWidth`), no clipped headline or button
- [ ] At least one real Android phone and, if available, one iPhone (Safari), portrait and landscape
- [ ] 200% browser text zoom keeps the form and timeline usable
- [ ] Touch targets at least 44 px; timeline and form readable without sideways scrolling

### Accessibility

- [ ] Full keyboard-only pass of the page and form, with a visible focus ring on every control
- [ ] One `h1`, then `h2` per section, with no skipped levels; each headline is read once by a screen reader (quick NVDA or TalkBack check)
- [ ] Every input has a visible label; errors are linked with `aria-describedby`; the error summary receives focus
- [ ] Reduced motion (OS setting and DevTools emulation) shows all content with no movement and no loader
- [ ] Contrast checked for every text and background pair against the palette rules in section A; no meaning carried by colour alone
- [ ] axe DevTools shows no serious issues; Lighthouse Accessibility is 95 or higher

### Performance

- [ ] `vite build` output reviewed: initial JS about 120 kB gzip or less; the three.js chunk is not requested until Idea Spark nears the viewport (check the Network tab)
- [ ] Images are AVIF or WebP with `srcset`, explicit dimensions and lazy loading; Archivo Black is preloaded; no third-party requests anywhere
- [ ] Mobile LCP under 2.5 s and CLS under 0.1 on the production URL
- [ ] Lighthouse mobile target 95+ in all four categories: three runs, incognito window, no extensions, production URL; fix the largest measured bottleneck first; keep the report from a genuine run

### SEO and metadata

- [ ] Title, meta description, canonical, Open Graph and Twitter tags with an absolute 1200×630 image URL (set once the final domain is known)
- [ ] Favicon set, `theme-color`, `lang="en"`, `robots.txt`, `sitemap.xml`

### Deployment and submission

- [ ] GitHub repository public with a clean `.gitignore` and no secrets
- [ ] README covers overview, technologies, install, dev, build, deploy, config notes and the registration preview-mode note
- [ ] Vercel production deploy from `main`; the final URL opened and checked on a phone
- [ ] Lighthouse screenshot taken from the real production run
- [ ] Design and technology note of 100 words or fewer written and word-counted
- [ ] Live URL, repo URL, screenshot and note submitted by Sun 7:00 PM IST

## H. Antigravity execution instructions

Hand this section and the original spec to Antigravity only after you approve the plan.

**Ground rules**

- Work one task at a time in the order below. Run `npm run build` and commit after each task as `T#: summary`. Deploy at the end of each phase and report the URL and bundle size.
- The spec is fixed. No new sections, features, backend or packages beyond section C; ask first if something seems missing.
- Copy is verbatim from the spec. Any unverified value is `null` in `eventConfig` and its UI is hidden. Never invent URLs, emails, logos or photos.
- Content must be visible by default; animation is an enhancement and must respect `prefers-reduced-motion`.
- Preview-mode registration never shows a success state. Never write or display Lighthouse numbers that were not measured.

| ID | Task | Done when |
| --- | --- | --- |
| **Phase 0** |  |  |
| T1 | Scaffold Vite + React, Tailwind v4 plugin, folder tree from section B, Git, GitHub repo, first Vercel deploy | Build is green and the URL is live |
| T2 | Tokens in `@theme`, self-hosted fonts with metric-adjusted fallback and Archivo Black preload, base and focus styles | Palette and type tokens exist; no visible font-swap jump |
| T3 | `eventConfig.js`, `schedule.js`, `prompts.js` (12 per category), `content.js`, `nav.js`, `lib/time.js` | No event fact is duplicated in a component |
| **Phase 1** |  |  |
| T4 | `SectionShell`, `Navbar`, `MobileMenu`, skip link, anchor scrolling | Nav works from 320 to 1920 px; Esc and focus return work |
| T5 | Hero static layout, `Countdown` with three states, CTAs | `?now=` shows all three states; the headline is the dominant `h1`; "POSSIBILITIES." and "SPRINT" fit at 320 px |
| T6 | About static: intro, manifesto, journey | Matches spec copy and light/dark/light order |
| T7 | Idea Spark generator with picker, shuffle-bag, Copy, Another one | Works with no 3D present; no immediate repeats |
| T8 | Timeline from data, two visually distinct day panels | All 11 items correct; no horizontal scroll on mobile |
| T9 | Challenge static: four steps and fact strip from config | Facts read from `eventConfig` |
| T10 | Registration: `validation.js`, `useRegistrationForm`, three steps, Review, `submitRegistration` in preview mode | Every Functional item for registration in section G passes |
| T11 | Venue static with `MapFacade` and the fallbacks | No iframe loads before a click |
| T12 | Footer, `BackToTop` | Links and focus behaviour correct. **M1: deploy and report** |
| **Phase 2** |  |  |
| T13 | `Spark` and `Fragments` SVG art; hero composition and type scale | Hero reads as the approved identity on a real phone: headline dominant, IDEA SPRINT integrated with the spark |
| T14 | `motion/gsap.js`, `useReveal`, `matchMedia`, fonts-ready refresh; hero entrance and desktop parallax | Hero `h1` is never reveal-from-opacity-0; reduced motion shows final state |
| T15 | Reveals for About, Timeline, Challenge, Footer; Timeline rail scrub | No pinning; content visible if GSAP fails |
| T16 | `SectionWipe` at three boundaries | Scrolling is never blocked; mobile uses the simple band |
| **Phase 3** |  |  |
| T17 | `Loader`: CSS shell in `index.html` with its own pure-CSS 2.0 s hide timer (`pointer-events: none`, hidden for reduced motion and without JS), then the GSAP timeline (1.6 s or less) layered on top; shows on each full page load, never on anchor navigation | With React or GSAP blocked, JS disabled, or reduced motion on, the overlay is gone by 2.0 s at the latest and never blocks hero clicks or focus |
| T18 | About manifesto and journey activation; Challenge travelling spark | Desktop only where specified |
| T19 | `SparkScene` lazy R3F with all fallbacks; `RoundedBoxGeometry` imported from `three/addons` (or core `BoxGeometry`). **Stop at Sun 12:00 PM** | Stable on a phone, or the SVG fallback ships |
| **Phase 4–5** |  |  |
| T20 | `optimize-images.mjs`, image conversion, favicon set, OG image, `robots.txt`, `sitemap.xml`, meta tags | All SEO items in section G pass |
| T21 | QA pass using section G; fix findings | Every box checked on the production URL |
| T22 | Lighthouse loop targeting 95+ in all four categories (fix the largest measured bottleneck first, without cutting brand elements or core features), README, then the submission note | Real report saved; README complete; note is 100 words or fewer |

**Kickoff prompt to paste into Antigravity**

```text
Read the approved IDEA SPRINT 2026 implementation plan and the original spec.
Do not redesign anything. Implement strictly in task order T1 to T22, one task
at a time, committing after each and running `npm run build` first. Start with
T1 only, then stop and report the live URL. Ask before adding any package that
is not in section C of the plan.
```

**Draft design and technology note** (80 words; adjust to match what actually ships, and recount):

> Idea Sprint 2026 is a typography-led microsite in IEDC's cream, black, orange and lime. One geometric spark recurs from loader to footer, so every section feels connected. React, Vite and Tailwind provide the structure; GSAP drives purposeful, reduced-motion-safe animation. Event details live in one config file, and the registration form validates fully on the client without pretending to submit. The 3D Idea Spark prompt generator loads lazily and falls back to SVG, keeping the initial bundle small and performance high.
