/**
 * shot-hero.mjs — captures the README hero screenshot (doc/hero.png, 1440x900).
 * Needs a running server and a Playwright browser (one-time: npx playwright install chromium).
 *
 *   npm run build && npm run preview        # terminal 1 (http://localhost:4173)
 *   node scripts/shot-hero.mjs [url]        # terminal 2
 */
import { chromium } from 'playwright'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const url = process.argv[2] ?? 'http://localhost:4173/'
const out = path.join(root, 'doc', 'hero.png')
fs.mkdirSync(path.dirname(out), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500) // loader (~1.1 s) + hero entrance
await page.screenshot({ path: out })
await browser.close()
console.log('wrote', path.relative(root, out))
