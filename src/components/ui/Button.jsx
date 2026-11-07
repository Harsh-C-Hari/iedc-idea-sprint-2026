/**
 * Button.jsx — reusable button primitive.
 *
 * Variants:
 *   'primary'   — near-black fill, cream text (use on cream/dark backgrounds)
 *   'orange'    — orange fill, near-black text (plan section A: near-black on orange ~5.3:1)
 *   'outline'   — transparent fill, near-black border and text (on cream)
 *   'outline-light' — transparent fill, cream border and text (on dark)
 *
 * Size: 'md' (default) | 'lg'
 * Minimum touch target 48px height enforced via min-h.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  className = '',
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center font-[family-name:var(--font-body)] font-semibold ' +
    'tracking-wide uppercase rounded-[var(--radius-sm)] ' +
    'transition-colors duration-[var(--duration-fast)] ' +
    'focus-visible:outline-[3px] focus-visible:outline-[var(--color-near-black)] focus-visible:outline-offset-[3px] ' +
    'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const sizes = {
    md: 'px-6 py-3 text-sm min-h-[48px]',
    lg: 'px-8 py-4 text-base min-h-[56px]',
  }

  const variants = {
    primary: 'bg-[var(--color-near-black)] text-[var(--color-cream)] hover:bg-[#2a2420]',
    orange: 'bg-[var(--color-orange)] text-[var(--color-near-black)] hover:bg-[#d4901f]',
    outline: 'border-2 border-[var(--color-near-black)] text-[var(--color-near-black)] hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)]',
    'outline-light': 'border-2 border-[var(--color-cream)] text-[var(--color-cream)] hover:bg-[var(--color-cream)] hover:text-[var(--color-near-black)]',
  }

  return (
    <Tag
      className={`${base} ${sizes[size] ?? sizes.md} ${variants[variant] ?? variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
