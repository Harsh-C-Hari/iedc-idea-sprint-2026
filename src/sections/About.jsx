/**
 * About.jsx — section 2 with reveals (T15).
 *
 * Layout (plan section D):
 *   • Cream intro: headline wide, copy offset
 *   • Near-black manifesto: QUESTION. IMAGINE. EXPERIMENT. CREATE. — four oversized lines
 *   • Cream journey: DISCOVER, IDEATE, DEVELOP, PRESENT — four numbered stages
 *
 * Motion (plan section D, T15):
 *   • Manifesto words toggle to lime and scale up as they cross viewport centre
 *     (toggleClass, not scrub — plan section D). Reduced motion: no toggle.
 *   • Journey stages become active one by one as they enter viewport.
 *   • About intro headline and body: simple fade reveals via useReveal.
 *   • No pinning. Content visible if GSAP fails.
 */
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import SectionShell from '../components/ui/SectionShell.jsx'
import { aboutIntro, manifesto, journey } from '../data/content.js'
import useReveal from '../motion/useReveal.js'
import { gsap, ScrollTrigger } from '../motion/gsap.js'

const REDUCED =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** ── Intro sub-section (cream) ── */
function AboutIntro({ revealRef }) {
  return (
    <div ref={revealRef} className="px-5 md:px-8 lg:px-16 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 items-start">
        <h2
          id="about-heading"
          data-reveal="fade"
          className="font-[family-name:var(--font-display)]
                     text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-[-0.025em]
                     text-[var(--color-near-black)] col-span-1"
        >
          {aboutIntro.headline}
        </h2>
        <p
          data-reveal="fade"
          data-reveal-delay="0.1"
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
  const ref = useRef(null)

  useGSAP(() => {
    if (REDUCED) return
    const words = ref.current?.querySelectorAll('[data-manifesto-word]')
    const list  = ref.current?.querySelector('ul')
    if (!words?.length || !list) return

    // 1. Reveal on first scroll into view (clip from left) — only animates clipPath
    words.forEach((word) => {
      gsap.set(word, { clipPath: 'inset(0 100% 0 0)' })
      gsap.to(word, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.7,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: word,
          start: 'top 85%',
          once: true,
        },
      })
    })

    // 2. Single ScrollTrigger on the list: tracks closest word to viewport center
    // and sets data-active="true". CSS transition handles the color & scale.
    ScrollTrigger.create({
      trigger: list,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: () => {
        const vCenter = window.innerHeight / 2
        let closestWord = null
        let minDistance = Infinity

        words.forEach((word) => {
          const rect = word.getBoundingClientRect()
          const wordCenter = rect.top + rect.height / 2
          const dist = Math.abs(vCenter - wordCenter)
          if (dist < minDistance) {
            minDistance = dist
            closestWord = word
          }
        })

        const listRect = list.getBoundingClientRect()
        const inActiveZone = listRect.top <= vCenter + 60 && listRect.bottom >= vCenter - 60

        words.forEach((word) => {
          const shouldBeActive = inActiveZone && word === closestWord
          if (shouldBeActive) {
            if (word.getAttribute('data-active') !== 'true') {
              word.setAttribute('data-active', 'true')
            }
          } else {
            if (word.hasAttribute('data-active')) {
              word.removeAttribute('data-active')
            }
          }
        })
      },
      onLeave: () => {
        words.forEach((w) => w.removeAttribute('data-active'))
      },
      onLeaveBack: () => {
        words.forEach((w) => w.removeAttribute('data-active'))
      },
    })
  }, { scope: ref, dependencies: [] })

  return (
    <div
      ref={ref}
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
              data-manifesto-word
              className="font-[family-name:var(--font-display)]
                         text-[clamp(2.5rem,8vw,7rem)] leading-[1.0] tracking-[-0.03em]
                         origin-left will-change-transform"
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
  const ref = useRef(null)

  useGSAP(() => {
    if (REDUCED) return
    const stages = ref.current?.querySelectorAll('[data-journey-stage]')
    if (!stages?.length) return

    stages.forEach((stage, i) => {
      gsap.set(stage, { opacity: 0, y: 24 })
      gsap.to(stage, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: i * 0.08,
        scrollTrigger: {
          trigger: stage,
          start: 'top 88%',
          once: true,
        },
      })
    })
  }, { scope: ref, dependencies: [] })

  return (
    <div ref={ref} className="px-5 md:px-8 lg:px-16 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto">
        <h3
          className="font-[family-name:var(--font-body)] text-xs uppercase tracking-widest
                     opacity-65 mb-10"
        >
          The journey
        </h3>

        <ol
          aria-label="Event journey stages"
          className="list-none p-0 m-0
                     flex flex-col gap-10
                     lg:grid lg:grid-cols-4 lg:gap-8 lg:items-start"
        >
          {journey.map((stage, i) => (
            <li
              key={stage.title}
              data-journey-stage
              className="relative"
            >
              {/* Connector line between stages (desktop only) — never touches circle */}
              {i < journey.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hidden lg:block absolute top-5 h-px
                             bg-[var(--color-near-black)] opacity-15 z-0"
                  style={{ left: '2.75rem', width: 'calc(100% - 1.5rem)' }}
                />
              )}

              {/* Number node with solid cream background */}
              <div
                className="relative z-10 w-10 h-10 rounded-full border-2
                           border-[var(--color-near-black)] bg-[var(--color-cream)]
                           flex items-center justify-center mb-4"
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
  // useReveal for the intro section only (manifesto + journey have bespoke timelines)
  const introRevealRef = useReveal({ skip: ['manifesto-word', 'journey-stage'] })

  return (
    <SectionShell
      id="about"
      labelId="about-heading"
      theme="light"
      className="p-0"
    >
      <AboutIntro revealRef={introRevealRef} />
      <Manifesto />
      <Journey />
    </SectionShell>
  )
}
