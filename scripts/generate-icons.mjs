// Generates all DueWell PWA icons from an inline SVG (font-independent, so it
// renders identically on every machine). Run: `npm run generate-icons`.
// Replace with a real design later — just re-run this script with a new SVG.
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pub = resolve(root, 'public')
const iconDir = resolve(pub, 'icons')

// Calendar + check motif on a teal→deep-teal gradient.
// `rounded` = corner radius (0 for full-bleed / maskable / apple-touch).
function svg({ rounded = 0 } = {}) {
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#18b2a2"/>
      <stop offset="0.55" stop-color="#0f766e"/>
      <stop offset="1" stop-color="#0b4f57"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.28" cy="0.22" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="card"><rect x="146" y="170" width="220" height="196" rx="34"/></clipPath>
  </defs>

  <rect x="0" y="0" width="512" height="512" rx="${rounded}" fill="url(#bg)"/>
  <rect x="0" y="0" width="512" height="512" rx="${rounded}" fill="url(#glow)"/>

  <!-- calendar tabs -->
  <rect x="197" y="146" width="20" height="44" rx="10" fill="#ffffff"/>
  <rect x="295" y="146" width="20" height="44" rx="10" fill="#ffffff"/>

  <!-- calendar card -->
  <g clip-path="url(#card)">
    <rect x="146" y="170" width="220" height="196" fill="#ffffff"/>
    <rect x="146" y="170" width="220" height="60" fill="#0f766e"/>
  </g>

  <!-- check mark -->
  <path d="M198 296 L242 340 L322 256" fill="none" stroke="#0f766e"
        stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
}

async function render(svgString, size, outPath, { flatten } = {}) {
  let img = sharp(Buffer.from(svgString)).resize(size, size)
  if (flatten) img = img.flatten({ background: '#0f766e' })
  await img.png().toFile(outPath)
  console.log('  ✓', outPath.replace(root + '/', '').replace(root + '\\', ''))
}

async function main() {
  await mkdir(iconDir, { recursive: true })

  const rounded = svg({ rounded: 112 }) // ~22% radius, nice on Android
  const full = svg({ rounded: 0 }) // full-bleed for maskable + apple-touch

  console.log('Generating DueWell icons…')
  await render(rounded, 192, resolve(iconDir, 'pwa-192x192.png'))
  await render(rounded, 512, resolve(iconDir, 'pwa-512x512.png'))
  // Maskable icons are full-bleed (no rounding): Android applies its own
  // adaptive mask. The motif sits well inside the 80% safe zone, so nothing
  // meaningful is clipped at any mask shape. We ship both sizes so PWABuilder
  // reports a complete maskable set.
  await render(full, 512, resolve(iconDir, 'maskable-512x512.png'))
  await render(full, 192, resolve(iconDir, 'maskable-192x192.png'))
  // iOS applies its own rounded mask, so the source must be a full square.
  await render(full, 180, resolve(pub, 'apple-touch-icon.png'), { flatten: true })
  await render(rounded, 32, resolve(pub, 'favicon-32.png'))

  // Crisp SVG favicon for desktop browser tabs.
  await writeFile(resolve(pub, 'favicon.svg'), svg({ rounded: 96 }), 'utf8')
  console.log('  ✓ public/favicon.svg')
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
