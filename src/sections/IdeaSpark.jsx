/**
 * IdeaSpark.jsx — section 3 (T19: lazy 3D SparkScene + SVG fallback).
 *
 * Logic (plan section D):
 *   • Four categories, 12 prompts each.
 *   • Shuffle-bag via lib/pickPrompt.js — no immediate repeats.
 *   • States: nothing selected → selected → prompt shown.
 *   • Buttons: Generate, Copy, Another one.
 *   • Prompt card is aria-live="polite".
 *   • Copy uses useCopy hook (navigator.clipboard + textarea fallback).
 *
 * 3D scene (T19):
 *   • SparkScene is lazy-loaded only when the section nears the viewport
 *     (IntersectionObserver, rootMargin 300px).
 *   • Capability check: WebGL + !reducedMotion + !saveData.
 *   • SVG Spark fallback if: WebGL unavailable, reduced motion, Save-Data,
 *     lazy chunk error (via ErrorBoundary), or Suspense timeout.
 *
 * Layout (plan section D):
 *   Desktop: asymmetric — "WHAT IF...?" + scene left, picker + card right.
 *   Mobile: headline → compact spark area → chips → Generate → card → actions.
 */
import { useState, useRef, useEffect, lazy, Suspense, Component } from 'react'
import SectionShell from '../components/ui/SectionShell.jsx'
import Button from '../components/ui/Button.jsx'
import Spark from '../components/art/Spark.jsx'
import prompts from '../data/prompts.js'
import { createBag, pick } from '../lib/pickPrompt.js'
import useCopy from '../hooks/useCopy.js'
import { canUseWebGL } from '../components/three/webgl.js'

// ── Lazy-load the 3D scene — NOT in initial bundle ───────────────────────────
const SparkScene = lazy(() => import('../components/three/SparkScene.jsx'))

const CATEGORIES = Object.entries(prompts).map(([key, value]) => ({
  key,
  label: value.label,
  prompts: value.prompts,
}))

// ── SVG fallback (shown when WebGL unavailable or chunk fails) ───────────────
function SparkFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center w-full h-full"
    >
      <Spark size={160} color="lime" />
    </div>
  )
}

// ── Error boundary wrapping the lazy scene ───────────────────────────────────
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return <SparkFallback />
    return this.props.children
  }
}

// ── 3D scene area: gated by capability + IntersectionObserver ────────────────
function SceneArea({ promptSeed }) {
  const containerRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const webgl = canUseWebGL()

  useEffect(() => {
    // No WebGL / reduced motion / Save-Data → never load the chunk
    if (!webgl) return

    const el = containerRef.current
    if (!el) return

    // Only request the chunk when the section is 300 px from the viewport
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [webgl])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="hidden lg:flex items-center justify-center
                 w-full max-w-[320px] aspect-square
                 rounded-[var(--radius-lg)]
                 overflow-hidden"
    >
      {webgl && shouldLoad ? (
        <SceneErrorBoundary>
          <Suspense fallback={<SparkFallback />}>
            <SparkScene promptSeed={promptSeed} />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <SparkFallback />
      )}
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────────────
export default function IdeaSpark() {
  const [selectedKey, setSelectedKey] = useState(null)
  const [prompt, setPrompt]           = useState(null)
  const [promptSeed, setPromptSeed]   = useState(0)
  const bagsRef = useRef({})
  const lastRef = useRef({})
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
    setPromptSeed((s) => s + 1) // scatter 3D pieces
  }

  function handleSelectCategory(key) {
    setSelectedKey(key)
    setPrompt(null)
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

          {/* ── Left: headline + 3D scene ── */}
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

            {/* 3D scene — lazy, gated by IntersectionObserver + WebGL check */}
            <SceneArea promptSeed={promptSeed} />
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
                        inline-flex px-5 py-2 min-h-[44px] items-center
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
                                 hover:bg-[#c3db5f] transition-colors duration-[var(--duration-fast)]
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
