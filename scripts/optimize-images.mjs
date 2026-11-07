import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const destDir = path.resolve('public/images')

async function optimize() {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  const campusSource = path.join(destDir, 'cec-campus.jpg')
  if (fs.existsSync(campusSource)) {
    console.log('Optimizing cec-campus images...')
    await sharp(campusSource)
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(destDir, 'cec-campus.webp'))

    console.log('Generated public/images/cec-campus.webp')
  } else {
    console.log('No cec-campus.jpg found in public/images/')
  }
}

optimize().catch(console.error)
