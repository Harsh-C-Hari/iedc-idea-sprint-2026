/**
 * useCountdown.js — 1-second ticker for the event countdown.
 *
 * Returns { phase, days, hours, minutes, seconds }
 * phase: 'before' | 'live' | 'after'
 *
 * Features (plan section B):
 *   • Pauses when the tab is hidden (Page Visibility API)
 *   • Dev-only ?now= override for testing all three states
 *   • Uses explicit +05:30 ISO strings — correct on any device timezone
 */
import { useState, useEffect } from 'react'
import eventConfig from '../config/eventConfig.js'
import { parseISO, getPhase, decompose, devNowOverride } from '../lib/time.js'

const startMs = parseISO(eventConfig.startISO)
const endMs   = parseISO(eventConfig.endISO)

function snapshot() {
  const nowMs = devNowOverride() ?? Date.now()
  const phase = getPhase(nowMs, startMs, endMs)

  let targetMs
  if (phase === 'before') targetMs = startMs
  else if (phase === 'live') targetMs = endMs
  else targetMs = endMs

  const diff = Math.max(0, targetMs - nowMs)
  return { phase, ...decompose(diff) }
}

export default function useCountdown() {
  const [state, setState] = useState(snapshot)

  useEffect(() => {
    // Don't tick after the event has ended
    if (state.phase === 'after') return

    let id

    const tick = () => {
      if (document.hidden) return
      setState(snapshot())
    }

    id = setInterval(tick, 1000)

    const onVisibility = () => {
      if (!document.hidden) setState(snapshot())
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [state.phase])

  return state
}
