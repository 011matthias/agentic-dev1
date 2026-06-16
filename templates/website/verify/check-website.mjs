// Static website quality gate (the deterministic half of skil_website-quality).
// Runs over the built `dist/` after `astro build`, so it asserts the SERVED
// output, not the source: a framework can transform or drop a tag and only the
// build shows it. Browser-free on purpose, so CI (node, no Chrome) gates it; the
// Lighthouse budget is the on-demand browser tier in verify/lighthouse-budget.mjs.
//
// Every assertion is written to BITE: remove a required tag, point a link at a
// missing page, or drop the og:image file and the matching check goes red.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const DIST = join(process.cwd(), 'dist')

if (!existsSync(DIST)) {
  console.error('[website-quality] no dist/; run `astro build` before this check.')
  process.exit(1)
}

/** Required <head> tags. Each is a label + a regex that must match the HTML, and
 *  an optional extractor whose captured group must be non-empty. */
const HEAD_CHECKS = [
  ['html lang', /<html[^>]*\blang=["'][a-z-]+["']/i],
  ['charset', /<meta[^>]*charset=/i],
  ['viewport', /<meta[^>]*name=["']viewport["']/i],
  ['title', /<title>([^<]+)<\/title>/i, true],
  ['meta description', /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i, true],
  ['canonical', /<link[^>]*rel=["']canonical["'][^>]*href=["'](https?:\/\/[^"']+)["']/i, true],
  ['og:type', /<meta[^>]*property=["']og:type["']/i],
  ['og:title', /<meta[^>]*property=["']og:title["']/i],
  ['og:description', /<meta[^>]*property=["']og:description["']/i],
  ['og:url', /<meta[^>]*property=["']og:url["']/i],
  ['twitter:card', /<meta[^>]*name=["']twitter:card["']/i],
  ['favicon', /<link[^>]*rel=["'][^"']*icon[^"']*["']/i],
  ['json-ld', /<script[^>]*type=["']application\/ld\+json["']/i],
]

const failures = []
const fail = (page, msg) => failures.push(`${page}: ${msg}`)

const htmlFiles = readdirSync(DIST, { recursive: true })
  .map((p) => String(p))
  .filter((p) => p.endsWith('.html'))

if (htmlFiles.length === 0) fail('dist', 'no HTML pages were built')

for (const rel of htmlFiles) {
  const html = readFileSync(join(DIST, rel), 'utf8')

  for (const [label, re, mustHaveContent] of HEAD_CHECKS) {
    const m = html.match(re)
    if (!m) fail(rel, `missing ${label}`)
    else if (mustHaveContent && !m[1]?.trim()) fail(rel, `${label} is empty`)
  }

  // og:image must be present, absolute, and (when same-origin as the canonical)
  // resolve to a file that actually shipped; a 404 share image is dim-2 broken.
  const og = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  const canon = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](https?:\/\/[^"']+)["']/i)
  if (!og) {
    fail(rel, 'missing og:image')
  } else if (!/^https?:\/\//i.test(og[1])) {
    fail(rel, `og:image is not absolute (${og[1]})`)
  } else if (canon) {
    const ogUrl = new URL(og[1])
    const sameOrigin = ogUrl.host === new URL(canon[1]).host
    if (sameOrigin && !existsSync(join(DIST, decodeURIComponent(ogUrl.pathname)))) {
      fail(rel, `og:image points at a missing file (${ogUrl.pathname})`)
    }
  }

  // Internal <a> links must resolve to a built page or asset. External, mail,
  // tel, and pure-fragment links are out of scope here.
  for (const a of html.matchAll(/<a[^>]*\shref=["']([^"']+)["']/gi)) {
    const href = a[1]
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) continue
    const path = decodeURIComponent(href.split(/[?#]/)[0])
    if (!path || !path.startsWith('/')) continue // relative links: skip, rare in this archetype
    if (!resolvesInDist(path)) fail(rel, `internal link 404s: ${href}`)
  }
}

function resolvesInDist(path) {
  const base = join(DIST, path)
  if (path.endsWith('/')) return existsSync(join(base, 'index.html'))
  if (extname(path)) return existsSync(base)
  return existsSync(`${base}.html`) || existsSync(join(base, 'index.html'))
}

// Site-level files.
if (!existsSync(join(DIST, 'robots.txt'))) fail('dist', 'no robots.txt')
if (!existsSync(join(DIST, 'sitemap-index.xml'))) fail('dist', 'no sitemap-index.xml')

if (failures.length) {
  console.error(`[website-quality] FAIL (${failures.length}):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log(`[website-quality] PASS: ${htmlFiles.length} page(s), head + links + sitemap + robots.`)
