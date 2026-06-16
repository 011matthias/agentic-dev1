# Website Infrastructure (architecture)

The reusable toolkit a `website` build draws on. This is the concrete design for
review; the build follows on owner green light. It extends what already shipped
(the `website` archetype, `skil_website-quality`, `design-reviewer`) rather than
starting a parallel toolkit. Pairs with `docs/website-build-workflow.md` (the loop
that runs these parts).

## The split, as a file map

Every file below is one of two kinds. SHARED files are byte-identical across
projects and live in the template skeleton, skills, and tools. The PER-PROJECT
file is the one place a build spends its identity.

```
templates/website/
  src/styles/tokens/
    contract.css     SHARED  the semantic role variables every project must define
                             (names + the scale structure), and the Tailwind @theme
                             binding that maps them to utilities
    brand.css        PER-PROJECT  the ONLY values file: assigns the contract roles
                             from the subject, including the [data-theme=dark] set
  src/components/primitives/  SHARED  nav, hero*, section, card, cta, form, faq, footer
.claude/skills/
  skil_website-quality/  SHARED  the bar (exists)
  skil_website-design/   SHARED  the process (new)
tools/website-gates/     SHARED  axe + lighthouse + html-validate + links, one runner
docs/
  website-reference.md   SHARED  benchmarks + the anti-pattern tell-list
  website-build-workflow.md  SHARED  the loop
```

Shared: the token *contract*, the primitives, both skills, the gates, the
reference doc, the workflow. Per-project: the values in `brand.css`, the page
compositions, the copy, the assets.

## 1. Token architecture (structure shared, values fresh)

Three tiers. A project edits only tier 2.

- **Tier 1, the contract (`contract.css`, shared).** The fixed set of semantic role
  variables, the same names in every project, plus the Tailwind `@theme` binding so
  components reference roles, never raw values. The roles:
  - color: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`,
    `--color-brand`, `--color-accent`, `--color-border`, plus state
    (`--color-focus`). Components use `bg-surface`, `text-muted`, etc.
  - type: `--font-display`, `--font-body`, `--font-mono`; a modular scale
    `--text-xs .. --text-5xl`; `--leading-*`, `--tracking-*`, `--weight-*`.
  - space: a single spacing scale `--space-1 .. --space-32` (one rhythm, so
    "uniform spacing with no rhythm" is a deviation, not the default).
  - form: `--radius-{sm,md,lg,full}`, `--shadow-{sm,md,lg}`,
    `--border-width`.
  - motion: `--ease-{standard,emphasized}`, `--duration-{fast,base,slow}`, all
    behind `prefers-reduced-motion`.
- **Tier 2, the brand (`brand.css`, per-project).** Assigns every tier-1 role a real
  value from the subject, and the `[data-theme="dark"]` overrides. The scaffolder
  generates this fresh per project (a distinct starting palette + a pairing pick),
  never a house default, so the easy path is already specific.
- **Tier 3, the binding (in `contract.css`).** `@theme` exposes the roles as Tailwind
  utilities. Light/dark is the `[data-theme]` switch over the role layer, so a
  component is themed once and works in both.

Discipline the gates enforce: every defined role is referenced (no dead accent
token), and dark is not an afterthought (it ships from tier 1).

## 2. Typeface library + pairings

Self-hosted via Astro 5's native Fonts API (subsetting built in; no third-party
request, no FOIT). The library is a curated SHARED set; the chosen pairing is
per-project. Starting pairings, each a different personality, chosen to avoid the
system/overused trap (no Segoe UI, no Poppins, no Inter-as-display):

- editorial: a high-contrast serif display + a humanist sans body
- technical: a grotesque display + a monospace accent
- warm: a rounded-but-characterful display + a neutral body
- brutalist: a condensed/heavy display + a plain workhorse body

The scaffolder picks one per project as the starting point; the design pass
confirms or replaces it. Pairing guidance (contrast, scale, when to go display
vs neutral) lives in `skil_website-design`.

## 3. Component primitives

A small library, each built once to the floor (semantic HTML, keyboard focus,
responsive, dark, `prefers-reduced-motion`) and themed entirely through tier-1
roles. They are building blocks, not a layout: flexible slots, no imposed single
layout language, so distinctiveness is composed on top.

`Nav`, `Hero` (a few structural variants, not one gradient-blob shape), `Section`
(the content wrapper), `Card`, `CtaBand`, `Form` field set, `Faq`, `Footer`.
Building a site becomes compose-and-retheme; the brand layer makes the same
primitive look like a different studio's work.

## 4. The two skills

- **`skil_website-quality`** (exists): the bar. Mechanical gate contract + the
  agent-judged web-quality rubric (SEO, metadata, programmatic a11y, CWV, content).
- **`skil_website-design`** (new): the process. Operationalizes `frontend-design`:
  the brainstorm -> critique-against-defaults -> build -> critique-again loop, the
  requirement to produce a per-project token + signature plan and check it against
  "would I produce this for any other brief?", copy-as-design-material, and "spend
  boldness in one place." This is the judgment layer that keeps output distinct.

They do not overlap: design decides identity, quality verifies adequacy.

## 5. Quality gates + definition of done

One runner under `tools/website-gates/`, chained into the website npm `verify` so
CI and `verify.py` pick it up with no central edit. Two tiers (the existing
degradation pattern):

- **Static (gates CI, browser-free):** astro check, build, html-validate, the
  head/OG/sitemap + link gate (exists).
- **Browser (on-demand / local, SKIPs loudly without Chrome):** axe-core (zero
  serious/critical), Lighthouse budget (perf >= 90, a11y >= 95, SEO + best-practices
  >= 90 advisory).

`npm run verify` = static (CI). `npm run verify:full` = static + browser (local,
where chromium exists). The written definition of done is in the workflow doc.

## 6. Asset pipeline

- images: `astro:assets` (sharp) for responsive, modern-format, lazy-below-fold.
- SVG: svgo optimization; an inline-sprite icon strategy (no icon-font weight).
- fonts: the Astro Fonts API handles subsetting + self-hosting (tier 2).
- OG + favicon: generated, not hand-made: an OG-image route (satori-class) reading
  the brand tokens, and a favicon set from one source SVG.

Shared pipeline, per-project assets. Polish stops being manual.

## 7. Reference + anti-pattern doc

`docs/website-reference.md`: a few genuine benchmarks to aim at, plus the codified
AI-tell checklist that `design-reviewer` reads: system/overused typefaces, the
gradient-blob hero, every-section-the-same-bordered-white-card, uniform spacing
with no rhythm, defined-but-unused accent tokens, timid radius hedges, and the
three cliched looks (cream + serif + terracotta; near-black + acid accent;
broadsheet hairline columns). Turns hard-won critique into a reusable gate input.

## Build order (on green light)

Each piece independently usable; the last proves the whole.

1. Token architecture (`contract.css` + `brand.css` + light/dark) + the typeface library.
2. `skil_website-design` (the process skill).
3. Component primitives.
4. Gate suite + definition-of-done wiring (axe, html-validate, Lighthouse, one command).
5. Asset pipeline (image opt, OG generation, favicon, subsetting).
6. `docs/website-reference.md` + the new-site runbook + promote the workflow to
   `rule_website_build` / `comd_build-site`.
7. **Proof:** scaffold one example site from the infra, run a fresh design pass,
   pass every gate, and show light/dark x mobile/desktop screenshots: distinct and
   over the floor.

## Status

Architecture, written for review. No implementation until green light. Extends the
shipped `website` archetype, `skil_website-quality`, and `design-reviewer`.
