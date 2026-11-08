/**
 * gen-og.mjs — rasterises public/images/og-image.svg to public/images/og-image.png (1200x630).
 * Uses sharp only (already a devDependency): no browser, no hard-coded paths, works on Windows/macOS/Linux.
 * The SVG has its text converted to outlines (see scripts/og-build-svg.py), so no fonts are needed.
 *
 *   node scripts/gen-og.mjs
 */
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const svg = path.join(root, 'public', 'images', 'og-image.svg')
const png = path.join(root, 'public', 'images', 'og-image.png')

const info = await sharp(svg, { density: 96 })
  .resize(1200, 630, { fit: 'fill' })
  .flatten({ background: '#F2EBDD' })
  .png({ compressionLevel: 9, palette: false })
  .toFile(png)

console.log(`og-image.png written: ${info.width}x${info.height}, ${info.size} bytes`)
