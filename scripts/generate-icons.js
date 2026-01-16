import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const SOURCE_SVG = join(__dirname, '../public/icons/home.svg')
const OUTPUT_DIR = join(__dirname, '../public/icons/pwa')
const SPLASH_DIR = join(__dirname, '../public/splash')

// Apple splash screen sizes for different devices
const SPLASH_SCREENS = [
  // iPhone SE, iPod touch
  { width: 640, height: 1136, name: 'apple-splash-640-1136' },
  // iPhone 8, 7, 6s, 6
  { width: 750, height: 1334, name: 'apple-splash-750-1334' },
  // iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208' },
  // iPhone X, XS, 11 Pro
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436' },
  // iPhone XR, 11
  { width: 828, height: 1792, name: 'apple-splash-828-1792' },
  // iPhone XS Max, 11 Pro Max
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688' },
  // iPhone 12 mini, 13 mini
  { width: 1080, height: 2340, name: 'apple-splash-1080-2340' },
  // iPhone 12, 12 Pro, 13, 13 Pro, 14
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532' },
  // iPhone 12 Pro Max, 13 Pro Max
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778' },
  // iPhone 14 Pro
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556' },
  // iPhone 14 Pro Max, 15 Pro Max
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796' },
  // iPad Mini, iPad Air
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048' },
  // iPad Pro 10.5"
  { width: 1668, height: 2224, name: 'apple-splash-1668-2224' },
  // iPad Pro 11"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388' },
  // iPad Pro 12.9"
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732' },
]

// Theme color (emerald green)
const THEME_COLOR = { r: 16, g: 185, b: 129, alpha: 1 } // #10b981
const BG_COLOR = { r: 255, g: 255, b: 255, alpha: 1 } // white background

async function generateIcons() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  const svgBuffer = readFileSync(SOURCE_SVG)

  console.log('Generating PWA icons from home.svg...')

  for (const size of SIZES) {
    const outputPath = join(OUTPUT_DIR, `icon-${size}x${size}.png`)

    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: THEME_COLOR
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
      background: THEME_COLOR
    })
    .png()
    .toFile(appleTouchPath)

  console.log('✓ Generated Apple Touch Icon (180x180)')
}

async function generateSplashScreens() {
  await mkdir(SPLASH_DIR, { recursive: true })

  const svgBuffer = readFileSync(SOURCE_SVG)

  console.log('\nGenerating PWA splash screens...')

  for (const screen of SPLASH_SCREENS) {
    const outputPath = join(SPLASH_DIR, `${screen.name}.png`)

    // Calculate icon size (30% of the smaller dimension)
    const iconSize = Math.round(Math.min(screen.width, screen.height) * 0.25)

    // Create the icon with theme color background
    const iconBuffer = await sharp(svgBuffer)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: THEME_COLOR
      })
      .png()
      .toBuffer()

    // Create splash screen with centered icon
    const left = Math.round((screen.width - iconSize) / 2)
    const top = Math.round((screen.height - iconSize) / 2) - Math.round(screen.height * 0.05) // Slightly above center

    await sharp({
      create: {
        width: screen.width,
        height: screen.height,
        channels: 4,
        background: BG_COLOR
      }
    })
      .composite([
        {
          input: iconBuffer,
          left,
          top
        }
      ])
      .png()
      .toFile(outputPath)

    console.log(`✓ Generated splash screen ${screen.width}x${screen.height}`)
  }

  console.log('✓ All splash screens generated successfully!')
}

async function main() {
  try {
    await generateIcons()
    await generateSplashScreens()
    console.log('\n✓ All assets generated successfully!')
  } catch (error) {
    console.error('Error generating assets:', error)
    process.exit(1)
  }
}

main()
