import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
const p=await (await b.newContext({viewport:{width:1440,height:800},reducedMotion:'reduce'})).newPage()
await p.goto('http://localhost:5173/'); await p.waitForTimeout(1800)
const seq=[]
for(let i=0;i<30;i++){ await p.keyboard.press('Tab'); const t=await p.evaluate(()=>(document.activeElement.closest('#hero')?'HERO:':'')+document.activeElement.textContent.trim().slice(0,20)); seq.push(t); if(/HERO:.*regist/i.test(t)) break }
console.log(JSON.stringify(seq))
await p.waitForTimeout(400)
console.log(await p.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineColor+' '+s.outlineWidth+' '+s.outlineStyle}))
await p.screenshot({path:'/home/claude/scratch/p1-focus.png',clip:{x:780,y:100,width:520,height:520}})
await b.close()
