/**
 * scheduleClock.js — pure helpers that turn schedule.js into absolute times.
 *
 * schedule.js stays the source of truth ("20 November 2026" + "5:00 PM"). Every slot is converted to a
 * UTC timestamp through an ISO string with an explicit +05:30 offset, so Now/Next is correct on any
 * device timezone. No dependencies, no side effects.
 */
const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}
const p2 = (n) => String(n).padStart(2, '0')

/** '20 November 2026' + '5:00 PM' -> '2026-11-20T17:00:00+05:30' (null if unparseable) */
export function slotISO(dateStr, timeStr) {
  const d = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(String(dateStr).trim())
  const t = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(timeStr).trim())
  if (!d || !t || !MONTHS[d[2].toLowerCase()]) return null
  let h = Number(t[1]) % 12
  if (t[3].toUpperCase() === 'PM') h += 12
  return `${d[3]}-${p2(MONTHS[d[2].toLowerCase()])}-${p2(Number(d[1]))}T${p2(h)}:${t[2]}:00+05:30`
}

/** Flat, chronological list: [{ key: '1-0', day, index, startMs }] */
export function buildSlots(schedule) {
  const out = []
  schedule.forEach((day) =>
    day.items.forEach((item, index) => {
      const iso = slotISO(day.date, item.time)
      const startMs = iso ? Date.parse(iso) : NaN
      if (Number.isFinite(startMs)) out.push({ key: `${day.day}-${index}`, day: day.day, index, startMs })
    })
  )
  return out.sort((a, b) => a.startMs - b.startMs)
}

/**
 * Inside [startMs, endMs): "now" is the latest slot that has started and "next" the slot after it.
 * Outside the window both are null so the UI shows nothing extra.
 */
export function getNowNext(slots, nowMs, startMs, endMs) {
  if (!(nowMs >= startMs && nowMs < endMs)) return { nowKey: null, nextKey: null }
  let cur = -1
  for (let i = 0; i < slots.length; i++) if (slots[i].startMs <= nowMs) cur = i
  return {
    nowKey: cur >= 0 ? slots[cur].key : null,
    nextKey: slots[cur + 1] ? slots[cur + 1].key : null,
  }
}

/** 0..1 across the event window */
export function getProgress(nowMs, startMs, endMs) {
  if (endMs <= startMs) return 0
  return Math.min(1, Math.max(0, (nowMs - startMs) / (endMs - startMs)))
}
