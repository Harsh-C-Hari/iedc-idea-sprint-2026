/**
 * Venue.jsx — section 7.
 *
 * Content (plan section D):
 *   • College of Engineering Chengannur
 *   • SPDK Room, 5th Floor
 *   • "20 Nov, 5:00 PM to 21 Nov, 5:00 PM" (written out in full)
 *
 * MapFacade (Phase 3A):
 *   • Static map preview built from assets-src/cec-map.jpg (AVIF / WebP / JPG variants)
 *   • Animated LocationPin anchored to the college marker (eventConfig.venue.mapPin)
 *   • Cream tint over the map so the Google palette sits inside the site palette
 *   • "Load interactive map" button shown only if mapEmbedUrl is configured
 *   • Iframe NEVER created at load time (document.querySelectorAll('iframe').length === 0)
 *   • "Open in Google Maps" link if mapsUrl set, else "Search on Google Maps" fallback
 *   • Full-width container filling 100% of the card column (no right-edge strip)
 *
 * Caption:
 *   • Single space after period, no duplicate "5th Floor", opacity-70 for WCAG AA.
 */
import SectionShell from '../components/ui/SectionShell.jsx'
import ImageSkeleton from '../components/ui/ImageSkeleton.jsx'
import eventConfig from '../config/eventConfig.js'

const SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventConfig.venue.college)}`

/** Animated SVG location pin — drawn so the tip is at the bottom-centre of the box */
function LocationPin({ color = 'var(--color-orange)' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2 -2 28 34"
      aria-hidden="true"
      overflow="visible"
      className="block w-8 sm:w-9 lg:w-10 h-auto overflow-visible animate-bounce motion-reduce:animate-none drop-shadow-[0_2px_2px_rgb(23_23_23_/_0.35)]"
      style={{ animationDuration: '1.8s' }}
    >
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 8 12 20 12 20S24 20 24 12C24 5.373 18.627 0 12 0z"
        fill={color}
        stroke="var(--color-near-black)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="4" fill="white" opacity="0.95" />
    </svg>
  )
}

/** Map facade — clickable preview opens Google Maps */
function MapFacade() {
  const mapImage = eventConfig.venue.mapImage
  const mapsUrl  = eventConfig.venue.mapsUrl
  const { width: mapW, height: mapH } = eventConfig.venue.mapSize
  const pin = eventConfig.venue.mapPin
  const marker = eventConfig.venue.mapMarker
  const linkUrl  = mapsUrl ?? SEARCH_URL
  const linkLabel = mapsUrl ? 'Open in Google Maps' : 'Search on Google Maps'

  return (
    <div className="brutal group w-full rounded-[var(--radius-md)]
                    [--b-offset:6px] [--b-face:#fff] [--b-edge:rgb(23_23_23_/_0.12)] [--b-bw:1px]">
     {/* Inner wrapper clips the image to the radius; the block lives on the outer card so it is never clipped */}
     <div className="rounded-[var(--radius-md)] overflow-hidden">
      {/* Clickable map area: opens Google Maps in a new tab */}
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${eventConfig.venue.college} in Google Maps`}
        className="relative block bg-[var(--color-cream)] w-full overflow-hidden cursor-pointer focus-visible:outline-[var(--color-near-black)] focus-visible:outline-offset-[-6px]"
      >
        <div className="relative w-full" style={{ aspectRatio: `${mapW} / ${mapH}` }}>
          {/* Zoom layer: image, tint, pin and pulse scale together around the pin, so the pin stays on the marker */}
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out will-change-transform
                       group-hover:scale-[1.12] group-focus-within:scale-[1.12] motion-reduce:transition-none motion-reduce:transform-none"
            style={{ transformOrigin: `${pin.x}% ${pin.y}%` }}
          >
          {mapImage ? (
            <ImageSkeleton
              base="/images/cec-map"
              widths={[640, mapW]}
              sizes="(min-width:1024px) 540px, 100vw"
              alt={`Street map of central Chengannur showing ${eventConfig.venue.college} east of the KSRTC depot, near the District Hospital`}
              width={mapW}
              height={mapH}
              className="absolute inset-0 h-full w-full"
              imgClassName="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--color-near-black)]/5">
              <div className="text-center px-4">
                <p className="font-[family-name:var(--font-body)] text-sm font-semibold text-[var(--color-near-black)] mb-1">
                  {eventConfig.venue.college}
                </p>
                <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)] opacity-70">
                  {eventConfig.venue.room}
                </p>
              </div>
            </div>
          )}

          {/* Warm cream tint: pulls the grey Google palette toward the site's cream */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[var(--color-cream)] mix-blend-multiply opacity-60 pointer-events-none"
          />

          {/* Pin: its tip sits exactly on the college marker (left/top are % of the image) */}
          <div
            aria-hidden="true"
            className="absolute z-10 pointer-events-none -translate-x-1/2 -translate-y-full"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <LocationPin />
          </div>
          {/* Ring around the graduation-cap marker: sized as % of the map so it hugs the icon at every width */}
          <span
            aria-hidden="true"
            className="absolute z-[5] pointer-events-none -translate-x-1/2 -translate-y-1/2 block aspect-square"
            style={{ left: `${marker.x}%`, top: `${marker.y}%`, width: `${marker.size}%` }}
          >
            <span className="animate-ping absolute inset-0 rounded-full bg-[var(--color-orange)] opacity-60 motion-reduce:hidden" />
            <span className="absolute inset-0 rounded-full border-[1.5px] lg:border-2 border-[var(--color-orange)] bg-[var(--color-orange)]/15 shadow-[0_0_0_1px_rgb(23_23_23_/_0.55)]" />
          </span>
          </div>

          {/* Fixed edge outline (does not zoom) so the map reads as a card on the cream page */}
          <div
            aria-hidden="true"
            className="absolute inset-0 ring-1 ring-inset ring-[var(--color-near-black)]/15 pointer-events-none z-[6]"
          />

          {/* "Open on Google Maps" chip — bottom-centre keeps it off the map labels */}
          <span
            className="absolute z-10 bottom-3 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap
                       px-3 py-1 font-[family-name:var(--font-body)] text-xs font-medium tracking-wide
                       bg-[var(--color-near-black)]/90 text-[var(--color-cream)] rounded-full backdrop-blur-xs shadow-xs
                       group-hover:bg-[var(--color-orange)] group-hover:text-[var(--color-near-black)]
                       transition-colors duration-200 flex items-center gap-1.5 border border-white/10"
          >
            <span>Open on Google Maps</span>
            <span aria-hidden="true" className="text-xs">↗</span>
          </span>
        </div>
      </a>

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
          <p className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-70 mb-3">
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
              <div className="brutal group mb-8 rounded-[var(--radius-md)]
                              [--b-offset:6px] [--b-face:#fff] [--b-edge:rgb(23_23_23_/_0.12)] [--b-bw:1px]">
               <div className="rounded-[var(--radius-md)] overflow-hidden">
                <div className="relative aspect-[2.35/1] overflow-hidden bg-[var(--color-near-black)]/5">
                  <ImageSkeleton
                    base="/images/cec-campus"
                    widths={[640, 1024]}
                    sizes="(min-width:1024px) 540px, 100vw"
                    alt={`${eventConfig.venue.college} campus`}
                    width={1024}
                    height={435}
                    className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out will-change-transform
                               group-hover:scale-[1.08] group-focus-within:scale-[1.08] motion-reduce:transition-none motion-reduce:transform-none"
                    imgClassName="w-full h-full object-cover object-center"
                  />

                  {/* Gradient scrim at bottom for text legibility */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-near-black)]/60 via-[var(--color-near-black)]/20 to-transparent pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Subtle location tag pill overlay */}
                  <span
                    className="absolute bottom-3 left-3 px-3 py-1
                               font-[family-name:var(--font-body)] text-xs font-medium tracking-wide
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
                  <span className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)] opacity-70 uppercase tracking-widest flex items-center gap-2 font-medium">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-orange)] opacity-75 motion-reduce:hidden" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-orange)]" />
                    </span>
                    Host Campus
                  </span>
                </div>
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
                <dt className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-70 mb-1">
                  College
                </dt>
                <dd className="font-[family-name:var(--font-body)] font-semibold text-[var(--color-near-black)]">
                  {eventConfig.venue.college}
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-70 mb-1">
                  Room
                </dt>
                <dd className="font-[family-name:var(--font-body)] font-semibold text-[var(--color-near-black)]">
                  {eventConfig.venue.room}
                </dd>
              </div>
              <div>
                <dt className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest opacity-70 mb-1">
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
