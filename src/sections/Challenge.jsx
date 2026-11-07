/**
 * Challenge.jsx — section 5 with reveals (T15).
 *
 * Layout (plan section D):
 *   • Two-line headline with supporting headline and copy
 *   • Four steps (01–04) in an offset 2×2 grid on desktop; stacked on mobile
 *   • Near-black fact strip: 24 HOURS, TEAM SIZE 1–4, ELIGIBILITY, ONE IDEA
 *     — values read from eventConfig so one edit updates both here and the form
 *
 * Motion (plan section D, T15):
 *   • Staggered step card reveals (fade + slide up)
 *   • Fact strip values clip-reveal
 *   • Headline clip reveal
 *   • Reduced motion safe. Content visible if GSAP fails.
 *   • No pinning.
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import { steps } from '../data/content.js'
import eventConfig from '../config/eventConfig.js'
import { gsap } from '../motion/gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** Single step card */
function StepCard({ step, offset }) {
  return (
    <div
      data-challenge-step
      className={`
        p-6 md:p-8 border border-[var(--color-near-black)] border-opacity-10
        rounded-[var(--radius-md)]
        ${offset ? 'lg:mt-12' : ''}
      `}
    >
      <span
        className="font-[family-name:var(--font-display)]
                   text-[clamp(3rem,5vw,4.5rem)] leading-none tracking-[-0.03em]
                   text-[var(--color-orange)] opacity-30 block mb-4 select-none"
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
  )
}

/** Fact strip — values from eventConfig (plan section D) */
function FactStrip() {
  const stripRef = useRef(null)

  const facts = [
    { value: '24 HOURS',                                        label: 'Duration' },
    { value: `TEAM SIZE ${eventConfig.team.min}–${eventConfig.team.max}`, label: 'Team' },
    { value: eventConfig.eligibility.toUpperCase(),             label: 'Eligibility' },
    { value: 'ONE IDEA',                                        label: 'Deliverable' },
  ]

  useGSAP(() => {
    if (REDUCED) return
    const items = stripRef.current?.querySelectorAll('[data-fact-item]')
    if (!items?.length) return
    items.forEach((item) => {
      gsap.set(item, { clipPath: 'inset(0 100% 0 0)' })
      gsap.to(item, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.7,
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
      className="bg-[var(--color-near-black)] mt-20 lg:mt-24
                 px-5 md:px-8 lg:px-16 py-12"
      aria-label="Event facts"
    >
      <ul
        className="list-none p-0 m-0 max-w-6xl mx-auto
                   grid grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {facts.map(({ value, label }) => (
          <li key={label} data-fact-item className="flex flex-col gap-1">
            <span
              className="font-[family-name:var(--font-display)]
                         text-[clamp(1rem,2.5vw,1.5rem)] leading-tight tracking-[-0.02em]
                         text-[var(--color-lime)]"
            >
              {value}
            </span>
            <span
              className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                         text-[var(--color-cream)] opacity-40"
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Challenge() {
  const outerRef = useRef(null)

  // Staggered step cards + headline reveal
  useGSAP(() => {
    if (REDUCED) return
    const el = outerRef.current
    if (!el) return

    // Headline clip reveal
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
        className="px-5 md:px-8 lg:px-16 pt-20 lg:pt-28 pb-0 overflow-hidden"
      >
        {/* Headline block */}
        <div className="max-w-6xl mx-auto mb-16 lg:mb-20">
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

        {/* Steps grid — 2×2 offset on desktop */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} offset={i === 1 || i === 3} />
            ))}
          </div>
        </div>

        {/* Fact strip */}
        <FactStrip />
      </SectionShell>
    </div>
  )
}
