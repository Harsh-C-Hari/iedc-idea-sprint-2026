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

/** Convenience re-exports */
export { gsap, ScrollTrigger }
export default gsap
