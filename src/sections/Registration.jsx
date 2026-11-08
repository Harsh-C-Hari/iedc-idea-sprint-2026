/**
 * Registration.jsx — section 6.
 *
 * Phase 1 fixes:
 *   • All text in dark section now uses --fg / --fg-muted / --line tokens
 *   • ErrorSummary restyled for dark section (dark-red surface, cream text)
 *   • Preview notice restyled for dark section (dark-amber surface, cream text)
 *   • "Copy summary" button uses cream fill with near-black text (was invisible bg-near-black on dark)
 *   • ErrorSummary keyed by field, not message; each item is a link that focuses its input
 *   • focus-visible rings use --focus-ring token (cream on dark)
 *   • ReviewStep "Edit" links use cream colour on dark
 *   • v3 border-opacity-* removed; replaced with --line token
 *   • Success state added for endpoint mode (preview mode never shows success)
 *   • tabIndex=-1 on h1 (for back-to-top focus)
 */
import { useRef, useState, useEffect } from 'react'
import SectionShell from '../components/ui/SectionShell.jsx'
import Button from '../components/ui/Button.jsx'
import Field from '../components/ui/Field.jsx'
import Select from '../components/ui/Select.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import useRegistrationForm from '../hooks/useRegistrationForm.js'
import useCopy from '../hooks/useCopy.js'
import { submitRegistration } from '../lib/submitRegistration.js'
import { downloadICS } from '../lib/calendar.js'
import eventConfig from '../config/eventConfig.js'

