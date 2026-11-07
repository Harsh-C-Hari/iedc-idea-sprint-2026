/**
 * Hero.jsx — section 1.
 *
 * Layout (plan section D):
 *   • h1: "24 HOURS. ONE IDEA. ENDLESS POSSIBILITIES." — dominant, highest contrast, first in reading order
 *   • "IDEA SPRINT 2026" — oversized wordmark (p), integrated into composition with spark at IDEA/SPRINT transition
 *   • Supporting copy, Countdown, two CTAs
 *   • Metadata row: IEDC BOOTCAMP CEC · College of Engineering Chengannur · 20–21 November 2026 · 24 hours
 *   • Fragments sit in two layers (placeholder positions; art added T13)
 *   • All artwork aria-hidden
 *
 * CTA labels follow registration.status (plan section D):
 *   open → "Register Now" | opening-soon → "Opening Soon" | else → "Registration Closed"
 *   preview → treated as open for CTA purposes (form is present, just preview mode)
 *
 * Secondary CTA scrolls to About, labelled "Explore" (plan section F, spec ambiguities).
 *
 * Type scale: headline sized by "POSSIBILITIES." — longest word at ~10–11 em Archivo Black (plan section A).
 * On mobile, the word stacks and contrast dominates over size.
 */
import SectionShell from '../components/ui/SectionShell.jsx'
import Button from '../components/ui/Button.jsx'
import Countdown from '../components/ui/Countdown.jsx'
import eventConfig from '../config/eventConfig.js'
import { heroSupporting, heroMeta } from '../data/content.js'

function ctaLabel(status) {
  if (status === 'open' || status === 'preview') return 'Register Now'
  if (status === 'opening-soon') return 'Opening Soon'
  return 'Registration Closed'
}

function ctaDisabled(status) {
  return status === 'closed'
}

export default function Hero() {
  const status = eventConfig.registration.status

  return (
    <SectionShell
      id="hero"
      labelId="hero-heading"
      theme="light"
      className="relative min-h-[100dvh] flex flex-col justify-center
                 pt-16 pb-12 px-5 md:px-8 lg:px-16 overflow-hidden"
    >
      {/* ── Wordmark "IDEA SPRINT 2026" ── */}
      {/* p element — not h1; supports headline, does not outrank it (plan section A) */}
      <p
        aria-label="IDEA SPRINT 2026"
        className="font-[family-name:var(--font-display)]
                   text-[clamp(3rem,14vw,10rem)] leading-[0.9] tracking-[-0.03em]
                   text-[var(--color-near-black)] opacity-[0.08]
                   select-none pointer-events-none
                   mb-4 lg:mb-6"
      >
        IDEA
        <br />
        SPRINT
        <br />
        <span className="text-[0.55em]">2026</span>
      </p>

      {/* ── Headline h1 ── */}
      {/* Sized by "POSSIBILITIES." — longest word; measured with clamp (plan section A) */}
      <h1
        id="hero-heading"
        className="font-[family-name:var(--font-display)]
                   text-[clamp(1.75rem,6.5vw,5.5rem)] leading-[1.0] tracking-[-0.025em]
                   text-[var(--color-near-black)]
                   max-w-[18ch]"
      >
        24 HOURS.
        <br />
        ONE IDEA.
        <br />
        ENDLESS
        <br />
        POSSIBILITIES.
      </h1>

      {/* ── Supporting copy ── */}
      <p
        className="font-[family-name:var(--font-body)] text-[1rem] md:text-[1.125rem]
                   leading-relaxed text-[var(--color-near-black)] opacity-70
                   max-w-[48ch] mt-6"
      >
        {heroSupporting}
      </p>

      {/* ── Countdown ── */}
      <div className="mt-8">
        <Countdown />
      </div>

      {/* ── CTAs ── */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button
          as="a"
          href="#registration"
          variant="primary"
          size="lg"
          disabled={ctaDisabled(status)}
          aria-disabled={ctaDisabled(status)}
          className="w-full sm:w-auto"
        >
          {ctaLabel(status)}
        </Button>
        <Button
          as="a"
          href="#about"
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
        >
          Explore
        </Button>
      </div>

      {/* ── Metadata row ── */}
      <ul
        aria-label="Event details"
        className="mt-10 flex flex-wrap gap-x-6 gap-y-2 list-none p-0 m-0"
      >
        {heroMeta.map((item) => (
          <li
            key={item}
            className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                       text-[var(--color-near-black)] opacity-50"
          >
            {item}
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}
