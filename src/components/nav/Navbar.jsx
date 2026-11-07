/**
 * Navbar.jsx — fixed minimal navigation bar.
 *
 * Layout (plan section D):
 *   • IEDC BOOTCAMP CEC wordmark — left
 *   • Section links — centre, hidden below 1024 px
 *   • Register button — right, always visible including on mobile
 *
 * Behaviour:
 *   • Mobile menu toggle with aria-expanded
 *   • Smooth scroll via CSS; anchors use scroll-margin-top
 */
import { useState, useRef } from 'react'
import nav from '../../data/nav.js'
import MobileMenu from './MobileMenu.jsx'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef(null)

  const toggleMenu = () => setMenuOpen((v) => !v)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header
        role="banner"
        className="fixed top-0 inset-x-0 z-[var(--z-nav)] h-16 flex items-center px-5 md:px-8
                   bg-[var(--color-near-black)] text-[var(--color-cream)]"
      >
        {/* Wordmark */}
        <a
          href="#hero"
          aria-label="IEDC BOOTCAMP CEC — back to top"
          className="font-[family-name:var(--font-display)] text-sm tracking-widest uppercase
                     text-[var(--color-cream)] no-underline shrink-0 focus-visible:outline-[var(--color-cream)]"
        >
          IEDC BOOTCAMP CEC
        </a>

        {/* Desktop nav — centre */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex flex-1 justify-center gap-8"
        >
          {nav.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="font-[family-name:var(--font-body)] text-sm font-medium tracking-wide
                         text-[var(--color-cream)] no-underline opacity-80
                         hover:opacity-100 hover:text-[var(--color-orange)]
                         transition-colors duration-[var(--duration-fast)]
                         focus-visible:outline-[var(--color-cream)]"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right side — Register CTA (always visible) + hamburger */}
        <div className="ml-auto flex items-center gap-4">
          <a
            href="#registration"
            className="font-[family-name:var(--font-body)] text-sm font-semibold uppercase
                       tracking-wide px-5 py-2 min-h-[40px] flex items-center
                       bg-[var(--color-orange)] text-[var(--color-near-black)]
                       rounded-[var(--radius-sm)]
                       hover:bg-[#d4901f] transition-colors duration-[var(--duration-fast)]
                       focus-visible:outline-[var(--color-cream)]"
          >
            Register
          </a>

          {/* Hamburger — only below 1024 px */}
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
      />
    </>
  )
}
