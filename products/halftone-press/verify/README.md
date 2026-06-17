# Website gate suite

The deterministic quality floor for a `website` product, run by one command, in
two tiers. The tiers exist because CI has no browser: the static tier gates every
push; the browser tier runs where Chrome exists (locally, on demand) and SKIPs
loudly otherwise, so the bar is never silently dropped.

These gates live here, in the product's `verify/`, not in a shared `tools/`
directory, so a scaffolded product carries its own gates and `tools/verify.py` +
CI discover them through the npm `verify` script with no central edit (the
`rule_testing` registration pattern). Every assertion is written to BITE and has
been mutation-proven; a green check that cannot fail is worse than no check.

## The one command

```
npm run verify        # static tier: gates CI, browser-free
npm run verify:full   # static + browser tier: run locally before shipping
```

## Static tier (`npm run verify`, gates CI)

| Step | What it asserts | Mutation that reddens it |
|------|-----------------|--------------------------|
| `astro check` | typecheck: no type error in any `.astro`/`.ts` | a bad prop type |
| `astro build` | the site builds to `dist/` | a build error |
| `check-website.mjs` | required `<head>` (title, description, canonical, OG/Twitter, JSON-LD, favicon), `og:image` resolves, no internal-link 404, `robots.txt` + sitemap | drop a tag, point a link at a missing page |
| `check-tokens.mjs` | every contract color/font role is referenced in the built CSS (no defined-but-unused token) | bind a role and never use it |
| `check-no-raw-values.mjs` | components/pages/layouts take color from roles, never a `#hex`/`oklch`/`rgb` literal | add `bg-[#ff0000]` to a component |
| `check-html.mjs` | the built HTML is valid (`html-validate` recommended): nesting, duplicate ids, label/ARIA references | duplicate an `id` |

## Browser tier (`npm run verify:full`, local; SKIPs loudly without a browser)

Optional dependencies, not installed by default so CI stays browser-free:

```
npm i -D playwright @axe-core/playwright   # axe
npx playwright install chromium
npm i -D lighthouse chrome-launcher        # lighthouse budget
```

| Step | What it asserts | SKIP when |
|------|-----------------|-----------|
| `check-axe.mjs` | axe-core: zero serious/critical violations, in light AND dark | `CI` set, or deps/browser absent |
| `lighthouse-budget.mjs` | performance >= 90, accessibility >= 95 (SEO + best-practices advisory) | `CI` set, or deps/Chrome absent |

A SKIP is announced, never silent; a FAIL means it ran and a budget was missed.

## Definition of done (what these gates enforce)

A site is not finished until, per `docs/website-build-workflow.md`:

- **Gates green:** the static tier passes, and the browser tier passes where it can
  run (axe 0 serious/critical; Lighthouse perf >= 90, a11y >= 95).
- **Tokens honest:** `brand.css` carries real per-subject values; no role left at a
  placeholder; no defined-but-unused token (`check-tokens`).
- **Design:** `design-reviewer` returns OK or every blocker/major is resolved; not
  one of the three AI-default looks; the type pairing is deliberate.
- **Responsive + themes:** light and dark verified at ~390px and ~1280px; visible
  keyboard focus; reduced-motion honored.
- **Content:** copy is real and specific (no lorem, no fabricated claims); CTAs
  active-voice; empty/error states give direction.
- **Assets:** images optimized and responsive; the OG image is a real 1200x630;
  favicon set present.

The gate suite is the mechanical half; `design-reviewer` + `skil_website-quality`
are the agent-judged half. Both clear before a site ships.

## Asset pipeline

Polish is generated, not hand-maintained:

- **OG image** (`src/pages/og.png.ts`): a static route that builds a real 1200x630
  PNG from the brand tokens (reads the colors from `brand.css`, lays it out with
  satori, rasterizes with resvg). `check-website.mjs` asserts the served image is
  exactly 1200x630. Swap the bundled OG faces in `src/assets/og/` to match the
  pairing.
- **Images** (`astro:assets`): `<Image>`/`<Picture>` emit responsive `srcset` in
  modern formats (AVIF, WebP), lazy below the fold. Use them for every raster.
- **Favicon set** (`scripts/gen-assets.mjs`): the SVG plus a 32px PNG fallback and
  the 180px apple-touch-icon, all from one source `public/favicon.svg`. Re-run the
  script after editing the source.
- **Fonts**: self-hosted and subset by Astro's Fonts API (the token layer, piece 1).
- **SVG**: optimize with `npx svgo <file>` before committing.
- **Icons**: currently inline SVGs at the use site (accessible, few in number). An
  inline-sprite strategy is the next step if the icon count grows; deferred while
  the set is small rather than built speculatively.
