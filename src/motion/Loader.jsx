/**
 * Loader.jsx — GSAP sequence for the CSS-shell loader (plan section B, T17/follow-up #3).
 *
 * Sequence (total ≤ 1.0 s — T22 optimised for LCP):
 *   0.00 s — IEDC BOOTCAMP CEC already visible via CSS animation
 *   0.00 s — GSAP cancels CSS animations, takes over
 *   0.00 s — brand label fades to 0.5 opacity
 *   0.20 s — bar draws left-to-right
 *   0.35 s — brand label fades out, IDEA SPRINT 2026 clips in from bottom
 *   0.60 s — Spark SVG scales + fades in
 *   0.75 s — entire inner wrapper clips upward out of view
 *   0.95 s — shell removed from DOM, 'loader:done' event dispatched (hero entrance begins)
 *
 * Fail-safes:
 *   • CSS shell has independent 1.1 s hide — works with no JS at all.
 *   • If GSAP errors, removeShell() is called in catch (shell removed).
 *   • prefers-reduced-motion — CSS hides shell immediately; Loader dispatches 'loader:done' at once.
 *   • pointer-events: none on #loader — hero always reachable underneath.
 *   • aria-hidden on #loader — screen readers skip it.
 */
import { useEffect } from 'react'
import { gsap } from './gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** Fade out, remove the loader shell, then fire 'loader:done' so Hero can start its entrance. */
function removeShell() {
  const el = document.getElementById('loader')
  if (!el) {
    window.dispatchEvent(new CustomEvent('loader:done'))
    return
  }
  el.style.transition = 'opacity 0.12s ease'
  el.style.opacity = '0'
  el.style.pointerEvents = 'none'
  setTimeout(() => {
    el?.remove()
    window.dispatchEvent(new CustomEvent('loader:done'))
  }, 150)
}

export default function Loader() {
  useEffect(() => {
    // Reduced-motion: CSS hides shell immediately; fire event so Hero starts right away.
    if (REDUCED) {
      window.dispatchEvent(new CustomEvent('loader:done'))
      return
    }

    const shell  = document.getElementById('loader')
    const inner  = document.getElementById('loader-inner')
    const brand  = document.getElementById('loader-brand')
    const bar    = document.getElementById('loader-bar')
    const title  = document.getElementById('loader-title')
    const spark  = document.getElementById('loader-spark')

    if (!shell || !inner) {
      // Shell missing — fire event immediately
      removeShell()
      return
    }

    let tl

    try {
      // ── Kill the pure-CSS animations so GSAP owns these elements ──────────
      ;[brand, bar, title, spark].filter(Boolean).forEach(el => {
        el.style.animation = 'none'
      })
      shell.style.animation = 'none'

      // ── Set initial states ─────────────────────────────────────────────────
      if (brand)  gsap.set(brand,  { opacity: 0, y: 4 })
      if (bar)    gsap.set(bar,    { scaleX: 0, transformOrigin: 'left center' })
      if (title)  gsap.set(title,  { clipPath: 'inset(0 0 100% 0)', y: 3 })
      if (spark)  gsap.set(spark,  { opacity: 0, scale: 0.4, transformOrigin: 'center center' })

      // ── Build timeline (target total ≤ 1.0 s before removeShell) ──────────
      tl = gsap.timeline({ onComplete: removeShell })

      // 0.00 — IEDC BOOTCAMP CEC fades in
      if (brand) {
        tl.to(brand, { opacity: 0.5, y: 0, duration: 0.22, ease: 'power3.out' }, 0)
      }

      // 0.20 — bar draws
      if (bar) {
        tl.to(bar, { scaleX: 1, duration: 0.28, ease: 'power3.out' }, 0.20)
      }

      // 0.35 — brand fades out as title clips in
      if (brand) {
        tl.to(brand, { opacity: 0, y: -3, duration: 0.16, ease: 'power2.in' }, 0.35)
      }
      if (title) {
        tl.to(title, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.26, ease: 'power3.out' }, 0.38)
      }

      // 0.60 — Spark assembles
      if (spark) {
        tl.to(spark, { opacity: 0.85, scale: 1, duration: 0.20, ease: 'back.out(1.6)' }, 0.60)
      }

      // 0.75 — clip the whole inner panel upward
      tl.to(inner, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.18,
        ease: 'power4.in',
      }, 0.75)

    } catch (err) {
      // Any GSAP error — remove shell so the site isn't blocked
      console.warn('[Loader] GSAP error, removing shell', err)
      removeShell()
    }

    return () => {
      // HMR / Strict-mode unmount — kill timeline, remove shell
      tl?.kill()
      removeShell()
    }
  }, [])

  // No DOM output — drives the CSS shell imperatively via GSAP.
  return null
}
