// No-raw-colors gate: components and pages must take color from the token roles
// (bg-surface, text-muted, border-border, ...), never a hard-coded hex/oklch/rgb/
// hsl literal. A raw color in a component is identity that cannot be re-skinned
// and will not invert in dark mode -- the leak the token contract exists to stop.
//
// Scope: src/components, src/pages, src/layouts. NOT src/styles (brand.css and
// contract.css are where literals legitimately live) and NOT public (raw SVGs).
// Source-level check: it reads the authored files, since that is where a literal
// would be introduced.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

const ROOT = process.cwd()
const DIRS = ['src/components', 'src/pages', 'src/layouts'].map((d) => join(ROOT, d))
const EXTS = new Set(['.astro', '.ts', '.tsx', '.jsx', '.js'])

// Image-generation endpoints (og.png.ts and the like) are exempt: they rasterize
// with satori/resvg, which require concrete colors, and they DERIVE those from the
// brand tokens (with a hex fallback only if parsing fails). The gate guards styling
// leaks in markup, not raster generation.
const IMAGE_ROUTE = /\.(png|jpe?g|gif|webp|avif)\.(t|j)sx?$/i

// Color literals. currentColor / transparent / the role tokens are not matched.
const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:oklch|oklab|rgb|rgba|hsl|hsla|lab|lch|color)\(/g

// Strip comments before scanning, so a comment that *mentions* a color (e.g. the
// cream #F4F1EA in the AI-tell list) is not a false positive. Block comments and
// HTML comments are safe to remove wholesale; line comments are removed only when
// not part of a `://` URL (negative lookbehind for the colon).
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(?<!:)\/\/[^\n]*/g, '')
}

function walk(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else if (EXTS.has(extname(p)) && !IMAGE_ROUTE.test(name)) out.push(p)
  }
  return out
}

const offenders = []
for (const dir of DIRS) {
  for (const file of walk(dir)) {
    const text = stripComments(readFileSync(file, 'utf8'))
    const hits = text.match(COLOR)
    if (hits) offenders.push({ file: file.slice(ROOT.length + 1), hits: [...new Set(hits)] })
  }
}

if (offenders.length) {
  console.error(`[no-raw-values] FAIL: ${offenders.length} file(s) hard-code a color:`)
  for (const { file, hits } of offenders) {
    console.error(`  - ${file}: ${hits.join(', ')}`)
  }
  console.error('  Use a token role (bg-*, text-*, border-*) instead, defined in brand.css.')
  process.exit(1)
}

console.log('[no-raw-values] PASS: components/pages/layouts take color from token roles only.')
