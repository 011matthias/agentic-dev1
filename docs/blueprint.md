# Catalyzer Blueprint (next-steps context)

The plan for turning agentic-dev1 from a governed workspace into a software
engineering catalyzer for two target areas: (1) website builds, (2) vibe-coded
apps and games of all shapes and sizes. Written 2026-06-12. Absorbs the Cycle-6
backlog from `docs/sessions/2026-06-09.md` and the pending actions in
`.claude/skills/CURATION.md` into one ordered sequence; this file is the active
next-steps context until superseded by a later checkpoint.

## The gap

The governance layer (hooks, rules, CI, verify.py, the annealing loop) says how
work runs. Nothing yet says how a product comes into being: no intake, no
scaffolds, no per-archetype quality bar, no ship path. CREW was hand-rolled.
The catalyzer is a product pipeline on top of the existing harness, built on
one principle: pre-decide everything decidable once (stack, structure, quality
floor, deploy) so a new project spends zero time on setup and all of it on the
thing itself.

## Target structure

```
.claude/
  agents/                 code-reviewer (exists) + design-reviewer
  skills/                 + vendored webapp-testing, frontend-design
                          + authored skil_website-quality, skil_shipping
  commands/               + comd_new-product, comd_ship
  rules/                  + rule_product_structure, rule_testing, rule_release
templates/                NEW: the heart of the catalyzer
  website/                Astro content / marketing / landing site
  app/                    Vite + React + TS PWA (extracted from CREW)
  game/                   Vite + TS canvas loop (DOM games use the app template)
  _shared/                ARCHITECTURE.md + PRODUCT.md skeletons, Playwright
                          smoke test, the npm verify wiring
products/
  crew/                   exists; every product stays self-contained
tools/
  scaffold.py             NEW: stamps a template into products/{name}
  verify.py               exists; runs each product's own npm verify script
docs/
  blueprint.md            this file
  stack.md                the pre-decided defaults, one line of why each
```

## The six layers

1. **Templates + scaffolder (the spine).** Three archetypes: `website`, `app`,
   `game`. Each ships with the stack wired, an ARCHITECTURE.md skeleton, a
   Playwright smoke test, a working npm `verify` script, and a PRODUCT.md brief
   template (what / who / success metric / scope cut; CREW's
   measurement-is-first-class pattern generalized). `tools/scaffold.py` stamps
   one into `products/{name}`.

2. **Product manifest.** A `"dev1"` block in each product's `package.json`
   (archetype, deploy target, status). CI discovers products by globbing
   `products/*/package.json` and reads the block; no central list to edit, so
   the tenth product costs the same as the second.

3. **Verify profiles (non-negotiable 2, per archetype).** Each template's npm
   `verify` script is pre-wired so `verify.py` picks it up with no central
   edit (the skil_crew-verify registration pattern, generalized):
   - all: install, typecheck, build;
   - website: plus Lighthouse budget (perf >= 90, a11y >= 95), link check,
     meta/OG presence;
   - app: plus Playwright smoke (boots, core flow clicks through), valid PWA
     manifest;
   - game: plus Playwright smoke; game-feel stays agent-judged via
     skil_game-feel-review.

4. **Skills (the taste layer).** What stops vibe-coded output from looking
   AI-generic. Vendor `frontend-design` and `webapp-testing` (already curated,
   pending). Author `skil_website-quality` (SEO, OG, a11y, performance) and
   `skil_shipping` (deploy runbooks per target) after the harvest below.
   `skil_game-feel-review` exists; `skil_crew-verify` is specified in
   CURATION.md.

