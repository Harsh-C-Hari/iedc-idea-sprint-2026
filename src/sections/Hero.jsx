/**
 * Hero.jsx — section 1 with GSAP entrance.
 *
 * Phase 3A Polish:
 *   • Min-height 100svh, padding-top = navbar height (4rem) + 1.5rem (5.5rem).
 *   • Desktop (>=1024px): Two-column layout.
 *     - Left: Single h1 ("IDEA SPRINT 2026" with spark), tagline ("24 HOURS. ONE IDEA. ENDLESS POSSIBILITIES."),
 *       supporting copy, countdown, CTAs, and metadata row.
 *     - Right: Composed cluster of geometric shapes & Spark (CSS float keyframes, no cursor movement, no new WebGL).
 *   • Sized with clamp() so all content + CTAs fit cleanly above the fold on
 *     1440x900, 1280x720, 1920x1080 and 390x844.
 *   • Single h1, clip-reveal only. Never revealed from opacity: 0.
 *   • Respects prefers-reduced-motion.
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import Button from '../components/ui/Button.jsx'
import Countdown from '../components/ui/Countdown.jsx'
import Spark from '../components/art/Spark.jsx'
import { Cube, Ring, Disc, Sphere } from '../components/art/Fragments.jsx'
import eventConfig from '../config/eventConfig.js'
import { heroSupporting, heroMeta } from '../data/content.js'
import { gsap } from '../motion/gsap.js'

function ctaLabel(status) {
  if (status === 'open' || status === 'preview') return 'Register Now'
  if (status === 'opening-soon') return 'Opening Soon'
  return 'Registration Closed'
}
function ctaDisabled(status) {
  return status === 'closed'
}

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export default function Hero() {
  const status = eventConfig.registration.status
  const outerRef = useRef(null)
  const layerFarRef = useRef(null)

  // ── Entrance timeline ─────────────────────────────────────────────────────
  // Waits for 'loader:done' so h1 is LCP-eligible during loader phase.
  useGSAP(() => {
    const el = outerRef.current
    if (!el || REDUCED) return

    function runEntrance() {
      const sparkEl = el.querySelector('[data-hero="spark"]')
      const h1Words = el.querySelectorAll('[data-hero="h1-word"]')
      const taglineEl = el.querySelector('[data-hero="tagline"]')
      const supportEl = el.querySelector('[data-hero="support"]')
      const countdownEl = el.querySelector('[data-hero="countdown"]')
      const ctaEl = el.querySelector('[data-hero="cta"]')
      const metaEl = el.querySelector('[data-hero="meta"]')
      const fragEls = el.querySelectorAll('[data-hero="frag"]')

      // Set hidden start states only after loader exits (keeps h1 LCP-eligible)
      // h1Words use clip-path only — never opacity:0 (plan constraint)
      gsap.set(sparkEl, { opacity: 0, scale: 0.5, transformOrigin: 'center center' })
      gsap.set(h1Words, { clipPath: 'inset(0 0 100% 0)', y: 6 })
      gsap.set([taglineEl, supportEl, countdownEl, ctaEl, metaEl], { opacity: 0, y: 12 })
      gsap.set(fragEls, { opacity: 0, scale: 0.6, transformOrigin: 'center center' })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(sparkEl, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' }, 0.05)
      tl.to(h1Words, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.35, stagger: 0.055 }, 0.08)
      tl.to(fragEls, { opacity: 1, scale: 1, duration: 0.45, stagger: 0.05, ease: 'back.out(1.3)' }, 0.28)
      tl.to([taglineEl, supportEl, countdownEl, ctaEl, metaEl],
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 }, 0.36)
    }

    if (!document.getElementById('loader')) {
      runEntrance()
    } else {
      window.addEventListener('loader:done', runEntrance, { once: true })
    }

    return () => window.removeEventListener('loader:done', runEntrance)
  }, { scope: outerRef, dependencies: [] })

  // ── Scroll-scrubbed far-layer shift (decorative background fragments only) ──
  useGSAP(() => {
    if (REDUCED) return
    const el = outerRef.current
    const far = layerFarRef.current
    if (!el || !far) return

    gsap.to(far, {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, { scope: outerRef, dependencies: [] })

  return (
    <div ref={outerRef}>
      <SectionShell
        id="hero"
        labelId="hero-heading"
        theme="light"
        className="relative min-h-[100svh] flex flex-col justify-center
                   pt-[calc(4rem+1.5rem)] pb-8 px-5 md:px-8 lg:px-16 overflow-hidden"
      >
        {/* ════ BACKGROUND LAYER — decorative ambient float ════ */}
        <div
          aria-hidden="true"
          ref={layerFarRef}
          className="pointer-events-none select-none absolute inset-0 overflow-hidden"
        >
          {/* Subtle Ring top-left */}
          <div
            data-hero="frag"
            className="absolute"
            style={{ top: '6%', left: '2%', animation: 'heroFloat1 9s ease-in-out infinite' }}
          >
            <Ring size={120} color="#F05A28" opacity={0.10} />
          </div>
          {/* Subtle Disc mid-left */}
          <div
            data-hero="frag"
            className="absolute"
            style={{ top: '45%', left: '-1%', animation: 'heroFloat2 11s ease-in-out infinite' }}
          >
            <Disc size={80} color="#D9F36A" opacity={0.12} />
          </div>
          {/* Subtle Cube bottom-left */}
          <div
            data-hero="frag"
            className="absolute hidden sm:block"
            style={{ bottom: '8%', left: '8%', animation: 'heroFloat3 8s ease-in-out infinite' }}
          >
            <Cube size={42} color="#F05A28" opacity={0.15} />
          </div>
        </div>

        {/* ════ MAIN TWO-COLUMN CONTENT GRID ════ */}
        <div className="relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 lg:gap-12 items-center flex-1 my-auto">

          {/* ── Left Column: Headline, Tagline, Copy, Countdown, CTAs, Meta ── */}
          <div className="lg:col-span-7 flex flex-col justify-center">

            {/* Visual Headline (Single h1) */}
            <h1
              id="hero-heading"
              tabIndex={-1}
              className="font-[family-name:var(--font-display)]
                         leading-[0.92] tracking-[-0.035em]
                         text-[var(--color-near-black)]
                         focus:outline-none"
              style={{ fontSize: 'clamp(2.5rem, 5.8vw, 5.25rem)' }}
            >
              <span className="block overflow-hidden">
                <span data-hero="h1-word" className="inline-flex items-center gap-2 sm:gap-3.5">
                  IDEA SPRINT
                  <span aria-hidden="true" data-hero="spark" className="inline-block transform -translate-y-1">
                    <Spark size={40} color="orange" className="hidden sm:inline-block" />
                    <Spark size={28} color="orange" className="sm:hidden inline-block" />
                  </span>
                </span>
              </span>
              <span className="block overflow-hidden">
                <span
                  data-hero="h1-word"
                  className="block text-[var(--color-near-black)] opacity-85"
                >
                  2026
                </span>
              </span>
            </h1>

            {/* Tagline — smaller real text */}
            <p
              data-hero="tagline"
              className="font-[family-name:var(--font-display)]
                         text-[clamp(0.85rem,1.6vw,1.15rem)] tracking-tight uppercase
                         text-[var(--color-near-black)] opacity-85 mt-2 lg:mt-3"
            >
              24 Hours. One Idea. Endless Possibilities.
            </p>

            {/* Supporting Copy */}
            <p
              data-hero="support"
              className="font-[family-name:var(--font-body)]
                         text-[clamp(0.875rem,1.3vw,1rem)] leading-relaxed
                         text-[var(--color-near-black)] opacity-70
                         max-w-[44ch] mt-2 sm:mt-3"
            >
              {heroSupporting}
            </p>

            {/* Countdown */}
            <div data-hero="countdown" className="mt-4 sm:mt-5">
              <Countdown />
            </div>

            {/* Action CTAs */}
            <div data-hero="cta" className="mt-5 sm:mt-6 flex flex-row gap-3">
              <Button
                as="a"
                href="#registration"
                variant="primary"
                size="lg"
                disabled={ctaDisabled(status)}
                aria-disabled={ctaDisabled(status)}
                className="w-auto"
              >
                {ctaLabel(status)}
              </Button>
              <Button
                as="a"
                href="#about"
                variant="outline"
                size="lg"
                className="w-auto"
              >
                Explore
              </Button>
            </div>

            {/* Event Metadata Row */}
            <ul
              data-hero="meta"
              aria-label="Event details"
              className="mt-4 sm:mt-5 flex flex-wrap gap-x-5 gap-y-1.5 list-none p-0 m-0"
            >
              {heroMeta.map((item) => (
                <li
                  key={item}
                  className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                             text-[var(--color-near-black)] opacity-60"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right Column: Composed Geometric Cluster (Desktop only) ── */}
          <div
            aria-hidden="true"
            className="hidden lg:flex lg:col-span-5 items-center justify-center relative w-full pointer-events-none select-none"
          >
            <div className="relative w-full max-w-[360px] aspect-square flex items-center justify-center">
              {/* Central primary Spark */}
              <div
                data-hero="frag"
                className="relative z-10"
                style={{ animation: 'heroFloat1 8s ease-in-out infinite' }}
              >
                <Spark size={110} color="orange" />
              </div>

              {/* Orbiting large Ring */}
              <div
                data-hero="frag"
                className="absolute inset-0 flex items-center justify-center"
                style={{ animation: 'heroFloat2 10s ease-in-out infinite', animationDelay: '0.4s' }}
              >
                <Ring size={230} color="#F05A28" opacity={0.16} />
              </div>

              {/* Cube upper-left */}
              <div
                data-hero="frag"
                className="absolute top-2 left-4"
                style={{ animation: 'heroFloat3 7s ease-in-out infinite', animationDelay: '0.8s' }}
              >
                <Cube size={54} color="#D9F36A" opacity={0.35} />
              </div>

              {/* Sphere upper-right */}
              <div
                data-hero="frag"
                className="absolute top-6 right-4"
                style={{ animation: 'heroFloat1 9s ease-in-out infinite', animationDelay: '1.2s' }}
              >
                <Sphere size={44} color="#F05A28" opacity={0.25} uid="hero-right-sphere" />
              </div>

              {/* Disc lower-right */}
              <div
                data-hero="frag"
                className="absolute bottom-4 right-6"
                style={{ animation: 'heroFloat2 8s ease-in-out infinite', animationDelay: '1.6s' }}
              >
                <Disc size={52} color="#D9F36A" opacity={0.22} />
              </div>

              {/* Small ring lower-left */}
              <div
                data-hero="frag"
                className="absolute bottom-6 left-6"
                style={{ animation: 'heroFloat3 11s ease-in-out infinite', animationDelay: '2.0s' }}
              >
                <Ring size={64} color="#171717" opacity={0.15} />
              </div>
            </div>
          </div>

        </div>
      </SectionShell>
    </div>
  )
}
