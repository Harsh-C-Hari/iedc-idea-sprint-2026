/**
 * Hero.jsx — section 1 with GSAP entrance (T14).
 *
 * Layout (plan section D):
 *   • h1: "24 HOURS. ONE IDEA. ENDLESS POSSIBILITIES." — dominant, highest contrast
 *     Words revealed with clipPath + translateY — NEVER from opacity:0 (plan T13/T14).
 *   • "IDEA SPRINT 2026" — oversized visible wordmark (p), tonal outlined.
 *     Spark sits at the IDEA/SPRINT visual transition.
 *   • Fragments in two layers (behind type and crossing boundaries)
 *   • Supporting copy, Countdown, two CTAs, metadata row
 *   • Mobile: 4 fragments, full-width CTA, wordmark stacks, no parallax
 *
 * Motion (plan section D, T14):
 *   • Entrance ≤ 1.2 s: wordmark fade, h1 words clip-reveal staggered,
 *     fragments scale in, then copy/countdown/CTA fade up
 *   • Ambient float: CSS keyframe animations on 3 fragments (transform only)
 *   • Desktop-only cursor parallax: 3 layers via gsap.quickTo (~12 px max)
 *   • Light scroll-scrubbed artwork shift (y only)
 *   • Fail-safe: content visible by default; GSAP sets hidden states itself
 *   • Reduced motion: durations 0, start states skipped
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
import { gsap, ScrollTrigger } from '../motion/gsap.js'

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

  // Outer ref for useGSAP scope and scroll trigger
  const outerRef = useRef(null)
  // Refs for 3-layer cursor parallax
  const layerFarRef = useRef(null)
  const layerMidRef = useRef(null)
  const layerNearRef = useRef(null)

  // ── Entrance timeline ───────────────────────────────────────────────────
  useGSAP(() => {
    const el = outerRef.current
    if (!el) return

    const wordmark = el.querySelector('[data-hero="wordmark"]')
    const sparkEl = el.querySelector('[data-hero="spark"]')
    const h1Words = el.querySelectorAll('[data-hero="h1-word"]')
    const supportEl = el.querySelector('[data-hero="support"]')
    const countdownEl = el.querySelector('[data-hero="countdown"]')
    const ctaEl = el.querySelector('[data-hero="cta"]')
    const metaEl = el.querySelector('[data-hero="meta"]')
    const fragEls = el.querySelectorAll('[data-hero="frag"]')

    if (REDUCED) {
      return // content already visible via CSS defaults
    }

    // Set hidden start states (GSAP applies these; content is visible if GSAP never runs)
    gsap.set(wordmark, { opacity: 0, y: -20 })
    gsap.set(sparkEl, { opacity: 0, scale: 0.4, transformOrigin: 'center center' })
    gsap.set(h1Words, { clipPath: 'inset(0 0 100% 0)', y: 8 })
    gsap.set([supportEl, countdownEl, ctaEl, metaEl], { opacity: 0, y: 16 })
    gsap.set(fragEls, { opacity: 0, scale: 0.5, transformOrigin: 'center center' })

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.to(wordmark, { opacity: 1, y: 0, duration: 0.4 }, 0)
    tl.to(sparkEl, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.1)
    tl.to(h1Words, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.5, stagger: 0.08 }, 0.2)
    tl.to(fragEls, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.06, ease: 'back.out(1.3)' }, 0.5)
    tl.to([supportEl, countdownEl, ctaEl, metaEl], { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.65)

  }, { scope: outerRef, dependencies: [] })

  // ── Desktop cursor parallax ─────────────────────────────────────────────
  useGSAP(() => {
    if (REDUCED) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (hover: hover)', () => {
      const far = layerFarRef.current
      const mid = layerMidRef.current
      const near = layerNearRef.current
      if (!far || !mid || !near) return

      const qFarX = gsap.quickTo(far, 'x', { duration: 0.9, ease: 'power1.out' })
      const qFarY = gsap.quickTo(far, 'y', { duration: 0.9, ease: 'power1.out' })
      const qMidX = gsap.quickTo(mid, 'x', { duration: 0.7, ease: 'power1.out' })
      const qMidY = gsap.quickTo(mid, 'y', { duration: 0.7, ease: 'power1.out' })
      const qNearX = gsap.quickTo(near, 'x', { duration: 0.5, ease: 'power1.out' })
      const qNearY = gsap.quickTo(near, 'y', { duration: 0.5, ease: 'power1.out' })

      function onMove(e) {
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const dx = (e.clientX - cx) / cx
        const dy = (e.clientY - cy) / cy
        qFarX(dx * 5); qFarY(dy * 5)
        qMidX(dx * 9); qMidY(dy * 9)
        qNearX(dx * 12); qNearY(dy * 12)
      }
      window.addEventListener('mousemove', onMove, { passive: true })
      return () => window.removeEventListener('mousemove', onMove)
    })
  }, { scope: outerRef, dependencies: [] })

  // ── Scroll-scrubbed artwork shift ────────────────────────────────────────
  useGSAP(() => {
    if (REDUCED) return
    const el = outerRef.current
    if (!el) return
    const far = layerFarRef.current
    if (!far) return

    // Scrub the background layer -40px over the full hero height (no pinning)
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
        className="relative min-h-[100dvh] flex flex-col justify-center
                   pt-16 pb-12 px-5 md:px-8 lg:px-16 overflow-hidden"
      >
        {/* ════ LAYER A — fragments behind all type ════ */}
        <div
          aria-hidden="true"
          ref={layerFarRef}
          className="pointer-events-none select-none absolute inset-0 overflow-hidden"
        >
          {/* Large ring — top right */}
          <div data-hero="frag" className="absolute"
            style={{ top: '-4%', right: '8%', animation: 'heroFloat1 7s ease-in-out infinite' }}>
            <Ring size={180} color="#f5a623" opacity={0.12} />
          </div>
          {/* Cube — upper left */}
          <div data-hero="frag" className="absolute"
            style={{ top: '8%', left: '4%', animation: 'heroFloat2 9s ease-in-out infinite', animationDelay: '1s' }}>
            <Cube size={64} color="#f5a623" opacity={0.18} />
          </div>
          {/* Large disc — mid left */}
          <div data-hero="frag" className="absolute"
            style={{ top: '32%', left: '-2%' }}>
            <Disc size={120} color="#c8f135" opacity={0.08} />
          </div>
          {/* Sphere — far right mid (desktop) */}
          <div data-hero="frag" className="absolute hidden lg:block"
            style={{ top: '45%', right: '3%', animation: 'heroFloat1 11s ease-in-out infinite', animationDelay: '2s' }}>
            <Sphere size={56} color="#f5a623" opacity={0.15} uid="hero-sphere-1" />
          </div>
          {/* Small cube — lower left (desktop) */}
          <div data-hero="frag" className="absolute hidden lg:block"
            style={{ bottom: '18%', left: '12%' }}>
            <Cube size={36} color="#c8f135" opacity={0.14} />
          </div>
          {/* Ring bottom right (desktop) */}
          <div data-hero="frag" className="absolute hidden lg:block"
            style={{ bottom: '10%', right: '18%', animation: 'heroFloat2 8s ease-in-out infinite', animationDelay: '3s' }}>
            <Ring size={88} color="#c8f135" opacity={0.10} />
          </div>
          {/* Tiny disc — right side (desktop) */}
          <div data-hero="frag" className="absolute hidden lg:block"
            style={{ top: '22%', right: '28%' }}>
            <Disc size={28} color="#f5a623" opacity={0.20} />
          </div>
          {/* Extra sphere bottom (desktop) */}
          <div data-hero="frag" className="absolute hidden lg:block"
            style={{ bottom: '24%', left: '42%' }}>
            <Sphere size={42} color="#c8f135" opacity={0.10} uid="hero-sphere-2" />
          </div>
          {/* Cube right edge (desktop) */}
          <div data-hero="frag" className="absolute hidden lg:block"
            style={{ top: '62%', right: '6%' }}>
            <Cube size={28} color="#f5f0e8" opacity={0.25} />
          </div>
        </div>

        {/* ════ COMPOSITION (parallax mid layer) ════ */}
        <div
          ref={layerMidRef}
          className="relative z-10 max-w-6xl w-full"
        >
          {/* Wordmark "IDEA SPRINT 2026" */}
          <div className="relative mb-2 lg:mb-0">
            <p
              aria-label="IDEA SPRINT 2026"
              data-hero="wordmark"
              className="font-[family-name:var(--font-display)]
                         leading-[0.88] tracking-[-0.04em]
                         select-none pointer-events-none"
              style={{
                fontSize: 'clamp(2.8rem, 15vw, 11rem)',
                WebkitTextStroke: '1px rgba(15,13,10,0.35)',
                color: 'rgba(15,13,10,0.07)',
              }}
            >
              <span className="block">IDEA</span>
              <span className="block relative">
                SPRINT
                {/* Spark at IDEA/SPRINT transition */}
                <span
                  aria-hidden="true"
                  data-hero="spark"
                  className="absolute"
                  style={{
                    right: 'clamp(-2rem, -3vw, -4rem)',
                    top: '0',
                    transform: 'translateY(-35%)',
                  }}
                >
                  <Spark size={72} color="orange" className="hidden sm:block" />
                  <Spark size={48} color="orange" className="sm:hidden" />
                </span>
              </span>
              <span
                className="block"
                style={{ fontSize: '0.5em', letterSpacing: '-0.02em', opacity: 0.7 }}
              >
                2026
              </span>
            </p>
          </div>

          {/* h1 — dominant, clip-reveal only */}
          <h1
            id="hero-heading"
            className="font-[family-name:var(--font-display)]
                       leading-[1.0] tracking-[-0.025em]
                       text-[var(--color-near-black)]
                       max-w-[18ch] mt-6 lg:mt-10"
            style={{ fontSize: 'clamp(1.65rem, 6.2vw, 5.25rem)' }}
          >
            {['24 HOURS.', 'ONE IDEA.', 'ENDLESS', 'POSSIBILITIES.'].map((word) => (
              <span key={word} className="block overflow-hidden">
                <span data-hero="h1-word" className="block">{word}</span>
              </span>
            ))}
          </h1>

          {/* LAYER B — fragments crossing letter boundaries (parallax near) */}
          <div aria-hidden="true" ref={layerNearRef} className="pointer-events-none select-none">
            <div data-hero="frag" className="absolute hidden lg:block"
              style={{ top: '54%', left: 'clamp(14rem, 32vw, 28rem)' }}>
              <Ring size={52} color="#f5a623" opacity={0.22} />
            </div>
            <div data-hero="frag" className="absolute hidden sm:block"
              style={{ top: '72%', left: 'clamp(10rem, 28vw, 24rem)' }}>
              <Disc size={22} color="#c8f135" opacity={0.30} />
            </div>
          </div>

          {/* Supporting copy */}
          <p
            data-hero="support"
            className="font-[family-name:var(--font-body)] text-[1rem] md:text-[1.125rem]
                       leading-relaxed text-[var(--color-near-black)] opacity-70
                       max-w-[48ch] mt-6"
          >
            {heroSupporting}
          </p>

          {/* Countdown */}
          <div data-hero="countdown" className="mt-8">
            <Countdown />
          </div>

          {/* CTAs */}
          <div data-hero="cta" className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              as="a"
              href="#registration"
              variant="primary"
              size="lg"
              disabled={ctaDisabled(status)}
              aria-disabled={ctaDisabled(status)}
              className="w-full sm:w-auto"
            >
              {ctaLabel(status)}
            </Button>
            <Button
              as="a"
              href="#about"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Explore
            </Button>
          </div>

          {/* Metadata row */}
          <ul
            data-hero="meta"
            aria-label="Event details"
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 list-none p-0 m-0"
          >
            {heroMeta.map((item) => (
              <li
                key={item}
                className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                           text-[var(--color-near-black)] opacity-50"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>
    </div>
  )
}
