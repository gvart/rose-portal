import sharp from 'sharp'
import { readFileSync } from 'fs'
import { mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const SOURCE_SVG = join(__dirname, '../public/icons/home.svg')
const OUTPUT_DIR = join(__dirname, '../public/icons/pwa')

async function generateIcons() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  const svgBuffer = readFileSync(SOURCE_SVG)

  console.log('Generating PWA icons from home.svg...')

  for (const size of SIZES) {
    const outputPath = join(OUTPUT_DIR, `icon-${size}x${size}.png`)

    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 16, g: 185, b: 129, alpha: 1 } // #10b981
      })
      .png()
      .toFile(outputPath)

    console.log(`✓ Generated ${size}x${size} icon`)
  }

  // Generate Apple Touch Icon
  const appleTouchPath = join(__dirname, '../public/apple-touch-icon.png')
  await sharp(svgBuffer)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 16, g: 185, b: 129, alpha: 1 }
    })
    .png()
    .toFile(appleTouchPath)

  console.log('✓ Generated Apple Touch Icon (180x180)')
  console.log('✓ All icons generated successfully!')
}

generateIcons().catch(console.error)
