/**
 * SectionWipe.jsx — geometric wipe at cream/dark section boundaries (T16).
 *
 * A thin band positioned at the boundary between two sections.
 * Its clip-path is scrubbed by ScrollTrigger as the band scrolls into view.
 * Uses transform and clip-path only — never blocks scrolling (no pinning).
 *
 * Props:
 *   id       {string}  — unique id (for ScrollTrigger)
 *   fromColor {string} — CSS colour of the outgoing section (default cream)
 *   toColor   {string} — CSS colour of the incoming section
 *   accentColor {string} — optional accent strip colour
 *
 * Three boundaries used in App.jsx (plan section B):
 *   1. Hero → About         (cream → cream, dark manifesto follows)  — accent: orange
 *   2. About → IdeaSpark    (cream → dark)                           — accent: lime
 *   3. Challenge → Registration (cream → dark)                       — accent: orange
 *
 * On mobile: simple single-colour band (no geometric detail).
 * On desktop: multi-layered diagonal clip with accent stripe.
 * Reduced motion: wipe is hidden; boundary is a plain colour change.
 * Content always visible if GSAP never runs (wipe is purely decorative).
 */
import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from './gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export default function SectionWipe({
  id,
  fromColor = 'var(--color-cream)',
  toColor   = 'var(--color-near-black)',
  accentColor = 'var(--color-orange)',
}) {
  const wipeRef   = useRef(null)
  const accentRef = useRef(null)

  useEffect(() => {
    if (REDUCED) return
    const band   = wipeRef.current
    const accent = accentRef.current
    if (!band) return

    // Start clipped (hidden from right), reveal as it scrolls into view
    gsap.set(band, { clipPath: 'inset(0 100% 0 0)' })
    if (accent) gsap.set(accent, { clipPath: 'inset(0 100% 0 0)', scaleX: 0 })

    ScrollTrigger.create({
      trigger: band,
      start: 'top 90%',
      end: 'top 40%',
      scrub: 0.6,
      id: `wipe-${id}`,
      onUpdate: (self) => {
        const p = self.progress
        const pct = (1 - p) * 100
        gsap.set(band, { clipPath: `inset(0 ${pct}% 0 0)` })
        if (accent) {
          gsap.set(accent, {
            clipPath: `inset(0 ${Math.max(0, pct - 20)}% 0 0)`,
          })
        }
      },
    })
  }, [id])

  if (REDUCED) {
    // Under reduced motion, just render a plain border line
    return (
      <div
        style={{ height: '2px', backgroundColor: accentColor, opacity: 0.2 }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden pointer-events-none select-none"
      style={{ height: 'clamp(32px, 4vw, 64px)' }}
    >
      {/* Base band — the outgoing colour sweeping across */}
      <div
        ref={wipeRef}
        className="absolute inset-0"
        style={{ backgroundColor: fromColor }}
      />

      {/* Accent stripe (desktop: diagonal offset; mobile: same as band) */}
      <div
        ref={accentRef}
        className="absolute inset-0 hidden sm:block"
        style={{
          backgroundColor: accentColor,
          opacity: 0.6,
          clipPath: 'polygon(0 0, 92% 0, 100% 100%, 0 100%)',
        }}
      />

      {/* Background (toColor shows through wherever the band hasn't covered) */}
      <div
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: toColor }}
      />
    </div>
  )
}
