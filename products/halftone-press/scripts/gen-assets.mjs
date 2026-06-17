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

// Showcase: a riso-look two-pass print. The blue and magenta rings are OFFSET
// (deliberate misregistration), multiply where they overlap (the third colour),
// and a halftone dot screen over the inks gives the grain the copy promises. A
// real print asset would replace it; this stands in as something specific to the
// subject, not generic vector art.
const showcase = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">
  <defs>
    <radialGradient id="dot"><stop offset="0" stop-color="#000"/><stop offset="0.55" stop-color="#000"/><stop offset="0.85" stop-color="#fff"/></radialGradient>
    <pattern id="halftone" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="#fff"/>
      <circle cx="7" cy="7" r="3.4" fill="#000"/>
    </pattern>
    <mask id="grain"><rect width="1600" height="1000" fill="url(#halftone)"/></mask>
    <g id="rings" style="mix-blend-mode:multiply">
      <circle cx="690" cy="480" r="300" fill="none" stroke="#1a44c8" stroke-width="74"/>
      <circle cx="910" cy="540" r="300" fill="none" stroke="#ff2d7e" stroke-width="74"/>
    </g>
  </defs>
  <rect width="1600" height="1000" fill="#f4f1ec"/>
  <use href="#rings"/>
  <!-- the same inks again, screened through the halftone mask, for tooth/grain -->
  <g mask="url(#grain)" opacity="0.5"><use href="#rings"/></g>
</svg>`
writeFileSync(join(root, 'src/assets/showcase.png'), renderToPng(showcase, 1600))
console.log('wrote src/assets/showcase.png (1600px)')
