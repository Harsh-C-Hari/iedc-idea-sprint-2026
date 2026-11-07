/**
 * App.jsx — root component.
 *
 * Renders:
 *   skip link → Navbar → <main> (Hero through Venue) → Footer
 *   SectionWipe at three genuine cream/dark boundaries (plan section B, T16):
 *     1. About → IdeaSpark        (cream → dark)  — accent: lime
 *     2. Challenge → Registration (cream → dark)  — accent: orange
 *     3. Venue → Footer           (cream → dark)  — accent: lime
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
import eventConfig from './config/eventConfig.js'
import schedule from './data/schedule.js'
import prompts from './data/prompts.js'
import { manifesto, journey, steps } from './data/content.js'
import nav from './data/nav.js'
import { parseISO, getPhase } from './lib/time.js'
import Loader from './motion/Loader.jsx'

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
      {/* Loader — drives CSS shell exit with GSAP (plan section B, T17) */}
      <Loader />

      {/* Skip link — plan section D */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" tabIndex={-1}>
        <Hero />
        <About />
        <IdeaSpark />
        <Timeline />
        <Challenge />
        <Registration />
        <Venue />
      </main>

      <Footer />
    </>
  )
}
