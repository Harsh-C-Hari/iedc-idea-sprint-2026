/**
 * useEventClock.js — "now" in ms, refreshed once a minute.
 * Pauses while the tab is hidden, refreshes on return, stops after the event ends.
 * Honours the same dev-only ?now= override as the countdown so all three states can be tested.
 */
import { useEffect, useState } from 'react'
import { devNowOverride } from '../lib/time.js'

const read = () => devNowOverride() ?? Date.now()

export default function useEventClock(stopAfterMs) {
  const [now, setNow] = useState(read)

  useEffect(() => {
    if (now >= stopAfterMs) return undefined
    const tick = () => { if (!document.hidden) setNow(read()) }
    const id = setInterval(tick, 60000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [now >= stopAfterMs, stopAfterMs]) // eslint-disable-line react-hooks/exhaustive-deps

  return now
}
