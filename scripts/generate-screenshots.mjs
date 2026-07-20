// Generates placeholder store/manifest screenshots for DueWell from inline SVG
// (font-independent, renders identically on every machine). Run:
//   npm run generate-screenshots
// These are branded placeholders using SYNTHETIC data only — replace them with
// real captures of the running app before your final Play Store submission.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const shotDir = resolve(root, 'public', 'screenshots')

// Synthetic sample bills — obviously fake, never real customer data.
const bills = [
  { name: 'Electricity', due: 'Due in 2 days', amount: '₹1,240', tint: '#f59e0b' },
  { name: 'Internet', due: 'Due in 5 days', amount: '₹799', tint: '#38bdf8' },
  { name: 'Rent', due: 'Due Jul 28', amount: '₹18,000', tint: '#a78bfa' },
  { name: 'Credit Card', due: 'Due Aug 02', amount: '₹4,520', tint: '#34d399' },
]

// The DueWell calendar+check mark, scaled to sit inside a small rounded badge.
function logoBadge(x, y, size) {
  const s = size / 512
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <defs>
      <linearGradient id="lb" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#18b2a2"/><stop offset="0.55" stop-color="#0f766e"/><stop offset="1" stop-color="#0b4f57"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#lb)"/>
    <rect x="197" y="146" width="20" height="44" rx="10" fill="#fff"/>
    <rect x="295" y="146" width="20" height="44" rx="10" fill="#fff"/>
    <rect x="146" y="170" width="220" height="196" rx="34" fill="#fff"/>
    <rect x="146" y="170" width="220" height="60" rx="0" fill="#0f766e"/>
    <path d="M198 296 L242 340 L322 256" fill="none" stroke="#0f766e" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`
}

function billCard(x, y, w, b) {
  const h = 132
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="#111c30" stroke="#1e2b45" stroke-width="1.5"/>
    <rect x="${x + 28}" y="${y + 30}" width="72" height="72" rx="20" fill="${b.tint}" opacity="0.18"/>
    <circle cx="${x + 64}" cy="${y + 66}" r="14" fill="${b.tint}"/>
    <text x="${x + 128}" y="${y + 58}" font-family="sans-serif" font-size="34" font-weight="600" fill="#f1f5f9">${b.name}</text>
    <text x="${x + 128}" y="${y + 98}" font-family="sans-serif" font-size="26" fill="#94a3b8">${b.due}</text>
    <text x="${x + w - 28}" y="${y + 78}" text-anchor="end" font-family="sans-serif" font-size="34" font-weight="700" fill="#5eead4">${b.amount}</text>
  </g>`
}

function frame(width, height, inner) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#0d182b"/>
      </linearGradient>
      <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#0b4f57"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    ${inner}
  </svg>`
}

// --- Narrow (mobile portrait) 1080x1920 ---
function mobile() {
  const M = 56 // side margin
  const w = 1080 - M * 2
  let y = 150
  const header =
    `${logoBadge(M, y, 84)}` +
    `<text x="${M + 108}" y="${y + 40}" font-family="sans-serif" font-size="52" font-weight="700" fill="#f8fafc">DueWell</text>` +
    `<text x="${M + 108}" y="${y + 78}" font-family="sans-serif" font-size="28" fill="#94a3b8">Stay on top of every due date.</text>`

  y += 150
  const hero =
    `<rect x="${M}" y="${y}" width="${w}" height="240" rx="36" fill="url(#hero)"/>` +
    `<text x="${M + 44}" y="${y + 74}" font-family="sans-serif" font-size="30" fill="#c7f0ea">Due this week</text>` +
    `<text x="${M + 44}" y="${y + 156}" font-family="sans-serif" font-size="84" font-weight="800" fill="#ffffff">₹2,039</text>` +
    `<text x="${M + 44}" y="${y + 205}" font-family="sans-serif" font-size="28" fill="#a7ded6">2 bills coming up soon</text>`

  y += 300
  const listHeader = `<text x="${M}" y="${y}" font-family="sans-serif" font-size="34" font-weight="700" fill="#e2e8f0">Upcoming</text>`
  y += 34
  const cards = bills.map((b, i) => billCard(M, y + i * 156, w, b)).join('')

  return frame(1080, 1920, header + hero + listHeader + cards)
}

// --- Wide (desktop/tablet) 1920x1080 ---
function wide() {
  const M = 96
  const header =
    `${logoBadge(M, 90, 96)}` +
    `<text x="${M + 124}" y="140" font-family="sans-serif" font-size="60" font-weight="700" fill="#f8fafc">DueWell</text>` +
    `<text x="${M + 124}" y="182" font-family="sans-serif" font-size="30" fill="#94a3b8">Stay on top of every due date.</text>`

  const hero =
    `<rect x="${M}" y="260" width="820" height="720" rx="40" fill="url(#hero)"/>` +
    `<text x="${M + 56}" y="360" font-family="sans-serif" font-size="34" fill="#c7f0ea">Due this week</text>` +
    `<text x="${M + 56}" y="480" font-family="sans-serif" font-size="120" font-weight="800" fill="#ffffff">₹2,039</text>` +
    `<text x="${M + 56}" y="540" font-family="sans-serif" font-size="32" fill="#a7ded6">Across 2 upcoming bills</text>`

  const colX = M + 900
  const colW = 1920 - colX - M
  const cards =
    `<text x="${colX}" y="300" font-family="sans-serif" font-size="38" font-weight="700" fill="#e2e8f0">Upcoming</text>` +
    bills.map((b, i) => billCard(colX, 330 + i * 160, colW, b)).join('')

  return frame(1920, 1080, header + hero + cards)
}

async function render(svgString, out) {
  await sharp(Buffer.from(svgString)).png().toFile(out)
  console.log('  ✓', out.replace(root + '/', '').replace(root + '\\', ''))
}

async function main() {
  await mkdir(shotDir, { recursive: true })
  console.log('Generating DueWell screenshots…')
  await render(mobile(), resolve(shotDir, 'mobile-1.png'))
  await render(wide(), resolve(shotDir, 'wide-1.png'))
  console.log('Done. (Replace with real app captures before final submission.)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
