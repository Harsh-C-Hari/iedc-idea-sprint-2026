import './styles/index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)


// Reveal fail-safe: if GSAP never wired scroll reveals (script error, blocked chunk),
// force every [data-reveal] element visible so content is never left hidden.
setTimeout(() => {
  try {
    if (ScrollTrigger.getAll().length === 0) document.documentElement.classList.add('reveal-failsafe')
  } catch {
    document.documentElement.classList.add('reveal-failsafe')
  }
}, 6000)
