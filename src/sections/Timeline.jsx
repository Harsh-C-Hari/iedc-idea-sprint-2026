/**
 * Timeline.jsx — section 4 with reveals and rail scrub (T15).
 *
 * Data from data/schedule.js — 7 items Day 1, 4 items Day 2 (11 total).
 *
 * Layout (plan section D):
 *   Day 1 — near-black panel, lime markers, oversized Archivo Black time labels
 *   Day 2 — cream panel, orange node fills, near-black text
 *   Desktop: central rail with ring nodes, items alternating sides
 *   Mobile: single left rail
 *   Each day is an <ol> with <time> elements.
 *
 * Motion (plan section D, T15):
 *   • Rail scaleY scrubbed to scroll progress through each panel (no pinning)
 *   • Items slide+fade in as they enter viewport
 *   • Time markers scale 0.9→1 and gain accent colour
 *   • Day headings reveal (clip)
 *   • Reduced motion: no animation, content visible
 *   • No pinning anywhere
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import schedule from '../data/schedule.js'
import { gsap, ScrollTrigger } from '../motion/gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** Single timeline item */
function TimelineItem({ item, side, day }) {
  const isDay1 = day === 1

  return (
    <li
      data-timeline-item
      className={`
        relative flex items-start gap-4
        lg:items-center
        ${side === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'}
      `}
    >
      {/* Content block */}
      <div
        className={`
          flex-1 pb-8
          ${side === 'right' ? 'lg:text-right' : 'lg:text-left'}
        `}
      >
        <time
          dateTime={item.time}
          data-timeline-time
          className={`
            font-[family-name:var(--font-display)]
            text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.025em]
            block mb-1
            ${isDay1 ? 'text-[var(--color-lime)]' : 'text-[var(--color-orange)]'}
          `}
        >
          {item.time}
        </time>
        <p
          className={`
            font-[family-name:var(--font-body)] font-semibold text-sm uppercase tracking-wide
            ${isDay1 ? 'text-[var(--color-cream)]' : 'text-[var(--color-near-black)]'}
          `}
        >
          {item.title}
        </p>
      </div>

      {/* Rail node */}
      <div
        className="shrink-0 relative z-10 w-4 h-4 rounded-full border-2 mt-2 lg:mt-0"
        style={{
          backgroundColor: isDay1 ? 'var(--color-lime)' : 'var(--color-orange)',
          borderColor:      isDay1 ? 'var(--color-lime)' : 'var(--color-orange)',
        }}
        aria-hidden="true"
      />

      {/* Right-side spacer (desktop only, for alternating layout) */}
      <div className="hidden lg:block flex-1" aria-hidden="true" />
    </li>
  )
}

/** One day panel with its own motion scope */
function DayPanel({ day }) {
  const isDay1 = day.day === 1
  const panelRef = useRef(null)
  const railRef  = useRef(null)

  useGSAP(() => {
    if (REDUCED) return
    const panel = panelRef.current
    const rail  = railRef.current
    if (!panel || !rail) return

    // Rail scaleY scrubbed to scroll progress through panel (no pinning)
    gsap.set(rail, { scaleY: 0, transformOrigin: 'top center' })
    gsap.to(rail, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: panel,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: 0.5,
      },
    })

    // Day heading reveal (clip)
    const heading = panel.querySelector('[data-timeline-heading]')
    if (heading) {
      gsap.set(heading, { clipPath: 'inset(0 100% 0 0)' })
      gsap.to(heading, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power4.out',
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
      })
    }

    // Timeline items — slide + fade
    const items = panel.querySelectorAll('[data-timeline-item]')
    items.forEach((item, i) => {
      gsap.set(item, { opacity: 0, y: 20 })
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
        },
        delay: i * 0.05,
      })
    })

    // Time markers scale + colour pop
    const times = panel.querySelectorAll('[data-timeline-time]')
    times.forEach((time) => {
      gsap.set(time, { scale: 0.9, transformOrigin: 'left center' })
      gsap.to(time, {
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: time,
          start: 'top 88%',
          once: true,
        },
      })
    })
  }, { scope: panelRef, dependencies: [] })

  return (
    <div
      ref={panelRef}
      className={`
        px-5 md:px-8 lg:px-16 py-20 lg:py-28
        ${isDay1
          ? 'bg-[var(--color-near-black)] text-[var(--color-cream)]'
          : 'bg-[var(--color-cream)] text-[var(--color-near-black)]'}
      `}
    >
      <div className="max-w-4xl mx-auto">
        {/* Day header */}
        <div className="mb-12 lg:mb-16">
          <span
            className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-50 block mb-2"
          >
            Day {day.day} · {day.date}
          </span>
          <h3
            data-timeline-heading
            className="font-[family-name:var(--font-display)]
                       text-[clamp(1.75rem,4vw,3.5rem)] leading-tight tracking-[-0.025em]"
          >
            {day.label}
          </h3>
        </div>

        {/* Rail + items */}
        <div className="relative">
          {/* Vertical rail line — scrub target */}
          <div
            ref={railRef}
            aria-hidden="true"
            className={`
              absolute left-[0.4375rem] lg:left-1/2 top-0 bottom-0 w-px
              -translate-x-1/2
              ${isDay1 ? 'bg-[var(--color-lime)] opacity-30' : 'bg-[var(--color-near-black)] opacity-20'}
            `}
          />

          <ol
            aria-label={`Day ${day.day} schedule`}
            className="list-none p-0 m-0 pl-8 lg:pl-0 flex flex-col"
          >
            {day.items.map((item, i) => (
              <TimelineItem
                key={item.time + item.title}
                item={item}
                side={i % 2 === 0 ? 'left' : 'right'}
                day={day.day}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function Timeline() {
  return (
    <SectionShell
      id="timeline"
      labelId="timeline-heading"
      theme="dark"
      className="p-0"
    >
      {/* Visually hidden heading for accessibility */}
      <h2 id="timeline-heading" className="sr-only">
        Event Timeline
      </h2>

      {schedule.map((day) => (
        <DayPanel key={day.day} day={day} />
      ))}

      {/* Subject to change note (plan section D) */}
      <div className="bg-[var(--color-cream)] px-5 md:px-8 lg:px-16 py-6">
        <p
          className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)]
                     opacity-40 italic max-w-4xl mx-auto"
        >
          Schedule subject to change — times will be confirmed by organizers.
        </p>
      </div>
    </SectionShell>
  )
}
