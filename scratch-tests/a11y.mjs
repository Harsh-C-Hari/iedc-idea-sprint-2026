import { createRequire } from 'module'
const require = createRequire('/home/claude/work/iedc-idea-sprint-2026-main/')
const { chromium } = require('playwright')
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args:['--no-sandbox'] })
let fail=0; const say=(n,ok,x='')=>{ if(!ok) fail++; console.log(ok?'PASS':'FAIL',n,x) }
for (const [w,h,rm] of [[1440,800,false],[1920,937,false],[1440,800,true]]){
  const p=await (await b.newContext({viewport:{width:w,height:h},reducedMotion:rm?'reduce':'no-preference'})).newPage()
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(3500)
  const tag=`${w}x${h}${rm?' reduced-motion':''}`
  // motion: every [data-hero] element (displayed ones) ends visible
  const m=await p.evaluate(()=>[...document.querySelectorAll('#hero [data-hero]')].filter(e=>e.offsetParent!==null).map(e=>{const s=getComputedStyle(e);const mt=s.transform==='none'?[1,0]:s.transform.match(/matrix\(([^)]+)\)/)[1].split(',').map(Number);return {k:e.dataset.hero,op:+s.opacity,scale:+Math.hypot(mt[0],mt[1]).toFixed(3),cp:s.clipPath}}).filter(x=>x.op<0.69||Math.abs(x.scale-1)>0.05||(x.cp!=='none'&&!/^inset\((0(px|%)?\s*)+\)$/.test(x.cp))))
  const sticker=await p.evaluate(()=>{const e=document.querySelector('[data-hero=event] [data-hero=frag]'),s=getComputedStyle(e);return {op:s.opacity,tr:s.transform,anim:s.animationName}})
  say(`motion: sticker ends opacity 1, scale 1, no float animation (${tag})`, sticker.op==='1'&&/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/.test(sticker.tr)&&sticker.anim==='none', JSON.stringify(sticker))
  say(`motion: all hero elements settled visible (${tag})`, m.length===0, JSON.stringify(m).slice(0,200))
  if(rm){ const an=await p.evaluate(()=>{const e=document.querySelector('[data-hero=event] [data-hero=frag]');return getComputedStyle(e).opacity}); say('reduced-motion: sticker visible & static',an==='1') ; continue }
  if(w===1920) continue
  // keyboard
  const seq=[]; for(let i=0;i<30;i++){ await p.keyboard.press('Tab'); const t=await p.evaluate(()=>(document.activeElement.closest('#hero')?'HERO:':'')+document.activeElement.textContent.trim().slice(0,12)); if(t.startsWith('HERO:')) seq.push(t); if(/HERO:.*regist/i.test(t)) break }
  say('keyboard: hero tab order Explore -> Register', seq.length===2&&/Explore/i.test(seq[0])&&/Regist/i.test(seq[1]), JSON.stringify(seq))
  const ring=await p.evaluate(()=>{const s=getComputedStyle(document.activeElement);return {c:s.outlineColor,w:s.outlineWidth,st:s.outlineStyle}})
  say('keyboard: 3px lime ring on Register', ring.c==='rgb(217, 243, 106)'&&ring.w==='3px'&&ring.st==='solid', JSON.stringify(ring))
  await p.keyboard.press('Enter'); await p.waitForTimeout(600)
  say('keyboard: Enter -> #registration', (await p.evaluate(()=>location.hash))==='#registration', await p.evaluate(()=>location.hash))
  await p.goto('http://localhost:5173/'); await p.waitForTimeout(2500)
  // screen reader
  const sr=await p.evaluate(()=>{
    const hero=document.querySelector('#hero'), card=document.querySelector('[data-hero=event]')
    const st=card.querySelector('[data-hero=frag]'), cl=[...hero.querySelectorAll('[aria-hidden]')].find(e=>typeof e.className==='string'&&e.className.includes('min-[1800px]'))
    return {sentence:card.querySelector('[data-event-date] .sr-only').textContent, visualHidden:card.querySelector('[data-event-date] > div').getAttribute('aria-hidden'),
      live:hero.querySelectorAll('[aria-live]').length, timerRole:card.querySelector('[role=timer]')?.getAttribute('role'), timerLiveAttr:card.querySelector('[role=timer]')?.getAttribute('aria-live'),
      stickerHidden:st.getAttribute('aria-hidden'), stickerFocusable:st.querySelectorAll('a,button,[tabindex]').length, clusterHidden:cl?.getAttribute('aria-hidden')}
  })
  say('sr: date reads as one sentence', /20 to 21 November 2026/.test(sr.sentence)&&sr.visualHidden==='true', sr.sentence)
  say('sr: countdown role=timer, no aria-live anywhere in hero', sr.timerRole==='timer'&&sr.live===0&&!sr.timerLiveAttr, `live=${sr.live}`)
  say('sr: sticker + cluster aria-hidden, sticker not focusable', sr.stickerHidden==='true'&&sr.clusterHidden==='true'&&sr.stickerFocusable===0)
}
await b.close(); console.log(fail?fail+' FAILED':'ALL PASS')
