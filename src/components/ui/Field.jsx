/**
 * Field.jsx — labelled text/email/tel input.
 *
 * Uses semantic theme tokens (--fg, --fg-muted, --line, --field-bg, --focus-ring)
 * set by [data-theme] on the nearest SectionShell, so it works on both
 * light (cream) and dark (near-black) sections without hard-coded colours.
 *
 * Accessibility (plan section B + G):
 *   • Visible label always present
 *   • aria-invalid on error
 *   • Error linked by aria-describedby
 *   • Minimum height 48px for touch targets
 *   • Focus ring driven by --focus-ring token (theme-aware)
 */
export default function Field({
  id,
  label,
  error,
  touched,
  required,
  className = '',
  isLeader = false,
  ...inputProps
}) {
  const errorId   = `${id}-error`
  const showError = touched && error

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={id}
        className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--fg)' }}
      >
        {label}
        {isLeader && (
          <span className="ml-2 text-[0.65rem] font-normal normal-case tracking-normal"
                style={{ opacity: 0.65 }}>
            (Team Lead)
          </span>
        )}
        {required && <span aria-hidden="true" className="ml-0.5 text-[var(--color-orange)]">*</span>}
      </label>

      <input
        id={id}
        aria-invalid={showError ? 'true' : 'false'}
        aria-describedby={showError ? errorId : undefined}
        required={required}
        className={`
          w-full px-4 py-3 min-h-[48px]
          font-[family-name:var(--font-body)] text-sm
          border-2 rounded-[var(--radius-sm)]
          transition-colors duration-[var(--duration-fast)]
          focus-visible:outline-none
          placeholder:opacity-65
          ${showError
            ? 'border-red-500 focus-visible:border-red-500'
            : 'focus-visible:border-[var(--focus-ring,var(--color-near-black))]'}
        `}
        style={{
          color:           'var(--fg)',
          backgroundColor: 'var(--field-bg)',
          borderColor:     showError ? undefined : 'var(--line)',
        }}
        {...inputProps}
      />

      {showError && (
        <p
          id={errorId}
          role="alert"
          className="font-[family-name:var(--font-body)] text-xs mt-0.5"
          style={{ color: 'var(--fg-muted)' }}
        >
          <span style={{ color: '#f87171' }}>{error}</span>
        </p>
      )}
    </div>
  )
}
