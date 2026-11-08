/**
 * Countdown.jsx — three-state event countdown display.
 *
 * before → shows days, hours, minutes, seconds until event start
 * live   → shows "LIVE" + time remaining to event end
 * after  → shows "SPRINT COMPLETED"
 *
 * Plan section D (Hero):
 *   • Rendered as a <time> element (no per-second aria-live — plan section D)
 *   • tabular-nums to prevent layout shift on digit change
 */
import useCountdown from '../../hooks/useCountdown.js'
import { pad2 } from '../../lib/time.js'
import eventConfig from '../../config/eventConfig.js'

function Unit({ value, label, dark }) {
  const formatted = pad2(value)
  return (
    <div className={`flex flex-col items-center min-w-[3.5rem] lg:min-w-[3.4rem] overflow-hidden ${dark ? ' lg:justify-center lg:bg-[var(--color-cream)]/10 lg:border lg:border-[var(--color-cream)]/25 lg:rounded-[var(--radius-sm)] lg:py-2' : ''}`}>
      <span
        key={formatted}
        className={`tabular-nums font-[family-name:var(--font-display)]
                   text-[clamp(2rem,6vw,3.5rem)] ${dark ? 'lg:text-[2.75rem]' : 'lg:text-[2.85rem]'} leading-none text-[var(--color-near-black)]
                   inline-block animate-[digitRoll_0.25s_cubic-bezier(0.16,1,0.3,1)] ${dark ? ' lg:text-[var(--color-lime)]' : ''}`}
      >
        {formatted}
      </span>
      <span className={`font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-70 mt-1 ${dark ? ' lg:text-[var(--color-cream)]' : ''}`}>
        {label}
      </span>
    </div>
  )
}

function Divider({ dark }) {
  return (
    <span
      aria-hidden="true"
      className={`font-[family-name:var(--font-display)] text-[clamp(1.5rem,4vw,2.5rem)] lg:text-[1.75rem]
                 leading-none text-[var(--color-orange-deep)] pb-4 select-none ${dark ? ' lg:hidden' : ''}`}
    >
      :
    </span>
  )
}

export default function Countdown({ onDarkAtLg = false }) {
  const dark = onDarkAtLg
  const { phase, days, hours, minutes, seconds } = useCountdown()

  if (phase === 'after') {
    return (
      <div
        role="status"
        className={`font-[family-name:var(--font-display)] text-[clamp(1.25rem,4vw,2rem)]
                   tracking-widest text-[var(--color-near-black)] ${dark ? ' lg:text-[var(--color-cream)]' : ''}`}
      >
        SPRINT COMPLETED
      </div>
    )
  }

  if (phase === 'live') {
    return (
      <div role="status" className="flex flex-col gap-2">
        <span
          className="font-[family-name:var(--font-display)] text-[clamp(1rem,3vw,1.5rem)]
                     tracking-widest text-[var(--color-orange)]"
        >
          LIVE NOW
        </span>
        <div className={dark ? 'flex items-end gap-3 lg:grid lg:grid-cols-3 lg:gap-2' : 'flex items-end gap-3 lg:gap-1.5'}>
          <Unit value={hours} label="hrs" dark={dark} />
          <Divider dark={dark} />
          <Unit value={minutes} label="min" dark={dark} />
          <Divider dark={dark} />
          <Unit value={seconds} label="sec" dark={dark} />
        </div>
        <time
          dateTime={eventConfig.endISO}
          className="sr-only"
        >
          Event ends {eventConfig.endISO}
        </time>
      </div>
    )
  }

  // phase === 'before'
  return (
    <div role="timer" className="flex flex-col gap-2">
      <span
        className={`font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-70 ${dark ? ' lg:text-[var(--color-cream)]' : ''}`}
      >
        Starts in
      </span>
      <div className={dark ? 'flex items-end gap-3 flex-wrap lg:grid lg:grid-cols-4 lg:gap-2' : 'flex items-end gap-3 flex-wrap lg:flex-nowrap lg:gap-1.5'}>
        <Unit value={days} label="days" dark={dark} />
        <Divider dark={dark} />
        <Unit value={hours} label="hrs" dark={dark} />
        <Divider dark={dark} />
        <Unit value={minutes} label="min" dark={dark} />
        <Divider dark={dark} />
        <Unit value={seconds} label="sec" dark={dark} />
      </div>
      <time
        dateTime={eventConfig.startISO}
        className="sr-only"
      >
        Event starts {eventConfig.startISO}
      </time>
    </div>
  )
}
