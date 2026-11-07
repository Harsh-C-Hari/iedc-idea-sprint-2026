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

export function canUseWebGL() {
  if (typeof window === 'undefined') return false

  // Reduced motion — skip 3D
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  // Save-Data hint — skip heavy assets
  if (navigator.connection?.saveData) return false

  // Slow network — skip 3D chunk on slow-2g, 2g, 3g
  const ect = navigator.connection?.effectiveType
  if (ect === 'slow-2g' || ect === '2g' || ect === '3g') return false

  // WebGL capability check
  try {
    const canvas = document.createElement('canvas')
    const ctx =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (ctx) {
      // Dispose context immediately to avoid resource leak
      const ext = ctx.getExtension?.('WEBGL_lose_context')
      ext?.loseContext()
      return true
    }
  } catch {
    // ignore — WebGL not available
  }

  return false
}

/** True if the current viewport is a small mobile screen (< 768 px). */
export function isMobile() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}
