# Hero above-the-fold + Event Date — progress log

## Phase 0 — Baseline harness (done)
- Scratch harness lives outside the repo (`measure.mjs`, `shots/`); run with `node measure.mjs <tag> [desktop|mobile|tablet]`.
- Baseline reproduced: hero 1290px tall at all desktop widths >=1366; countdown top y=1014 at 1920x937 (below fold).
- Mobile countdown/CTA bottoms: 360x740 -> 579 / 667 (CTA row only; meta row below fold), 390x844 -> 589 / 677, 430x932 -> 626 / 714.
- Baseline screenshots for every mobile/tablet viewport saved as `baseline-*.png`.
- No source changes in this phase.

## Phase 1 — Shared date component + mobile/tablet integration (done)
- New `src/components/ui/EventDate.jsx`: built from eventConfig (Intl, Asia/Kolkata), `20–21 NOV 2026` + `5:00 PM to 5:00 PM · 24 hours`, `<time dateTime>` elements, one sr-only sentence, visual lines aria-hidden. Marked with `data-event-date` (no GSAP hook, static).
- Hero: new wrapper `data-hero="event"` holds EventDate + countdown + CTA (hooks stay on their own elements). Date directly above countdown.
- `heroMeta` (content.js, only used by Hero) no longer contains the date or "24 hours".
- `@custom-variant short-mobile` (<=1023px wide AND <=760px tall) in index.css; trims gaps only (h1, support, event wrapper, countdown, CTA). Support paragraph NOT hidden — not needed.
- Measured (Register button bottom / fold-16): 360x740 698 / 724 OK; 390x844 756 / 828 OK; 430x932 772 / 916 OK; 768x1024 973 / 1008 OK. No horizontal scroll at any size.
- Known: 320x568 cannot fit (was 742 baseline, now 774); out of scope per plan.
- Tooling: `data-event-date` is what the measure script looks for.

## Phase 2 — Desktop two-column skeleton, lg+ (done)
- Hero content wrapper is `lg:grid lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:gap-x-12 lg:items-center`.
- Deviation from plan wording (same intent, more robust): the left items (wordmark, h1, decorative frags, support, Explore link) sit in one wrapper `<div data-hero-col="left">` instead of per-item `col-start-1` + `row-span-N`. It is a plain block below lg, so mobile/tablet DOM flow is unchanged. The event wrapper has `lg:col-start-2 lg:row-start-1 lg:mt-0`. DOM order unchanged (tab order: left column -> Explore -> Register).
- Meta row is `lg:hidden`. Tablet outline Explore wrapper is now `hidden sm:block lg:hidden`. The lg text link "Explore ↓" was added here (planned for Phase 4) so desktop is not left without Explore; exactly one Explore is visible per breakpoint.
- CTA stacks at lg (`lg:flex-col`), Register is `lg:w-full`.
- Regression: mobile/tablet screenshots are pixel-identical to Phase 1 (verified against the Phase 1 zip served on :5174, with countdown hidden + animations frozen via FREEZE=1 to remove clock/float noise).
- Still to do (later phases): hero is 1078px tall on desktop (left stack too tall), countdown wraps to 2 rows in the 360px card, the 3D cluster overlaps the card.

## Phase 3 — Desktop compact typography, lg+ (done, WAITING FOR USER PICK: C vs C-2)
- Switch: `DESKTOP_WORDMARK = 'one-line' | 'stacked'` at the top of `Hero.jsx` (currently 'one-line' = agreed Option C). 'stacked' = fallback C-2.
- Left column is `container-type: inline-size` at lg; wordmark/h1 sized with `min(Ncqw, Mvh)`.
  - C: wordmark `min(10.2cqw,14vh)` single line (IDEA SPRINT + outlined 2026, spark hidden at lg, items-end so baselines match); 76px at 1440x800.
  - C-2: stacked wordmark `min(9rem,15vh)` (120px at 1440x800), spark kept.
  - Both: h1 two lines (flex line-break element, same words/4 h1-word spans) `min(7.1cqw,7.4vh)` (53px at 1440x800), no wrap, `max-w-none`.
- Left-column height / available height (viewport minus 64px nav): C 0.42–0.65 (all <= 0.70, pass). C-2 0.70–0.89 (over target on short screens; Phase 5 short-desktop rules would trim it).
- Left column width is 744px at >=1366 (1152 container - 360 card - 48 gap), 488px at 1024.
- Mobile/tablet re-verified pixel-identical (FREEZE diff vs Phase 1).
- Screenshots to compare: `phase3-compare-C-vs-C2-*.png` (C left, C-2 right).

