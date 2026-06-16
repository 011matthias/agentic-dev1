# Checkpoint 2026-06-17: website infrastructure + build-workflow foundation

Scope: harness | Band: autonomous (dev1-rooted, hooks live; floor untouched).
Continues the website-builder arc from 2026-06-16; this session specs the full
reusable toolkit + workflow and hands the build to a fresh session.

## Done (this session)
- **TikTok website-animation link**: followed the short link
  (`@wearebrand.io/video/7635125860915334422`); LIMITATION, not a failure. Cannot
  watch video and TikTok renders captions client-side / blocks scraping, so only
  the creator handle was recoverable. Stated what would unblock (live URL, a
  description, or stills/GIF) rather than guessing.
- **Website-infrastructure spec received** (a full 9-component brief: opinionated
  stack, token architecture, primitives, design-process skill, visual loop, gates
  + DoD, asset pipeline, reference/anti-pattern doc, runbook). Ran orientation:
  Node 24, npm only (no pnpm/yarn), uv 0.11.11, and **Playwright chromium IS
  installed** in the ms-playwright cache, so axe / Lighthouse / screenshots run
  locally while CI stays browser-free.
- **Proposal + sign-off**: mapped the spec against the repo and showed ~40% is
  already shipped (the website archetype, skil_website-quality, design-reviewer,
  the verify spine); the net-new is depth (token architecture, primitives, the
  process skill, expanded gates, asset pipeline, reference doc). Owner signed off:
  extend in place, two skills.
- **PR #32 (merged): the foundation, laid out for review.** Three docs on main:
  - `docs/website-build-workflow.md`: the operating loop (intake -> direction ->
    compose -> gates -> visual review -> ship -> learn) mapped onto rule_dev_loop,
    with roles, the three owner checkpoints, and a written definition of done.
  - `docs/website-infrastructure.md`: the component architecture (3-tier tokens:
    shared contract.css vs per-project brand.css; typeface library + four pairings;
    primitives; the two-skill boundary; gate suite + DoD; asset pipeline; reference
    doc) + the on-greenlight build order.
  - `docs/website-infra-build-prompt.md`: the fresh-chat execution brief (the
    7-piece build order with per-piece acceptance criteria + the proof-site bar).
  Held as a DRAFT PR until the owner reviewed, then marked ready and merged on
  CI-green (honored the explicit review gate; did not auto-merge mid-review).

## Current state (main)
- main HEAD `38ec034` (#32). No open PRs.
- The toolkit is SPECCED and HANDED OFF, not built. The actual build runs in a
  fresh chat from `docs/website-infra-build-prompt.md` (owner directive: "write a
  prompt to properly build both in a fresh chat").
- Archetypes: `game` ready, `website` ready (Astro 5 + Tailwind v4, buildable),
  `app` still a stub.

## Next steps (concrete)
1. **Run the build** in a fresh agentic-dev1 session via
   `docs/website-infra-build-prompt.md`. The 7 pieces, each its own CI-green PR:
   (1) token architecture + typeface library, (2) skil_website-design (process
   skill), (3) component primitives, (4) gate suite + DoD (axe + Lighthouse +
   html-validate, one command), (5) asset pipeline (image opt, OG generation,
   favicon, subsetting), (6) website-reference.md + runbook + promote the workflow
   to rule_website_build + comd_build-site, (7) proof site with light/dark x
   mobile/desktop screenshots.
2. Best run from `~/Repo/agentic-dev1` so hooks stay live and the browser-tier
   gates (chromium present) actually exercise.
3. Eventually: fill the `app` stub (the last remaining archetype).

## Decisions
- **Extend agentic-dev1 in place**, not a parallel toolkit: a second home would
  duplicate the shipped archetype / skill / agent and split the design judgment.
- **Two skills**: skil_website-quality (the bar, exists) + new skil_website-design
  (the process). Design decides identity; quality verifies adequacy; they do not
  overlap.
- **Stack confirmed**: Astro 5 static + Tailwind v4 (@theme = the semantic token
  layer) + Cloudflare Pages; self-hosted fonts via Astro's Fonts API; light/dark
  from tier 1.
- **Governing principle**: shared = floor + tooling + workflow + token
  ARCHITECTURE; fresh per project = the VALUES in brand.css (palette, pairing,
  layout, signature, copy). Distinctiveness is the easy path by construction; if
  output converges on a house look, that is a failure and an anneal.
- **Delegated the build to a fresh chat** per the owner directive, producing a
  saved, durable build prompt rather than building inline. Kept the foundation a
  draft PR through review, merged only on green light.

## Strategic feedback
- Worked: the propose -> sign-off -> lay-out-for-review -> green-light -> handoff
  flow kept the owner in control at every gate; holding the foundation as a draft
  PR (not auto-merging mid-review) honored the explicit review gate cleanly.
- Suggestion: run the fresh build session from the repo root so the browser gates
  (chromium is present) actually run; the spec's whole "visual feedback loop" and
  axe/Lighthouse value depends on exercising them, not just wiring them.
- Health: clean stopping point, three foundation docs on main, zero open PRs. One
  low-harm recurring advisory noted below (gate-skip pre-publish on docs-only
  ships) as a tuning candidate.
