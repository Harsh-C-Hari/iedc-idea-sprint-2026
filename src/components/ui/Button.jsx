/**
 * Button.jsx — reusable button primitive.
 *
 * Variants:
 *   'primary'       — near-black fill, cream text (use on cream/dark backgrounds)
 *   'orange'        — orange fill, near-black text (plan section A: near-black on orange ~5.3:1)
 *   'outline'       — cream fill, near-black border and text (on cream)
 *   'outline-light' — near-black fill, cream border and text (on dark)
 *   'lime'          — lime fill, near-black text (near-black sections only)
 *
 * Hover system: see .brutal in index.css. Orange variant on a CREAM surface would hide its
 * orange block; it is only used on dark sections.
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

  // .brutal (index.css) supplies position, lift, offset block, press and focus ring offset.
  // Fill and border live on the ::before face, driven by --b-face / --b-edge / --b-bw.
  const base =
    'brutal inline-flex items-center justify-center font-[family-name:var(--font-body)] font-semibold ' +
    'tracking-wide uppercase rounded-[var(--radius-sm)] ' +
    'focus-visible:outline-[var(--focus-ring,var(--color-near-black))] ' +
    'cursor-pointer select-none'

  const disabledClass = disabled
    ? (isAnchor ? 'opacity-50 pointer-events-none' : 'disabled:opacity-50 disabled:cursor-not-allowed')
    : ''

  const sizes = {
    md: 'px-6 py-3 text-sm min-h-[48px]',
    lg: 'px-8 py-4 text-base min-h-[56px]',
  }

  const variants = {
    // near-black face on cream surfaces; block orange (default)
    primary:
      'text-[var(--color-cream)] [--b-face:var(--color-near-black)] hover:[--b-face:#2a2420]',
    // orange face; used on near-black sections, block lime (dark default)
    orange:
      'text-[var(--color-near-black)] [--b-face:var(--color-orange)] hover:[--b-face:var(--color-orange-hover)]',
    // lime face with near-black text; for near-black sections only, block orange
    lime:
      'text-[var(--color-near-black)] [--b-face:var(--color-lime)] hover:[--b-face:#c3db5f] [--b-color:var(--color-orange)]',
    // cream-surface outline: solid cream face so the block never shows through
    outline:
      'text-[var(--color-near-black)] [--b-face:var(--color-cream)] [--b-edge:var(--color-near-black)] [--b-bw:2px] ' +
      'hover:[--b-face:var(--color-near-black)] hover:text-[var(--color-cream)]',
    // near-black-surface outline: solid near-black face
    'outline-light':
      'text-[var(--color-cream)] [--b-face:var(--color-near-black)] [--b-edge:var(--color-cream)] [--b-bw:2px] ' +
      'hover:[--b-face:var(--color-cream)] hover:text-[var(--color-near-black)]',
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
