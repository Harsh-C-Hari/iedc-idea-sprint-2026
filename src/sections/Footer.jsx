/**
 * Footer.jsx — section 8 and page footer.
 *
 * Content (plan section D):
 *   • Closing headline from data/content.js (footerHeadline) — verbatim
 *   • IEDC BOOTCAMP CEC wordmark (typographic — no logo until verified)
 *   • IDEA SPRINT 2026
 *   • Nav links (all six sections), compact grid
 *   • Social as icon buttons (SocialLinks); each hidden when null in config
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
import SocialLinks from '../components/ui/SocialLinks.jsx'
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
  opacity-80 hover:opacity-100 no-underline inline-flex items-center min-h-[44px]
  transition-opacity duration-[var(--duration-fast)]
  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cream)]`

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
                 flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] shrink-0"
    >
      <span aria-hidden="true">↑</span>
      <span aria-hidden="true" className="hidden sm:inline">Back to top</span>
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
                 px-5 md:px-8 lg:px-16 pt-14 md:pt-20 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-6 overflow-hidden"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto">

        {/* Closing headline */}
        <div className="mb-8 lg:mb-12">
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
        <div className="border-t border-[var(--color-cream)]/10 pt-6 mb-8"
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

        {/* Brand + social | Explore — one row from md up, no column drives dead space */}
        <div className="grid gap-8 md:grid-cols-12 md:gap-x-10 items-start">

          {/* Brand column: logo, organiser line, social icons directly beneath */}
          <div className="md:col-span-7 lg:col-span-6 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3
                          md:flex md:flex-row md:items-center md:gap-5">
            <picture className="col-start-1 row-start-1">
              <source srcSet="/images/iedc-logo-cream.webp" type="image/webp" />
              <img
                src="/images/iedc-logo-cream.png"
                alt="IEDC logo"
                width="560"
                height="333"
                loading="lazy"
                decoding="async"
                className="w-32 md:w-40 h-auto md:shrink-0"
                style={{ aspectRatio: '560 / 333' }}
              />
            </picture>
            {/* display:contents on mobile keeps the grid placement; from md it stacks beside the logo */}
            <div className="contents md:flex md:flex-col md:items-start md:gap-3 md:min-w-0">
              <p className="col-span-2 row-start-2 font-[family-name:var(--font-body)] text-sm text-[var(--color-cream)]/80">
                {eventConfig.organizer} · {eventConfig.college}
              </p>
              <SocialLinks className="col-start-2 row-start-1 justify-end md:justify-start" />
            </div>
          </div>

          {/* Explore column: compact link grid */}
          <nav aria-label="Footer navigation" className="md:col-span-5 lg:col-span-6">
            <h2 className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                           text-[var(--color-cream)]/70 mb-1">
              Explore
            </h2>
            <ul className="list-none p-0 m-0 grid grid-cols-2 min-[360px]:grid-cols-3 gap-x-4 xl:flex xl:gap-x-8">
              {nav.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className={linkCls}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-[var(--color-cream)]/10
                        flex flex-row justify-between items-center gap-4">
          <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-cream)] opacity-70">
            © 2026 IEDC BOOTCAMP CEC.<span className="hidden sm:inline"> All rights reserved.</span>
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
