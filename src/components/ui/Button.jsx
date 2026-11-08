/**
 * Button.jsx — reusable button primitive.
 *
 * Variants:
 *   'primary'       — near-black fill, cream text (use on cream/dark backgrounds)
 *   'orange'        — orange fill, near-black text (plan section A: near-black on orange ~5.3:1)
 *   'outline'       — transparent fill, near-black border and text (on cream)
 *   'outline-light' — transparent fill, cream border and text (on dark)
 *
 * Size: 'md' (default) | 'lg'
 * Minimum touch target 48px height enforced via min-h.
 *
 * When rendered as <a> with disabled prop: uses aria-disabled + pointer-events-none
 * (the HTML `disabled` attribute has no effect on anchors).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  className = '',
  disabled,
  children,
  ...rest
}) {
  const isAnchor = Tag === 'a'

  // For <a> elements, translate disabled to aria attributes + pointer-events
  const anchorDisabledProps = isAnchor && disabled
    ? { 'aria-disabled': 'true', tabIndex: -1 }
    : {}

  const base =
    'inline-flex items-center justify-center font-[family-name:var(--font-body)] font-semibold ' +
    'tracking-wide uppercase rounded-[var(--radius-sm)] ' +
    'transition-[transform,background-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] ' +
    'hover:-translate-x-0.5 hover:-translate-y-0.5 ' +
    'active:translate-x-0 active:translate-y-0 active:shadow-none ' +
    // Focus ring uses theme-aware --focus-ring token
    'focus-visible:outline-[3px] focus-visible:outline-[var(--focus-ring,var(--color-near-black))] focus-visible:outline-offset-[3px] ' +
    'cursor-pointer select-none'

  const disabledClass = disabled
    ? (isAnchor ? 'opacity-50 pointer-events-none hover:transform-none hover:shadow-none' : 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none')
    : ''

  const sizes = {
    md: 'px-6 py-3 text-sm min-h-[48px]',
    lg: 'px-8 py-4 text-base min-h-[56px]',
  }

  const variants = {
    primary:
      'bg-[var(--color-near-black)] text-[var(--color-cream)] ' +
      'hover:bg-[#2a2420] hover:shadow-[3px_3px_0px_var(--color-orange)]',
    orange:
      'bg-[var(--color-orange)] text-[var(--color-near-black)] ' +
      'hover:bg-[var(--color-orange-hover)] hover:shadow-[3px_3px_0px_var(--color-near-black)]',
    outline:
      'border-2 border-[var(--color-near-black)] text-[var(--color-near-black)] ' +
      'hover:bg-[var(--color-near-black)] hover:text-[var(--color-cream)] hover:shadow-[3px_3px_0px_var(--color-orange)]',
    'outline-light':
      'border-2 border-[var(--color-cream)] text-[var(--color-cream)] ' +
      'hover:bg-[var(--color-cream)] hover:text-[var(--color-near-black)] hover:shadow-[3px_3px_0px_var(--color-orange)]',
  }

  return (
    <Tag
      className={`${base} ${disabledClass} ${sizes[size] ?? sizes.md} ${variants[variant] ?? variants.primary} ${className}`}
      disabled={!isAnchor ? disabled : undefined}
      {...anchorDisabledProps}
      {...rest}
    >
      {children}
    </Tag>
  )
}
