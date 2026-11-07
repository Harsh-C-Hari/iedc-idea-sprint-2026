/**
 * Challenge.jsx — section 5 with reveals (T15) + travelling Spark (T18).
 *
 * Phase 3A:
 *   • Fact strip is full-bleed edge-to-edge near-black band with 4 equal columns (desktop),
 *     thin cream/10 dividers, 2x2 on mobile.
 *   • Step numbers 01–04 are solid near-black for AAA contrast (14.1:1).
 *   • 2x2 grid is even with matching card heights per row.
 *   • Travelling Spark is visible in orange, tracking card edges without obstructing text.
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import Spark from '../components/art/Spark.jsx'
import { steps } from '../data/content.js'
import eventConfig from '../config/eventConfig.js'
import { gsap } from '../motion/gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** Single step card */
function StepCard({ step }) {
  return (
    <div
      data-challenge-step
      className="p-6 md:p-8 border border-[var(--color-near-black)]/10
                 rounded-[var(--radius-md)] flex flex-col justify-between
                 bg-white/40 h-full"
    >
      <div>
        <span
          className="font-[family-name:var(--font-display)]
                     text-[clamp(2.5rem,4.5vw,4rem)] leading-none tracking-[-0.03em]
                     text-[var(--color-near-black)] block mb-4 select-none"
        >
          {step.number}
        </span>
        <h3
          className="font-[family-name:var(--font-display)]
                     text-[clamp(1.25rem,2.5vw,1.75rem)] leading-tight tracking-[-0.02em]
                     text-[var(--color-near-black)] mb-3"
        >
          {step.title}
        </h3>
        <p
          className="font-[family-name:var(--font-body)] text-sm leading-relaxed
                     text-[var(--color-near-black)] opacity-65 max-w-[32ch]"
        >
          {step.description}
        </p>
      </div>
    </div>
  )
}

/** Fact strip — full-bleed edge-to-edge band */
function FactStrip() {
  const stripRef = useRef(null)

  const facts = [
    { value: '24 HOURS',                                                  label: 'Duration' },
    { value: `TEAM SIZE ${eventConfig.team.min}–${eventConfig.team.max}`, label: 'Team' },
    { value: eventConfig.eligibility.toUpperCase(),                       label: 'Eligibility' },
    { value: 'ONE IDEA',                                                  label: 'Deliverable' },
  ]

  useGSAP(() => {
    if (REDUCED) return
    const items = stripRef.current?.querySelectorAll('[data-fact-item]')
    if (!items?.length) return
    items.forEach((item, i) => {
      gsap.set(item, { clipPath: 'inset(0 100% 0 0)' })
      gsap.to(item, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.65,
        delay: i * 0.09,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
        },
      })
    })
  }, { scope: stripRef, dependencies: [] })

  return (
    <div
      ref={stripRef}
      className="w-full bg-[var(--color-near-black)] text-[var(--color-cream)]
                 mt-20 lg:mt-28 py-12 px-5 md:px-8 lg:px-16 border-y border-[var(--color-cream)]/10"
      aria-label="Event facts"
    >
      <ul
        className="list-none p-0 m-0 max-w-6xl mx-auto
                   grid grid-cols-2 lg:grid-cols-4
                   divide-y divide-[var(--color-cream)]/10 sm:divide-y-0
                   sm:divide-x divide-[var(--color-cream)]/10"
      >
        {facts.map(({ value, label }, idx) => (
          <li
            key={label}
            data-fact-item
            className={`flex flex-col justify-center gap-1.5 py-4 sm:py-0
                       ${idx % 2 === 0 ? 'pr-4 sm:px-6' : 'pl-4 sm:px-6'}
                       lg:px-8 first:pl-0 last:pr-0`}
          >
            <span
              className="font-[family-name:var(--font-display)]
                         text-[clamp(1.125rem,2.2vw,1.65rem)] leading-tight tracking-[-0.02em]
                         text-[var(--color-lime)]"
            >
              {value}
            </span>
            <span
              className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                         text-[var(--color-cream)] opacity-65"
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * TravellingSpark (T18) — desktop only.
 * A small Spark scrubbed across the step grid as the user scrolls.
 * On mobile: rendered as a static decorative element at the top of the grid.
 */
function TravellingSpark({ gridRef }) {
  const sparkRef = useRef(null)

  useGSAP(() => {
    if (REDUCED) return
    const spark = sparkRef.current
    const grid = gridRef.current
    if (!spark || !grid) return

    // Desktop only via matchMedia
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px)', () => {
      const cards = grid.querySelectorAll('[data-challenge-step]')
      if (cards.length < 4) return

      // Sample positions: centre-top of each card relative to grid
      function getPos(card) {
        if (!grid || !card) return { x: 0, y: 0 }
        const gr = grid.getBoundingClientRect()
        const cr = card.getBoundingClientRect()
        return {
          x: cr.left - gr.left + cr.width / 2 - 24, // 24 = half spark size 48
          y: cr.top - gr.top - 52,                   // safely above the card
        }
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })

      // Dynamic function-based values re-evaluate on refresh/resize
      gsap.set(spark, {
        x: () => getPos(cards[0]).x,
        y: () => getPos(cards[0]).y,
        opacity: 1,
      })

      cards.forEach((card, idx) => {
        if (idx === 0) return
        tl.to(spark, {
          x: () => getPos(card).x,
          y: () => getPos(card).y,
          ease: 'power1.inOut',
          duration: 1,
        })
      })

      return () => {
        // cleanup matchMedia context
      }
    })
  }, { scope: sparkRef, dependencies: [] })

  return (
    <div
      ref={sparkRef}
      aria-hidden="true"
      className="pointer-events-none select-none
                 lg:absolute lg:z-10
                 flex justify-center mb-6 lg:mb-0
                 opacity-60 lg:opacity-75"
      style={{ top: 0, left: 0 }}
    >
      <Spark size={48} color="orange" />
    </div>
  )
}

