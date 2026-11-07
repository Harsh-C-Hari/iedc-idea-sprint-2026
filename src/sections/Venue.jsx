/**
 * Venue.jsx — section 7.
 *
 * Content (plan section D):
 *   • College of Engineering Chengannur
 *   • SPDK Room, 5th Floor
 *   • "20 Nov, 5:00 PM to 21 Nov, 5:00 PM" (written out in full)
 *
 * MapFacade (Phase 3A):
 *   • Static map preview using cec-map.webp / cec-map.jpg
 *   • Animated LocationPin overlay with "Map preview" label chip
 *   • "Load interactive map" button shown only if mapEmbedUrl is configured
 *   • Iframe NEVER created at load time (document.querySelectorAll('iframe').length === 0)
 *   • "Open in Google Maps" link if mapsUrl set, else "Search on Google Maps" fallback
 *   • Full-width container filling 100% of the card column (no right-edge strip)
 *
 * Caption:
 *   • Single space after period, no duplicate "5th Floor", opacity-70 for WCAG AA.
 */
import { useState } from 'react'
import SectionShell from '../components/ui/SectionShell.jsx'
import eventConfig from '../config/eventConfig.js'

const SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventConfig.venue.college)}`

/** Animated SVG location pin */
function LocationPin({ color = 'var(--color-orange)' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 32"
      width="40"
      height="53"
      aria-hidden="true"
      className="animate-bounce"
      style={{ animationDuration: '1.8s' }}
    >
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z"
        fill={color}
      />
      <circle cx="12" cy="12" r="4" fill="white" opacity="0.9" />
    </svg>
  )
}

/** Map facade — no iframe until clicked */
function MapFacade() {
  const [loaded, setLoaded] = useState(false)
  const mapImage = eventConfig.venue.mapImage
  const mapEmbedUrl = eventConfig.venue.mapEmbedUrl
  const mapsUrl  = eventConfig.venue.mapsUrl
  const linkUrl  = mapsUrl ?? SEARCH_URL
  const linkLabel = mapsUrl ? 'Open in Google Maps' : 'Search on Google Maps'

  return (
    <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-near-black)]/12 bg-white shadow-xs w-full">
      {/* Map area: full width aspect-[4/3] without right-edge gap */}
      <div className="relative bg-[var(--color-cream)] w-full aspect-[4/3] overflow-hidden">
        {!loaded ? (
          /* Static facade */
          <div className="absolute inset-0 w-full h-full">
            {mapImage ? (
              <picture>
                <source srcSet="/images/cec-map.webp" type="image/webp" />
                <img
                  src={`/images/${mapImage}`}
                  alt="Map showing College of Engineering Chengannur"
                  width="1200"
                  height="900"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </picture>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--color-near-black)]/5">
                <div className="text-center px-4">
                  <p className="font-[family-name:var(--font-body)] text-sm font-semibold text-[var(--color-near-black)] mb-1">
                    {eventConfig.venue.college}
                  </p>
                  <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)] opacity-60">
                    {eventConfig.venue.room}
                  </p>
                </div>
              </div>
            )}

            {/* Animated LocationPin + "Map preview" chip */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <LocationPin />
              <span className="mt-2 px-2.5 py-1 font-[family-name:var(--font-body)] text-[11px] font-medium tracking-wide bg-[var(--color-near-black)]/85 text-[var(--color-cream)] rounded-full backdrop-blur-xs shadow-xs">
                Map preview
              </span>
            </div>

            {/* "Load interactive map" button — shown only if mapEmbedUrl is set */}
            {mapEmbedUrl && (
              <div className="absolute bottom-4 inset-x-0 flex justify-center z-20">
                <button
                  type="button"
                  onClick={() => setLoaded(true)}
                  className="px-5 py-2 min-h-[44px] flex items-center
                             font-[family-name:var(--font-body)] text-sm font-semibold
                             bg-[var(--color-near-black)] text-[var(--color-cream)]
                             rounded-[var(--radius-sm)] shadow-md
                             hover:bg-[#2a2420] transition-colors duration-[var(--duration-fast)]
                             focus-visible:outline-[var(--color-near-black)]"
                >
                  Load interactive map
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Iframe — ONLY injected after user clicks */
          <iframe
            title="College of Engineering Chengannur — Google Maps"
            src={mapEmbedUrl}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        )}
      </div>

      {/* Footer link */}
      <div className="px-4 py-3 bg-white border-t border-[var(--color-near-black)]/10 flex items-center justify-between">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)]
                     opacity-70 hover:opacity-100 underline
                     focus-visible:outline-[var(--color-near-black)]"
        >
          {linkLabel} ↗
        </a>
      </div>
    </div>
  )
}

/** Geometric fallback panel (when no campus photo supplied) */
function GeometricPanel() {
  return (
    <div
      aria-hidden="true"
      className="w-full aspect-[2.35/1] rounded-[var(--radius-md)] overflow-hidden
                 bg-[var(--color-near-black)] relative flex items-center justify-center"
    >
      <svg viewBox="0 0 400 225" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        <rect width="400" height="225" fill="#171717"/>
        <circle cx="200" cy="112" r="80" fill="none" stroke="#F05A28" strokeWidth="1" opacity="0.3"/>
        <circle cx="200" cy="112" r="50" fill="none" stroke="#D9F36A" strokeWidth="1" opacity="0.2"/>
        <line x1="80" y1="112" x2="320" y2="112" stroke="#F2EBDD" strokeWidth="0.5" opacity="0.1"/>
        <line x1="200" y1="30" x2="200" y2="195" stroke="#F2EBDD" strokeWidth="0.5" opacity="0.1"/>
        <polygon points="200,60 230,100 170,100" fill="#F05A28" opacity="0.15"/>
      </svg>
      <span className="relative z-10 font-[family-name:var(--font-display)] text-sm
                       text-[var(--color-cream)] opacity-20 tracking-widest uppercase">
        Photo coming soon
      </span>
    </div>
  )
}

export default function Venue() {
  return (
    <SectionShell
      id="venue"
      labelId="venue-heading"
      theme="light"
      className="px-5 md:px-8 lg:px-16 py-20 lg:py-28"
    >
      <div className="max-w-6xl mx-auto">

        {/* Heading block */}
        <div className="mb-12 lg:mb-16">
          <p className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-50 mb-3">
            Venue
          </p>
          <h2
            id="venue-heading"
            className="font-[family-name:var(--font-display)]
                       text-[clamp(2rem,5vw,4rem)] leading-tight tracking-[-0.025em]
                       text-[var(--color-near-black)] max-w-[20ch]"
          >
            WHERE IT HAPPENS
          </h2>
        </div>

        {/* Two-column layout: info + map */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">

          {/* Info block */}
          <div className="mb-10 lg:mb-0">
            {/* Campus photo or geometric panel */}
            {eventConfig.venue.photo ? (
              <div className="group rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-near-black)]/12 mb-8 bg-white shadow-xs hover:shadow-md transition-shadow duration-300">
                <div className="relative aspect-[2.35/1] overflow-hidden bg-[var(--color-near-black)]/5">
                  <picture>
                    <source srcSet="/images/cec-campus.webp" type="image/webp" />
                    <img
                      src={`/images/${eventConfig.venue.photo}`}
                      alt={`${eventConfig.venue.college} campus`}
                      width="1024"
                      height="435"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transform-none"
                    />
                  </picture>

                  {/* Gradient scrim at bottom for text legibility */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-near-black)]/60 via-[var(--color-near-black)]/20 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Subtle location tag pill overlay */}
                  <span
                    className="absolute bottom-3 left-3 px-3 py-1
                               font-[family-name:var(--font-body)] text-[11px] font-medium tracking-wide
                               bg-[var(--color-near-black)]/85 text-[var(--color-cream)]
                               rounded-[var(--radius-full)] backdrop-blur-xs shadow-xs
                               flex items-center gap-1.5 border border-white/10"
                  >
                    <svg className="w-3 h-3 text-[var(--color-orange)]" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                      <path d="M6 1C4.343 1 3 2.343 3 4c0 2.25 3 7 3 7s3-4.75 3-7c0-1.657-1.343-3-3-3zm0 4.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
                    </svg>
                    Main Block · Chengannur
                  </span>
                </div>
                <div className="px-4 py-3 bg-white border-t border-[var(--color-near-black)]/10 flex items-center justify-between">
                  <span className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)] opacity-80 font-medium">
                    {eventConfig.venue.college}
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-[11px] text-[var(--color-near-black)] opacity-60 uppercase tracking-widest flex items-center gap-2 font-medium">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-orange)] opacity-75 motion-reduce:hidden" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-orange)]" />
                    </span>
                    Host Campus
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <GeometricPanel />
              </div>
            )}

            {/* Venue details */}
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-50 mb-1">
                  College
                </dt>
                <dd className="font-[family-name:var(--font-body)] font-semibold text-[var(--color-near-black)]">
                  {eventConfig.venue.college}
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-50 mb-1">
                  Room
                </dt>
                <dd className="font-[family-name:var(--font-body)] font-semibold text-[var(--color-near-black)]">
                  {eventConfig.venue.room}
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-50 mb-1">
                  When
                </dt>
                <dd className="font-[family-name:var(--font-body)] font-semibold text-[var(--color-near-black)]">
                  20 Nov, 5:00 PM to 21 Nov, 5:00 PM
                </dd>
              </div>
            </dl>
          </div>

          {/* Map facade */}
          <div>
            <MapFacade />
            <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)]
                          opacity-70 mt-3 italic">
              The pin marks the college, not the specific room. {eventConfig.venue.room}.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
