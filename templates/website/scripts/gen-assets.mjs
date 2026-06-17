// Regenerate the raster assets that derive from a single source: the favicon set
// from public/favicon.svg, and a demo showcase image. Re-run after editing the
// source SVG or the brand:  node scripts/gen-assets.mjs
//
// Uses @resvg/resvg-js (already a dependency for the OG route). Favicons come from
// ONE source SVG so the set never drifts; the showcase is a token-coloured stand-in
// a real product replaces with its own art.
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const renderToPng = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng()

// Favicon set from the one source SVG.
const faviconSvg = readFileSync(join(root, 'public/favicon.svg'), 'utf8')
for (const [name, size] of [
  ['apple-touch-icon.png', 180],
  ['favicon-32.png', 32],
]) {
  writeFileSync(join(root, 'public', name), renderToPng(faviconSvg, size))
  console.log(`wrote public/${name} (${size}px)`)
}

// Demo showcase image (a brand-coloured abstract; replaced per project). Wide
// source so astro:assets can emit responsive, modern-format derivatives.
const showcase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b63be"/>
      <stop offset="1" stop-color="#1b2433"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#g)"/>
  <circle cx="1180" cy="300" r="320" fill="none" stroke="#2bb89a" stroke-width="10" opacity="0.55"/>
  <circle cx="1180" cy="300" r="200" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.30"/>
  <rect x="160" y="640" width="520" height="14" rx="7" fill="#ffffff" opacity="0.85"/>
  <rect x="160" y="690" width="360" height="14" rx="7" fill="#ffffff" opacity="0.45"/>
</svg>`
writeFileSync(join(root, 'src/assets/showcase.png'), renderToPng(showcase, 1600))
console.log('wrote src/assets/showcase.png (1600px)')