5. **Agents.** Add one now: `design-reviewer`, the visual twin of
   code-reviewer. It screenshots the running product via webapp-testing /
   Playwright and judges it adversarially against frontend-design ("does this
   look template-generic?"). Architect / playtester / debugger agents wait
   until friction earns them.

6. **Commands.** `comd_new-product {archetype} {name}` (asks the brief
   questions, scaffolds, first commit on a branch) and `comd_ship {product}`
   (verify profile, build, preview deploy; production deploy stays on the
   floor per rule_operating). comd_playtest / comd_status wait their turn.

## Pre-decided stack

| Decision | Default | Why |
|---|---|---|
| Websites | Astro | Content-first, fast by default, islands when needed |
| Apps / DOM games | Vite + React + TS PWA | Proven by CREW |
| Canvas games | Vite + TS, no framework | A game loop does not want React |
| Styling | Tailwind for websites; hand-rolled CSS for games | Speed vs. juice control (CREW pattern) |
| Deploy | Cloudflare Pages | Free, per-PR preview deploys, fast |
| E2E | Playwright | Proven in CREW's workflow; webapp-testing builds on it |

Open calls for the owner (the only two that change what gets built): Astro vs.
all-Vite for websites, and Cloudflare Pages vs. GitHub Pages. The defaults
above hold unless overridden.

## Upstream harvest: GitHub-sourced components

Before authoring anything that might already exist, sweep GitHub for
high-value repos and adapt the best. The Cycle-5 curation discipline applies
unchanged and `.claude/skills/CURATION.md` stays the single log: verify the
source exists and is maintained, judge quality + fit + license, vendor or
adapt with attribution, reject the generic and the duplicative, write our own
when nothing fits.

Run first (already curated, pending in CURATION.md):

- vendor `webapp-testing` (anthropics/skills, Apache-2.0): the keystone the
  verify profiles and skil_crew-verify compose with;
- vendor `frontend-design` (anthropics/skills, Apache-2.0): the taste layer
  design-reviewer judges against.

New slots the Cycle-5 sweep did not cover (it was CREW-scoped):

- **website archetype**: Astro starters and themes worth mining for
  `templates/website`; SEO / meta / OG skills; Lighthouse-CI configs; a11y
  checklists;
- **scaffolding**: project-template and generator patterns for `scaffold.py`
  and the `templates/` tree;
- **deploy / shipping**: Cloudflare Pages and GitHub Pages workflows,
  preview-deploy patterns, release automation for rule_release + comd_ship;
- **design taste beyond frontend-design**: design-system rubrics, typography
  and spacing systems, AI-generic-detection checklists for design-reviewer;
- **agent precedents**: design-review / UX-walker agents in the verified
  collections, mined for structure, not vendored wholesale.

Known-good sources (verified real in Cycle 5): anthropics/skills,
hesreallyhim/awesome-claude-code, VoltAgent/awesome-claude-code-subagents,
wshobson/agents, davila7/claude-code-templates. Each new slot also gets a
fresh GitHub search; the ecosystem moves fast and Cycle 5 is already three
days old.

## Rollout

Continues the cycle numbering from `docs/sessions/2026-06-09.md`; this
reshapes the old Cycle-6 backlog into cycles 6-10. Each cycle is one or more
PR-able units, merged on CI-green, floor untouched.

- **Cycle 6: harvest.** Vendor the two pending skills; run the new-slot sweep
  (Workflow fan-out, as Cycle 5 did); log every verdict in CURATION.md.
  Exit: the build cycles start from a known best-of-GitHub component set.
- **Cycle 7: spine.** `templates/` + `scaffold.py` + `comd_new-product` + the
  dev1 manifest block + per-archetype verify wiring + product-discovering CI.
  Exit: `comd_new-product website demo` reaches green CI in one session.
- **Cycle 8: quality.** skil_website-quality + skil_crew-verify (closes the
  Cycle-4 anonymity anneal) + design-reviewer + rule_testing. Exit:
  design-reviewer runs on a scaffolded site; the Confessions anonymity
  invariant has a test that fails when it regresses.
- **Cycle 9: ship.** Deploy configs + comd_ship + rule_release. Production
  deploy stays on the floor. Exit: a product live on a real URL.
- **Cycle 10: dogfood.** Build CREW's landing page end-to-end through the
  pipeline (needed for the 7 EUR unlock anyway); anneal every rough edge into
  the templates and commands.

## Deliberately not building yet

Backend / server template (no product needs one), shared runtime components
across products (the charter forbids it), comd_playtest / comd_status, and
further agents. Friction earns each of these, per the curation bar.

## Status

Written 2026-06-12 from a planning session. Owner directives captured: the two
target areas (websites; vibe-coded apps and games), and the GitHub harvest as
a first-class build step, not an afterthought. The session ran outside the
repo root, so hooks were inactive and the em-dash discipline was manual.
