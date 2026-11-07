/**
 * webgl.js — capability check for the lazy SparkScene (plan section C, T19).
 *
 * Returns true only when:
 *   • WebGL2 or WebGL1 is available
 *   • prefers-reduced-motion is NOT set
 *   • Save-Data header is NOT set
 *
 * Used in IdeaSpark.jsx to decide whether to load SparkScene or use SVG fallback.
 */

export function canUseWebGL() {
  if (typeof window === 'undefined') return false

  // Reduced motion — skip 3D
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  // Save-Data — skip heavy assets
  if (navigator.connection?.saveData) return false

  // WebGL2 check
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
    // ignore
  }

  return false
}
