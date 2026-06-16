# Checkpoint 2026-06-16: website builder (general skill + buildable archetype)

Scope: harness | Band: autonomous (dev1-rooted session, hooks live; floor
untouched). Separate same-day file (parallel-session safe), distinct from the
Cycle-6 harvest, Cycle-7 spine, and github-sweep arcs.

Owner directive: make the infrastructure a high-quality website builder, founded
generally and NOT coupled to the CREW product.

## Done (both merged on CI-green, floor untouched)
- **PR #29: skil_website-quality** (general, archetype-level). The web-platform
  quality bar (SEO, social + structured metadata, programmatic a11y, Core Web
  Vitals, anti-generic content) the visual layer (frontend-design /
  design-reviewer) does not cover. Defines the mechanical website gate
  (Lighthouse perf >= 90 / a11y >= 95, link + meta/OG presence, per rule_testing)
  and a 6-dimension agent-judged rubric; visual taste routed to design-reviewer.
  The website twin of skil_game-feel-review, deliberately NOT the product-bound
  skil_crew-verify shape. Recorded in CURATION.md (authored + action rows).
- **PR #30: the website archetype is now buildable end-to-end.** `scaffold.py
  website <name>` stamps a real product instead of refusing a stub.
  - `templates/website/`: Astro 5 static + Tailwind v4 (`@tailwindcss/vite`) +
    `@astrojs/sitemap`. `Layout.astro` carries the full skil_website-quality head
    contract (lang/charset/viewport/title/description/canonical/OG+Twitter/favicon/
    sitemap/JSON-LD); landmarks, skip link, focus, reduced-motion in the floor.
    Neutral copy/palette so the bare template is not an AI-default look.
  - Verify profile: npm `verify` = `astro check && astro build && node
    verify/check-website.mjs` (browser-free static gate: head set, internal-link
    resolution, og:image existence, robots, sitemap). `verify:lighthouse` is the
    on-demand browser tier (perf/a11y budget) that SKIPs loudly under CI / no
    Chrome, never silently.
  - Wiring: scaffold.py skips `.astro` cache; `test_rejects_stub_archetype`
    retargeted to `app`; added `test_stamp_website_is_well_formed`;
    templates/README marks website `ready`; removed the website stub README so
    products inherit `_shared`'s brief. Also landed the deferred
    feedback_found_capabilities_archetype_level memory.

## Current state (main)
- main HEAD `7dfb844` (#30). No open PRs.
- Verified, not assumed: CI "Template builds" ran `npm ci && npm run verify` on
  the Astro template (ubuntu, no browser) green (28s); the static gate was
  mutation-proven to bite (drop canonical + robots -> 2 failures, exit 1);
  `pytest tools/tests` 72 passed; ruff + INDEX + ARCHITECTURE gates green;
  `scaffold.py website demo-site --dry-run` stamps 19 files, `.astro` excluded.
- Archetypes now: `game` ready, `website` ready, `app` still a stub.
- Lighthouse is intentionally NOT a template dependency: the budget tier runs via
  `npm i -D lighthouse chrome-launcher` locally or via skil_website-quality's
  webapp-testing driver, keeping CI install lean.

## Next steps (concrete)
1. **Dogfood the website builder** (blueprint Cycle 10): scaffold a first real
   site and build it through the pipeline (CREW's landing page is the natural
   target; needs the brief from the owner: what / who / one job).
2. **app archetype** (the last stub): extract the CREW Vite + React + TS PWA
   stack into `templates/app` with a Playwright smoke + valid PWA manifest, so
   all three archetypes are ready.
3. **Cycle 9 ship path** (floor): `comd_ship` + Cloudflare Pages deploy config +
   rule_release. Production deploy stays on the gated floor.
4. Optional polish: swap the placeholder `public/og-default.svg` for a real
   1200x630 PNG, and parameterize astro.config `site` per product at scaffold
   time (currently a placeholder the product edits).

## Decisions
- Founded the website skill at the archetype/harness level (`.claude/skills/`),
  not under any product, per the owner directive; product-bound is reserved for
  the genuinely product-specific (skil_crew-verify).
- Split the website verify into a browser-free static gate (gates CI) and an
  on-demand Lighthouse tier (SKIPs loudly), the skil_crew-verify degradation
  pattern, so CI stays portable and fast.
- Shipped #29 and #30 as two PRs (skill first as the durable foundation, then the
  archetype that hangs off it) rather than one, each green before the next.
