/**
 * Loader.jsx — CSS-driven lifecycle controller for the "24-Hour Spark" load sequence.
 *
 * All animation keyframes are defined in pure CSS inside index.html for zero runtime
 * script overhead and zero LCP penalty. This component:
 *   1. Measures elapsed time since index.html painted (window.__ldT0).
 *   2. Dispatches 'loader:done' at ~700 ms (as panels begin opening) to trigger Hero entrance.
 *   3. Removes #loader from the DOM at ~1100 ms once panels are fully clear.
 *   4. Handles prefers-reduced-motion immediately (instant dispatch & shell removal).
 *   5. Protects against React StrictMode / HMR double-execution via module-level flags.
 */
import { useEffect } from 'react'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

let doneFired = false
let timerDone = null
let timerRemove = null

function fireDone() {
  if (doneFired || window.__loaderDone) return
  doneFired = true
  window.__loaderDone = true
  window.dispatchEvent(new CustomEvent('loader:done'))
}

function removeShell() {
  const el = document.getElementById('loader')
  el?.remove()
}

export default function Loader() {
  useEffect(() => {
    // Reduced motion: skip immediately
    if (REDUCED) {
      fireDone()
      removeShell()
      return
    }

    const loaderEl = document.getElementById('loader')
    // If shell is already missing, dispatch done immediately
    if (!loaderEl) {
      fireDone()
      return
    }

    // If already completed in previous lifecycle (e.g. HMR), ensure clean state
    if (window.__loaderDone) {
      removeShell()
      return
    }

    const elapsed = performance.now() - (window.__ldT0 ?? 0)
    const doneDelay = Math.max(0, 700 - elapsed)
    const removeDelay = Math.max(0, 1100 - elapsed)

    if (timerDone) clearTimeout(timerDone)
    if (timerRemove) clearTimeout(timerRemove)

    timerDone = setTimeout(() => {
      fireDone()
      timerDone = null
    }, doneDelay)

    timerRemove = setTimeout(() => {
      removeShell()
      timerRemove = null
    }, removeDelay)

    return () => {
      if (timerDone) {
        clearTimeout(timerDone)
        timerDone = null
      }
      if (timerRemove) {
        clearTimeout(timerRemove)
        timerRemove = null
      }
      // Safety: if unmounted permanently before completion, ensure shell is removed
      setTimeout(() => {
        if (!timerDone && !timerRemove && !doneFired) {
          fireDone()
          removeShell()
        }
      }, 50)
    }
  }, [])

  return null
}
