/**
 * Field.jsx — labelled text/email/tel input.
 *
 * Accessibility (plan section B + G):
 *   • Visible label always present
 *   • aria-invalid on error
 *   • Error linked by aria-describedby
 *   • Minimum height 48px for touch targets
 *   • Focus ring is near-black (plan section A)
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
        className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-wider
                   text-[var(--color-near-black)]"
      >
        {label}
        {isLeader && (
          <span className="ml-2 text-[0.65rem] font-normal normal-case tracking-normal
                           opacity-50">
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
          text-[var(--color-near-black)] bg-white
          border-2 rounded-[var(--radius-sm)]
          transition-colors duration-[var(--duration-fast)]
          focus-visible:outline-none
          ${showError
            ? 'border-red-600 focus-visible:border-red-600'
            : 'border-[var(--color-near-black)] border-opacity-20 focus-visible:border-[var(--color-near-black)]'}
        `}
        {...inputProps}
      />

      {showError && (
        <p
          id={errorId}
          role="alert"
          className="font-[family-name:var(--font-body)] text-xs text-red-600 mt-0.5"
        >
          {error}
        </p>
      )}
    </div>
  )
}
