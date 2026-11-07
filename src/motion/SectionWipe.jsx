/**
 * SectionWipe.jsx — geometric wipe at cream/dark section boundaries (Phase 2.3 rebuild).
 *
 * Uses useGSAP for strict-mode safety and automatic cleanup.
 * Animates clipPath directly via gsap.fromTo with ScrollTrigger scrub.
 * Taller band (~96-160px fluid) with a distinct diagonal accent stripe.
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from './gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export default function SectionWipe({
  id,
  fromColor   = 'var(--color-cream)',
  toColor     = 'var(--color-near-black)',
  accentColor = 'var(--color-orange)',
}) {
  const containerRef = useRef(null)
  const bandRef      = useRef(null)
  const accentRef    = useRef(null)

  useGSAP(() => {
    if (REDUCED) return
    const container = containerRef.current
    const band      = bandRef.current
    const accent    = accentRef.current
    if (!container || !band) return

    // Animate band clip from right to left smoothly via GSAP fromTo
    gsap.fromTo(
      band,
      { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
      {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 95%',
          end: 'bottom 40%',
          scrub: 0.5,
        },
      }
    )

    if (accent) {
      gsap.fromTo(
        accent,
        { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
        {
          clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)',
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top 90%',
            end: 'bottom 35%',
            scrub: 0.6,
          },
        }
      )
    }
  }, { scope: containerRef, dependencies: [id] })

  if (REDUCED) {
    return (
      <div
        style={{ height: '3px', backgroundColor: accentColor, opacity: 0.3 }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative overflow-hidden pointer-events-none select-none w-full"
      style={{ height: 'clamp(96px, 10vw, 160px)' }}
    >
      {/* Background: toColor fills behind */}
      <div
        className="absolute inset-0 -z-10"
        style={{ backgroundColor: toColor }}
      />

      {/* Accent stripe with angled edge */}
      <div
        ref={accentRef}
        className="absolute inset-0"
        style={{
          backgroundColor: accentColor,
          opacity: 0.85,
        }}
      />

      {/* Foreground band: fromColor sweeping across */}
      <div
        ref={bandRef}
        className="absolute inset-0"
        style={{ backgroundColor: fromColor }}
      />
    </div>
  )
}
