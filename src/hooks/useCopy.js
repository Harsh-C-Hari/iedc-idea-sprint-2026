/**
 * useCopy.js — clipboard copy with textarea fallback.
 *
 * Returns { copy(text), copied: bool }
 * "copied" resets to false after 2 s.
 * Falls back to a textarea select+execCommand when navigator.clipboard is unavailable.
 */
import { useState, useCallback } from 'react'

export default function useCopy() {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Textarea fallback
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silent fail — the button text "Press Ctrl+C" state is not needed here
      // since the textarea fallback covers the common insecure-context case.
    }
  }, [])

  return { copy, copied }
}
