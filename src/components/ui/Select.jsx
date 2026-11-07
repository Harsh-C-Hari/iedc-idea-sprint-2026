/**
 * Select.jsx — labelled select dropdown.
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
        className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-wider
                   text-[var(--color-near-black)]"
      >
        {label}
        {required && <span aria-hidden="true" className="ml-0.5 text-[var(--color-orange)]">*</span>}
      </label>

      <select
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
          appearance-none cursor-pointer
          ${showError
            ? 'border-red-600 focus-visible:border-red-600'
            : 'border-[var(--color-near-black)] border-opacity-20 focus-visible:border-[var(--color-near-black)]'}
        `}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

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
