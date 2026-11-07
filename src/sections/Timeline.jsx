/**
 * Timeline.jsx — section 4 with reveals and per-item rail segments (T15 / Phase 1.6 fix 4).
 *
 * Data from data/schedule.js — 7 items Day 1, 4 items Day 2 (11 total).
 *
 * Layout:
 *   Day 1 — near-black panel, lime markers, oversized Archivo Black time labels
 *   Day 2 — cream panel, orange node fills, near-black text
 *   Desktop: central rail with ring nodes, items alternating sides
 *   Mobile: left rail, items to the right
 *   Rail segments connect node centre to next node centre; last item has no segment.
 *
 * Motion:
 *   • Each rail segment scales Y from top to bottom as user scrolls (transform-only)
 *   • Items slide+fade in as they enter viewport
 *   • Time markers scale 0.9→1 and gain accent colour
 *   • Day headings reveal (clip)
 *   • Reduced motion: content visible, no animations
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
      className="relative flex items-start pl-10 lg:pl-0 pb-12 lg:pb-16"
    >
      {/* ── Rail segment (only rendered if not the last item) ── */}
      {!isLast && (
        <span
          data-rail-segment
          aria-hidden="true"
          className={`
            absolute left-3 lg:left-1/2 top-2.5 w-px h-full -translate-x-1/2 z-0
            ${isDay1 ? 'bg-[var(--color-lime)] opacity-30' : 'bg-[var(--color-near-black)] opacity-20'}
          `}
        />
      )}

      {/* ── Node marker ── */}
      <div
        aria-hidden="true"
        className={`
          absolute left-3 lg:left-1/2 top-2.5 -translate-x-1/2 z-10
          rounded-full border-2 transition-transform duration-300
          ${isLast ? 'w-5 h-5 -translate-y-0.5' : 'w-4 h-4'}
          ${isLast && isDay1 ? 'ring-4 ring-[#D9F36A]/20' : ''}
          ${isLast && !isDay1 ? 'ring-4 ring-[#F05A28]/20' : ''}
        `}
        style={{
          backgroundColor: isDay1 ? 'var(--color-lime)' : 'var(--color-orange)',
          borderColor:      isDay1 ? 'var(--color-lime)' : 'var(--color-orange)',
        }}
      />

      {/* ── Desktop Left slot (only populated when side === 'left') ── */}
      <div
        className={`
          hidden lg:block w-1/2 pr-12
          ${side === 'left' ? 'text-right' : 'pointer-events-none select-none'}
        `}
      >
        {side === 'left' && (
          <div>
            <time
              dateTime={item.time}
              data-timeline-time
              className={`
                font-[family-name:var(--font-display)]
                text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.025em]
                block mb-1
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
        <time
          dateTime={item.time}
          data-timeline-time
          className={`
            font-[family-name:var(--font-display)]
            text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.025em]
            block mb-1
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
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
        },
        delay: (i % 3) * 0.05,
      })
    })

    // 3. Rail segments scaleY (top to bottom scrub)
    const segments = panel.querySelectorAll('[data-rail-segment]')
    segments.forEach((seg) => {
      gsap.set(seg, { scaleY: 0, transformOrigin: 'top center' })
      gsap.to(seg, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: seg,
          start: 'top 82%',
          end: 'bottom 68%',
          scrub: 0.3,
        },
      })
    })

    // 4. Time markers scale + pop
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

      {/* Subject to change note */}
      <div className="bg-[var(--color-cream)] px-5 md:px-8 lg:px-16 py-6">
        <p
          className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)]
                     opacity-65 italic max-w-4xl mx-auto"
        >
          Schedule subject to change — times will be confirmed by organizers.
        </p>
      </div>
    </SectionShell>
  )
}
