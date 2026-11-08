import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const [,, port, outdir] = process.argv
const fs = require('fs'); fs.mkdirSync(outdir,{recursive:true})
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
const S=[[320,568],[360,740],[390,844],[430,932],[768,1024],[1023,768]]
for (const [w,h] of S){
  const p=await (await b.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'})).newPage()
  await p.goto(`http://localhost:${port}/`); await p.waitForTimeout(1800)
  await p.addStyleTag({content:'[data-hero="countdown"]{visibility:hidden!important} #hero *{animation:none!important;transition:none!important} [data-hero="frag"],[data-hero="spark"]{visibility:hidden!important}'})
  await p.waitForTimeout(300)
  await p.screenshot({path:`${outdir}/m-${w}x${h}.png`})
}
await b.close()
