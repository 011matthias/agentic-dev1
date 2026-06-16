# Website Build Workflow (foundation)

The operating loop for taking on a "build me a website" task. It is a
specialization of `rule_dev_loop`'s spine for one archetype, naming exactly where
the design judgment, the quality bar, and the gates fire, and where the owner
decides. This is the foundation the eventual `comd_build-site` command and a
`rule_website_build` rule are promoted from; it is written first so the workflow
is reviewable before the tooling is built.

Pending owner green light (this is the layout, not the build).

## The governing rule, restated

Two things stay separated and never blur:

- **Shared (identical every build):** the quality floor, the tooling, and this
  workflow. How good and how fast we are is standardized.
- **Fresh (decided per build, from the subject):** the palette, the type pairing,
  the layout concept, the signature element, the copy. The look is never
  standardized.

The workflow is built so distinctiveness is the easy path. The default brand
tokens are generated fresh per project (never a house look), Phase 1 forces the
"would I produce this for any other brief?" critique, and the visual review is
adversarial about template-genericness. If output starts converging on a look,
the workflow has failed and that becomes an anneal.

## The loop

| Phase | I produce | Driven by | Owner checkpoint |
|-------|-----------|-----------|------------------|
| 0. Intake | a filled brief: subject, audience, the page's one job, real content, constraints, deploy target | `PRODUCT.md` brief; `frontend-design` (pin the subject if the brief does not) | confirm the brief, or I state my inference and proceed |
| 1. Direction | the per-project token + signature plan: palette, display/body pairing, layout concept, the one signature element, plus `brand.css` and a one-paragraph rationale | `skil_website-design` (the process: brainstorm then self-critique against the AI-defaults) | **review the direction.** This is the cheap place to redirect taste, before any page is built |
| 2. Compose | the site: starter instantiated, brand tokens applied, primitives composed into pages, real copy written | the component primitives + `frontend-design` (spend boldness in one place, copy-as-design-material) | none (autonomous build) |
| 3. Gates | executed proof the floor is cleared | the one-command gate suite (astro check, build, axe, Lighthouse, html-validate, links, head/OG/sitemap) | none (mechanical, gates the merge) |
| 4. Visual review | an adversarial read of the rendered result, light/dark x mobile/desktop | `design-reviewer` + `skil_website-quality`, screenshots via `webapp-testing` | **taste sign-off** for anything shipped or paid-for |
| 5. Ship | branch, PR, CI green, merge | the existing ship chain (`rule_operating`) | production deploy only (the floor) |
| 6. Learn | every AI-tell that slipped becomes a row in the reference doc; every gate gap becomes a new check | the anneal step (`rule_dev_loop` non-negotiable 3) | none |

## Mapping to rule_dev_loop

Nothing here escapes the spine; it sharpens it for websites.

- Understand + Specify -> **Intake** (the brief is the spec).
- Plan -> **Direction** (the design plan is the plan; its acceptance criterion is
  "distinct from the default I would produce for any brief").
- Implement -> **Compose**.
- Verify -> **Gates** (behavior, not state: the rendered, served output is
  measured, never the source).
- Review -> **Visual review** (the adversarial read; design is the agent-judged
  layer, `rule_testing`).
- Integrate -> **Ship**.
- Learn -> **Anneal**.

## Roles

- **`skil_website-design`** (process): the judgment layer. Runs the
  brainstorm -> critique-against-defaults -> build -> critique-again loop and
  produces the per-project token + signature plan. Keeps output distinctive.
- **`skil_website-quality`** (bar): is it market-adequate? SEO, social and
  structured metadata, programmatic accessibility, Core Web Vitals, content
  substance. Owns the mechanical gate contract.
- **`design-reviewer`** (agent): the adversarial visual read of the running build
  against `frontend-design` + the bar. Reports, does not edit.
- **The gate suite** (`tools/`): the deterministic floor, one command, wired into
  the website `verify` so CI and `verify.py` run it with no central edit.
- **`webapp-testing`** (vendored): the headless driver the visual review and the
  browser-tier gates compose on.

Boundary: `skil_website-design` asks "is it distinctive and good?";
`skil_website-quality` asks "is it correct, fast, accessible, findable?". Both
clear before a site is done.

## Definition of done

A site is not finished until every line holds:

- **Gates green:** astro check + build; axe reports zero serious/critical; Lighthouse
  performance >= 90 and accessibility >= 95 (SEO and best-practices >= 90 advisory);
  html-validate clean; no broken links; the head/OG/sitemap gate passes.
- **Tokens honest:** `brand.css` carries real per-subject values; no semantic role
  left at a placeholder; no defined-but-unused token (every token is referenced).
- **Design:** `design-reviewer` returns OK or every blocker/major finding is
  resolved; it is not one of the three AI-default looks; the type pairing is
  deliberate (not a system face, not Poppins, not Inter-as-display).
- **Responsive + themes:** light AND dark verified at ~390px and ~1280px; no
  overflow; visible keyboard focus; reduced-motion honored.
- **Content:** copy is real and specific (no lorem, no placeholder); CTAs are
  active-voice; empty and error states give direction.
- **Assets:** images optimized and responsive; the OG image is a real 1200x630;
  favicon set present.
- **Reviewed:** for anything shipped or paid-for, the owner has seen the
  light/dark x mobile/desktop screenshots.

## Status

Foundation, written for review. Promotes to a `rule_website_build` rule and a
`comd_build-site` command once the infra it orchestrates is built. Pairs with
`docs/website-infrastructure.md` (the components this loop runs).
