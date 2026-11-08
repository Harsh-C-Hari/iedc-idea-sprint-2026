/**
 * IdeaSpark.jsx — section 3 (T19: lazy 3D SparkScene + SVG fallback).
 *
 * Logic (plan section D):
 *   • Four categories, 12 prompts each.
 *   • Shuffle-bag via lib/pickPrompt.js — no immediate repeats.
 *   • States: nothing selected → selected → prompt shown.
 *   • Buttons: Generate, Copy, Another one.
 *   • Result card: category + prompt in a persistent aria-live="polite" region; "Copied" in its own
 *     role="status" region.
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
      data-testid="spark-fallback"
      className="scene-skel"
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
  componentDidCatch(error, errorInfo) {
    console.error('[IdeaSpark] 3D Scene Error:', error, errorInfo)
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
  const [isIntersecting, setIsIntersecting] = useState(false)
  const webgl = canUseWebGL()

  useEffect(() => {
    // No WebGL / reduced motion / Save-Data → never load the chunk
    if (!webgl) return
    // Without IntersectionObserver the static SVG fallback simply stays
    if (typeof IntersectionObserver === 'undefined') return

    const el = containerRef.current
    if (!el) return

    // Preload when 200px away; track intersection to play/pause rendering
    const io = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) {
          setShouldLoad(true)
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [webgl])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="scene-area-container"
      className="hidden lg:flex items-center justify-center
                 w-full max-w-[360px] aspect-square
                 rounded-[var(--radius-lg)]
                 overflow-hidden"
    >
      {webgl && shouldLoad ? (
        <SceneErrorBoundary>
          <Suspense fallback={<SparkFallback />}>
            <SparkScene promptSeed={promptSeed} paused={!isIntersecting} />
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
  // Preselect first category so Generate is never in a blocked/muddy disabled state
  const [selectedKey, setSelectedKey] = useState(CATEGORIES[0]?.key ?? null)
  const [prompt, setPrompt]           = useState(null)
  const [promptSeed, setPromptSeed]   = useState(0)
  const bagsRef = useRef({})
  const lastRef = useRef({})
  const { copy, copied, failed } = useCopy()

  function handleGenerate() {
    if (!selectedKey) return
    const cat = prompts[selectedKey]
    const shown = prompt
    if (!bagsRef.current[selectedKey]) {
      bagsRef.current[selectedKey] = createBag(cat.prompts)
    }
    let { prompt: next, bag: remaining } = pick(
      bagsRef.current[selectedKey],
      cat.prompts,
      lastRef.current[selectedKey] ?? null,
    )
    // Belt and braces: never show the prompt that is already on screen twice in a row
    if (next === shown && cat.prompts.length > 1) {
      ;({ prompt: next, bag: remaining } = pick(remaining, cat.prompts, shown))
    }
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
      className="px-5 md:px-8 lg:px-16 pt-20 pb-12 md:py-20 lg:py-28"
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
                         text-[var(--color-cream)] opacity-60 max-w-[40ch] mb-6 lg:mb-8"
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
                           text-[var(--color-cream)] opacity-70 mb-4"
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
                    {/* Selected = permanent lifted state (data-on): lime face, near-black text + border,
                        orange block at rest. A check mark means state never relies on colour alone. */}
                    <span
                      data-on={selectedKey === key ? 'true' : undefined}
                      className={`
                        brutal inline-flex px-5 py-2 min-h-[44px] items-center gap-2
                        font-[family-name:var(--font-body)] text-sm font-medium
                        rounded-[var(--radius-full)] cursor-pointer select-none
                        [--b-bw:2px]
                        ${selectedKey === key
                          ? '[--b-face:var(--color-lime)] [--b-edge:var(--color-near-black)] [--b-color:var(--color-orange)] text-[var(--color-near-black)] font-semibold'
                          : '[--b-face:var(--color-near-black)] [--b-edge:rgb(242_235_221_/_0.45)] text-[var(--color-cream)]'}
                      `}
                    >
                      {selectedKey === key && <span aria-hidden="true">✓</span>}
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Generate button — outline-light when disabled so it's readable on dark */}
            <Button
              variant={selectedKey ? 'orange' : 'outline-light'}
              size="lg"
              onClick={handleGenerate}
              disabled={!selectedKey}
              aria-disabled={!selectedKey}
              className="w-full mb-6"
            >
              Generate Prompt
            </Button>

            {/* Result card.
                The live region is ALWAYS mounted (so the first prompt is announced) and holds only
                the category + prompt. Buttons sit outside it, and "Copied" has its own status region,
                so neither action re-reads the whole card. */}
            <div className="lg:min-h-[8rem]">
              <div
                data-testid="spark-result"
                className={prompt
                  ? 'p-6 border-2 border-[var(--color-cream)]/25 rounded-[var(--radius-md)] bg-[var(--color-cream)]/5'
                  : ''}
              >
                <div aria-live="polite" aria-atomic="true">
                  {prompt && (
                    <div key={promptSeed} className="spark-in">
                      <p
                        className="font-[family-name:var(--font-body)] text-xs font-semibold uppercase
                                   tracking-widest text-[var(--color-lime)] mb-3"
                      >
                        {CATEGORIES.find((c) => c.key === selectedKey)?.label}
                      </p>
                      <p
                        className="font-[family-name:var(--font-body)] text-[1.0625rem] leading-relaxed
                                   text-[var(--color-cream)] mb-6 min-h-[6.9rem] lg:min-h-[5.2rem]"
                      >
                        {prompt}
                      </p>
                    </div>
                  )}
                </div>

                {prompt && (
                  <div className="flex flex-wrap gap-4 pr-1 pb-1">
                    <Button
                      variant="lime"
                      size="md"
                      type="button"
                      onClick={() => copy(prompt)}
                      className="min-w-[8.5rem]"
                    >
                      {copied ? 'Copied!' : failed ? 'Copy failed' : 'Copy'}
                    </Button>
                    <Button variant="outline-light" size="md" type="button" onClick={handleGenerate}>
                      Another one
                    </Button>
                  </div>
                )}
              </div>

              {!prompt && (
                <p
                  className="font-[family-name:var(--font-body)] text-sm
                             text-[var(--color-cream)] opacity-70 italic"
                >
                  {selectedKey
                    ? 'Press Generate to get a starting prompt.'
                    : 'Select a category above to begin.'}
                </p>
              )}

              {/* Announces copy result only */}
              <p role="status" aria-live="polite" className="sr-only">
                {copied ? 'Copied to clipboard' : failed ? 'Could not copy. Select the text and copy it manually.' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
