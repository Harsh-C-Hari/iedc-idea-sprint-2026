/**
 * useScrollSpy.js — which tracked section crosses the reading line.
 *
 * • One IntersectionObserver over the section elements (no scroll listener).
 *   rootMargin '-40% 0px -55% 0px' leaves a thin band at 40–45% of the viewport — the reading
 *   line — which is also well below the 4rem fixed header.
 * • Above the first tracked section (the hero) nothing is active.
 * • At the very bottom of the page the last section is forced active. The bottom is detected with a
 *   second observer on a 1px sentinel appended after the footer (still no scroll listener).
 * • Never touches location.hash. Fail-safe: without IntersectionObserver, returns null forever.
 * • Observers (and the sentinel) are cleaned up on unmount.
 */
import { useEffect, useState } from 'react'

export default function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(null)
  const key = ids.join('|')

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return undefined
    const list = key.split('|')
    const els = list.map((id) => document.getElementById(id))
    if (els.some((el) => !el)) return undefined // markup not as expected: highlight nothing

    const crossing = new Set()
    let atBottom = false
    let current = null

    const publish = (next) => {
      if (next !== current) {
        current = next
        setActiveId(next)
      }
    }

    const compute = () => {
      if (atBottom) return publish(list[list.length - 1])
      // last section in page order that crosses the line wins at a boundary
      for (let i = list.length - 1; i >= 0; i--) {
        if (crossing.has(list[i])) return publish(list[i])
      }
      // Nothing crosses the line: above the first tracked section => none; otherwise keep the last one
      const firstTop = els[0].getBoundingClientRect().top
      if (firstTop > window.innerHeight * 0.4) return publish(null)
      return undefined
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) crossing.add(e.target.id)
          else crossing.delete(e.target.id)
        })
        compute()
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    els.forEach((el) => io.observe(el))

    const sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    sentinel.style.cssText = 'height:1px;width:1px;pointer-events:none;'
    document.body.appendChild(sentinel)
    const bottomIO = new IntersectionObserver(
      (entries) => {
        atBottom = entries[entries.length - 1].isIntersecting
        compute()
      },
      { threshold: 0 }
    )
    bottomIO.observe(sentinel)

    return () => {
      io.disconnect()
      bottomIO.disconnect()
      sentinel.remove()
    }
  }, [key])

  return activeId
}
