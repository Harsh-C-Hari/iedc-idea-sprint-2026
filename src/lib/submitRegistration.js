/**
 * submitRegistration.js — the only place that knows the submission destination.
 *
 * Modes (plan section B):
 *   'preview'  — nothing is sent; Review step says plainly not yet connected.
 *                Never shows a success screen. Returns { ok: false, preview: true }.
 *   'endpoint' — POST JSON to config URL with 10 s timeout, honeypot field.
 *                Success only on 2xx. On failure, keeps data for retry.
 *                Returns { ok: true } or { ok: false, error: string }.
 */
import eventConfig from '../config/eventConfig.js'

/**
 * @param {object} formData — { teamName, teamSize, participants: [...] }
 * @returns {Promise<{ ok: boolean, preview?: boolean, error?: string }>}
 */
export async function submitRegistration(formData) {
  const { mode, endpoint } = eventConfig.registration

  if (mode === 'preview' || !endpoint) {
    return { ok: false, preview: true }
  }

  // Honeypot field — bots fill this, humans don't
  const payload = {
    ...formData,
    _hp: '', // must be empty
    submittedAt: new Date().toISOString(),
  }

  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(endpoint, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  controller.signal,
    })
    clearTimeout(timeoutId)

    if (res.ok) return { ok: true }
    return { ok: false, error: `Server error (${res.status}). Your data was kept — please try again.` }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      return { ok: false, error: 'Request timed out. Your data was kept — please try again.' }
    }
    return { ok: false, error: 'Could not reach the server. Your data was kept — please try again.' }
  }
}
