import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
for (const [port,tag] of [[5174,'before'],[5173,'after']]) for (const [w,h] of [[1440,800],[1920,937]]){
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage()
  await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(3500)
  await p.screenshot({path:`/home/claude/scratch/${tag}-${w}x${h}.png`})
}
await b.close()
