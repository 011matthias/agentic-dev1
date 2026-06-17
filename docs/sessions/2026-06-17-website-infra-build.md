# Checkpoint 2026-06-17: website infrastructure build (pieces 1-5 of 7)

Scope: harness (templates/website, skills, tools) | Band: autonomous (dev1-rooted,
hooks live; floor untouched). The BUILD session executing
`docs/website-infra-build-prompt.md`; distinct from the same-day foundation
checkpoint (`2026-06-17-website-infra-foundation.md`, the spec/handoff).

## Done this session (5 of 7 pieces, each its own CI-green squash-merge)

- **#34 piece 1 (tokens):** `templates/website/src/styles/tokens/contract.css`
  (shared role names + scales + Tailwind `@theme inline` binding) + `brand.css`
  (per-project 8 color roles + dark via OS pref and `[data-theme]`, labeled
  EXAMPLE). Self-hosted fonts via Astro Fonts API (Fraunces/Mulish/JetBrains Mono),
  the four-pairing library in `tokens/README.md`. `verify/check-tokens.mjs`
  (dead-token gate). Dark mode is a pure cascade switch, zero JS.
- **#35 piece 2 (design skill):** `.claude/skills/skil_website-design/SKILL.md`,
  product-agnostic, the four-pass loop (brainstorm -> critique-against-defaults ->
  build -> critique-again) + the "would I produce this for any other brief?" gate.
  Boundary with skil_website-quality stated. Registered in CURATION.md.
- **#36 piece 3 (primitives):** Nav (JS-free mobile disclosure), Hero
  (stacked/centered/split), Section, Card, CtaBand, Form+Field, Faq, Footer; all
  role-themed, semantic, responsive, dark, reduced-motion. `verify/check-no-raw-
  values.mjs`. Layout composes Nav+Footer; old Header/Footer removed.
- **#37 piece 4 (gate suite + DoD):** `check-html.mjs` (html-validate, static) +
  `check-axe.mjs` (axe serious/critical, browser tier). `npm run verify` (static,
  gates CI) + `npm run verify:full` (static + browser, SKIPs loudly). `verify/
  README.md` documents the suite + DoD.
- **#38 piece 5 (assets):** `src/pages/og.png.ts` generates a real 1200x630 OG PNG
  from the brand tokens (satori + resvg + culori; bundled woff faces in
  `src/assets/og/`). check-website asserts 1200x630. astro:assets `<Picture>` demo
  (AVIF+WebP srcset). Favicon set from one source SVG (`scripts/gen-assets.mjs`).
  svgo on favicon.svg. og-default.svg removed.

Every new gate mutation-proven to bite. axe was exercised by installing browser
deps + chromium locally (clean PASS both themes; contrast regression -> red), then
the browser deps were uninstalled so CI stays browser-free.

## Current state (main)

- main HEAD `eb9dfda` (#38). No open PRs.
- `templates/website` verify (static) green; `verify:full` SKIPs the browser tier
  loudly without deps (CI-safe). All 5 CI runs green (incl. native resvg-js on
  ubuntu + OG generation at build).
- New template deps: `@resvg/resvg-js`, `culori`, `satori`, `html-validate`
  (+ `@types/culori` dev). Browser-tier deps (playwright, @axe-core/playwright,
  lighthouse, chrome-launcher) are intentionally NOT in package.json (on-demand).

## Next steps (concrete)

1. **Piece 6 (docs + promotion):** `docs/website-reference.md` (genuine benchmarks
   + the codified AI-tell checklist design-reviewer reads: system/overused faces,
   gradient-blob hero, every-section-same-card, uniform spacing no rhythm,
   defined-but-unused accent, timid radius, the three cliched looks) + the new-site
   runbook + promote the workflow to a `rule_website_build` rule and a
   `comd_build-site` command.
2. **Piece 7 (proof):** scaffold ONE example site from the infra
   (`uv run tools/scaffold.py website <name>`), run a fresh skil_website-design pass
   (fresh tokens, NOT the example brand), pass every gate (DoD green), capture
   light/dark x mobile/desktop screenshots showing it is distinct AND over the
   floor. Use a real honest subject or a clearly-labeled fictional demo; fabricate
   nothing. Run the browser tier for real (chromium present): axe 0 serious/critical
   + a real Lighthouse perf/a11y number.

## Notes

- Deferred (not silently cut): the inline-sprite icon strategy (inline SVGs are
  accessible + few; noted in verify/README).
- A parallel session committed the spec-session handoff docs as #33 mid-orientation
  (shared-worktree gotcha, benign; branched cleanly after). Stay alert per
  [[gotcha_shared_worktree]].
