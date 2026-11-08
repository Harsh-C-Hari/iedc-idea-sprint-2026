/**
 * optimize-images.mjs — builds AVIF / WebP / JPG variants from the master JPGs.
 * Masters live in assets-src/ (outside public, never shipped).
 * masters are read from assets-src/*.jpg when present, else from the JPG itself.
 * Widths never exceed the source width (no upscaling).
 * Run: node scripts/optimize-images.mjs
 */
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const dir = path.resolve('public/images')
const srcDir = path.resolve('assets-src')
const WIDTHS = [640, 1024, 1600]
const jobs = ['cec-campus', 'cec-map']

async function run() {
  fs.mkdirSync(srcDir, { recursive: true })
  for (const name of jobs) {
    const master = path.join(srcDir, `${name}.jpg`)
    const live = path.join(dir, `${name}.jpg`)
    if (!fs.existsSync(master)) {
      if (!fs.existsSync(live)) continue
      fs.copyFileSync(live, master)
    }
    const meta = await sharp(master).metadata()
    // Skip sizes within 64px of the source width so we don't ship near-duplicate files
    const widths = [...new Set(WIDTHS.filter((w) => w < meta.width - 64).concat(meta.width))]
    for (const w of widths) {
      const base = sharp(master).resize({ width: w, withoutEnlargement: true })
      const out = path.join(dir, `${name}-${w}`)
      await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${out}.avif`)
      await base.clone().webp({ quality: 78, effort: 6 }).toFile(`${out}.webp`)
      await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(`${out}.jpg`)
      console.log(name, w, 'avif/webp/jpg', ['avif', 'webp', 'jpg'].map((e) => fs.statSync(`${out}.${e}`).size))
    }
  }
}
run().catch((e) => { console.error(e); process.exit(1) })
