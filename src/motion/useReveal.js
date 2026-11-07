/**
 * motion/useReveal.js — shared reveal hook driven by data-reveal attributes.
 *
 * Usage:
 *   const ref = useReveal()
 *   <div ref={ref}>
 *     <p data-reveal="fade">Fades in when scrolled into view</p>
 *     <p data-reveal="fade" data-reveal-delay="0.1">Staggered</p>
 *   </div>
 *
 * Supported data-reveal values:
 *   "fade"         — opacity 0→1, y 24→0
 *   "slide-left"   — opacity 0→1, x -40→0
 *   "slide-right"  — opacity 0→1, x 40→0
 *   "clip"         — clipPath top-to-bottom reveal (for headlines)
 *   "scale"        — scale 0.88→1, opacity 0→1
 *   "manifesto-word" — special: handled by About.jsx bespoke timeline
 *   "journey-stage"  — special: handled by About.jsx bespoke timeline
 *
 * Attributes:
 *   data-reveal-delay  — numeric delay in seconds (default 0)
 *   data-reveal-stagger — numeric stagger when multiple siblings share a parent
 *
 * Fail-safe: elements are visible by default in CSS.
 * GSAP sets the hidden start state itself inside useGSAP().
 * If GSAP never runs, all content remains visible.
 *
 * Reduced motion: ScrollTrigger still fires but durations collapse to 0
 * and start states are skipped entirely — final values applied instantly.
 */
import { useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from './gsap.js'

const REDUCED = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

/**
 * Maps a data-reveal value to a fromVars object.
 * fromVars are applied by GSAP as the hidden start state.
 * On reduced motion these are skipped — elements stay at their natural CSS state.
 */
function fromVars(type) {
  if (REDUCED) return {}   // skip hidden start state under reduced motion
  switch (type) {
    case 'fade': return { opacity: 0, y: 24 }
    case 'slide-left': return { opacity: 0, x: -40 }
    case 'slide-right': return { opacity: 0, x: 40 }
    case 'clip': return { clipPath: 'inset(0 0 100% 0)', opacity: 1 }
    case 'scale': return { scale: 0.88, opacity: 0 }
    default: return { opacity: 0, y: 16 }
  }
}

function toVars(type) {
  if (REDUCED) return { duration: 0 }
  switch (type) {
    case 'fade': return { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
    case 'slide-left': return { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
    case 'slide-right': return { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
    case 'clip': return { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power4.out' }
    case 'scale': return { scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(1.4)' }
    default: return { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
  }
}

/**
 * useReveal(options?)
 * Returns a ref to attach to the section wrapper.
 * Finds all [data-reveal] descendants and wires ScrollTrigger reveals.
 *
 * Options:
 *   skip {string[]} — data-reveal values to skip (let bespoke timelines handle them)
 */
export default function useReveal({ skip = [] } = {}) {
  const ref = useRef(null)

  useGSAP(() => {
    if (!ref.current) return

    const selector = '[data-reveal]'
    const elements = Array.from(ref.current.querySelectorAll(selector)).filter(
      (el) => !skip.includes(el.dataset.reveal)
    )
    if (!elements.length) return

    if (REDUCED) {
      elements.forEach((el) => gsap.set(el, { opacity: 1, x: 0, y: 0, scale: 1 }))
      return
    }

    // ScrollTrigger.batch batches elements entering together for smooth staggers
    ScrollTrigger.batch(elements, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        batch.forEach((el, i) => {
          const type = el.dataset.reveal
          const delay = parseFloat(el.dataset.revealDelay ?? '0')
          const from = fromVars(type)
          const to = {
            ...toVars(type),
            delay: delay || i * 0.08,
          }
          if (Object.keys(from).length) {
            gsap.set(el, from)
          }
          gsap.to(el, to)
        })
      },
    })
  }, { scope: ref, dependencies: [] })

  return ref
}
