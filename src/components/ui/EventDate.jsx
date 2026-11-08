/**
 * EventDate.jsx — the event date + time window, derived from eventConfig.
 *
 * Nothing is hard-coded: the text is built from startISO / endISO in the
 * event's own timezone, so it is right on any device timezone.
 *
 *   Line 1 (display):  20–21 NOV 2026        (same month)
 *                      20 NOV – 2 DEC 2026   (different months)
 *   Line 2 (body):     5:00 PM to 5:00 PM · 24 hours
 *
 * Screen readers get one sentence (sr-only); the visual lines are aria-hidden
 * so the date is not read twice. Each date/time is a <time dateTime>.
 */
import eventConfig from '../../config/eventConfig.js'

const tz = eventConfig.timezone

function fmt(iso, opts) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts })
    .format(new Date(iso))
    .replace(/\u202f/g, ' ') // newer ICU uses a narrow no-break space before AM/PM
}

function ymd(iso) {
  return {
    d: fmt(iso, { day: 'numeric' }),
    mShort: fmt(iso, { month: 'short' }).toUpperCase(),
    mLong: fmt(iso, { month: 'long' }),
    y: fmt(iso, { year: 'numeric' }),
  }
}

function durationLabel(startISO, endISO) {
  const mins = Math.round((new Date(endISO) - new Date(startISO)) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h && !m) return `${h} ${h === 1 ? 'hour' : 'hours'}`
  if (!h) return `${m} min`
  return `${h} h ${m} min`
}

export function getEventDateParts(startISO = eventConfig.startISO, endISO = eventConfig.endISO) {
  const s = ymd(startISO)
  const e = ymd(endISO)
  const sameMonth = s.mShort === e.mShort && s.y === e.y
  const sameYear = s.y === e.y

  let startText
  if (sameMonth) startText = s.d
  else if (sameYear) startText = `${s.d} ${s.mShort}`
  else startText = `${s.d} ${s.mShort} ${s.y}`
  const endText = `${e.d} ${e.mShort} ${e.y}`
  const joiner = sameMonth ? '–' : ' – '

  const t1 = fmt(startISO, { hour: 'numeric', minute: '2-digit', hour12: true })
  const t2 = fmt(endISO, { hour: 'numeric', minute: '2-digit', hour12: true })

  const spoken =
    (sameMonth
      ? `${s.d} to ${e.d} ${e.mLong} ${e.y}`
      : `${s.d} ${s.mLong}${sameYear ? '' : ` ${s.y}`} to ${e.d} ${e.mLong} ${e.y}`) +
    `, ${t1} to ${t2}`

  return { startText, endText, joiner, t1, t2, spoken, duration: durationLabel(startISO, endISO) }
}

export default function EventDate({ className = '' }) {
  const { startText, endText, joiner, t1, t2, spoken, duration } = getEventDateParts()
  return (
    <div data-event-date className={className}>
      <p className="sr-only">{spoken}</p>
      <div aria-hidden="true">
        <p
          className="font-[family-name:var(--font-display)] text-[1.75rem] sm:text-[2rem]
                     leading-none tracking-[-0.02em] text-[var(--color-near-black)]"
        >
          <time dateTime={eventConfig.startISO}>{startText}</time>
          {joiner}
          <time dateTime={eventConfig.endISO}>{endText}</time>
        </p>
        <p
          className="font-[family-name:var(--font-body)] text-sm leading-snug
                     text-[var(--color-near-black)] opacity-70 mt-2"
        >
          <time dateTime={eventConfig.startISO}>{t1}</time> to{' '}
          <time dateTime={eventConfig.endISO}>{t2}</time> · {duration}
        </p>
      </div>
    </div>
  )
}
