/**
 * Navbar.jsx — fixed minimal navigation bar.
 *
 * Layout (plan section D):
 *   • IEDC logo mark — left, links to the hero (all breakpoints)
 *   • Section links — centre, hidden below 1024px
 *   • Register button — right, always visible including on mobile
 *
 * Behaviour:
 *   • Mobile menu toggle with aria-expanded
 *   • Smooth scroll via CSS; anchors use scroll-margin-top
 *
 * Phase 1 fixes:
 *   • #d4901f replaced with --color-orange-hover
 *   • Focus ring uses --focus-ring token (cream on dark background)
 *   • Mobile wordmark shortened below sm to prevent crowding
 */
import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import nav from '../../data/nav.js'
import useScrollSpy from '../../hooks/useScrollSpy.js'
import MobileMenu from './MobileMenu.jsx'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef(null)
  const navRef = useRef(null)
  const indicatorRef = useRef(null)
  const shownRef = useRef(false)

  // Scrollspy: nav.js is the source of truth for tracked sections and their order
  const activeId = useScrollSpy(nav.map((n) => n.href.slice(1)))

  // Shared underline: one element moved with translateX + scaleX (never width/left animation)
  function placeIndicator() {
    const bar = indicatorRef.current
    const wrap = navRef.current
    if (!bar || !wrap) return
    const link = activeId ? wrap.querySelector(`a[href="#${activeId}"]`) : null
    if (!link) {
      bar.style.opacity = '0'
      shownRef.current = false
      return
    }
    const x = link.offsetLeft
    const w = link.offsetWidth
    if (!shownRef.current) {
      // first appearance: place without travelling from the previous/zero position
      bar.style.transition = 'none'
      bar.style.transform = `translateX(${x}px) scaleX(${w})`
      void bar.offsetWidth
      bar.style.transition = ''
      shownRef.current = true
    } else {
      bar.style.transform = `translateX(${x}px) scaleX(${w})`
    }
    bar.style.opacity = '1'
  }

  useLayoutEffect(placeIndicator, [activeId])

  // Keep the underline aligned when the links resize (font swap, viewport change)
  useEffect(() => {
    const wrap = navRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(() => { shownRef.current && placeIndicator() })
    wrap.querySelectorAll('a').forEach((a) => ro.observe(a))
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [activeId])

  const toggleMenu = () => setMenuOpen((v) => !v)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header
        role="banner"
        data-theme="dark"
        className="fixed top-0 inset-x-0 z-[var(--z-nav)] h-16 flex items-center px-5 md:px-8
                   bg-[var(--color-near-black)] text-[var(--color-cream)]"
      >
        {/* IEDC logo mark — same on every breakpoint */}
        <a
          href="#hero"
          aria-label="IEDC BOOTCAMP CEC — back to top"
          className="font-[family-name:var(--font-display)] text-sm tracking-widest uppercase
                     text-[var(--color-cream)] no-underline shrink-0 mr-4
                     focus-visible:outline-[var(--color-cream)]"
        >
          <picture className="block">
            <source srcSet="/images/iedc-mark-cream.webp" type="image/webp" />
            <img
              src="/images/iedc-mark-cream.png"
              alt=""
              width="560"
              height="224"
              decoding="async"
              className="block h-7 sm:h-8 w-auto"
            />
          </picture>
        </a>

        {/* Desktop nav — centre (omits Register since it is already the dedicated CTA on the right) */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex flex-1 justify-center"
        >
         <div ref={navRef} className="relative flex gap-8">
          {nav
            .filter((item) => item.href !== '#registration')
            .map(({ label, href }) => (
              <a
                key={href}
                href={href}
                aria-current={activeId === href.slice(1) ? 'true' : undefined}
                className="font-[family-name:var(--font-body)] text-sm font-medium tracking-wide
                           text-[var(--color-cream)] no-underline opacity-80
                           aria-[current=true]:opacity-100
                           hover:opacity-100 hover:text-[var(--color-orange)]
                           transition-colors duration-[var(--duration-fast)]
                           focus-visible:outline-[var(--color-cream)]"
              >
                {label}
              </a>
            ))}
          {/* Shared active indicator: 1px-wide, scaled to the link width */}
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="nav-indicator pointer-events-none absolute left-0 -bottom-1.5 h-0.5 w-px
                       bg-[var(--color-orange)] origin-left opacity-0"
          />
         </div>
        </nav>

        {/* Right side — Register CTA (always visible) + hamburger */}
        <div className="ml-auto flex items-center gap-4">
          <a
            href="#registration"
            aria-current={activeId === 'registration' ? 'true' : undefined}
            data-on={activeId === 'registration' ? 'true' : undefined}
            className="brutal font-[family-name:var(--font-body)] text-sm font-semibold uppercase
                       tracking-wide px-5 py-2 min-h-[44px] flex items-center
                       text-[var(--color-near-black)]
                       [--b-face:var(--color-orange)] hover:[--b-face:var(--color-orange-hover)]
                       rounded-[var(--radius-sm)]
                       focus-visible:outline-[var(--color-cream)]"
          >
            Register
          </a>

          {/* Hamburger — only below 1024px */}
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={toggleMenu}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px]
                       text-[var(--color-cream)] focus-visible:outline-[var(--color-cream)]"
          >
            <span
              className={`block w-6 h-0.5 bg-current transition-transform duration-[var(--duration-normal)]
                          ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-opacity duration-[var(--duration-normal)]
                          ${menuOpen ? 'opacity-0' : 'opacity-100'}`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-transform duration-[var(--duration-normal)]
                          ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </header>

      <MobileMenu
        id="mobile-menu"
        isOpen={menuOpen}
        onClose={closeMenu}
        triggerRef={triggerRef}
        activeId={activeId}
      />
    </>
  )
}
