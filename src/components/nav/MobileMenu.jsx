/**
 * MobileMenu.jsx — full-screen near-black overlay nav for < 1024 px.
 *
 * Behaviour (plan section D, Navbar):
 *   • Opened by a disclosure button with aria-expanded.
 *   • Esc or any link click closes it and returns focus to the trigger button.
 *   • Traps focus while open.
 */
import { useEffect, useRef } from 'react'
import nav from '../../data/nav.js'

export default function MobileMenu({ isOpen, onClose, triggerRef }) {
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
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      hidden={!isOpen}
      className={`
        fixed inset-0 z-[var(--z-modal)]
        bg-[var(--color-near-black)] text-[var(--color-cream)]
        flex flex-col justify-center items-center gap-8
        transition-opacity duration-[var(--duration-normal)]
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <nav aria-label="Mobile navigation">
        <ul className="list-none m-0 p-0 flex flex-col items-center gap-6">
          {nav.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={handleLinkClick}
                className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-cream)] no-underline hover:text-[var(--color-orange)] focus-visible:outline-[var(--color-cream)] transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Register CTA */}
      <a
        href="#registration"
        onClick={handleLinkClick}
        className="mt-4 px-8 py-4 bg-[var(--color-orange)] text-[var(--color-near-black)] font-[family-name:var(--font-body)] font-semibold uppercase tracking-wide rounded-[var(--radius-sm)] text-base min-h-[48px] flex items-center hover:bg-[#d4901f] transition-colors"
      >
        Register
      </a>
    </div>
  )
}