## Phase 3 decision + Phase 4 — Event card, countdown, cluster (done)
- User picked **C-2** (stacked wordmark): `DESKTOP_WORDMARK = 'stacked'`. The one-line variant remains behind the switch.
- User asked for the countdown on ONE line: at lg the countdown row is `flex-nowrap gap-1.5`, digits `2.85rem`, unit `min-w-[3.4rem]`, divider `1.75rem` (Countdown.jsx, lg-only classes; mobile sizes untouched).
- Right column widened to `24rem`; event wrapper is a card at lg: cream surface, 2px near-black border, `--radius-sm`, `p-6` (no new shadows/gradients).
- 3D cluster: `lg:opacity-40`, hidden under new `short-desktop` variant (lg+ and <=720px tall; defined in index.css) via `short-desktop:!hidden`.
- Removed the decorative Ring that collided with the headline at lg (the `hidden lg:block` near-layer fragment).
- Countdown states verified with `?now=` (needs `%2B` for the plus sign): before / live / after all fit the card at 1440x800 and 1024x700; one Explore visible per breakpoint; Register label still driven by `ctaLabel(status)`.
- Desktop fit (date / countdown / Register bottoms all <= innerHeight-16): PASS at 1920x937, 1536x730, 1440x800, 1366x650, 1280x600, 1024x700. Hero height = viewport height at every desktop size. No horizontal scroll.
- Mobile/tablet: pixel-identical to Phase 1 (FREEZE diff).
- Remaining: Phase 5 (ultrawide/tall checks, formal assertion script, short-desktop type trims if needed), Phase 6 (a11y, contrast over cluster, reduced motion, QA-CHECKLIST, final report).

## Phase 5 — Fit-to-screen tuning and short-screen safety (done)
- Assertion script (`scratch-tests/assert.mjs`, needs vite on :5173; paths inside assume the scratch layout, adjust `createRequire` path): date, countdown, Register and Explore bottoms <= innerHeight-16, no horizontal scroll, hero height <= viewport. **ALL PASS** on 1920x937, 1536x730, 1440x800, 1366x650, 1280x600, 1024x700, plus 2560x1080 and 1920x1200.
- `lg:min-h` unchanged (section keeps `min-h-[100svh]`); hero is exactly viewport height at every desktop size, so no dead space or clipping.
- Fix: content block is now `lg:mx-auto` (it was left-anchored, leaving a hole before the cluster on wide screens). At <=1280 the layout is unchanged.
- Short-desktop rule: the `short-desktop` variant (cluster hidden) is in place; no extra type trims were needed since 1280x600 and 1366x650 already pass with Explore visible.
- Mobile/tablet still pixel-identical to Phase 1.
- Helper scripts are saved in `scratch-tests/` (not part of the app build).

## Phase 6 — Regression, accessibility, docs, final report (done)
- Mobile/tablet: pixel-identical to Phase 1 (which only added the date line + short-phone trims + meta row losing the date). Differences vs baseline are therefore exactly the allowed ones.
- Keyboard: Tab from the headline goes Explore -> Register (document order); 3px focus ring visible on both; Enter on Register scrolls to `#registration`.
- Screen reader: date reads as one sentence ("20 to 21 November 2026, 5:00 PM to 5:00 PM"), visual lines are aria-hidden; no `aria-live` in the Hero (countdown unchanged).
- Contrast: date line 2 (70% near-black on cream) 6.11:1; line 1 15.11:1; the card has an opaque cream surface, so nothing sits over the 3D cluster.
- Motion: with motion on, every Hero element ends at opacity 1 (entrance unchanged, no new animation); reduced motion shows everything static.
- `npm run build` passes (only the pre-existing three.js chunk-size warning).
- `doc/QA-CHECKLIST.md` updated with the hero fit / date / one-Explore lines.

## Follow-up fixes (after Phase 6)
- Hero: removed `lg:mx-auto` again so the content block is left-anchored (64px from the left edge) like the original design; wordmark -> Explore sits to the left. Desktop fit assertions are unaffected (vertical only).
- Timeline mobile day toggle: the toggle now lives in its own full-bleed band (`.day-toggle-wrap`, < lg and JS only) whose background follows the active day (near-black for Day 1, cream for Day 2), so it always matches the timeline panel below. On Day 2 the buttons use cream-surface variants (`outline` + `primary` with an orange offset block). Desktop is unchanged (band is display:none at lg).
