/**
 * Hero.jsx — section 1.
 *
 * Layout (plan section D):
 *   • h1: "24 HOURS. ONE IDEA. ENDLESS POSSIBILITIES." — dominant, highest contrast, first in reading order
 *     Sized by "POSSIBILITIES." — longest word at ~10–11 em Archivo Black (plan section A).
 *     Never revealed from opacity:0 — transform/clip only (plan section A, T13 constraint).
 *   • "IDEA SPRINT 2026" — oversized visible wordmark (p), integrated into composition.
 *     The Spark component sits at the IDEA/SPRINT transition.
 *     Tonal treatment: outlined stroke + partial fill. NOT opacity 0.08.
 *   • Fragments in two layers: layer A (behind wordmark and h1), layer B (1-2 crossing letter boundaries)
 *   • Supporting copy, Countdown, two CTAs, metadata row
 *   • Mobile: 4 fragments, full-width CTA, wordmark stacks, no parallax
 *
 * CTA labels follow registration.status (plan section D).
 * Secondary CTA scrolls to About, labelled "Explore" (plan section F).
 */
import SectionShell from '../components/ui/SectionShell.jsx'
import Button from '../components/ui/Button.jsx'
import Countdown from '../components/ui/Countdown.jsx'
import Spark from '../components/art/Spark.jsx'
import { Cube, Ring, Disc, Sphere } from '../components/art/Fragments.jsx'
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
      {/* ════════════════════════════════════════════════════════
          LAYER A — fragments behind all type (aria-hidden)
          Desktop: 9 fragments. Mobile: 4 (hidden with lg: prefix).
      ═══════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden"
      >
        {/* Large ring — top right, behind wordmark */}
        <Ring
          size={180}
          color="#f5a623"
          opacity={0.12}
          className="absolute"
          style={{ top: '-4%', right: '8%' }}
        />
        {/* Cube — upper left, behind IDEA */}
        <Cube
          size={64}
          color="#f5a623"
          opacity={0.18}
          className="absolute"
          style={{ top: '8%', left: '4%' }}
        />
        {/* Disc — behind "24 HOURS." line */}
        <Disc
          size={120}
          color="#c8f135"
          opacity={0.08}
          className="absolute"
          style={{ top: '32%', left: '-2%' }}
        />
        {/* Sphere — far right mid */}
        <Sphere
          size={56}
          color="#f5a623"
          opacity={0.15}
          className="absolute hidden lg:block"
          style={{ top: '45%', right: '3%' }}
          uid="hero-sphere-1"
        />
        {/* Small cube — lower left */}
        <Cube
          size={36}
          color="#c8f135"
          opacity={0.14}
          className="absolute hidden lg:block"
          style={{ bottom: '18%', left: '12%' }}
        />
        {/* Ring bottom right */}
        <Ring
          size={88}
          color="#c8f135"
          opacity={0.1}
          className="absolute hidden lg:block"
          style={{ bottom: '10%', right: '18%' }}
        />
        {/* Tiny disc — right of SPRINT */}
        <Disc
          size={28}
          color="#f5a623"
          opacity={0.2}
          className="absolute hidden lg:block"
          style={{ top: '22%', right: '28%' }}
        />
        {/* Extra sphere bottom centre */}
        <Sphere
          size={42}
          color="#c8f135"
          opacity={0.1}
          className="absolute hidden lg:block"
          style={{ bottom: '24%', left: '42%' }}
          uid="hero-sphere-2"
        />
        {/* Small cube — right edge */}
        <Cube
          size={28}
          color="#f5f0e8"
          opacity={0.25}
          className="absolute hidden lg:block"
          style={{ top: '62%', right: '6%' }}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          COMPOSITION — wordmark + headline
      ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-6xl w-full">

        {/* ── Wordmark "IDEA SPRINT 2026" ── */}
        {/*
          Visible oversized wordmark integrated into composition (plan T13 constraint).
          Tonal outlined treatment: near-black stroke on cream background reads clearly.
          Not opacity 0.08 — it must register as the brand identity.
          The Spark sits at the IDEA/SPRINT visual transition.
          p element — not h1 — so it does not outrank the headline in hierarchy.
        */}
        <div className="relative mb-2 lg:mb-0">
          <p
            aria-label="IDEA SPRINT 2026"
            className="font-[family-name:var(--font-display)]
                       leading-[0.88] tracking-[-0.04em]
                       select-none pointer-events-none"
            style={{
              fontSize: 'clamp(2.8rem, 15vw, 11rem)',
              WebkitTextStroke: '1px rgba(15,13,10,0.35)',
              color: 'rgba(15,13,10,0.07)',
            }}
          >
            <span className="block">IDEA</span>
            {/* Spark sits at the IDEA/SPRINT visual transition */}
            <span className="block relative">
              SPRINT
              <span
                aria-hidden="true"
                className="absolute"
                style={{
                  /* positions spark at right edge of SPRINT, overlapping junction */
                  right: 'clamp(-2rem, -3vw, -4rem)',
                  top: '0',
                  transform: 'translateY(-35%)',
                }}
              >
                <Spark
                  size={72}
                  color="orange"
                  className="hidden sm:block"
                />
                <Spark
                  size={48}
                  color="orange"
                  className="sm:hidden"
                />
              </span>
            </span>
            <span
              className="block"
              style={{ fontSize: '0.5em', letterSpacing: '-0.02em', opacity: 0.7 }}
            >
              2026
            </span>
          </p>
        </div>

        {/* ── Headline h1 ── */}
        {/*
          Dominant element. Highest contrast. First in reading order.
          Sized by "POSSIBILITIES." — longest word.
          NEVER revealed from opacity:0 — transform/clip only (plan section A).
          clamp() values tested at 320, 390, 1440px.
        */}
        <h1
          id="hero-heading"
          className="font-[family-name:var(--font-display)]
                     leading-[1.0] tracking-[-0.025em]
                     text-[var(--color-near-black)]
                     max-w-[18ch] mt-6 lg:mt-10"
          style={{ fontSize: 'clamp(1.65rem, 6.2vw, 5.25rem)' }}
        >
          24 HOURS.
          <br />
          ONE IDEA.
          <br />
          ENDLESS
          <br />
          POSSIBILITIES.
        </h1>

        {/* ── LAYER B — 1-2 fragments crossing letter boundaries ── */}
        {/*
          These are positioned relative to the composition, crossing type boundaries.
          z-index above layer A but below UI text so they create depth without hurting legibility.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none"
        >
          {/* Ring crossing the h1 — overlaps "ENDLESS" on desktop only */}
          <Ring
            size={52}
            color="#f5a623"
            opacity={0.22}
            className="absolute hidden lg:block"
            style={{ top: '54%', left: 'clamp(14rem, 32vw, 28rem)' }}
          />
          {/* Small disc crossing "POSSIBILITIES." */}
          <Disc
            size={22}
            color="#c8f135"
            opacity={0.3}
            className="absolute hidden sm:block"
            style={{ top: '72%', left: 'clamp(10rem, 28vw, 24rem)' }}
          />
        </div>

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
      </div>
    </SectionShell>
  )
}
