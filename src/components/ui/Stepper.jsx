/**
 * Stepper.jsx — step progress indicator.
 * Shows "Step N of 3" text + a progress bar on mobile.
 * Shows labelled step pills on desktop.
 */
const STEP_LABELS = ['Team', 'Participants', 'Review']

export default function Stepper({ step }) {
  const total = STEP_LABELS.length

  return (
    <div aria-label={`Step ${step + 1} of ${total}: ${STEP_LABELS[step]}`}>
      {/* Mobile: text + bar */}
      <div className="lg:hidden mb-6">
        <p className="font-[family-name:var(--font-body)] text-xs text-[var(--color-near-black)] opacity-50 mb-2">
          Step {step + 1} of {total} — {STEP_LABELS[step]}
        </p>
        <div
          className="h-1 bg-[var(--color-near-black)] bg-opacity-10 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={total}
        >
          <div
            className="h-full bg-[var(--color-orange)] rounded-full transition-all duration-[var(--duration-normal)]"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: pills */}
      <ol className="hidden lg:flex gap-6 mb-10 list-none p-0 m-0">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={i === step ? 'step' : undefined}
              className={`
                w-7 h-7 rounded-full flex items-center justify-center
                font-[family-name:var(--font-body)] text-xs font-semibold
                transition-colors duration-[var(--duration-fast)]
                ${i < step
                  ? 'bg-[var(--color-near-black)] text-[var(--color-cream)]'
                  : i === step
                  ? 'bg-[var(--color-orange)] text-[var(--color-near-black)]'
                  : 'bg-[var(--color-near-black)] bg-opacity-10 text-[var(--color-near-black)] opacity-40'}
              `}
            >
              {i + 1}
            </span>
            <span
              className={`
                font-[family-name:var(--font-body)] text-sm
                ${i === step
                  ? 'font-semibold text-[var(--color-near-black)]'
                  : 'text-[var(--color-near-black)] opacity-40'}
              `}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
