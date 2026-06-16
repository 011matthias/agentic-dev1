# Build Prompt: website infrastructure + build workflow

The execution brief for a fresh session to build the reusable website toolkit and
its workflow. Paste the block below (everything under "Prompt") into a new
agentic-dev1 chat. The authoritative spec is the two foundation docs; this prompt
is the order of operations, the constraints, and the acceptance bar.

---

## Prompt

Build the reusable website-building infrastructure and its build workflow for
agentic-dev1. The goal: any future "build me a website" task clears a
market-competitive bar for both engineering quality (performance, accessibility,
SEO, production-readiness) and aesthetics (distinctive, intentional design) by
default, without re-deriving the basics each time.

The authoritative spec is two docs already on `main`:
- `docs/website-infrastructure.md` (the component architecture)
- `docs/website-build-workflow.md` (the operating loop + definition of done)

Read both in full before building. This prompt is the execution order, not a
replacement for them.

### The principle that governs every decision

Separate two things and never let them blur:
- SHARED, identical every project: the quality floor, the tooling, this workflow,
  and the token ARCHITECTURE (the role contract, the scales, the @theme binding).
- FRESH, decided per project from the subject: the palette, the type pairing, the
  layout concept, the signature element, the copy (the VALUES in `brand.css`).

The failure mode to kill: infrastructure that becomes a look. If output starts
converging on a house style, the toolkit has failed at its actual job. Build it so
distinctiveness is the easy path, not something you fight the tooling for. The
scaffolder generates fresh brand tokens per project (never a default look), the
design process forces the "would I produce this for any other brief?" critique,
and `design-reviewer` adversarially flags template-genericness.

### Orientation (do first)

- Run the `rule_session_start` protocol: load all memory, print the header, name
  the band, check the latest checkpoint + friction register.
- Read the two spec docs above.
- Read what ALREADY EXISTS and extend it; do not build a parallel toolkit:
  `templates/website/` (the shipped Astro 5 + Tailwind v4 archetype + its
  `verify/`), `.claude/skills/skil_website-quality/` (the bar),
  `.claude/skills/frontend-design/SKILL.md` (the vendored taste methodology, read
  it fully; operationalizing it is a core part of the job), and
  `.claude/agents/design-reviewer.md` (the visual reviewer).
- Environment (already verified, re-check if unsure): Node 24, npm only (no
  pnpm/yarn), uv present, and Playwright chromium IS installed in the
  `ms-playwright` cache, so axe / Lighthouse / screenshots run locally. CI is
  browser-free: keep every gate degrading (static tier gates CI, browser tier
  SKIPs loudly without chromium).

### Constraints (non-negotiable)

- Stack: Astro 5 (static output, content/marketing-leaning) + Tailwind v4 (its
  `@theme` is the semantic token layer) + Cloudflare Pages. Self-host fonts via
  Astro 5's Fonts API (subsetting built in). Deviate to islands or the app
  template only when a site is genuinely app-like, and document the deviation.
- Floor, not look: re-read the principle before any decision touching visual
  identity.
- Performance and accessibility are GATES, not nice-to-haves.
- Styling is driven by the semantic token contract, never hardcoded values; fonts
  self-hosted; the baseline fast by construction.
- Prefer well-supported, maintainable libraries over clever fragile ones; this is
  infrastructure that has to last.
- Do NOT fabricate content, testimonials, or credentials in any scaffolding or
  example.
- Two skills: `skil_website-quality` (the bar, exists) and a new
  `skil_website-design` (the process). Keep the boundary: design decides identity,
  quality verifies adequacy.

### How to work (the harness rules)

- Follow `rule_dev_loop`: understand, specify, plan, implement, verify, review,
  integrate, learn. Verify BEHAVIOR (the rendered, served output and the gates),
  never state ("it compiled"). Cite the executed check.
- Ship each build-order piece as its own branch -> PR -> CI green -> squash-merge.
  The ship chain is autonomous (`rule_operating`); only deploy / tag / force push /
  direct-to-main is the floor and needs an explicit order.
