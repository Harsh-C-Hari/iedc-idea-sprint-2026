/**
 * Footer.jsx — section 8 and page footer.
 *
 * Content (plan section D):
 *   • Closing headline from data/content.js (footerHeadline) — verbatim
 *   • IEDC BOOTCAMP CEC wordmark (typographic — no logo until verified)
 *   • IDEA SPRINT 2026
 *   • Nav links (all six sections)
 *   • Instagram and LinkedIn only when verified in config (not null)
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
                 text-[var(--color-cream)] opacity-50 hover:opacity-100
                 transition-opacity duration-[var(--duration-fast)]
                 focus-visible:outline-[var(--color-cream)]
                 flex items-center gap-2"
    >
      <span aria-hidden="true">↑</span> Back to top
    </button>
  )
}

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
        <div className="mb-16 lg:mb-20">
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

        {/* Footer nav + info grid */}
        <div className="border-t border-[var(--color-cream)]/10 pt-10
                        grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Wordmark + event */}
          <div className="flex flex-col gap-3">
            <p className="font-[family-name:var(--font-display)] text-sm tracking-widest uppercase
                          text-[var(--color-cream)]">
              IEDC BOOTCAMP CEC
            </p>
            <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-cream)] opacity-50">
              IDEA SPRINT 2026
            </p>
            <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-cream)] opacity-40">
              {eventConfig.college}
            </p>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {nav.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="font-[family-name:var(--font-body)] text-sm
                               text-[var(--color-cream)] opacity-60
                               hover:opacity-100 no-underline
                               transition-opacity duration-[var(--duration-fast)]
                               focus-visible:outline-[var(--color-cream)]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social + contact — hidden when null (plan section H) */}
          <div className="flex flex-col gap-3">
            {eventConfig.social.instagram && (
              <a
                href={eventConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-[family-name:var(--font-body)] text-sm
                           text-[var(--color-cream)] opacity-60 hover:opacity-100
                           no-underline transition-opacity duration-[var(--duration-fast)]
                           focus-visible:outline-[var(--color-cream)]"
              >
                Instagram ↗
              </a>
            )}
            {eventConfig.social.linkedin && (
              <a
                href={eventConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-[family-name:var(--font-body)] text-sm
                           text-[var(--color-cream)] opacity-60 hover:opacity-100
                           no-underline transition-opacity duration-[var(--duration-fast)]
                           focus-visible:outline-[var(--color-cream)]"
              >
                LinkedIn ↗
              </a>
            )}
            {eventConfig.contact.email && (
              <a
                href={`mailto:${eventConfig.contact.email}`}
                className="font-[family-name:var(--font-body)] text-sm
                           text-[var(--color-cream)] opacity-60 hover:opacity-100
                           no-underline transition-opacity duration-[var(--duration-fast)]
                           focus-visible:outline-[var(--color-cream)]"
              >
                {eventConfig.contact.email}
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--color-cream)]/10
                        flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-cream)] opacity-30">
            © 2026 IEDC BOOTCAMP CEC. All rights reserved.
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
