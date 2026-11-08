/**
 * Timeline.jsx — section 4 with reveals and per-item rail segments.
 *
 * Phase 3A:
 *   • Dots sit exactly on the rail centre line and are vertically centered
 *     on the time row (measured tolerance <= 1px).
 *   • Footnote left edge aligns with the section container/heading left edge.
 *   • Rail ends cleanly at the last dot of each day.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import Button from '../components/ui/Button.jsx'
import schedule from '../data/schedule.js'
import eventConfig from '../config/eventConfig.js'
import { gsap, ScrollTrigger } from '../motion/gsap.js'
import { downloadICS } from '../lib/calendar.js'
import { parseISO } from '../lib/time.js'
import { buildSlots, getNowNext, getProgress } from '../lib/scheduleClock.js'
import useEventClock from '../hooks/useEventClock.js'

const START_MS = parseISO(eventConfig.startISO)
const END_MS = parseISO(eventConfig.endISO)

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false


/** "Now" / "Next" tag. Absolutely positioned beside the time so it never changes layout. */
function StatusBadge({ status, isDay1, side }) {
  if (!status) return null
  const isNow = status === 'now'
  const tone = isNow
    ? (isDay1 ? 'bg-[var(--color-lime)] text-[var(--color-near-black)] border-[var(--color-lime)]'
              : 'bg-[var(--color-orange)] text-[var(--color-near-black)] border-[var(--color-orange)]')
    : (isDay1 ? 'bg-transparent text-[var(--color-cream)] border-[var(--color-cream)]'
              : 'bg-transparent text-[var(--color-near-black)] border-[var(--color-near-black)]')
  return (
    <span
      data-timeline-status={status}
      className={`absolute top-1/2 -translate-y-1/2 ${side === 'left' ? 'right-full mr-3' : 'left-full ml-3'}
        border-2 rounded-[var(--radius-sm)] px-2 py-0.5 text-[0.7rem] leading-none font-semibold uppercase
        tracking-widest font-[family-name:var(--font-body)] whitespace-nowrap ${tone}`}
    >
      {isNow ? 'Now' : 'Next'}
    </span>
  )
}

/** Single timeline item with connected rail segment */
function TimelineItem({ item, side, day, isLast, status }) {
  const isDay1 = day === 1

  return (
    <li
      data-timeline-item
      aria-current={status === 'now' ? 'time' : undefined}
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
            transform: status === 'now' ? 'scale(1.4)' : undefined,
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
            <div className="relative">
            <StatusBadge status={status} isDay1={isDay1} side="left" />
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
            </div>
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
          <div className="relative">
          <StatusBadge status={status} isDay1={isDay1} side="right" />
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
          </div>
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
function DayPanel({ day, hiddenOnMobile, statusFor }) {
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
      data-day-panel={day.day}
      data-day-hidden={hiddenOnMobile ? 'true' : undefined}
      className={`
        px-5 md:px-8 lg:px-16 ${isDay1 ? 'pt-12 lg:pt-16 pb-20 lg:pb-28' : 'pt-20 lg:pt-28 pb-14 lg:pb-20'}
        ${isDay1
          ? 'bg-[var(--color-near-black)] text-[var(--color-cream)]'
          : 'bg-[var(--color-cream)] text-[var(--color-near-black)]'}
      `}
    >
      <div className="max-w-4xl mx-auto">
        {/* Day header */}
        <div className="mb-12 lg:mb-16">
          <span
            className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-70 block mb-2"
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
                status={statusFor(`${day.day}-${i}`)}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}


/** Header: live progress line, Add to calendar, and the mobile-only day toggle. */
function TimelineHeader({ progress, phase, nowPct, activeDay, onDay, liveDay }) {
  const caption =
    phase === 'live' ? `Live now · ${nowPct}% of the 24 hours` :
    phase === 'after' ? 'Event ended' : 'Starts 20 Nov · 5:00 PM IST'
  const onDay1 = activeDay === 1
  return (
    <>
    <div className="bg-[var(--color-near-black)] text-[var(--color-cream)] px-5 md:px-8 lg:px-16 pt-16 lg:pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-70 mb-2">
              Schedule · all times IST
            </p>
            <p className="font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wide min-h-[1.25rem]">
              {caption}
            </p>
          </div>
          <div className="pr-1 pb-1">
            <Button variant="outline-light" size="md" type="button" onClick={downloadICS}>
              Add to calendar
            </Button>
          </div>
        </div>

        {/* Thin progress line across the event window — scaleX only */}
        <div
          role="progressbar"
          aria-label="Event progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="mt-6 h-[3px] bg-[var(--color-cream)]/20 overflow-hidden"
        >
          <div
            data-timeline-progress
            className="timeline-progress h-full w-full origin-left bg-[var(--color-lime)]"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>
    </div>
    {/* Day toggle band (< lg, JS only): full-bleed, takes the active day's panel colour so the
        buttons sit on the same background as the timeline below them. */}
    <div
      className={`day-toggle-wrap px-5 md:px-8 pt-8 pb-1
        ${onDay1 ? 'bg-[var(--color-near-black)] text-[var(--color-cream)]'
                 : 'bg-[var(--color-cream)] text-[var(--color-near-black)]'}`}
    >
      <div className="max-w-4xl mx-auto">
        <div role="group" aria-label="Choose schedule day" className="day-toggle gap-5 pr-1 pb-1">
          {schedule.map((d) => {
            const on = activeDay === d.day
            const variant = onDay1 ? (on ? 'lime' : 'outline-light') : (on ? 'primary' : 'outline')
            return (
              <Button
                key={d.day}
                type="button"
                variant={variant}
                data-on={on ? 'true' : undefined}
                aria-pressed={on}
                onClick={() => onDay(d.day)}
                className={`flex-1 ${onDay1 ? '' : '[--b-color:var(--color-orange)]'}`}
              >
                Day {d.day}{liveDay === d.day ? ' · Live' : ''}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
    </>
  )
}

export default function Timeline() {
  const slots = useMemo(() => buildSlots(schedule), [])
  const now = useEventClock(END_MS)
  const [activeDay, setActiveDay] = useState(1)

  const phase = now < START_MS ? 'before' : now < END_MS ? 'live' : 'after'
  const progress = getProgress(now, START_MS, END_MS)
  const { nowKey, nextKey } = getNowNext(slots, now, START_MS, END_MS)
  const statusFor = (key) => (key === nowKey ? 'now' : key === nextKey ? 'next' : null)
  const liveDay = nowKey ? Number(nowKey.split('-')[0]) : null

  // A day that was display:none has no layout; re-measure scroll triggers when the toggle changes it.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return undefined }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [activeDay])

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

      <TimelineHeader
        progress={progress}
        phase={phase}
        nowPct={Math.floor(progress * 100)}
        activeDay={activeDay}
        onDay={setActiveDay}
        liveDay={liveDay}
      />

      {schedule.map((day) => (
        <DayPanel
          key={day.day}
          day={day}
          hiddenOnMobile={activeDay !== day.day}
          statusFor={statusFor}
        />
      ))}

      {/* Subtle divider line between Timeline and Challenge */}
      <div className="bg-[var(--color-cream)] px-5 md:px-8 lg:px-16" aria-hidden="true">
        <div className="max-w-6xl mx-auto border-t border-[var(--color-near-black)]/10" />
      </div>
    </SectionShell>
  )
}
