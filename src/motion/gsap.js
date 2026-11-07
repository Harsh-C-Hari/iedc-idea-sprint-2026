/**
 * motion/gsap.js — single registration point for GSAP and ScrollTrigger.
 *
 * Import this module (side-effect import) before any other GSAP usage.
 * It registers ScrollTrigger once, so double-registration on re-import is safe.
 *
 * Also exports `mm` — the gsap.matchMedia() context, with two conditions:
 *   - reduced: prefers-reduced-motion:reduce  → no timelines, final states only
 *   - desktop: min-width 1024px + hover:hover  → enables cursor parallax
 *
 * ScrollTrigger.refresh() is called after document.fonts.ready so reveals
 * fire at the correct scroll position (plan section B, animation architecture).
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register once — safe to import this module multiple times
gsap.registerPlugin(ScrollTrigger)

// ignoreMobileResize prevents spurious refreshes on iOS when the URL bar hides
ScrollTrigger.config({ ignoreMobileResize: true })

// Refresh after fonts are ready so clamp() sizes are final
if (typeof document !== 'undefined') {
  document.fonts.ready.then(() => {
    ScrollTrigger.refresh()
  })
}

/** Shared matchMedia context — add conditions per section */
export const mm = gsap.matchMedia()

/** Shared motion design tokens (Phase 2.7) */
export const motionTokens = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.6,
    enter: 0.8,
  },
  ease: {
    outExpo: 'power4.out',
    outBack: 'back.out(1.4)',
    inOut: 'power2.inOut',
    linear: 'none',
  },
}

/** Check if reduced motion is preferred dynamically */
export function isReducedMotion() {
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

/** Convenience re-exports */
export { gsap, ScrollTrigger }
export default gsap
