import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const destDir = path.resolve('public/images')

async function optimize() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  // 1. Campus photo
  const campusSource = path.join(destDir, 'cec-campus.jpg')
  if (fs.existsSync(campusSource)) {
    console.log('Optimizing cec-campus images...')
    await sharp(campusSource)
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(destDir, 'cec-campus.webp'))
    console.log('Generated public/images/cec-campus.webp')
  }

  // 2. Map preview
  const mapSource = path.join(destDir, 'cec-map.jpg')
  if (fs.existsSync(mapSource)) {
    console.log('Optimizing cec-map images...')
    await sharp(mapSource)
      .webp({ quality: 88, effort: 6 })
      .toFile(path.join(destDir, 'cec-map.webp'))
    console.log('Generated public/images/cec-map.webp')
  }
}

optimize().catch(console.error)
