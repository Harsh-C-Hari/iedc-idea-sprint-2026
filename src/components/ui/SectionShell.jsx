/**
 * SectionShell.jsx — wrapper for every page section.
 *
 * Renders a <section> with id, aria-labelledby, and optional theme
 * ('light' = cream bg, 'dark' = near-black bg).
 * Content is visible by default; animation applied externally via GSAP.
 */
export default function SectionShell({
  id,
  labelId,
  theme = 'light',
  className = '',
  children,
  ...rest
}) {
  const bgClass = theme === 'dark'
    ? 'bg-[var(--color-near-black)] text-[var(--color-cream)]'
    : 'bg-[var(--color-cream)] text-[var(--color-near-black)]'

  return (
    <section
      id={id}
      aria-labelledby={labelId}
      data-theme={theme}
      className={`${bgClass} ${className}`}
      {...rest}
    >
      {children}
    </section>
  )
}
