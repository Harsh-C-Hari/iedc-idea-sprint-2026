/**
 * Fragments.jsx — individual geometric SVG primitives.
 *
 * Exports: Cube, Ring, Disc, Sphere
 * Used in Hero (two layers: most behind type, 1–2 crossing letter boundaries).
 * All are aria-hidden — decorative only.
 *
 * Props shared by all:
 *   size      {number}  — bounding box size in px
 *   color     {string}  — hex or CSS colour token reference
 *   opacity   {number}  — 0–1
 *   className {string}
 *   style     {object}
 */

/** Isometric cube fragment */
export function Cube({ size = 48, color = '#f5a623', opacity = 0.6, className = '', style = {} }) {
  const dark = color === '#c8f135' ? '#8aab00' : color === '#f5f0e8' ? '#c8c3bb' : '#c47d08'
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" focusable="false"
      className={className}
      style={{ opacity, ...style }}
    >
      {/* Top face */}
      <polygon points="24,4 42,14 24,24 6,14" fill={color} />
      {/* Left face */}
      <polygon points="6,14 24,24 24,44 6,34" fill={dark} />
      {/* Right face */}
      <polygon points="24,24 42,14 42,34 24,44" fill={color} opacity="0.75" />
    </svg>
  )
}

/** Partial ring / torus arc fragment */
export function Ring({ size = 48, color = '#c8f135', opacity = 0.55, className = '', style = {} }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" focusable="false"
      className={className}
      style={{ opacity, ...style }}
    >
      <circle cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth="4" />
      <circle cx="24" cy="24" r="10" fill="none" stroke={color} strokeWidth="2" opacity="0.4" />
    </svg>
  )
}

/** Filled disc fragment */
export function Disc({ size = 32, color = '#f5f0e8', opacity = 0.4, className = '', style = {} }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" focusable="false"
      className={className}
      style={{ opacity, ...style }}
    >
      <circle cx="16" cy="16" r="14" fill={color} />
    </svg>
  )
}

/** Sphere illusion (radial gradient) */
export function Sphere({ size = 40, color = '#f5a623', opacity = 0.5, className = '', style = {}, uid = 'sphere' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" focusable="false"
      className={className}
      style={{ opacity, ...style }}
    >
      <defs>
        <radialGradient id={`rg-${uid}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="60%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#rg-${uid})`} />
    </svg>
  )
}