export default function Challenge() {
  const outerRef = useRef(null)
  const gridRef = useRef(null)

  // Staggered step cards + headline reveal
  useGSAP(() => {
    const el = outerRef.current
    if (!el || REDUCED) return

    // Heading clip reveal
    const heading = el.querySelector('[data-challenge-heading]')
    if (heading) {
      gsap.set(heading, { clipPath: 'inset(0 100% 0 0)' })
      gsap.to(heading, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power4.out',
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
      })
    }

    // Step cards — staggered fade + slide
    const stepCards = el.querySelectorAll('[data-challenge-step]')
    stepCards.forEach((card, i) => {
      gsap.set(card, { opacity: 0, y: 32 })
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: i * 0.08,
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      })
    })
  }, { scope: outerRef, dependencies: [] })

  return (
    <div ref={outerRef}>
      <SectionShell
        id="challenge"
        labelId="challenge-heading"
        theme="light"
        className="px-0 pt-20 lg:pt-28 pb-0 overflow-hidden"
      >
        {/* Headline block */}
        <div className="max-w-6xl mx-auto px-5 md:px-8 lg:px-16 mb-16 lg:mb-20">
          <h2
            id="challenge-heading"
            data-challenge-heading
            className="font-[family-name:var(--font-display)]
                       text-[clamp(2rem,5vw,4.5rem)] leading-[1.0] tracking-[-0.025em]
                       text-[var(--color-near-black)] max-w-[16ch]"
          >
            WHAT DOES IT TAKE TO SPRINT?
          </h2>
          <p
            className="font-[family-name:var(--font-body)] text-[1rem] md:text-[1.125rem]
                       leading-relaxed text-[var(--color-near-black)] opacity-65
                       mt-6 max-w-[52ch]"
          >
            Twenty-four hours. Four stages. One idea that could actually matter.
            Here is how the sprint works.
          </p>
        </div>

        {/* Steps grid — 2×2 even heights on desktop */}
        <div className="max-w-6xl mx-auto px-5 md:px-8 lg:px-16 relative" ref={gridRef}>
          {/* Travelling Spark — decorative, desktop scrubbed */}
          <TravellingSpark gridRef={gridRef} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {steps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>
        </div>

        {/* Fact strip — full-bleed band */}
        <FactStrip />
      </SectionShell>
    </div>
  )
}
