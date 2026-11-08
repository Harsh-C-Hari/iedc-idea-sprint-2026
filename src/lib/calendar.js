/**
 * calendar.js — client-side .ics generation (no dependency).
 *
 * One event built from eventConfig. Times are written in UTC (Z) so every
 * calendar app resolves 17:00 Asia/Kolkata (+05:30) correctly without a VTIMEZONE block.
 */
import eventConfig from '../config/eventConfig.js'

const pad = (n) => String(n).padStart(2, '0')

/** Date -> 20261120T113000Z */
function toICSUTC(d) {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

/** Escape text per RFC 5545 */
function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Fold lines longer than 75 octets (simple ASCII-safe fold) */
function fold(line) {
  if (line.length <= 74) return line
  const out = []
  let rest = line
  out.push(rest.slice(0, 74))
  rest = rest.slice(74)
  while (rest.length) {
    out.push(' ' + rest.slice(0, 73))
    rest = rest.slice(73)
  }
  return out.join('\r\n')
}

export function buildICS() {
  const start = new Date(eventConfig.startISO)
  const end = new Date(eventConfig.endISO)
  const location = `${eventConfig.venue.room}, ${eventConfig.venue.college}`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IEDC BOOTCAMP CEC//IDEA SPRINT 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:idea-sprint-2026@iedcbootcampcec`,
    `DTSTAMP:${toICSUTC(new Date())}`,
    `DTSTART:${toICSUTC(start)}`,
    `DTEND:${toICSUTC(end)}`,
    `SUMMARY:${esc(eventConfig.name)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(`${eventConfig.tagline} Organised by ${eventConfig.organizer}.`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}

/** Builds the file, triggers a download, then revokes the object URL. */
export function downloadICS() {
  const blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'idea-sprint-2026.ics'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke after the click has been processed
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
