/**
 * Venue.jsx — section 7.
 *
 * Content (plan section D):
 *   • College of Engineering Chengannur
 *   • SPDK Room, 5th Floor
 *   • "20 Nov, 5:00 PM to 21 Nov, 5:00 PM" (written out in full — plan section D)
 *
 * MapFacade (plan section D):
 *   • Static preview panel + animated pin + "Load interactive map" button
 *   • Iframe injected only on click (no third-party requests at load time)
 *   • "Open in Google Maps" link (target="_blank" rel="noopener noreferrer")
 *   • If mapsUrl is null: search URL from college name, labelled "Search on Google Maps"
 *
 * Photo fallback (plan section D + section F Q4):
 *   • If venue.photo is null: geometric panel (not a stock image).
 *
 * Iframe never loads at page load — plan section A (Performance and Best Practices).
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
  const mapsUrl  = eventConfig.venue.mapsUrl
  const embedUrl = mapsUrl
    ? `${mapsUrl}&output=embed`
    : null
  const linkUrl  = mapsUrl ?? SEARCH_URL
  const linkLabel = mapsUrl ? 'Open in Google Maps' : 'Search on Google Maps'

  return (
    <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-near-black)]/10">
      {/* Map area */}
      <div className="relative bg-[var(--color-cream)] aspect-[4/3] max-h-[400px]">
        {!loaded ? (
          /* Static facade */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4
                       bg-[var(--color-near-black)]/5"
          >
            <LocationPin />
            <div className="text-center px-4">
              <p className="font-[family-name:var(--font-body)] text-sm font-semibold
                            text-[var(--color-near-black)] mb-1">
                {eventConfig.venue.college}
              </p>
              <p className="font-[family-name:var(--font-body)] text-xs
                            text-[var(--color-near-black)] opacity-50">
                {eventConfig.venue.room}
              </p>
            </div>
            {embedUrl && (
              <button
                type="button"
                onClick={() => setLoaded(true)}
                className="px-5 py-2 min-h-[44px] flex items-center
                           font-[family-name:var(--font-body)] text-sm font-semibold
                           bg-[var(--color-near-black)] text-[var(--color-cream)]
                           rounded-[var(--radius-sm)]
                           hover:bg-[#2a2420] transition-colors duration-[var(--duration-fast)]
                           focus-visible:outline-[var(--color-near-black)]"
              >
                Load interactive map
              </button>
            )}
          </div>
        ) : (
          /* Iframe — only injected after user clicks */
          <iframe
            title="College of Engineering Chengannur — Google Maps"
            src={embedUrl}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        )}
      </div>

      {/* Footer link */}
      <div className="px-4 py-3 bg-white border-t border-[var(--color-near-black)]/5">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)]
                     opacity-60 hover:opacity-100 underline
                     focus-visible:outline-[var(--color-near-black)]"
        >
          {linkLabel} ↗
        </a>
      </div>
    </div>
  )
}

/** Geometric fallback panel (when no photo supplied — plan section D) */
function GeometricPanel() {
  return (
    <div
      aria-hidden="true"
      className="w-full aspect-[16/9] rounded-[var(--radius-md)] overflow-hidden
                 bg-[var(--color-near-black)] relative flex items-center justify-center"
    >
      {/* Simple geometric shapes as placeholder artwork */}
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
              <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--color-near-black)]/10 mb-8 bg-white shadow-xs">
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
                      className="w-full h-full object-cover object-center"
                    />
                  </picture>
                  {/* Subtle location tag pill overlay */}
                  <span
                    className="absolute bottom-3 left-3 px-2.5 py-1
                               font-[family-name:var(--font-body)] text-[11px] font-medium tracking-wide
                               bg-[var(--color-near-black)]/75 text-[var(--color-cream)]
                               rounded-[var(--radius-full)] backdrop-blur-xs shadow-xs"
                  >
                    Main Block · Chengannur
                  </span>
                </div>
                <div className="px-4 py-3 bg-white border-t border-[var(--color-near-black)]/5 flex items-center justify-between">
                  <span className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)] opacity-70 font-medium">
                    {eventConfig.venue.college}
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-[11px] text-[var(--color-near-black)] opacity-50 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange)] inline-block" aria-hidden="true" />
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
                          opacity-40 mt-3 italic">
              The pin marks the college, not the specific room.
              {eventConfig.venue.room} is on the 5th Floor.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
