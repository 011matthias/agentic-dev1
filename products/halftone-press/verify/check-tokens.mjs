// Dead-token gate: every semantic role the contract defines must actually be
// SPENT. A palette that declares an `accent` (or a `surface`, or a `mono` face)
// and never uses it is a defined-but-unused token -- the precise AI-tell the
// design reference calls out (a brand pretending to have a color it never spends).
//
// How it bites: contract.css binds each role to a brand variable
// (`--color-accent: var(--accent)`). With Tailwind's `@theme inline`, that
// `var(--accent)` lands in the built CSS ONLY if some utility or rule consumes the
// role. So: parse the role -> brand-var bindings from contract.css, then assert
// each brand var appears as `var(--name)` in the built dist CSS. Drop the last use
// of a role and this goes red; that is the mutation proof.
//
// Runs over dist/ (the served output), so it measures what shipped, not the
// source. Browser-free; part of the static `verify` tier.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const CONTRACT = join(ROOT, 'src/styles/tokens/contract.css')
const DIST = join(ROOT, 'dist')

if (!existsSync(CONTRACT)) {
  console.error('[tokens] no src/styles/tokens/contract.css found.')
  process.exit(1)
}
if (!existsSync(DIST)) {
  console.error('[tokens] no dist/; run `astro build` before this check.')
  process.exit(1)
}

const contract = readFileSync(CONTRACT, 'utf8')

// Pull the role bindings: `--color-<role>: var(--<brandvar>)` and the font roles.
// The captured brand var (group 2) is what must be referenced in the output.
const roles = []
for (const m of contract.matchAll(/--(?:color|font)-([\w-]+):\s*var\(--([\w-]+)\)/g)) {
  roles.push({ role: m[1], brandVar: m[2] })
}

if (roles.length === 0) {
  console.error('[tokens] parsed zero role bindings from contract.css; the binding shape changed.')
  process.exit(1)
}

// Concatenate every built stylesheet.
const cssFiles = readdirSync(DIST, { recursive: true })
  .map((p) => String(p))
  .filter((p) => p.endsWith('.css'))
const builtCss = cssFiles.map((rel) => readFileSync(join(DIST, rel), 'utf8')).join('\n')

const dead = roles.filter(({ brandVar }) => !builtCss.includes(`var(--${brandVar})`))

if (dead.length) {
  console.error(`[tokens] FAIL: ${dead.length} defined-but-unused role(s):`)
  for (const { role, brandVar } of dead) {
    console.error(`  - ${role} (var(--${brandVar})) is bound in the contract but never used`)
  }
  console.error('  Spend the role in a primitive/page, or drop it from the contract.')
  process.exit(1)
}

console.log(`[tokens] PASS: all ${roles.length} role tokens referenced (${roles.map((r) => r.role).join(', ')}).`)
