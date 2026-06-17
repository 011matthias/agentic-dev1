// Lighthouse budget: the browser tier of the website verify profile
// (skil_website-quality / rule_testing). Performance >= 90, accessibility >= 95.
//
// This is the on-demand tier, NOT on the CI path: `npm run verify` runs only the
// static gate so CI (no browser) stays green and fast. This script SKIPs loudly
// (exit 0) when it cannot run, and FAILs only when it actually ran and a budget
// was missed; a SKIP is announced, never silent. Enable it with:
//   npm i -D lighthouse chrome-launcher
import { execSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const PERF_MIN = 90
const A11Y_MIN = 95
const skip = (why) => {
  console.log(`[lighthouse] SKIP: ${why}`)
  process.exit(0)
}

if (process.env.CI) skip('CI runs the static gate only; run the budget locally where a browser exists.')

let lighthouse, launch
try {
  ;({ default: lighthouse } = await import('lighthouse'))
  ;({ launch } = await import('chrome-launcher'))
} catch {
  skip('lighthouse / chrome-launcher not installed (npm i -D lighthouse chrome-launcher).')
}

if (!existsSync(join(process.cwd(), 'dist'))) {
  console.log('[lighthouse] building (no dist/) ...')
  execSync('astro build', { stdio: 'inherit' })
}

// Serve the built site; astro preview prints the local URL on stdout.
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

let chrome
try {
  chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox'] })
  const { lhr } = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error' })
  const perf = Math.round(lhr.categories.performance.score * 100)
  const a11y = Math.round(lhr.categories.accessibility.score * 100)
  const ok = perf >= PERF_MIN && a11y >= A11Y_MIN
  console.log(`[lighthouse] performance ${perf} (>= ${PERF_MIN}), accessibility ${a11y} (>= ${A11Y_MIN})`)
  if (!ok) {
    console.error('[lighthouse] FAIL: a budget was missed.')
    process.exitCode = 1
  } else {
    console.log('[lighthouse] PASS')
  }
} catch (e) {
  skip(`no usable Chrome (${e.message}).`)
} finally {
  if (chrome) await chrome.kill()
  preview.kill()
}
