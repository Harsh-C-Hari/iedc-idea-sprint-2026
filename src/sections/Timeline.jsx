/**
 * Timeline.jsx — section 4.
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
 * Shows "Schedule subject to change" note (plan section D).
 */
import SectionShell from '../components/ui/SectionShell.jsx'
import schedule from '../data/schedule.js'

/** Single timeline item */
function TimelineItem({ item, side, day }) {
  const isDay1 = day === 1

  return (
    <li
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

/** One day panel */
function DayPanel({ day }) {
  const isDay1 = day.day === 1

  return (
    <div
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
            className={`
              font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-50 block mb-2
            `}
          >
            Day {day.day} · {day.date}
          </span>
          <h3
            className="font-[family-name:var(--font-display)]
                       text-[clamp(1.75rem,4vw,3.5rem)] leading-tight tracking-[-0.025em]"
          >
            {day.label}
          </h3>
        </div>

        {/* Rail + items */}
        <div className="relative">
          {/* Vertical rail line */}
          <div
            aria-hidden="true"
            className={`
              absolute left-[0.4375rem] lg:left-1/2 top-0 bottom-0 w-px
              -translate-x-1/2 opacity-20
              ${isDay1 ? 'bg-[var(--color-lime)]' : 'bg-[var(--color-near-black)]'}
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
