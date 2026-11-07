/**
 * App.jsx — root component.
 *
 * Renders:
 *   skip link → Navbar → <main> with 8 section placeholders → (sections added T5–T12)
 *
 * Phase 0 data-wiring check printed to console only (removed in T5).
 */
import './styles/index.css'
import Navbar from './components/nav/Navbar.jsx'
import eventConfig from './config/eventConfig.js'
import schedule from './data/schedule.js'
import prompts from './data/prompts.js'
import { manifesto, journey, steps } from './data/content.js'
import nav from './data/nav.js'
import { parseISO, getPhase } from './lib/time.js'

const _phase = getPhase(
  Date.now(),
  parseISO(eventConfig.startISO),
  parseISO(eventConfig.endISO),
)

if (import.meta.env.DEV) {
  console.info(
    '[IDEA SPRINT]',
    `phase=${_phase}`,
    `nav=${nav.length}`,
    `day1=${schedule[0]?.items.length}`,
    `day2=${schedule[1]?.items.length}`,
    `prompts=${Object.keys(prompts).length}`,
    `manifesto=${manifesto.length}`,
    `journey=${journey.length}`,
    `steps=${steps.length}`,
  )
}

export default function App() {
  return (
    <>
      {/* Skip link — plan section D */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" tabIndex={-1}>
        {/* Sections added T5–T12 */}
        {/* Temporary placeholder so the shell has visible content */}
        <div
          style={{
            paddingTop: '4rem',
            minHeight: '100dvh',
            background: 'var(--color-cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            fontFamily: 'var(--font-display)',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2rem, 8vw, 6rem)',
              color: 'var(--color-near-black)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            {eventConfig.name}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-near-black)',
              opacity: 0.6,
              fontSize: '0.875rem',
            }}
          >
            Phase 1 in progress — sections loading…
          </p>
        </div>
      </main>
    </>
  )
}
