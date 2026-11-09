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
import { Fragment, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import Button from '../components/ui/Button.jsx'
import Countdown from '../components/ui/Countdown.jsx'
import EventDate from '../components/ui/EventDate.jsx'
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

/**
 * Desktop (lg+) wordmark treatment — the agreed Option C vs. its fallback C-2.
 *   'one-line' : IDEA SPRINT 2026 on a single line, sized by column width (cqw) with a height cap.
 *   'stacked'  : IDEA / SPRINT / 2026 stacked, sized by viewport height.
 * Both keep the three data-hero="wm-line" spans for the GSAP reveal.
 */
const DESKTOP_WORDMARK = 'stacked' // 'one-line' | 'stacked'
const ONE_LINE = DESKTOP_WORDMARK === 'one-line'

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
      const sparkEl = el.querySelectorAll('[data-hero="spark"]')
      const h1Words = el.querySelectorAll('[data-hero="h1-word"]')
      const supportEl = el.querySelector('[data-hero="support"]')
      const countdownEl = el.querySelector('[data-hero="countdown"]')
      const ctaEl = el.querySelector('[data-hero="cta"]')
      const metaEl = el.querySelector('[data-hero="meta"]')
      const fragEls = el.querySelectorAll('[data-hero="frag"]')

      // Set hidden start states only after loader exits (keeps h1 LCP-eligible)
      // h1Words use clip-path only — never opacity:0 (plan constraint)
      const wmLines = el.querySelectorAll('[data-hero="wm-line"]')
      gsap.set(wmLines, { clipPath: 'inset(0 0 100% 0)', y: 10 })
      gsap.set(sparkEl, { opacity: 0, scale: 0.5, transformOrigin: 'center center' })
      gsap.set(h1Words, { clipPath: 'inset(0 0 100% 0)', y: 6 })
      gsap.set([supportEl, countdownEl, ctaEl, metaEl], { opacity: 0, y: 12 })
      gsap.set(fragEls, { opacity: 0, scale: 0.6, transformOrigin: 'center center' })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(wmLines, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.45, stagger: 0.08 }, 0)
      tl.to(sparkEl, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' }, 0.05)
      tl.to(h1Words, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.35, stagger: 0.055 }, 0.08)
      tl.to(fragEls, { opacity: 1, scale: 1, duration: 0.45, stagger: 0.05, ease: 'back.out(1.3)' }, 0.28)
      tl.to([supportEl, countdownEl, ctaEl, metaEl],
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 }, 0.36)
    }

    if (window.__loaderDone || !document.getElementById('loader')) {
      runEntrance()
    } else {
      window.addEventListener('loader:done', runEntrance, { once: true })
    }

    return () => window.removeEventListener('loader:done', runEntrance)
  }, { scope: outerRef, dependencies: [] })

  // ── Pause ambient float while hero is off-screen ──────────────────────────
  useGSAP(() => {
    const el = outerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => {
      el.classList.toggle('hero-paused', !e.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
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
                   pt-[calc(4rem+1.5rem)] max-lg:pt-[calc(4rem+1rem)] pb-8 max-lg:pb-5 px-5 md:px-8 lg:px-16 overflow-hidden"
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
            className="absolute lg:!right-auto lg:!left-[22%]"
            style={{ top: '7%', right: '-14%', animation: 'heroSpin 40s linear infinite' }}
          >
            <Ring size={300} color="#F05A28" opacity={0.16} />
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

          {/* Floating 3D Geometric Cluster (Right side background, desktop) */}
          <div
            aria-hidden="true"
            className="hidden min-[1800px]:flex short-desktop:!hidden items-center justify-center absolute right-[2%] xl:right-[6%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 lg:opacity-40"
          >
            <div className="relative w-[340px] xl:w-[400px] aspect-square flex items-center justify-center">
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

        {/* ════ CONTENT — static (no cursor parallax, no transform) ════ */}
        <div className="relative z-10 max-w-6xl w-full my-auto max-lg:flex max-lg:flex-col
                        lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-x-12 lg:items-center">
          {/* Left column (lg+): wordmark, headline, supporting copy, Explore link. Plain block below lg. */}
          <div data-hero-col="left" className="max-lg:contents lg:col-start-1 lg:row-start-1 lg:[container-type:inline-size]">
          {/* Wordmark "IDEA SPRINT 2026" — solid orange-deep display type, 2026 outlined */}
          <div className="relative mb-2 lg:mb-0 max-lg:order-1">
            <span
              aria-hidden="true"
              data-hero="spark"
              className="lg:hidden absolute pointer-events-none z-10 rotate-[12deg]"
              style={{ right: '4%', top: '2%' }}
            >
              <Spark size={104} color="ink" className="hidden min-[420px]:block" />
              <Spark size={84} color="ink" className="min-[420px]:hidden" />
            </span>
            <h1
              id="hero-heading"
              tabIndex={-1}
              data-hero="wordmark"
              className={`relative font-[family-name:var(--font-display)]
                         leading-[0.88] tracking-[-0.04em]
                         select-none pointer-events-none focus:outline-none
                         [font-size:clamp(2.8rem,min(22.5vw,15svh),11rem)]
                         ${ONE_LINE
                           ? 'lg:flex lg:items-end lg:whitespace-nowrap lg:gap-x-[0.2em] lg:leading-[0.95] lg:[font-size:min(10.2cqw,14vh)]'
                           : 'lg:[font-size:min(9rem,15vh)]'}`}
            >
              <span className="sr-only">Idea Sprint 2026</span>
              <span aria-hidden="true" className="block overflow-hidden">
                <span data-hero="wm-line" className="block text-[var(--color-orange-deep)]">IDEA</span>
              </span>
              <span aria-hidden="true" className="block">
               <span className={`relative inline-block ${ONE_LINE ? 'lg:block' : ''}`}>
                <span className="block overflow-hidden">
                  <span data-hero="wm-line" className="block text-[var(--color-orange-deep)]">SPRINT</span>
                </span>
                {/* Spark anchored to the end of SPRINT (desktop) */}
                <span
                  aria-hidden="true"
                  data-hero="spark"
                  className={`absolute hidden lg:block ${ONE_LINE ? 'lg:hidden' : ''}`}
                  style={{ left: '100%', top: '0', width: 'max-content', transform: 'translate(-30%,-55%)' }}
                >
                  <div className="rotate-[12deg]"><Spark size={100} color="ink" /></div>
                </span>
               </span>
              </span>
              <span
                aria-hidden="true"
                className={`block overflow-hidden lg:mt-[0.12em] lg:[font-size:0.42em] max-lg:absolute max-lg:right-0 max-lg:bottom-0 max-lg:translate-y-[42%] max-lg:p-1 max-lg:[font-size:0.34em] ${ONE_LINE ? 'lg:[font-size:1em]' : ''}`}
                style={{ letterSpacing: '0.01em' }}
              >
                <span
                  data-hero="wm-line"
                  className="inline-block bg-[var(--color-near-black)] text-[var(--color-lime)] px-[0.3em] pt-[0.06em] pb-[0.02em] -rotate-[2deg] leading-[1.05]"
                >
                  2026
                </span>
              </span>
            </h1>
          </div>

          {/* tagline — dominant, clip-reveal only. NEVER from opacity:0. */}
          <p
            data-hero="tagline"
            className="font-[family-name:var(--font-display)]
                       leading-[1.12] lg:leading-[1.0] tracking-[-0.025em]
                       text-[var(--color-near-black)]
                       mt-7 max-lg:order-2
                       max-lg:flex max-lg:flex-wrap max-lg:gap-x-[0.3em]
                       [font-size:clamp(1.15rem,4.6vw,5.25rem)]
                       lg:mt-5 lg:flex lg:flex-wrap lg:gap-x-[0.3em] lg:whitespace-nowrap
                       lg:[font-size:min(5.3cqw,5.4vh)]"
          >
            {['24 HOURS.', 'ONE IDEA.', 'ENDLESS', 'POSSIBILITIES.'].map((word, i) => (
              <Fragment key={word}>
                <span className="block overflow-hidden">
                  <span data-hero="h1-word" className="block">{word}</span>
                </span>
                {/* Desktop only: flex line break so the headline reads as two lines (same words). */}
                {i === 1 && <span aria-hidden="true" className="block basis-full h-0" />}
              </Fragment>
            ))}
          </p>

          {/* Decorative near-layer fragments (overlapping type) — static, no parallax */}
          <div aria-hidden="true" className="pointer-events-none select-none">
            <div data-hero="frag" className="absolute hidden sm:block"
              style={{ top: '72%', left: 'clamp(10rem, 28vw, 24rem)' }}>
              <Disc size={22} color="#D9F36A" opacity={0.30} />
            </div>
          </div>

          {/* Supporting copy */}
          <p
            data-hero="support"
            className="font-[family-name:var(--font-body)] text-[1rem] md:text-[1.125rem]
                       leading-relaxed text-[var(--color-near-black)] opacity-70
                       max-w-[48ch] mt-6 max-lg:order-4 lg:mt-4 lg:text-base"
          >
            {heroSupporting}
          </p>

          {/* Explore — desktop text link (tablet keeps the outline button, phones the arrow link) */}
          <a
            href="#about"
            className="hidden lg:inline-flex mt-5 min-h-[44px] items-center font-[family-name:var(--font-body)] text-sm font-semibold
                       uppercase tracking-wide underline underline-offset-4
                       text-[var(--color-near-black)] focus-visible:outline-[var(--color-near-black)]"
          >
            Explore ↓
          </a>
          </div>

          {/* Event card — date, countdown and CTA read as one unit (when → how long → act) */}
          <div data-hero="event" className="mt-4 max-lg:order-3 lg:mt-0 lg:col-start-2 lg:row-start-1
                     lg:relative lg:bg-[var(--color-near-black)] lg:border-2 lg:border-[var(--color-near-black)] lg:rounded-[var(--radius-sm)] lg:p-6
                     lg:shadow-[6px_6px_0_0_var(--color-orange)] lg:[--focus-ring:var(--color-lime)]">
          <EventDate onDarkAtLg />

          {/* Countdown */}
          <div data-hero="countdown" className="mt-4 lg:mt-6">
            <Countdown onDarkAtLg />
          </div>

          {/* CTAs */}
          <div data-hero="cta" className="mt-4 lg:mt-8 flex flex-col sm:flex-row lg:flex-col gap-4">
            <Button
              as="a"
              href="#registration"
              variant="primary"
              size="lg"
              disabled={ctaDisabled(status)}
              aria-disabled={ctaDisabled(status)}
              className="w-full sm:w-auto max-lg:!min-h-[52px] max-lg:!py-3 lg:w-full lg:text-[var(--color-near-black)] lg:[--b-face:var(--color-orange)]
                         lg:hover:[--b-face:var(--color-orange-hover)] lg:[--b-color:var(--color-lime)]"
            >
              {ctaLabel(status)}
            </Button>
            {/* Wrapper owns visibility: Button's base `display` would beat `hidden` on the Button itself. */}
            <div className="hidden sm:block lg:hidden">
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
          </div>
          </div>

          {/* Metadata row */}
          <ul
            data-hero="meta"
            aria-label="Event details"
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 list-none p-0 m-0 max-lg:order-5 lg:hidden"
          >
            {heroMeta.map((item) => (
              <li
                key={item}
                className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                           text-[var(--color-near-black)] opacity-70"
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
