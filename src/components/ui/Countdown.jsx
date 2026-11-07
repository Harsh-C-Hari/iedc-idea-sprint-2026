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

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[3.5rem]">
      <span
        className="tabular-nums font-[family-name:var(--font-display)]
                   text-[clamp(2rem,6vw,3.5rem)] leading-none text-[var(--color-near-black)]"
      >
        {pad2(value)}
      </span>
      <span className="font-[family-name:var(--font-body)] text-[0.65rem] uppercase tracking-widest opacity-60 mt-1">
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,4vw,2.5rem)]
                 leading-none text-[var(--color-orange)] pb-4 select-none"
    >
      :
    </span>
  )
}

export default function Countdown() {
  const { phase, days, hours, minutes, seconds } = useCountdown()

  if (phase === 'after') {
    return (
      <div
        role="status"
        className="font-[family-name:var(--font-display)] text-[clamp(1.25rem,4vw,2rem)]
                   tracking-widest text-[var(--color-near-black)]"
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
        <div className="flex items-end gap-3">
          <Unit value={hours}   label="hrs" />
          <Divider />
          <Unit value={minutes} label="min" />
          <Divider />
          <Unit value={seconds} label="sec" />
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
        className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-60"
      >
        Starts in
      </span>
      <div className="flex items-end gap-3 flex-wrap">
        <Unit value={days}    label="days" />
        <Divider />
        <Unit value={hours}   label="hrs" />
        <Divider />
        <Unit value={minutes} label="min" />
        <Divider />
        <Unit value={seconds} label="sec" />
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