- Anneal every escape: an AI-tell that slips becomes a row in
  `docs/website-reference.md`; a gate gap becomes a new check.
- Gotchas (in memory): Windows Git-Bash mangles `git show <rev>:<path>` (use
  `git ls-tree` + `git cat-file -p`); never lead a Bash command with `cd <subdir>`
  (it leaks the shell cwd and breaks the cwd-relative hooks; use `npm --prefix` /
  `git -C` from the repo root); if a parallel session stomps HEAD, push-by-SHA
  first, then disentangle.

### Build order (each piece is one PR; the stated AC is its exit gate)

1. Token architecture. `contract.css` (the shared semantic role variables +
   scales + the Tailwind `@theme` binding) and `brand.css` (the per-project values
   + `[data-theme="dark"]` overrides), plus the self-hosted typeface library with
   four deliberate pairings (no Segoe UI, no Poppins, no Inter-as-display).
   AC: a demo brand instantiates the contract; light AND dark both render; every
   role token is referenced (no dead token); typecheck + build green.
2. `skil_website-design` (the process skill). Operationalize `frontend-design`:
   the brainstorm -> critique-against-defaults -> build -> critique-again loop, the
   per-project token + signature plan with the "would I produce this for any other
   brief?" test, copy-as-design-material, and spend-boldness-in-one-place.
   AC: SKILL.md registered, product-agnostic, boundary with `skil_website-quality`
   stated.
3. Component primitives. Nav, hero variants, section, card, CTA band, form, FAQ,
   footer; semantic HTML, keyboard focus, responsive, dark, reduced-motion; themed
   only through tier-1 roles; layout-agnostic (no single imposed layout language).
   AC: each renders in light + dark at ~390px and ~1280px; axe clean; no raw values.
4. Gate suite + definition of done. A one-command runner chaining astro check,
   build, html-validate, the head/OG/sitemap + link gate (exists), axe (zero
   serious/critical), and Lighthouse (perf >= 90, a11y >= 95; SEO + best-practices
   >= 90 advisory). Static tier in `npm run verify` (CI, browser-free); browser
   tier in `npm run verify:full` (local, SKIPs loudly). Enforce the written DoD.
   AC: one command runs it; each assertion mutation-proven to bite; CI green
   without a browser.
5. Asset pipeline. `astro:assets` image optimization, svgo, an inline-sprite icon
   strategy, font subsetting (Fonts API), and generated OG image (a route reading
   the brand tokens) + favicon set from one source SVG.
   AC: the OG image is a real 1200x630 generated from tokens; images are responsive
   and modern-format.
6. Reference doc + runbook + promotion. `docs/website-reference.md` (a few genuine
   benchmarks + the codified AI-tell checklist `design-reviewer` reads: system /
   overused faces, gradient-blob hero, every-section-the-same-white-card, uniform
   spacing with no rhythm, defined-but-unused accent tokens, timid radius hedges,
   the three cliched looks). The new-site runbook. Promote the workflow to a
   `rule_website_build` rule and a `comd_build-site` command.
   AC: `design-reviewer` reads the tell-list; the runbook walks spin-up -> fresh
   tokens -> design pass -> gates.
7. Proof. Scaffold ONE example site from the infrastructure, run a fresh
   design-process pass with `skil_website-design`, pass every gate (the DoD green),
   and capture light/dark x mobile/desktop screenshots showing it is distinct AND
   over the floor. Use a real, honest subject (document a real open-source tool, or
   a clearly-labeled fictional demo); fabricate nothing.

### Definition of done (the whole job)

The proof site (piece 7) clears the definition of done in
`docs/website-build-workflow.md`: gates green, tokens honest (real per-subject
values, no dead token), design distinct (not one of the three AI looks, deliberate
type pairing, `design-reviewer` OK or findings resolved), responsive in light and
dark, real copy, optimized assets, and screenshots shown.

### First step

Run session-start, read the two spec docs and the existing archetype / skill /
agent, then post a short plan for piece 1 (token architecture) and proceed. Ship
piece by piece on CI-green; show the screenshots at the proof.
