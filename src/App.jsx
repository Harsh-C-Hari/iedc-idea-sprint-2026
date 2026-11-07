/**
 * App.jsx — root component.
 * Phase 0 shell: imports all config/data to validate T3 exports.
 * Sections are added task by task from T4 onward.
 */
import './styles/index.css'
import eventConfig from './config/eventConfig.js'
import schedule from './data/schedule.js'
import prompts from './data/prompts.js'
import { manifesto, journey, steps } from './data/content.js'
import nav from './data/nav.js'
import { parseISO, getPhase } from './lib/time.js'

// Validate config is wired (dev-only, removed in Phase 1)
const _startMs = parseISO(eventConfig.startISO)
const _endMs   = parseISO(eventConfig.endISO)
const _phase   = getPhase(Date.now(), _startMs, _endMs)

export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', background: '#f5f0e8', minHeight: '100dvh' }}>
      <h1 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '2rem', marginBottom: '1rem' }}>
        {eventConfig.name}
      </h1>
      <p>{eventConfig.tagline}</p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
        Phase: <strong>{_phase}</strong> · Nav items: {nav.length} (expect 6) ·
        Schedule days: {schedule.length} · Day 1 items: {schedule[0]?.items.length} (expect 7) ·
        Day 2 items: {schedule[1]?.items.length} (expect 4) ·
        Prompt categories: {Object.keys(prompts).length} ·
        Manifesto words: {manifesto.length} · Journey stages: {journey.length} ·
        Challenge steps: {steps.length}
      </p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#999' }}>
        Phase 0 shell — sections added in Phase 1 (T4–T12)
      </p>
    </div>
  )
}
