/**
 * Stepper.jsx — step progress indicator.
 * Shows "Step N of 3" text + a progress bar on mobile.
 * Shows labelled step pills on desktop.
 *
 * Uses --fg, --fg-muted, --on-fg, --line tokens from [data-theme] on the
 * nearest SectionShell so it renders correctly on both light and dark sections.
 *
 * Phase 1.5 fixes:
 *   • Done pills: check SVG in var(--on-fg) on var(--fg) fill — no --field-bg
 *   • Upcoming pills: outlined (border var(--line), text var(--fg)) for ≥ 4.5:1
 */

/** Minimal check SVG — rendered as text colour via currentColor */
function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <polyline
        points="1.5,6.5 4.5,9.5 10.5,2.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
            className="h-full bg-[var(--color-orange)] rounded-full origin-left transition-transform duration-[var(--duration-normal)] ease-out"
            style={{
              width: '100%',
              transform: `scaleX(${(step + 1) / total})`,
            }}
          />
        </div>
      </div>

      {/* Desktop: pills */}
      <ol className="hidden lg:flex gap-6 mb-10 list-none p-0 m-0">
        {STEP_LABELS.map((label, i) => {
          const isDone    = i < step
          const isCurrent = i === step
          // Upcoming: outlined pill — border var(--line), text var(--fg) full strength
          // Current:  orange fill, near-black text (always ≥ 7:1)
          // Done:     --fg fill, --on-fg text (cream-on-dark or dark-on-light)

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
                    ? { backgroundColor: 'var(--fg)', color: 'var(--on-fg)', border: 'none' }
                    : isCurrent
                    ? { backgroundColor: 'var(--color-orange)', color: 'var(--color-near-black)', border: 'none' }
                    : { backgroundColor: 'transparent', color: 'var(--fg)', border: '1.5px solid var(--line)' }
                }
              >
                {isDone ? <CheckIcon /> : i + 1}
              </span>
              <span
                className="font-[family-name:var(--font-body)] text-sm transition-colors duration-[var(--duration-fast)]"
                style={{
                  color:      'var(--fg)',
                  opacity:    isCurrent ? 1 : 0.6,
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
