/**
 * MobileMenu.jsx — full-screen near-black overlay nav for < 1024 px.
 *
 * Behaviour (plan section D, Navbar):
 *   • Opened by a disclosure button with aria-expanded.
 *   • Esc or any link click closes it and returns focus to the trigger button.
 *   • Traps focus while open.
 *
 * Phase 1 fixes:
 *   • #d4901f replaced with --color-orange-hover
 *   • Removed the `hidden` attribute (caused transition to never animate — the
 *     element was removed from layout before the opacity transition could start).
 *     Replaced with visibility + pointer-events toggling so the CSS transition works.
 *   • Focus ring is cream (dark section).
 */
import { useEffect, useRef } from 'react'
import nav from '../../data/nav.js'

export default function MobileMenu({ id, isOpen, onClose, triggerRef, activeId = null }) {
  const menuRef = useRef(null)

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        triggerRef?.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, triggerRef])

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  /* Focus first link when opened */
  useEffect(() => {
    if (isOpen) {
      const first = menuRef.current?.querySelector('a')
      first?.focus()
    }
  }, [isOpen])

  const handleLinkClick = () => {
    onClose()
    triggerRef?.current?.focus()
  }

  return (
    <div
      id={id}
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      data-theme="dark"
      /* Keep in DOM always so transition animates; toggle via visibility + pointer-events */
      className={`
        fixed inset-0 z-[var(--z-modal)]
        bg-[var(--color-near-black)] text-[var(--color-cream)]
        flex flex-col justify-center items-center gap-8
        transition-[opacity,visibility] duration-[var(--duration-normal)]
        ${isOpen
          ? 'opacity-100 visible pointer-events-auto'
          : 'opacity-0 invisible pointer-events-none'}
      `}
    >
      <button
        type="button"
        onClick={() => { onClose(); triggerRef?.current?.focus() }}
        tabIndex={isOpen ? undefined : -1}
        aria-label="Close navigation menu"
        className="absolute top-3 right-4 w-12 h-12 flex items-center justify-center
                   text-[var(--color-cream)] focus-visible:outline-[var(--color-cream)]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>

      <nav aria-label="Mobile navigation">
        <ul className="list-none m-0 p-0 flex flex-col items-center gap-6">
          {nav.filter((item) => item.href !== '#registration').map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={handleLinkClick}
                tabIndex={isOpen ? undefined : -1}
                aria-current={activeId === href.slice(1) ? 'true' : undefined}
                className="relative font-[family-name:var(--font-display)] text-4xl text-[var(--color-cream)] no-underline
                           hover:text-[var(--color-orange)]
                           focus-visible:outline-[var(--color-cream)]
                           transition-colors"
              >
                {/* Lime marker for the active section (reserved, absolutely positioned: no layout shift) */}
                <span
                  aria-hidden="true"
                  className={`absolute -left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[var(--color-lime)]
                              ${activeId === href.slice(1) ? 'opacity-100' : 'opacity-0'}`}
                />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Register CTA */}
      <a
        href="#registration"
        aria-current={activeId === 'registration' ? 'true' : undefined}
        data-on={activeId === 'registration' ? 'true' : undefined}
        onClick={handleLinkClick}
        tabIndex={isOpen ? undefined : -1}
        className="brutal mt-4 px-8 py-4 text-[var(--color-near-black)]
                   [--b-face:var(--color-orange)] hover:[--b-face:var(--color-orange-hover)]
                   font-[family-name:var(--font-body)] font-semibold uppercase tracking-wide
                   rounded-[var(--radius-sm)] text-base min-h-[48px] flex items-center
                   focus-visible:outline-[var(--color-cream)]"
      >
        Register
      </a>
    </div>
  )
}
