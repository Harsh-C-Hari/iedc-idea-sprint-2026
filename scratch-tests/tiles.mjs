import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
const states={before:'',live:'?now=2026-11-20T18:30:00%2B05:30',after:'?now=2026-11-22T10:00:00%2B05:30'}
for (const [w,h] of [[1440,800],[1024,700],[1920,937]]) for (const [st,q] of Object.entries(states)){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage()
  await p.goto('http://localhost:5173/'+q); await p.waitForTimeout(2200)
  const sample=()=>p.evaluate(()=>{
    const cd=document.querySelector('[data-hero=countdown]'), card=document.querySelector('[data-hero=event]').getBoundingClientRect()
    const tiles=[...cd.querySelectorAll('.tabular-nums')].map(d=>d.parentElement)
    return {tiles:tiles.map(t=>{const r=t.getBoundingClientRect();const d=t.querySelector('.tabular-nums').getBoundingClientRect();return {x:Math.round(r.x),w:+r.width.toFixed(1),h:+r.height.toFixed(1),top:Math.round(r.top),dw:+d.width.toFixed(1),over:t.scrollWidth>t.clientWidth}}),
      cardBottom:Math.round(card.bottom), cdBottom:Math.round(cd.getBoundingClientRect().bottom), cdW:Math.round(cd.getBoundingClientRect().width), text:cd.innerText.replace(/\s+/g,' ').slice(0,40)}
  })
  const a=await sample(); const ws=new Set(), tops=new Set()
  for(let i=0;i<6;i++){ await p.waitForTimeout(500); const s=await sample(); s.tiles.forEach(t=>{ws.add(t.w+'x'+t.h);tops.add(t.top)}) }
  console.log(`${w}x${h} ${st}`, JSON.stringify({text:a.text,n:a.tiles.length,tile:a.tiles[0],maxDigitW:Math.max(0,...a.tiles.map(t=>t.dw)),overflow:a.tiles.some(t=>t.over),oneRow:tops.size<=1,sizes:[...ws],cardBottom:a.cardBottom,innerH:h}))
  if(st==='before'&&w!==1920) await p.screenshot({path:`/home/claude/scratch/p2-${w}x${h}.png`})
  if(st!=='before'&&w===1440) await p.screenshot({path:`/home/claude/scratch/p2-${st}.png`,clip:{x:800,y:240,width:480,height:380}})
}
await b.close()