/* ── Identity panel (left, sticky on desktop) ──────────────────────── */
function IdentityPanel({ deadlineISO }) {
  const deadline = deadlineISO
    ? new Date(deadlineISO).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata',
      })
    : null

  return (
    <div className="lg:sticky lg:top-20 flex flex-col gap-6">
      <div>
        <p className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest mb-2"
           style={{ color: 'var(--fg-muted)' }}>
          Register
        </p>
        <h2
          id="registration-heading"
          className="font-[family-name:var(--font-display)]
                     text-[clamp(2rem,4vw,3rem)] leading-tight tracking-[-0.025em]"
          style={{ color: 'var(--fg)' }}
        >
          IDEA SPRINT 2026
        </h2>
      </div>

      <ul className="list-none p-0 m-0 flex flex-col gap-3">
        {[
          eventConfig.college,
          '20–21 November 2026',
          `Team size: ${eventConfig.team.min}–${eventConfig.team.max} members`,
          ...(deadline
            ? [`Register by: ${deadline}${eventConfig.provisional_deadlineISO ? ' (provisional)' : ''}`]
            : []),
        ].map((item) => (
          <li key={item}
              className="font-[family-name:var(--font-body)] text-sm"
              style={{ color: 'var(--fg-muted)' }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Error summary (focus target on failed Next) ───────────────────── */
function ErrorSummary({ errors, summaryRef }) {
  const entries = Object.entries(errors).filter(([, v]) => v)
  if (!entries.length) return null

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="error-flash p-4 rounded-[var(--radius-sm)] mb-6 focus:outline-none"
      style={{
        backgroundColor: 'rgb(185 28 28 / 0.22)',
        border: '1px solid rgb(248 113 113 / 0.50)',
      }}
    >
      <p className="font-[family-name:var(--font-body)] text-sm font-semibold mb-2"
         style={{ color: 'var(--fg)' }}>
        Please fix the following:
      </p>
      <ul className="list-disc pl-4">
        {entries.map(([field, msg]) => (
          <li key={field} className="font-[family-name:var(--font-body)] text-xs">
            {/* Each error is a link that focuses its input */}
            <a
              href={`#${field.replace(/_/g, '-')}`}
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById(field.replace(/_/g, '-'))
                el?.focus()
              }}
              className="underline focus-visible:outline-[var(--focus-ring,var(--color-cream))]"
              style={{ color: 'var(--fg)' }}
            >
              {msg}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Step 0: Team ───────────────────────────────────────────────────── */
function TeamStep({ state, setTeamName, setTeamSize, touch }) {
  const { teamName, teamSize, errors, touched } = state
  const sizes = Array.from({ length: eventConfig.team.max - eventConfig.team.min + 1 },
    (_, i) => eventConfig.team.min + i)

  return (
    <div className="flex flex-col gap-6">
      <Field
        id="team-name"
        label="Team name"
        type="text"
        required
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        onBlur={() => touch('teamName')}
        error={errors.teamName}
        touched={touched.teamName}
        maxLength={40}
        autoComplete="organization"
      />

      <fieldset className="border-0 p-0 m-0">
        <legend className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--fg)' }}>
          Team size <span aria-hidden="true" className="text-[var(--color-orange)]">*</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {sizes.map((n) => (
            /* has-[:focus-visible] shows the focus ring on the visual span
               when the sr-only radio receives keyboard focus.             */
            <label
              key={n}
              className="cursor-pointer rounded-[var(--radius-sm)]"
            >
              <input
                type="radio"
                name="team-size"
                value={n}
                checked={teamSize === n}
                onChange={() => setTeamSize(n)}
                className="sr-only"
              />
              <span
                data-on={teamSize === n ? 'true' : undefined}
                className={`
                  brutal inline-flex items-center justify-center w-14 h-12
                  font-[family-name:var(--font-display)] text-lg
                  rounded-[var(--radius-sm)] cursor-pointer select-none [--b-bw:2px] [--b-color:var(--color-orange)]
                  ${teamSize === n
                    ? '[--b-face:var(--color-cream)] [--b-edge:var(--color-cream)] text-[var(--color-near-black)]'
                    : '[--b-face:var(--color-near-black)] [--b-edge:var(--line)] text-[var(--color-cream)]'}
                `}
              >
                {n}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

/* ── Step 1: Participants ───────────────────────────────────────────── */
function ParticipantsStep({ state, setParticipantField, touch }) {
  const { teamSize, participants, errors, touched } = state

  return (
    <div className="flex flex-col gap-10">
      {Array.from({ length: teamSize }, (_, i) => {
        const p = participants[i] ?? {}
        const isLeader = i === 0
        const prefix = `p${i}`

        return (
          <div key={i} className="flex flex-col gap-4">
            <h3 className="font-[family-name:var(--font-display)] text-base tracking-wide"
                style={{ color: 'var(--fg)' }}>
              Participant {i + 1}
              {isLeader && (
                <span className="ml-2 font-[family-name:var(--font-body)] text-xs font-normal uppercase tracking-widest"
                      style={{ color: 'var(--fg-muted)' }}>
                  · TEAM LEAD
                </span>
              )}
            </h3>

            <Field
              id={`${prefix}-name`}
              label="Full name"
              type="text"
              required
              isLeader={false}
              value={p.name ?? ''}
              onChange={(e) => setParticipantField(i, 'name', e.target.value)}
              onBlur={() => touch(`${prefix}_name`)}
              error={errors[`${prefix}_name`]}
              touched={touched[`${prefix}_name`]}
              autoComplete={i === 0 ? 'name' : 'off'}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                id={`${prefix}-email`}
                label="Email"
                type="email"
                inputMode="email"
                required
                value={p.email ?? ''}
                onChange={(e) => setParticipantField(i, 'email', e.target.value)}
                onBlur={() => touch(`${prefix}_email`)}
                error={errors[`${prefix}_email`]}
                touched={touched[`${prefix}_email`]}
                autoComplete={i === 0 ? 'email' : 'off'}
              />

              <Field
                id={`${prefix}-phone`}
                label="Phone"
                type="tel"
                inputMode="tel"
                required
                value={p.phone ?? ''}
                onChange={(e) => setParticipantField(i, 'phone', e.target.value)}
                onBlur={() => touch(`${prefix}_phone`)}
                error={errors[`${prefix}_phone`]}
                touched={touched[`${prefix}_phone`]}
                autoComplete={i === 0 ? 'tel' : 'off'}
                placeholder="10-digit mobile"
              />
            </div>

            {/* Semester — only shown if config has list */}
            {eventConfig.semesters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  id={`${prefix}-semester`}
                  label="Semester"
                  required
                  options={eventConfig.semesters}
                  placeholder="Select semester"
                  value={p.semester ?? ''}
                  onChange={(e) => setParticipantField(i, 'semester', e.target.value)}
                  onBlur={() => touch(`${prefix}_semester`)}
                  error={errors[`${prefix}_semester`]}
                  touched={touched[`${prefix}_semester`]}
                />

                {/* Division — only shown if config has list */}
                {eventConfig.divisions && (
                  <Select
                    id={`${prefix}-division`}
                    label="Division"
                    required
                    options={eventConfig.divisions}
                    placeholder="Select division"
                    value={p.division ?? ''}
                    onChange={(e) => setParticipantField(i, 'division', e.target.value)}
                    onBlur={() => touch(`${prefix}_division`)}
                    error={errors[`${prefix}_division`]}
                    touched={touched[`${prefix}_division`]}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Success panel (shown after a valid submit) ─────────────────────── */
function formatEventWindow() {
  const opts = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: eventConfig.timezone }
  const f = new Intl.DateTimeFormat('en-IN', opts)
  return `${f.format(new Date(eventConfig.startISO))} – ${f.format(new Date(eventConfig.endISO))} IST, 2026`
}

function SuccessPanel({ teamName, teamSize, isPreview }) {
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])

  const rows = [
    ['Team', teamName],
    ['Team size', `${teamSize} member${teamSize > 1 ? 's' : ''}`],
    ['When', formatEventWindow()],
    ['Where', `${eventConfig.venue.room}, ${eventConfig.venue.college}`],
  ]

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="flex flex-col gap-6 p-6 md:p-8 rounded-[var(--radius-sm)] focus:outline-none
                 focus-visible:outline-[3px] focus-visible:outline-[var(--focus-ring,var(--color-cream))] focus-visible:outline-offset-[3px]"
      style={{ border: '2px solid var(--line, rgb(242 235 221 / 0.3))' }}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center"
             style={{ backgroundColor: 'var(--color-lime)' }} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M7 17l6 6L25 10" stroke="#171717" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight"
            style={{ color: 'var(--fg)' }}>
          {isPreview ? 'Registration preview complete' : 'Registration received!'}
        </h3>
      </div>

      <dl className="m-0 grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-3 font-[family-name:var(--font-body)] text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-xs uppercase tracking-widest pt-0.5" style={{ color: 'var(--fg-muted)' }}>{k}</dt>
            <dd className="m-0 font-semibold break-words" style={{ color: 'var(--fg)' }}>{v}</dd>
          </div>
        ))}
      </dl>

      <div>
        <Button variant="outline-light" size="md" type="button" onClick={downloadICS}>
          Add to calendar
        </Button>
      </div>

      {isPreview && (
        <p className="font-[family-name:var(--font-body)] text-xs m-0" style={{ color: 'var(--fg-muted)' }}>
          This is a frontend-only demo: nothing was sent or saved, so this does not register your team yet.
        </p>
      )}
    </div>
  )
}

/* ── Step 2: Review ─────────────────────────────────────────────────── */
function ReviewStep({ state, goToStep, onSubmit, submitting, submitResult }) {
  const { teamName, teamSize, participants } = state
  const { copy, copied } = useCopy()
  const isPreview = eventConfig.registration.mode === 'preview' || !eventConfig.registration.endpoint

  function buildSummary() {
    const lines = [
      `IDEA SPRINT 2026 — Registration Summary`,
      `Team: ${teamName} (${teamSize} member${teamSize > 1 ? 's' : ''})`,
      '',
      ...participants.slice(0, teamSize).map((p, i) =>
        `Participant ${i + 1}${i === 0 ? ' (Team Lead)' : ''}: ${p.name} · ${p.email} · ${p.phone}${p.semester ? ` · ${p.semester}` : ''}${p.division ? ` / ${p.division}` : ''}`
      ),
    ]
    return lines.join('\n')
  }

  /* Success state: real success (endpoint) or the honest frontend-only preview */
  if (submitResult?.ok) {
    return <SuccessPanel teamName={teamName} teamSize={teamSize} isPreview={isPreview} />
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Preview mode notice — plainly honest, never fake */}
      {isPreview && (
        <div
          className="p-4 rounded-[var(--radius-sm)]"
          style={{
            backgroundColor: 'rgb(120 90 20 / 0.22)',
            border: '1px solid rgb(251 191 36 / 0.30)',
          }}
        >
          <p className="font-[family-name:var(--font-body)] text-sm font-semibold mb-1"
             style={{ color: 'var(--fg)' }}>
            Registrations are not yet connected to a destination.
          </p>
          <p className="font-[family-name:var(--font-body)] text-xs"
             style={{ color: 'var(--fg-muted)' }}>
            The form is fully working but submissions are not being saved yet.
            Use "Copy summary" to keep your details and check back when registration opens.
          </p>
        </div>
      )}

      {/* Team block */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest"
              style={{ color: 'var(--fg-muted)' }}>
            Team
          </h3>
          <button
            type="button"
            onClick={() => goToStep(0)}
            className="font-[family-name:var(--font-body)] text-xs underline
                       focus-visible:outline-[var(--focus-ring,var(--color-cream))]"
            style={{ color: 'var(--color-orange)' }}
          >
            Edit
          </button>
        </div>
        <p className="font-[family-name:var(--font-body)] text-sm" style={{ color: 'var(--fg)' }}>
          <strong>{teamName}</strong> · {teamSize} member{teamSize > 1 ? 's' : ''}
        </p>
      </div>

      {/* Participants block */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest"
              style={{ color: 'var(--fg-muted)' }}>
            Participants
          </h3>
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="font-[family-name:var(--font-body)] text-xs underline
                       focus-visible:outline-[var(--focus-ring,var(--color-cream))]"
            style={{ color: 'var(--color-orange)' }}
          >
            Edit
          </button>
        </div>
        <ul className="list-none p-0 m-0 flex flex-col gap-3">
          {participants.slice(0, teamSize).map((p, i) => (
            <li key={i} className="font-[family-name:var(--font-body)] text-sm"
                style={{ color: 'var(--fg)' }}>
              <span className="font-semibold">{p.name}</span>
              {i === 0 && <span className="ml-2 text-xs" style={{ color: 'var(--fg-muted)' }}>TEAM LEAD</span>}
              <br />
              <span style={{ color: 'var(--fg-muted)' }}>{p.email} · {p.phone}</span>
              {p.semester && <span style={{ color: 'var(--fg-muted)' }}> · {p.semester}{p.division ? ` / ${p.division}` : ''}</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="orange"
          size="lg"
          type="button"
          onClick={submitting ? undefined : onSubmit}
          aria-busy={submitting}
          aria-disabled={submitting}
          className={`flex-1 gap-3 ${submitting ? 'opacity-80 cursor-wait' : ''}`}
        >
          {submitting && <span className="spinner" aria-hidden="true" />}
          {submitting ? 'Submitting…' : 'Submit registration'}
        </Button>

        {isPreview && (
          /* Copy summary — cream fill with near-black text, visible on dark section */
          <button
            type="button"
            onClick={() => copy(buildSummary())}
            className="sm:flex-1 px-6 py-3 min-h-[56px] flex items-center justify-center
                       font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wide
                       bg-[var(--color-cream)] text-[var(--color-near-black)]
                       rounded-[var(--radius-sm)]
                       hover:bg-[#e0d9cb]
                       transition-colors duration-[var(--duration-fast)]
                       focus-visible:outline-[var(--focus-ring,var(--color-cream))]"
          >
            {copied ? 'Copied!' : 'Copy summary'}
          </button>
        )}
      </div>
      <span className="sr-only" aria-live="polite">{copied ? 'Summary copied' : ''}</span>

      {/* Endpoint error — keep data, offer retry */}
      {submitResult && !submitResult.ok && !submitResult.preview && (
        <p
          role="alert"
          className="font-[family-name:var(--font-body)] text-xs mt-2"
          style={{ color: '#fca5a5' }}
        >
          {submitResult.error}
        </p>
      )}
    </div>
  )
}

/* ── Status gate ─────────────────────────────────────────────────────── */
function StatusGate({ status }) {
  if (status === 'opening-soon') {
    return (
      <div className="py-16 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl mb-4"
           style={{ color: 'var(--fg)' }}>
          Registration opens soon.
        </p>
        {eventConfig.registration.deadlineISO && (
          <p className="font-[family-name:var(--font-body)] text-sm"
             style={{ color: 'var(--fg-muted)' }}>
            Check back for the opening date.
          </p>
        )}
      </div>
    )
  }
  return (
    <div className="py-16 text-center">
      <p className="font-[family-name:var(--font-display)] text-2xl mb-4"
         style={{ color: 'var(--fg)' }}>
        Registration is closed.
      </p>
      <p className="font-[family-name:var(--font-body)] text-sm"
         style={{ color: 'var(--fg-muted)' }}>
        Thank you for your interest in IDEA SPRINT 2026.
      </p>
    </div>
  )
}

/* ── Main Registration section ───────────────────────────────────────── */
export default function Registration() {
  const { status, deadlineISO } = eventConfig.registration
  const isActive = status === 'open' || status === 'preview'

  const form = useRegistrationForm()
  const { state, setTeamName, setTeamSize, setParticipantField, touch, tryNext, goToStep, setSubmitting, setSubmitResult } = form
  const errorSummaryRef = useRef(null)
  const stepHeadingRef  = useRef(null)
  const stepWrapRef     = useRef(null)
  const [flashKey, setFlashKey] = useState(0)   // remounts the error summary so .error-flash replays
  const [lockedH, setLockedH]   = useState(null) // keeps height steady between review and success panel
  const isPreview = eventConfig.registration.mode === 'preview' || !eventConfig.registration.endpoint

  async function handleNext() {
    const ok = tryNext(errorSummaryRef)
    if (!ok) setFlashKey((k) => k + 1)
    if (ok) {
      setTimeout(() => {
        stepHeadingRef.current?.focus()
        stepHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  function handleBack() {
    goToStep(state.step - 1)
    setTimeout(() => {
      stepHeadingRef.current?.focus()
      stepHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  async function handleSubmit() {
    if (state.submitting) return
    // Lock the review height so swapping in the success panel never shifts layout
    if (stepWrapRef.current) setLockedH(stepWrapRef.current.offsetHeight)
    setSubmitting(true)
    const result = await submitRegistration({
      teamName:     state.teamName,
      teamSize:     state.teamSize,
      participants: state.participants.slice(0, state.teamSize),
    })
    if (result.preview) {
      // Frontend-only demo: brief pause so the spinner is perceivable, nothing is sent.
      await new Promise((r) => setTimeout(r, 700))
      setSubmitResult({ ok: true, preview: true })
      return
    }
    setSubmitResult(result)
  }

  const succeeded = Boolean(state.submitResult?.ok)

  return (
    <SectionShell
      id="registration"
      labelId="registration-heading"
      theme="dark"
      className="px-5 md:px-8 lg:px-16 py-20 lg:py-28"
    >
      {!isActive ? (
        <>
          <h2 id="registration-heading" className="sr-only">Registration</h2>
          <StatusGate status={status} />
        </>
      ) : (
        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-5 lg:gap-16 items-start">

          {/* Identity panel — 2 of 5 cols */}
          <div className="lg:col-span-2 mb-10 lg:mb-0">
            <IdentityPanel deadlineISO={deadlineISO} />
          </div>

          {/* Form — 3 of 5 cols */}
          <div className="lg:col-span-3">
            <h2
              id="registration-heading"
              ref={stepHeadingRef}
              tabIndex={-1}
              className="font-[family-name:var(--font-display)]
                         text-[clamp(1.5rem,3vw,2.5rem)] leading-tight tracking-[-0.025em]
                         mb-8 focus:outline-none"
              style={{ color: 'var(--fg)' }}
            >
              {state.step === 0 && 'Your team'}
              {state.step === 1 && 'Participant details'}
              {state.step === 2 && (succeeded ? 'You’re all set' : 'Review and submit')}
            </h2>

            <Stepper step={state.step} />

            {/* Error summary (focus target on failed Next) */}
            <ErrorSummary key={flashKey} errors={state.errors} summaryRef={errorSummaryRef} />

            {/* Step content with smooth slide+fade */}
            <div
              key={state.step}
              ref={stepWrapRef}
              className="animate-[fadeSlideIn_0.35s_cubic-bezier(0.16,1,0.3,1)]"
              style={succeeded && lockedH ? { minHeight: lockedH } : undefined}
            >
              {state.step === 0 && (
                <TeamStep
                  state={state}
                  setTeamName={setTeamName}
                  setTeamSize={setTeamSize}
                  touch={touch}
                />
              )}
              {state.step === 1 && (
                <ParticipantsStep
                  state={state}
                  setParticipantField={setParticipantField}
                  touch={touch}
                />
              )}
              {state.step === 2 && (
                <ReviewStep
                  state={state}
                  goToStep={goToStep}
                  onSubmit={handleSubmit}
                  submitting={state.submitting}
                  submitResult={state.submitResult}
                />
              )}
            </div>

            {/* Nav buttons */}
            {state.step < 2 && (
              <div className="mt-8 flex justify-between items-center">
                {state.step > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="font-[family-name:var(--font-body)] text-sm underline
                               hover:opacity-100 focus-visible:outline-[var(--focus-ring,var(--color-cream))]"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    ← Back
                  </button>
                ) : <span />}

                <Button
                  variant="orange"
                  size="lg"
                  onClick={handleNext}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionShell>
  )
}
