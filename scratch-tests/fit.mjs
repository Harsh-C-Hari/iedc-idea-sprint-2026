import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const tag=process.argv[2]||'fit'
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
const out=[]
for (const [w,h] of [[1920,937],[1536,730],[1440,800],[1366,650],[1280,600],[1024,700]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'})).newPage()
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(1800)
  const r = await p.evaluate(()=>{
    const col=document.querySelector('[data-hero-col="left"]'), wm=document.querySelector('[data-hero="wordmark"]'), h1=document.querySelector('#hero-heading')
    const cb=col.getBoundingClientRect()
    const lines=[...document.querySelectorAll('[data-hero="h1-word"]')].map(e=>Math.round(e.getBoundingClientRect().top))
    const nav=64
    return { colW:Math.round(cb.width), colH:Math.round(cb.height), wmScroll:wm.scrollWidth, wmFs:Math.round(parseFloat(getComputedStyle(wm).fontSize)), h1Scroll:h1.scrollWidth, h1Fs:Math.round(parseFloat(getComputedStyle(h1).fontSize)), h1lines:[...new Set(lines)].length, avail:innerHeight-nav, hero:Math.round(document.querySelector('#hero').getBoundingClientRect().height) }
  })
  r.ratio=(r.colH/r.avail).toFixed(2); out.push({vp:`${w}x${h}`,...r})
  await p.screenshot({path:`shots/${tag}-${w}x${h}.png`})
}
await b.close(); console.table(out)
