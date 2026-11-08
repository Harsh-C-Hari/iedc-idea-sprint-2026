import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
for (const [n,q] of [['before',''],['live','?now=2026-11-20T18:30:00%2B05:30'],['after','?now=2026-11-22T10:00:00%2B05:30']]) for (const [w,h] of [[1440,800],[1024,700]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'})).newPage()
  await p.goto('http://localhost:5173/'+q); await p.waitForTimeout(1800)
  const r = await p.evaluate(()=>{const ev=document.querySelector('[data-hero="event"]').getBoundingClientRect(); const cd=document.querySelector('[data-hero="countdown"]'); const kids=[...cd.querySelectorAll('div,span')]; const over=kids.some(k=>k.getBoundingClientRect().right>ev.right-20); return {cardRight:Math.round(ev.right),over,cdH:Math.round(cd.getBoundingClientRect().height),txt:cd.innerText.replace(/\n/g,' ').slice(0,40),btn:[...document.querySelectorAll('#hero a')].find(a=>/Regist|Opening|Closed/i.test(a.textContent)).textContent.trim(), exp:[...document.querySelectorAll('#hero a')].filter(a=>/Explore/i.test(a.textContent)&&a.offsetParent).length}})
  console.log(n,w,JSON.stringify(r))
  if(w==1440) await p.screenshot({path:`shots/state-${n}.png`})
}
await b.close()
