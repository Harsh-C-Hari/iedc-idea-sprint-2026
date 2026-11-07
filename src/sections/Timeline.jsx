/**
 * Timeline.jsx — section 4 with reveals and per-item rail segments.
 *
 * Phase 3A:
 *   • Dots sit exactly on the rail centre line and are vertically centered
 *     on the time row (measured tolerance <= 1px).
 *   • Footnote left edge aligns with the section container/heading left edge.
 *   • Rail ends cleanly at the last dot of each day.
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import schedule from '../data/schedule.js'
import { gsap } from '../motion/gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** Single timeline item with connected rail segment */
function TimelineItem({ item, side, day, isLast }) {
  const isDay1 = day === 1

  return (
    <li
      data-timeline-item
      className={`relative flex items-start pl-10 lg:pl-0 ${isLast ? 'pb-0' : 'pb-12 lg:pb-16'}`}
    >
      {/* ── Rail segment (only rendered if not the last item) ── */}
      {!isLast && (
        <span
          data-rail-segment
          aria-hidden="true"
          className={`
            absolute left-3 lg:left-1/2 top-[calc(clamp(2rem,4vw,3rem)/2)] w-px h-full -translate-x-1/2 z-0
            ${isDay1 ? 'bg-[var(--color-lime)] opacity-30' : 'bg-[var(--color-near-black)] opacity-20'}
          `}
        />
      )}

      {/* ── Node marker slot (vertically aligned with the time row) ── */}
      <div
        className="absolute left-3 lg:left-1/2 top-0 -translate-x-1/2 z-10
                   h-[clamp(2rem,4vw,3rem)] flex items-center justify-center pointer-events-none"
      >
        <div
          data-timeline-dot
          aria-hidden="true"
          className={`
            rounded-full border-2 transition-transform duration-300
            ${isLast ? 'w-5 h-5' : 'w-4 h-4'}
            ${isLast && isDay1 ? 'ring-4 ring-[#D9F36A]/20' : ''}
            ${isLast && !isDay1 ? 'ring-4 ring-[#F05A28]/20' : ''}
          `}
          style={{
            backgroundColor: isDay1 ? 'var(--color-lime)' : 'var(--color-orange)',
            borderColor:      isDay1 ? 'var(--color-lime)' : 'var(--color-orange)',
          }}
        />
      </div>

      {/* ── Desktop Left slot (only populated when side === 'left') ── */}
      <div
        className={`
          hidden lg:block w-1/2 pr-12
          ${side === 'left' ? 'text-right' : 'pointer-events-none select-none'}
        `}
      >
        {side === 'left' && (
          <div className="flex flex-col items-end">
            <time
              dateTime={item.time}
              data-timeline-time
              className={`
                font-[family-name:var(--font-display)]
                text-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)]
                flex items-center justify-end leading-none tracking-[-0.025em]
                mb-1
                ${isDay1 ? 'text-[var(--color-lime)]' : 'text-[var(--color-near-black)]'}
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
        )}
      </div>

      {/* ── Right slot (mobile shows content here; desktop shows when side === 'right') ── */}
      <div
        className={`
          flex-1 lg:w-1/2 lg:flex-none
          ${side === 'right' ? 'lg:pl-12 lg:text-left' : 'lg:hidden'}
        `}
      >
        <div className="flex flex-col items-start">
          <time
            dateTime={item.time}
            data-timeline-time
            className={`
              font-[family-name:var(--font-display)]
              text-[clamp(2rem,4vw,3rem)] h-[clamp(2rem,4vw,3rem)]
              flex items-center justify-start leading-none tracking-[-0.025em]
              mb-1
              ${isDay1 ? 'text-[var(--color-lime)]' : 'text-[var(--color-near-black)]'}
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
      </div>
    </li>
  )
}

/** One day panel with its own motion scope */
function DayPanel({ day }) {
  const isDay1 = day.day === 1
  const panelRef = useRef(null)

  useGSAP(() => {
    if (REDUCED) return
    const panel = panelRef.current
    if (!panel) return

    // 1. Day heading reveal (clip)
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

    // 2. Timeline items — slide + fade
    const items = panel.querySelectorAll('[data-timeline-item]')
    items.forEach((item, i) => {
      gsap.set(item, { opacity: 0, y: 20 })
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        delay: i * 0.06,
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
      })
    })

    // 3. Rail segment reveals — scaleY scrub
    const segments = panel.querySelectorAll('[data-rail-segment]')
    segments.forEach((seg) => {
      gsap.set(seg, { scaleY: 0, transformOrigin: 'top center' })
      gsap.to(seg, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: seg,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 0.8,
        },
      })
    })
  }, { scope: panelRef, dependencies: [] })

  return (
    <div
      ref={panelRef}
      className={`
        px-5 md:px-8 lg:px-16 ${isDay1 ? 'py-20 lg:py-28' : 'pt-20 lg:pt-28 pb-14 lg:pb-20'}
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
          <ol
            aria-label={`Day ${day.day} schedule`}
            className="list-none p-0 m-0 flex flex-col"
          >
            {day.items.map((item, i) => (
              <TimelineItem
                key={item.time + item.title}
                item={item}
                side={i % 2 === 0 ? 'left' : 'right'}
                day={day.day}
                isLast={i === day.items.length - 1}
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

      {/* Subtle divider line between Timeline and Challenge */}
      <div className="bg-[var(--color-cream)] px-5 md:px-8 lg:px-16" aria-hidden="true">
        <div className="max-w-6xl mx-auto border-t border-[var(--color-near-black)]/10" />
      </div>
    </SectionShell>
  )
}
