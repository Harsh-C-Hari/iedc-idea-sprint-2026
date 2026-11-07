/**
 * Spark.jsx — the recurring geometric spark motif.
 *
 * A layered inline SVG: gradient-shaded cubes, rings and discs assembled
 * into one compact spark shape. Used in Loader, Hero, About, Challenge,
 * Footer and IdeaSpark fallback.
 *
 * Props:
 *   size    {number}  — rendered square size in px (default 120)
 *   color   {string}  — primary accent ('orange' | 'lime' | 'cream'), default 'orange'
 *   className {string}
 *
 * All content is aria-hidden — purely decorative.
 */

const PALETTES = {
  orange: {
    cube:   '#f5a623',
    cubeDark: '#c47d08',
    ring:   '#c8f135',
    ringDark: '#8aab00',
    disc:   '#f5f0e8',
    discDark: '#c8c3bb',
    glow:   'rgba(245,166,35,0.35)',
  },
  lime: {
    cube:   '#c8f135',
    cubeDark: '#8aab00',
    ring:   '#f5a623',
    ringDark: '#c47d08',
    disc:   '#f5f0e8',
    discDark: '#c8c3bb',
    glow:   'rgba(200,241,53,0.3)',
  },
  cream: {
    cube:   '#f5f0e8',
    cubeDark: '#c8c3bb',
    ring:   '#f5a623',
    ringDark: '#c47d08',
    disc:   '#c8f135',
    discDark: '#8aab00',
    glow:   'rgba(245,240,232,0.25)',
  },
}

export default function Spark({ size = 120, color = 'orange', className = '' }) {
  const p = PALETTES[color] ?? PALETTES.orange
  const uid = `sp-${color}-${size}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Cube face gradient — top-left lit */}
        <linearGradient id={`${uid}-cg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.cube} />
          <stop offset="100%" stopColor={p.cubeDark} />
        </linearGradient>

        {/* Ring gradient */}
        <linearGradient id={`${uid}-rg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.ring} />
          <stop offset="100%" stopColor={p.ringDark} />
        </linearGradient>

        {/* Disc gradient */}
        <radialGradient id={`${uid}-dg`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={p.disc} />
          <stop offset="100%" stopColor={p.discDark} />
        </radialGradient>

        {/* Glow filter */}
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Back ring (large, tilted ellipse) */}
      <ellipse
        cx="60" cy="62"
        rx="34" ry="12"
        transform="rotate(-18 60 62)"
        fill="none"
        stroke={`url(#${uid}-rg)`}
        strokeWidth="3"
        opacity="0.7"
      />

      {/* Front disc (small, behind cube) */}
      <circle
        cx="78" cy="72"
        r="10"
        fill={`url(#${uid}-dg)`}
        opacity="0.6"
      />

      {/* Main cube — isometric 3-face illusion */}
      {/* Top face */}
      <polygon
        points="60,20 90,36 60,52 30,36"
        fill={`url(#${uid}-cg)`}
        opacity="0.95"
        filter={`url(#${uid}-glow)`}
      />
      {/* Left face */}
      <polygon
        points="30,36 60,52 60,84 30,68"
        fill={p.cubeDark}
        opacity="0.9"
      />
      {/* Right face */}
      <polygon
        points="60,52 90,36 90,68 60,84"
        fill={p.cube}
        opacity="0.75"
      />

      {/* Accent ring (front, small, tilted) */}
      <ellipse
        cx="60" cy="52"
        rx="18" ry="6"
        transform="rotate(10 60 52)"
        fill="none"
        stroke={`url(#${uid}-rg)`}
        strokeWidth="2"
        opacity="0.5"
      />

      {/* Scatter dots (spark energy) */}
      <circle cx="22" cy="42" r="2.5" fill={p.ring} opacity="0.7" />
      <circle cx="102" cy="38" r="2" fill={p.cube} opacity="0.6" />
      <circle cx="92" cy="80" r="3" fill={p.ring} opacity="0.5" />
      <circle cx="18" cy="72" r="2" fill={p.disc} opacity="0.4" />
      <circle cx="50" cy="96" r="2.5" fill={p.cube} opacity="0.5" />

      {/* Light flash lines (3 short rays) */}
      <line x1="60" y1="10" x2="60" y2="18" stroke={p.cube} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="98" y1="28" x2="92" y2="33" stroke={p.ring} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="22" y1="28" x2="28" y2="33" stroke={p.ring} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}
