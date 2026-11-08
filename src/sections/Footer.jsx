/**
 * Footer.jsx — section 8 and page footer.
 *
 * Content (plan section D):
 *   • Closing headline from data/content.js (footerHeadline) — verbatim
 *   • IEDC BOOTCAMP CEC wordmark (typographic — no logo until verified)
 *   • IDEA SPRINT 2026
 *   • Nav links (all six sections)
 *   • Instagram, LinkedIn, website and email each hidden when null in config
 *   • Email only when approved in config (not null)
 *   • © 2026 IEDC BOOTCAMP CEC
 *
 * BackToTop (plan section D):
 *   • Scrolls to hero (instant under reduced motion)
 *   • Moves focus to the h1 (plan section D)
 *
 * Large spark placeholder — art added in T13.
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import nav from '../data/nav.js'
import eventConfig from '../config/eventConfig.js'
import { footerHeadline } from '../data/content.js'
import { gsap } from '../motion/gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** Shared footer link style: 44px touch target, visible focus ring, readable on near-black */
const linkCls = `font-[family-name:var(--font-body)] text-sm text-[var(--color-cream)]
  opacity-80 hover:opacity-100 no-underline inline-flex items-center min-h-[44px] py-2
  transition-opacity duration-[var(--duration-fast)]
  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cream)]`

/** External link: new tab, noopener, descriptive accessible name */
function ExtLink({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={linkCls}>
      {children}<span aria-hidden="true" className="ml-1">↗</span>
    </a>
  )
}

/** Back to top button */
function BackToTop() {
  function handleClick() {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Move focus to h1 (plan section D)
    setTimeout(() => {
      const h1 = document.querySelector('h1')
      h1?.focus()
    }, 400)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                 text-[var(--color-cream)] opacity-70 hover:opacity-100
                 transition-opacity duration-[var(--duration-fast)]
                 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cream)]
                 flex items-center gap-2 min-h-[44px]"
    >
      <span aria-hidden="true">↑</span> Back to top
    </button>
  )
}

const hasContact = Boolean(
  eventConfig.social.instagram ||
  eventConfig.social.linkedin ||
  eventConfig.contact.email ||
  eventConfig.contact.website
)

export default function Footer() {
  const footerRef = useRef(null)

  // Headline clip reveal (plan section D, T15)
  useGSAP(() => {
    if (REDUCED) return
    const el = footerRef.current
    if (!el) return
    const lines = el.querySelectorAll('[data-footer-line]')
    if (!lines.length) return
    lines.forEach((line, i) => {
      gsap.set(line, { clipPath: 'inset(0 100% 0 0)' })
      gsap.to(line, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        ease: 'power4.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
        },
      })
    })
  }, { scope: footerRef, dependencies: [] })

  return (
    <footer
      id="footer"
      ref={footerRef}
      className="bg-[var(--color-near-black)] text-[var(--color-cream)]
                 px-5 md:px-8 lg:px-16 pt-20 pb-10 overflow-hidden"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto">

        {/* Closing headline */}
        <div className="mb-12 lg:mb-16">
          <p
            aria-label={footerHeadline.join(' ')}
            className="font-[family-name:var(--font-display)]
                       text-[clamp(3rem,10vw,8rem)] leading-[0.95] tracking-[-0.03em]
                       text-[var(--color-cream)]"
          >
            {footerHeadline.map((line, i) => (
              <span key={i} data-footer-line className="block overflow-hidden">
                <span className="block">
                  {i === 1
                    ? <span className="text-[var(--color-orange)]">{line}</span>
                    : line}
                </span>
              </span>
            ))}
          </p>
        </div>

        {/* Event name — one line, scaled to the full container width via container units */}
        <div className="border-t border-[var(--color-cream)]/10 pt-8 mb-12"
             style={{ containerType: 'inline-size' }}>
          <p
            className="font-[family-name:var(--font-display)] uppercase whitespace-nowrap
                       leading-[0.9] tracking-[-0.02em] text-[var(--color-cream)]"
            style={{ fontSize: '9.9cqw' }}
          >
            {eventConfig.name.replace(' 2026', '')}{' '}
            <span className="text-[var(--color-orange)]">2026</span>
          </p>
        </div>

        {/* Logo + links */}
        <div className="pb-10 flex flex-col md:flex-row justify-between items-start gap-10">

          {/* Logo + organiser (space reserved: 560x333) */}
          <div className="flex flex-col gap-4">
            <picture>
              <source srcSet="/images/iedc-logo-cream.webp" type="image/webp" />
              <img
                src="/images/iedc-logo-cream.png"
                alt="IEDC logo"
                width="560"
                height="333"
                loading="lazy"
                decoding="async"
                className="w-40 md:w-48 h-auto"
                style={{ aspectRatio: '560 / 333' }}
              />
            </picture>
            <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-cream)]/80">
              {eventConfig.organizer} · {eventConfig.college}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-10 md:gap-16 md:ml-auto text-left">
            {/* Contact + social — each hidden when null (plan section H) */}
            {hasContact && (
              <div>
                <h2 className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                               text-[var(--color-cream)]/70 mb-2">
                  Contact &amp; social
                </h2>
                <ul className="list-none p-0 m-0 flex flex-col items-start">
                  {eventConfig.social.linkedin && (
                    <li>
                      <ExtLink
                        href={eventConfig.social.linkedin}
                        label={`${eventConfig.organizer} on LinkedIn (opens in new tab)`}
                      >
                        LinkedIn
                      </ExtLink>
                    </li>
                  )}
                  {eventConfig.social.instagram && (
                    <li>
                      <ExtLink
                        href={eventConfig.social.instagram}
                        label={`${eventConfig.organizer} on Instagram (opens in new tab)`}
                      >
                        Instagram
                      </ExtLink>
                    </li>
                  )}
                  {eventConfig.contact.website && (
                    <li>
                      <ExtLink
                        href={eventConfig.contact.website}
                        label={`${eventConfig.organizer} website, ${eventConfig.contact.websiteLabel || eventConfig.contact.website} (opens in new tab)`}
                      >
                        {eventConfig.contact.websiteLabel || eventConfig.contact.website}
                      </ExtLink>
                    </li>
                  )}
                  {eventConfig.contact.email && (
                    <li>
                      <a href={`mailto:${eventConfig.contact.email}`} className={linkCls}>
                        {eventConfig.contact.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Nav links */}
            <nav aria-label="Footer navigation">
              <h2 className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                             text-[var(--color-cream)]/70 mb-2">
                Explore
              </h2>
              <ul className="list-none p-0 m-0 flex flex-col items-start">
                {nav.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} className={linkCls}>{label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--color-cream)]/10
                        flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-cream)] opacity-70">
            © 2026 IEDC BOOTCAMP CEC. All rights reserved.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
