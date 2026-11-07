/**
 * Loader.jsx — GSAP sequence for the CSS-shell loader (plan section B, T17/follow-up #3).
 *
 * Sequence (total ≤ 1.6 s):
 *   0.00 s — IEDC BOOTCAMP CEC already visible via CSS animation
 *   0.00 s — GSAP cancels CSS animations, takes over
 *   0.00 s — brand label fades to 0.5 opacity
 *   0.35 s — bar draws left-to-right
 *   0.60 s — brand label fades out, IDEA SPRINT 2026 clips in from bottom
 *   1.00 s — Spark SVG scales + fades in
 *   1.25 s — entire inner wrapper clips upward out of view
 *   1.55 s — shell removed from DOM (hero entrance begins)
 *
 * Fail-safes:
 *   • CSS shell has independent 2 s hide — works with no JS at all.
 *   • If GSAP errors, removeShell() is called in catch (shell removed).
 *   • prefers-reduced-motion — CSS hides shell; Loader returns null.
 *   • pointer-events: none on #loader — hero always reachable.
 *   • aria-hidden on #loader — screen readers skip it.
 */
import { useEffect } from 'react'
import { gsap } from './gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** Fade out then remove the entire loader shell from the DOM. */
function removeShell() {
  const el = document.getElementById('loader')
  if (!el) return
  el.style.transition = 'opacity 0.15s ease'
  el.style.opacity = '0'
  el.style.pointerEvents = 'none'
  setTimeout(() => { el?.remove() }, 200)
}

export default function Loader() {
  useEffect(() => {
    // Reduced-motion: CSS hides shell; nothing to do here.
    if (REDUCED) return

    const shell  = document.getElementById('loader')
    const inner  = document.getElementById('loader-inner')
    const brand  = document.getElementById('loader-brand')
    const bar    = document.getElementById('loader-bar')
    const title  = document.getElementById('loader-title')
    const spark  = document.getElementById('loader-spark')

    if (!shell || !inner) {
      // Shell missing — nothing to animate
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
      if (brand)  gsap.set(brand,  { opacity: 0, y: 6 })
      if (bar)    gsap.set(bar,    { scaleX: 0, transformOrigin: 'left center' })
      if (title)  gsap.set(title,  { clipPath: 'inset(0 0 100% 0)', y: 4 })
      if (spark)  gsap.set(spark,  { opacity: 0, scale: 0.4, transformOrigin: 'center center' })

      // ── Build timeline ─────────────────────────────────────────────────────
      tl = gsap.timeline({ onComplete: removeShell })

      // 0.00 — IEDC BOOTCAMP CEC fades in
      if (brand) {
        tl.to(brand, { opacity: 0.5, y: 0, duration: 0.35, ease: 'power3.out' }, 0)
      }

      // 0.35 — bar draws
      if (bar) {
        tl.to(bar, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, 0.35)
      }

      // 0.60 — brand fades out as title clips in
      if (brand) {
        tl.to(brand, { opacity: 0, y: -4, duration: 0.25, ease: 'power2.in' }, 0.60)
      }
      if (title) {
        tl.to(title, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.4, ease: 'power3.out' }, 0.65)
      }

      // 1.00 — Spark assembles
      if (spark) {
        tl.to(spark, { opacity: 0.85, scale: 1, duration: 0.3, ease: 'back.out(1.6)' }, 1.00)
      }

      // 1.25 — clip the whole inner panel upward
      tl.to(inner, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.28,
        ease: 'power4.in',
      }, 1.25)

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
