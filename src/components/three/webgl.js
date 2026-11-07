/**
 * webgl.js — capability check for the lazy SparkScene (plan section C, T19/follow-up #4).
 *
 * Returns true only when ALL of these hold:
 *   • WebGL2 or WebGL1 is available
 *   • prefers-reduced-motion is NOT set
 *   • Save-Data is NOT set
 *   • Network effectiveType is NOT slow-2g, 2g, or 3g
 *
 * Used in IdeaSpark.jsx to decide whether to load SparkScene or use SVG fallback.
 */

/**
 * webgl.js — capability check for the lazy SparkScene (plan section C, T19/follow-up #4).
 *
 * Returns true only when ALL of these hold:
 *   • WebGL2 or WebGL1 is available (probed once and cached at module level)
 *   • prefers-reduced-motion is NOT set
 *   • Save-Data is NOT set
 *   • Network effectiveType is NOT slow-2g, 2g, or 3g
 *
 * Used in IdeaSpark.jsx to decide whether to load SparkScene or use SVG fallback.
 */

let cachedWebGLSupport = null

function probeWebGL() {
  if (cachedWebGLSupport !== null) return cachedWebGLSupport
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const ctx =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    // Probe context once without calling loseContext(), avoiding simulated context-loss
    // events, driver churn, or context disposal conflicts with React StrictMode.
    cachedWebGLSupport = !!ctx
  } catch {
    cachedWebGLSupport = false
  }

  return cachedWebGLSupport
}

export function canUseWebGLDetailed() {
  if (typeof window === 'undefined') return { result: false, reason: 'no-window' }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) return { result: false, reason: 'prefers-reduced-motion' }

  const saveData = navigator.connection?.saveData
  if (saveData) return { result: false, reason: 'save-data' }

  const ect = navigator.connection?.effectiveType
  if (ect === 'slow-2g' || ect === '2g' || ect === '3g') {
    return { result: false, reason: `slow-connection: ${ect}` }
  }

  const supported = probeWebGL()
  return {
    result: supported,
    reason: supported ? 'webgl-supported' : 'no-webgl-context',
  }
}

export function canUseWebGL() {
  return canUseWebGLDetailed().result
}

/** True if the current viewport is a small mobile screen (< 768 px). */
export function isMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}
