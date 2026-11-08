import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
const V=[[1920,937],[1536,730],[1440,800],[1366,650],[1280,600],[1024,700],[1680,900],[1800,900],[1799,900],[2560,1080],[1920,1200]]
let fail=0
const hit=(a,c,m=0)=>a.left<c.right+m&&a.right>c.left-m&&a.top<c.bottom+m&&a.bottom>c.top-m
for (const [w,h] of V){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage()
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(2500); await p.waitForFunction(()=>{const e=document.querySelector('[data-hero=event] [data-hero=frag]');return e&&getComputedStyle(e).opacity==='1'},null,{timeout:8000}).catch(()=>{}); await p.waitForTimeout(300)
  const r=await p.evaluate(()=>{
    const R=e=>{const x=e.getBoundingClientRect();return {left:x.left,top:x.top,right:x.right,bottom:x.bottom}}
    const card=document.querySelector('[data-hero=event]'), cr=R(card)
    const block={left:cr.left+6,top:cr.top+6,right:cr.right+6,bottom:cr.bottom+6}
    const st=card.querySelector('[data-hero=frag]'), sv=R(st.querySelector('svg')), sw=st
    const cl=[...document.querySelectorAll('#hero [aria-hidden]')].find(e=>typeof e.className==='string'&&e.className.includes('min-[1800px]'))
    const found=!!cl; const cs=cl?getComputedStyle(cl):null, shown=cs&&cs.display!=='none'
    const rg=document.createRange(); rg.selectNodeContents(card.querySelector('[data-event-date] [aria-hidden] p')); const dr=rg.getBoundingClientRect(); const date={left:dr.left,top:dr.top,right:dr.right,bottom:dr.bottom}
    const sc=getComputedStyle(st)
    return {found,cr,block,sv,date,shown,cl:shown?R(cl):null,op:sc.opacity,tr:sc.transform,nav:document.querySelector('header,nav')?.getBoundingClientRect().bottom,ih:innerHeight,iw:innerWidth,sw:document.documentElement.scrollWidth,
      sparks:[...document.querySelectorAll('#hero svg')].length}
  })
  const union={left:r.cr.left,top:Math.min(r.cr.top,r.sv.top),right:Math.max(r.block.right,r.sv.right),bottom:r.block.bottom}
  const c={
   stickerInViewport:r.sv.right<=r.iw-8&&r.sv.top>=0, belowNav:r.sv.top>=Math.max(64,r.nav||64)+8,
   notOverDate:!hit(r.sv,r.date), visible:r.op==='1'&&(r.tr==='none'||/matrix\(1, 0, 0, 1, 0, 0\)/.test(r.tr)),
   clusterFound:r.found, clusterClear:!r.shown||!hit(r.cl,union,12), clusterShownWhenWide:w<1800||h<=720||r.shown, noHScroll:r.sw<=r.iw }
  const ok=Object.values(c).every(Boolean); if(!ok) fail++
  console.log(`${w}x${h}`, ok?'PASS':'FAIL', JSON.stringify(c), 'stickerTop='+Math.round(r.sv.top), 'cluster='+(r.shown?'shown':'hidden'))
  if([[1440,800],[1280,600],[1920,937]].some(([a,d])=>a===w&&d===h)) await p.screenshot({path:`/home/claude/scratch/p3-${w}x${h}.png`})
}
await b.close(); console.log(fail?fail+' FAILED':'ALL PASS')
