/**
 * App.jsx — root component.
 *
 * Renders:
 *   skip link → Navbar → <main> (Hero through Venue) → Footer
 *   SectionWipe at three cream/dark boundaries (plan section B, T16):
 *     1. Hero → About         (cream / dark manifesto) — accent: orange
 *     2. About → IdeaSpark    (cream → dark)           — accent: lime
 *     3. Challenge → Registration (cream → dark)       — accent: orange
 *
 * Phase 0 data-wiring check printed to console only in DEV.
 */
import './styles/index.css'
import Navbar from './components/nav/Navbar.jsx'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import IdeaSpark from './sections/IdeaSpark.jsx'
import Timeline from './sections/Timeline.jsx'
import Challenge from './sections/Challenge.jsx'
import Registration from './sections/Registration.jsx'
import Venue from './sections/Venue.jsx'
import Footer from './sections/Footer.jsx'
import SectionWipe from './motion/SectionWipe.jsx'
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
        <Hero />

        {/* Boundary 1: Hero → About (cream accent, dark manifesto follows) */}
        <SectionWipe
          id="hero-about"
          fromColor="var(--color-cream)"
          toColor="var(--color-cream)"
          accentColor="var(--color-orange)"
        />

        <About />

        {/* Boundary 2: About → IdeaSpark (cream → dark) */}
        <SectionWipe
          id="about-ideaspark"
          fromColor="var(--color-cream)"
          toColor="var(--color-near-black)"
          accentColor="var(--color-lime)"
        />

        <IdeaSpark />
        <Timeline />
        <Challenge />

        {/* Boundary 3: Challenge → Registration (cream → dark) */}
        <SectionWipe
          id="challenge-registration"
          fromColor="var(--color-cream)"
          toColor="var(--color-near-black)"
          accentColor="var(--color-orange)"
        />

        <Registration />
        <Venue />
      </main>

      <Footer />
    </>
  )
}
