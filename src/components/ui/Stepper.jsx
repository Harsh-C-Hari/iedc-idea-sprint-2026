/**
 * Stepper.jsx — step progress indicator.
 * Shows "Step N of 3" text + a progress bar on mobile.
 * Shows labelled step pills on desktop.
 *
 * Uses --fg, --fg-muted, --line tokens from [data-theme] on the nearest
 * SectionShell so it renders correctly on both light and dark sections.
 * Replaces v3 bg-opacity-* / border-opacity-* (removed in Tailwind v4).
 */
const STEP_LABELS = ['Team', 'Participants', 'Review']

export default function Stepper({ step }) {
  const total = STEP_LABELS.length

  return (
    <div aria-label={`Step ${step + 1} of ${total}: ${STEP_LABELS[step]}`}>
      {/* Mobile: text + bar */}
      <div className="lg:hidden mb-6">
        <p
          className="font-[family-name:var(--font-body)] text-xs mb-2"
          style={{ color: 'var(--fg-muted)' }}
        >
          Step {step + 1} of {total} — {STEP_LABELS[step]}
        </p>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--line)' }}
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
        {STEP_LABELS.map((label, i) => {
          const isDone    = i < step
          const isCurrent = i === step

          return (
            <li key={label} className="flex items-center gap-2">
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center
                  font-[family-name:var(--font-body)] text-xs font-semibold
                  transition-colors duration-[var(--duration-fast)]
                `}
                style={
                  isDone
                    ? { backgroundColor: 'var(--fg)', color: 'var(--field-bg)' }
                    : isCurrent
                    ? { backgroundColor: 'var(--color-orange)', color: 'var(--color-near-black)' }
                    : { backgroundColor: 'var(--line)', color: 'var(--fg-muted)' }
                }
              >
                {i + 1}
              </span>
              <span
                className="font-[family-name:var(--font-body)] text-sm transition-colors duration-[var(--duration-fast)]"
                style={{
                  color:      'var(--fg)',
                  opacity:    isCurrent ? 1 : 0.5,
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
