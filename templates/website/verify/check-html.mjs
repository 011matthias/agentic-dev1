// HTML validity gate (static tier). Runs html-validate over the built dist/ HTML,
// so it asserts the SERVED markup: malformed nesting, duplicate ids, a control
// without a label, a broken ARIA reference. Pure Node, no browser, so CI gates it.
//
// Config is inline and `root: true` (no .htmlvalidate.json lookup) so the gate is
// deterministic wherever it runs. Astro's JSON-LD and inlined head tags are valid
// HTML and pass the recommended preset; tune `rules` here if a real product's
// output needs an exception, with a comment saying why.
import { HtmlValidate } from 'html-validate'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = join(process.cwd(), 'dist')
if (!existsSync(DIST)) {
  console.error('[html-validate] no dist/; run `astro build` before this check.')
  process.exit(1)
}

const htmlvalidate = new HtmlValidate({
  root: true,
  extends: ['html-validate:recommended'],
  rules: {
    // Astro emits the JSON-LD payload via set:html; the script element itself is
    // valid. No other deviations from recommended at the archetype level.
  },
})

const files = readdirSync(DIST, { recursive: true })
  .map(String)
  .filter((p) => p.endsWith('.html'))

let errors = 0
for (const rel of files) {
  const report = await htmlvalidate.validateFile(join(DIST, rel))
  if (report.valid) continue
  for (const result of report.results) {
    for (const msg of result.messages) {
      if (msg.severity === 2) {
        errors++
        console.error(`  ${rel}:${msg.line}:${msg.column} ${msg.ruleId}: ${msg.message}`)
      }
    }
  }
}

if (errors) {
  console.error(`[html-validate] FAIL: ${errors} error(s) in built HTML.`)
  process.exit(1)
}
console.log(`[html-validate] PASS: ${files.length} page(s) are valid HTML.`)
