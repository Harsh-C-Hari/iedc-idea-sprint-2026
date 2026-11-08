/**
 * gen-favicon.mjs — favicon-32.png and apple-touch-icon.png (180) from the IEDC mark.
 * sharp only (devDependency). The mark is the real asset (/images/iedc-mark.png), trimmed of its
 * transparent margin and centred on a cream tile; the IEDC blue comes only from the logo itself.
 *
 *   node scripts/gen-favicon.mjs
 */
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const mark = path.join(root, 'public', 'images', 'iedc-mark.png')
const outDir = path.join(root, 'public', 'favicon')
const CREAM = '#F2EBDD'

async function tile(size, { radius = 0, fill = 0.84 } = {}) {
  const inner = Math.round(size * fill)
  const glyph = await sharp(mark).trim().resize({ width: inner, height: inner, fit: 'inside' }).png().toBuffer()
  const bg = radius
    ? Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${CREAM}"/></svg>`)
    : { create: { width: size, height: size, channels: 3, background: CREAM } }
  return sharp(bg).composite([{ input: glyph, gravity: 'centre' }]).png({ compressionLevel: 9 }).toBuffer()
}

// 32px browser tab: rounded tile, mark nearly edge to edge so it stays legible when tiny
await sharp(await tile(32, { radius: 6, fill: 0.88 })).toFile(path.join(outDir, 'favicon-32.png'))
// 180px iOS home screen: square tile (iOS applies its own corner mask)
await sharp(await tile(180, { fill: 0.78 })).toFile(path.join(outDir, 'apple-touch-icon.png'))
console.log('wrote favicon-32.png (32x32) and apple-touch-icon.png (180x180) in public/favicon/')
