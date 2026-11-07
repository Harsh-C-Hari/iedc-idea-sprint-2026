/**
 * Loader.jsx — GSAP overlay layer for the CSS-shell loader (plan section B, T17).
 *
 * The CSS shell in index.html is already visible on first paint and hides
 * itself via a pure-CSS animation at 2 s max.  This component takes over
 * early: it plays a branded GSAP timeline (≤ 1.6 s), then removes the shell
 * DOM node so the hero entrance can begin cleanly.
 *
 * Rules:
 *  • If GSAP fails or component never mounts, the CSS shell's 2 s timer
 *    guarantees the site stays reachable.
 *  • prefers-reduced-motion: CSS already hides the shell; we return null.
 *  • Runs once on mount — no sessionStorage needed (plain page-load overlay).
 */
import { useEffect } from 'react'
import { gsap } from './gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** Remove the loader shell and all inline styles so there's no DOM residue. */
function removeShell() {
  const el = document.getElementById('loader')
  if (!el) return
  el.style.transition = 'opacity 0.25s ease'
  el.style.opacity = '0'
  el.style.pointerEvents = 'none'
  setTimeout(() => {
    el.remove()
  }, 300)
}

export default function Loader() {
  useEffect(() => {
    // Skip if reduced-motion — CSS already hides the shell
    if (REDUCED) return

    const shell = document.getElementById('loader')
    if (!shell) return

    const wordmark = document.getElementById('loader-wordmark')
    const bar = document.getElementById('loader-bar')
    const sub = document.getElementById('loader-sub')

    // The CSS animations have already started the entrance; we layer a brief
    // GSAP hold then exit.  Total duration target: ≤ 1.6 s.
    const tl = gsap.timeline({
      onComplete: removeShell,
    })

    // Brief pause to let CSS entrance settle (~0.9 s), then exit
    tl.to(
      [wordmark, bar, sub].filter(Boolean),
      {
        opacity: 0,
        y: -10,
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.in',
      },
      0.9,              // start exit at 0.9 s
    )

    return () => {
      // If component unmounts early (HMR / strict mode), kill the timeline
      // and remove the shell so the site isn't blocked.
      tl.kill()
      removeShell()
    }
  }, [])

  // This component has no rendered output — it only drives the shell via
  // imperative GSAP.  Returning null is intentional.
  return null
}
