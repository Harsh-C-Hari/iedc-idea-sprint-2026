/**
 * About.jsx — section 2.
 *
 * Layout (plan section D):
 *   • Cream intro: headline wide, copy offset
 *   • Near-black manifesto: QUESTION. IMAGINE. EXPERIMENT. CREATE. — four oversized lines
 *   • Cream journey: DISCOVER, IDEATE, DEVELOP, PRESENT — four numbered stages
 *     (horizontal rule with nodes on desktop, vertical list on mobile)
 *
 * Order: cream → dark → cream  (plan section D)
 * All copy verbatim from data/content.js (plan section H).
 */
import SectionShell from '../components/ui/SectionShell.jsx'
import { aboutIntro, manifesto, journey } from '../data/content.js'

/** ── Intro sub-section (cream) ── */
function AboutIntro() {
  return (
    <div className="px-5 md:px-8 lg:px-16 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 items-start">
        <h2
          id="about-heading"
          className="font-[family-name:var(--font-display)]
                     text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-[-0.025em]
                     text-[var(--color-near-black)] col-span-1"
        >
          {aboutIntro.headline}
        </h2>
        <p
          className="font-[family-name:var(--font-body)] text-[1rem] md:text-[1.125rem]
                     leading-relaxed text-[var(--color-near-black)] opacity-70
                     mt-6 lg:mt-0 col-span-1"
        >
          {aboutIntro.body}
        </p>
      </div>
    </div>
  )
}

/** ── Manifesto sub-section (dark) ── */
function Manifesto() {
  return (
    <div
      className="bg-[var(--color-near-black)] text-[var(--color-cream)]
                 px-5 md:px-8 lg:px-16 py-20 lg:py-28"
    >
      <div className="max-w-6xl mx-auto">
        <ul
          aria-label="Our manifesto"
          className="list-none p-0 m-0 flex flex-col gap-4"
        >
          {manifesto.map((word) => (
            <li
              key={word}
              data-reveal="manifesto-word"
              className="font-[family-name:var(--font-display)]
                         text-[clamp(2.5rem,8vw,7rem)] leading-[1.0] tracking-[-0.03em]
                         text-[var(--color-cream)]"
            >
              {word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** ── Journey sub-section (cream) ── */
function Journey() {
  return (
    <div className="px-5 md:px-8 lg:px-16 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto">
        <h3
          className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                     opacity-50 mb-10"
        >
          The journey
        </h3>

        {/* Desktop: horizontal with connecting rule; Mobile: vertical list */}
        <ol
          aria-label="Event journey stages"
          className="list-none p-0 m-0
                     flex flex-col gap-10
                     lg:grid lg:grid-cols-4 lg:gap-8 lg:items-start"
        >
          {journey.map((stage, i) => (
            <li
              key={stage.title}
              data-reveal="journey-stage"
              className="relative"
            >
              {/* Connector line between stages (desktop only) */}
              {i < journey.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden lg:block absolute top-5 left-full w-full h-px
                             bg-[var(--color-near-black)] opacity-15 z-0"
                />
              )}

              {/* Number node */}
              <div
                className="relative z-10 w-10 h-10 rounded-full border-2
                           border-[var(--color-near-black)] flex items-center justify-center mb-4"
              >
                <span
                  className="font-[family-name:var(--font-body)] text-xs font-semibold
                             text-[var(--color-near-black)]"
                >
                  {stage.number}
                </span>
              </div>

              <h4
                className="font-[family-name:var(--font-display)]
                           text-[clamp(1.25rem,2.5vw,1.75rem)] leading-tight tracking-[-0.02em]
                           text-[var(--color-near-black)] mb-3"
              >
                {stage.title}
              </h4>
              <p
                className="font-[family-name:var(--font-body)] text-sm leading-relaxed
                           text-[var(--color-near-black)] opacity-65 max-w-[32ch]"
              >
                {stage.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default function About() {
  return (
    <SectionShell
      id="about"
      labelId="about-heading"
      theme="light"
      className="p-0"
    >
      <AboutIntro />
      <Manifesto />
      <Journey />
    </SectionShell>
  )
}
