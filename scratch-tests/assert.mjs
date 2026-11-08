import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
const V=[[1920,937],[1536,730],[1440,800],[1366,650],[1280,600],[1024,700],[2560,1080],[1920,1200]]
let fail=0
for (const [w,h] of V){
  const p=await (await b.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'})).newPage()
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(1800)
  const r=await p.evaluate(()=>{
    const bt=e=>e.getBoundingClientRect().bottom
    const btn=[...document.querySelectorAll('#hero a')].find(a=>/Regist|Opening|Closed/i.test(a.textContent))
    const exp=[...document.querySelectorAll('#hero a')].find(a=>/Explore/i.test(a.textContent)&&a.offsetParent)
    const hero=document.querySelector('#hero'), col=document.querySelector('[data-hero-col="left"]').getBoundingClientRect(), ev=document.querySelector('[data-hero="event"]').getBoundingClientRect()
    return {date:bt(document.querySelector('[data-event-date]')),cd:bt(document.querySelector('[data-hero="countdown"]')),btn:bt(btn),exp:bt(exp),left:col.left,right:ev.right,ih:innerHeight,iw:innerWidth,sw:document.documentElement.scrollWidth,hero:hero.getBoundingClientRect().height,wmTop:col.top}
  })
  const lim=h-16, checks={date:r.date<=lim,countdown:r.cd<=lim,button:r.btn<=lim,explore:r.exp<=lim,hscroll:r.sw<=r.iw,heroFits:r.hero<=h+1}
  const ok=Object.values(checks).every(Boolean); if(!ok) fail++
  console.log(`${w}x${h}`, ok?'PASS':'FAIL', JSON.stringify(checks), `contentL=${Math.round(r.left)} contentR=${Math.round(r.iw-r.right)}`)
}
await b.close(); console.log(fail?`${fail} FAILED`:'ALL PASS')
