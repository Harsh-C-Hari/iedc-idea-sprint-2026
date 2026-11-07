/**
 * Select.jsx — labelled select dropdown.
 *
 * Uses semantic theme tokens (--fg, --fg-muted, --line, --field-bg, --focus-ring)
 * set by [data-theme] on the nearest SectionShell.
 * Includes an inline SVG chevron so appearance-none selects have a visible arrow
 * on both light and dark sections.
 *
 * Same accessibility pattern as Field.
 */
export default function Select({
  id,
  label,
  error,
  touched,
  required,
  options = [],
  placeholder,
  className = '',
  ...selectProps
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
        {required && <span aria-hidden="true" className="ml-0.5 text-[var(--color-orange)]">*</span>}
      </label>

      {/* Wrapper for relative positioning of the chevron */}
      <div className="relative">
        <select
          id={id}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? errorId : undefined}
          required={required}
          className={`
            w-full px-4 py-3 pr-10 min-h-[48px]
            font-[family-name:var(--font-body)] text-sm
            border-2 rounded-[var(--radius-sm)]
            transition-colors duration-[var(--duration-fast)]
            focus-visible:outline-none
            appearance-none cursor-pointer
            ${showError
              ? 'border-red-500 focus-visible:border-red-500'
              : 'focus-visible:border-[var(--focus-ring,var(--color-near-black))]'}
          `}
          style={{
            color:           'var(--fg)',
            backgroundColor: 'var(--field-bg)',
            borderColor:     showError ? undefined : 'var(--line)',
          }}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ color: '#171717', backgroundColor: '#fff' }}>
              {opt}
            </option>
          ))}
        </select>

        {/* Inline SVG chevron — colour matches --fg token */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
        >
          <svg
            width="16" height="16" viewBox="0 0 16 16"
            fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ color: 'var(--fg)', opacity: 0.65 }}
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {showError && (
        <p
          id={errorId}
          role="alert"
          className="font-[family-name:var(--font-body)] text-xs mt-0.5"
        >
          <span style={{ color: '#f87171' }}>{error}</span>
        </p>
      )}
    </div>
  )
}
