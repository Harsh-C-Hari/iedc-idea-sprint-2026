/**
 * useCopy.js — clipboard copy with a real fallback.
 *
 * Returns { copy(text) -> Promise<boolean>, copied, failed }
 *   • Tries navigator.clipboard.writeText; if it is missing OR rejects (insecure context, permission
 *     policy), falls back to a hidden textarea + execCommand('copy').
 *   • "copied" / "failed" reset after 2 s; repeated clicks restart the timer; cleared on unmount.
 */
import { useState, useCallback, useRef, useEffect } from 'react'

function legacyCopy(text) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.setAttribute('aria-hidden', 'true')
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;'
  const prev = document.activeElement
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  ta.setSelectionRange(0, text.length)
  let ok = false
  try { ok = document.execCommand('copy') } catch { ok = false }
  document.body.removeChild(ta)
  if (prev && typeof prev.focus === 'function') prev.focus({ preventScroll: true }) // keep keyboard focus on the button
  return ok
}

export default function useCopy() {
  const [state, setState] = useState('idle') // 'idle' | 'copied' | 'failed'
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(async (text) => {
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        ok = true
      }
    } catch {
      ok = false
    }
    if (!ok) ok = legacyCopy(text)
    setState(ok ? 'copied' : 'failed')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2000)
    return ok
  }, [])

  return { copy, copied: state === 'copied', failed: state === 'failed' }
}
