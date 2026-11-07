/**
 * lib/time.js — pure time utilities for the countdown and config.
 *
 * All date arithmetic works with explicit ISO strings that carry the +05:30
 * offset, so results are correct on any device timezone (plan section B, F).
 *
 * No dependencies. No side effects. Pure functions only.
 */

/**
 * Parse an ISO 8601 string (e.g. '2026-11-20T17:00:00+05:30') to a UTC ms timestamp.
 * Uses the built-in Date parser which handles explicit offsets correctly in all
 * browsers. We do NOT rely on the device's local timezone.
 *
 * @param {string} iso
 * @returns {number} Unix timestamp in milliseconds (UTC)
 */
export function parseISO(iso) {
  return new Date(iso).getTime()
}

/**
 * Derive the countdown phase from the current time vs event window.
 *
 * @param {number} nowMs     — current time (ms, UTC)
 * @param {number} startMs   — event start (ms, UTC)
 * @param {number} endMs     — event end (ms, UTC)
 * @returns {'before' | 'live' | 'after'}
 */
export function getPhase(nowMs, startMs, endMs) {
  if (nowMs < startMs) return 'before'
  if (nowMs < endMs)   return 'live'
  return 'after'
}

/**
 * Decompose a positive millisecond duration into days, hours, minutes, seconds.
 *
 * @param {number} ms — must be >= 0
 * @returns {{ days: number, hours: number, minutes: number, seconds: number }}
 */
export function decompose(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  const totalSeconds = Math.floor(ms / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)

  return { days, hours, minutes, seconds }
}

/**
 * Zero-pad a number to 2 digits.
 *
 * @param {number} n
 * @returns {string}
 */
export function pad2(n) {
  return String(n).padStart(2, '0')
}

/**
 * Read a ?now= query param (dev-only override) and return its ms value,
 * or null if the param is absent or invalid.
 *
 * Usage: ?now=2026-11-20T16:59:00+05:30  → before
 *        ?now=2026-11-20T17:30:00+05:30  → live
 *        ?now=2026-11-21T18:00:00+05:30  → after
 *
 * @returns {number | null}
 */
export function devNowOverride() {
  if (typeof window === 'undefined') return null
  const param = new URLSearchParams(window.location.search).get('now')
  if (!param) return null
  const ms = Date.parse(param)
  return Number.isFinite(ms) ? ms : null
}
