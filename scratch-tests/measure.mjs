import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const tag = process.argv[2] || 'baseline'
const only = process.argv[3] // optional filter: desktop|mobile|tablet
const V = [
 ['desktop',1920,937],['desktop',1536,730],['desktop',1440,800],['desktop',1366,650],['desktop',1280,600],['desktop',1024,700],
 ['tablet',768,1024],
 ['mobile',320,568],['mobile',360,740],['mobile',390,844],['mobile',430,932],
 ['wide',2560,1080],['tall',1920,1200],
]
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
const out=[]
for (const [k,w,h] of V) {
  if (only && k!==only) continue
  const ctx = await b.newContext({ viewport:{width:w,height:h}, reducedMotion:'reduce', deviceScaleFactor:1 })
  const p = await ctx.newPage()
  await p.goto((process.env.BASE||'http://localhost:5173/') + (process.env.Q||''), { waitUntil:'load' })
  if (process.env.FREEZE) await p.addStyleTag({content:'[data-hero="countdown"]{visibility:hidden!important} #hero *{animation:none!important;transition:none!important}'})
  await p.waitForTimeout(2500)
  const r = await p.evaluate(()=>{
    const q=s=>document.querySelector(s); const bx=e=>{ if(!e) return null; const r=e.getBoundingClientRect(); return {top:Math.round(r.top+scrollY),bottom:Math.round(r.bottom+scrollY),left:Math.round(r.left),right:Math.round(r.right)} }
    const btn=[...document.querySelectorAll('#hero a')].find(a=>/Register|Opening|Closed/i.test(a.textContent))
    const exp=[...document.querySelectorAll('#hero a')].filter(a=>/Explore/i.test(a.textContent)&&a.offsetParent!==null&&getComputedStyle(a).visibility!=='hidden')
    return { hero:bx(q('#hero')), countdown:bx(q('[data-hero="countdown"]')), cta:bx(q('[data-hero="cta"]')), date:bx(q('[data-event-date]')), btn:bx(btn), explore:exp.length,
      hscroll: document.documentElement.scrollWidth>innerWidth, sw:document.documentElement.scrollWidth, ih:innerHeight }
  })
  await p.screenshot({ path:`shots/${tag}-${k}-${w}x${h}.png` })
  const lim=h-16
  const rows=[r.date,r.countdown,r.btn]
  const pass = r.date? [r.date,r.countdown,r.btn].every(x=>x&&x.bottom<=lim) : null
  out.push({k,w,h,heroH:r.hero.bottom-r.hero.top,cd:r.countdown&&`${r.countdown.top}-${r.countdown.bottom}`,btnBottom:r.btn&&r.btn.bottom,date:r.date&&`${r.date.top}-${r.date.bottom}`,explore:r.explore,hscroll:r.hscroll,fits:pass})
  await ctx.close()
}
await b.close()
console.table(out)
