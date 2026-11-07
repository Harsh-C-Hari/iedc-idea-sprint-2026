/**
 * IdeaSpark.jsx — section 3.
 *
 * Logic (plan section D):
 *   • Four categories, 12 prompts each.
 *   • Shuffle-bag via lib/pickPrompt.js — no immediate repeats, no back-to-back across refills.
 *   • States: nothing selected → selected → prompt shown.
 *   • Buttons: Generate, Copy, Another one.
 *   • Prompt card is aria-live="polite".
 *   • Copy uses useCopy hook (navigator.clipboard + textarea fallback).
 *   • 3D scene is T19 — this task uses SparkFallback placeholder text.
 *
 * Layout (plan section D):
 *   Desktop: asymmetric — "WHAT IF...?" + scene left, picker + card right.
 *   Mobile: headline → compact spark area → chips → Generate → card → actions.
 */
import { useState, useRef } from 'react'
import SectionShell from '../components/ui/SectionShell.jsx'
import Button from '../components/ui/Button.jsx'
import prompts from '../data/prompts.js'
import { createBag, pick } from '../lib/pickPrompt.js'
import useCopy from '../hooks/useCopy.js'

const CATEGORIES = Object.entries(prompts).map(([key, value]) => ({
  key,
  label: value.label,
  prompts: value.prompts,
}))

export default function IdeaSpark() {
  const [selectedKey, setSelectedKey] = useState(null)
  const [prompt, setPrompt]           = useState(null)
  const bagsRef = useRef({}) // { [categoryKey]: string[] }
  const lastRef = useRef({}) // { [categoryKey]: string | null }
  const { copy, copied } = useCopy()

  function handleGenerate() {
    if (!selectedKey) return
    const cat = prompts[selectedKey]
    if (!bagsRef.current[selectedKey]) {
      bagsRef.current[selectedKey] = createBag(cat.prompts)
    }
    const { prompt: next, bag: remaining } = pick(
      bagsRef.current[selectedKey],
      cat.prompts,
      lastRef.current[selectedKey] ?? null,
    )
    bagsRef.current[selectedKey] = remaining
    lastRef.current[selectedKey] = next
    setPrompt(next)
  }

  function handleSelectCategory(key) {
    setSelectedKey(key)
    setPrompt(null) // reset card when category changes
  }

  return (
    <SectionShell
      id="idea-spark"
      labelId="idea-spark-heading"
      theme="dark"
      className="px-5 md:px-8 lg:px-16 py-20 lg:py-28"
    >
      <div className="max-w-6xl mx-auto">
        {/* Desktop two-column layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">

          {/* ── Left: headline + spark placeholder ── */}
          <div>
            <h2
              id="idea-spark-heading"
              className="font-[family-name:var(--font-display)]
                         text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-[-0.03em]
                         text-[var(--color-cream)] mb-6"
            >
              WHAT IF...?
            </h2>
            <p
              className="font-[family-name:var(--font-body)] text-[1rem] leading-relaxed
                         text-[var(--color-cream)] opacity-60 max-w-[40ch] mb-10"
            >
              Pick a category and generate a starting prompt. Use it, ignore it,
              or let it spark something better.
            </p>

            {/* Spark scene placeholder — replaced with SparkScene in T19 */}
            <div
              aria-hidden="true"
              className="hidden lg:flex items-center justify-center
                         w-full max-w-[320px] aspect-square
                         border border-[var(--color-cream)] border-opacity-10
                         rounded-[var(--radius-lg)]
                         text-[var(--color-cream)] opacity-20
                         font-[family-name:var(--font-body)] text-sm"
            >
              [ 3D scene — T19 ]
            </div>
          </div>

          {/* ── Right: picker + prompt card ── */}
          <div className="mt-10 lg:mt-0">

            {/* Category picker — radio group */}
            <fieldset className="border-0 p-0 m-0 mb-8">
              <legend
                className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                           text-[var(--color-cream)] opacity-50 mb-4"
              >
                Choose a challenge category
              </legend>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map(({ key, label }) => (
                  <label key={key} className="cursor-pointer">
                    <input
                      type="radio"
                      name="spark-category"
                      value={key}
                      checked={selectedKey === key}
                      onChange={() => handleSelectCategory(key)}
                      className="sr-only"
                    />
                    <span
                      className={`
                        inline-block px-5 py-2 min-h-[44px] flex items-center
                        font-[family-name:var(--font-body)] text-sm font-medium
                        rounded-[var(--radius-full)] border border-current
                        transition-colors duration-[var(--duration-fast)]
                        cursor-pointer
                        ${selectedKey === key
                          ? 'bg-[var(--color-lime)] text-[var(--color-near-black)] border-[var(--color-lime)]'
                          : 'text-[var(--color-cream)] border-[var(--color-cream)] border-opacity-30 hover:border-opacity-80'}
                      `}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Generate button */}
            <Button
              variant="orange"
              size="lg"
              onClick={handleGenerate}
              disabled={!selectedKey}
              aria-disabled={!selectedKey}
              className="w-full mb-6"
            >
              Generate Prompt
            </Button>

            {/* Prompt card — aria-live so screen readers announce new prompt */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="min-h-[8rem]"
            >
              {prompt ? (
                <div
                  className="p-6 border border-[var(--color-cream)] border-opacity-15
                             rounded-[var(--radius-md)] bg-[var(--color-cream)] bg-opacity-5"
                >
                  <p
                    className="font-[family-name:var(--font-body)] text-[1.0625rem] leading-relaxed
                               text-[var(--color-cream)] mb-6"
                  >
                    {prompt}
                  </p>
                  {/* Card actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => copy(prompt)}
                      className="px-5 py-2 min-h-[44px] flex items-center
                                 font-[family-name:var(--font-body)] text-sm font-semibold
                                 text-[var(--color-near-black)] bg-[var(--color-lime)]
                                 rounded-[var(--radius-sm)]
                                 hover:bg-[#afd42d] transition-colors duration-[var(--duration-fast)]
                                 focus-visible:outline-[var(--color-cream)]"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="px-5 py-2 min-h-[44px] flex items-center
                                 font-[family-name:var(--font-body)] text-sm font-medium
                                 text-[var(--color-cream)] border border-[var(--color-cream)] border-opacity-30
                                 rounded-[var(--radius-sm)]
                                 hover:border-opacity-80 transition-colors duration-[var(--duration-fast)]
                                 focus-visible:outline-[var(--color-cream)]"
                    >
                      Another one
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="font-[family-name:var(--font-body)] text-sm
                             text-[var(--color-cream)] opacity-30 italic"
                >
                  {selectedKey
                    ? 'Press Generate to get a starting prompt.'
                    : 'Select a category above to begin.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
