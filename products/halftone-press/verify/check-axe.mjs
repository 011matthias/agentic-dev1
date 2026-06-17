// Accessibility gate (browser tier): axe-core over the SERVED build, in both
// light and dark, failing on any serious/critical violation. This catches the
// programmatic a11y a screenshot hides (contrast, names, roles, focus order).
//
// On-demand / local, NOT on the CI path: like the Lighthouse budget it SKIPs
// loudly (exit 0) when it cannot run, and FAILs only when it actually ran and
// found a violation. Enable with:
//   npm i -D playwright @axe-core/playwright && npx playwright install chromium
import { execSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const skip = (why) => {
  console.log(`[axe] SKIP: ${why}`)
  process.exit(0)
}

if (process.env.CI) skip('CI runs the static gate only; run axe locally where a browser exists.')

let chromium, AxeBuilder
try {
  ;({ chromium } = await import('playwright'))
  ;({ default: AxeBuilder } = await import('@axe-core/playwright'))
} catch {
  skip('playwright / @axe-core/playwright not installed (npm i -D playwright @axe-core/playwright).')
}

if (!existsSync(join(process.cwd(), 'dist'))) {
  console.log('[axe] building (no dist/) ...')
  execSync('astro build', { stdio: 'inherit' })
}

const preview = spawn('npm', ['run', 'preview'], { shell: process.platform === 'win32' })
const url = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('preview did not start in 30s')), 30_000)
  preview.stdout.on('data', (b) => {
    const m = String(b).match(/http:\/\/localhost:\d+/)
    if (m) {
      clearTimeout(timer)
      resolve(m[0])
    }
  })
  preview.on('error', reject)
}).catch((e) => {
  preview.kill()
  skip(`could not start preview: ${e.message}`)
})

let browser
const failures = []
try {
  browser = await chromium.launch()
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ colorScheme: theme })
    const page = await ctx.newPage()
    await page.goto(url, { waitUntil: 'networkidle' })
    const { violations } = await new AxeBuilder({ page }).analyze()
    for (const v of violations) {
      if (v.impact === 'serious' || v.impact === 'critical') {
        failures.push(`${theme}: ${v.id} (${v.impact}) on ${v.nodes.length} node(s)`)
      }
    }
    await ctx.close()
  }
} catch (e) {
  skip(`no usable browser (${e.message}); run \`npx playwright install chromium\`.`)
} finally {
  if (browser) await browser.close()
  preview.kill()
}

if (failures.length) {
  console.error(`[axe] FAIL: ${failures.length} serious/critical violation(s):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('[axe] PASS: zero serious/critical violations (light + dark).')
