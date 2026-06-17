# Website reference: benchmarks + the AI-tell checklist

Two things a website build aims at: the measurable bar (benchmarks) and the
unmeasurable one (does it read as a deliberate design or a template). The first is
gated mechanically; the second is the codified tell-list `design-reviewer` and the
`skil_website-design` pass-2 critique read. This doc is the shared source for both,
so the bar and the critique do not drift between builds.

## Benchmarks (what to aim at)

Real targets, not aspirations. The gate suite enforces the hard ones; the rest are
the numbers a build is measured against.

- **Core Web Vitals** (the field thresholds, web.dev): LCP <= 2.5s, CLS <= 0.1,
  INP <= 200ms. A static Astro site with self-hosted subset fonts and no shipped JS
  clears these by construction; the way to lose them is an unsized hero image (CLS)
  or a render-blocking font (LCP).
- **Lighthouse** (the gate): performance >= 90, accessibility >= 95; SEO and
  best-practices >= 90 advisory. 100/100 is reachable for a content site and worth
  it; treat anything under 90 perf as a regression to explain.
- **axe**: zero serious/critical violations, in light AND dark. Contrast is the
  usual first miss; verify the decisive state, not just the default.
- **Page weight**: a content/marketing page should ship 0 KB of app JS by default
  (Astro islands only where genuinely interactive). HTML+CSS first paint; fonts
  subset to the glyphs used (the Fonts API does this).
- **Share card**: a real 1200x630 PNG (~1.91:1), generated from the tokens, not a
  placeholder; `og:image` absolute and resolvable.

## The AI-tell checklist (what reads as templated)

Each tell is a default an AI reaches for regardless of subject. Where a brief
genuinely calls for one, it is a choice and fine; where it appears because nothing
else was decided, it is the tell. `design-reviewer` names these by number; the
`skil_website-design` pass-2 critique revises any that appear unbidden.

1. **System / overused typefaces.** Segoe UI or the system stack as a brand face,
   Poppins, or Inter used as the display face. The page's voice defaulted instead
   of being chosen. Fix: a deliberate display/body pairing from the subject (the
   library in `templates/website/src/styles/tokens/README.md`).
2. **The gradient-blob hero.** A big headline centered over a soft radial/conic
   gradient or a blurred blob, often with a generic "Get started" button. It fits
   any product, which is the problem. Fix: open with the most characteristic thing
   in the subject's world (hero-as-thesis).
3. **Every-section-the-same-card.** The whole page is rows of identical bordered
   white cards on a grey background. No hierarchy, no rhythm, no decision. Fix:
   vary section tone and layout; let structure encode real grouping.
4. **Uniform spacing with no rhythm.** Every gap the same value, so nothing groups
   or separates; the page reads flat. Fix: one spacing scale used with intent
   (tight within a group, generous between sections); the `--spacing` base gives
   the rhythm, use its steps deliberately.
5. **Defined-but-unused accent.** A palette declares an accent (or a second/third
   color) that never appears, so the brand claims a richness it does not spend. The
   `check-tokens` gate fails the build on this; visually, an accent that appears
   exactly once as a link color is the softer version of the same tell.
6. **Timid radius hedges.** A `border-radius` of 3-5px everywhere: neither sharp
   nor round, a hedge rather than a decision. Fix: commit (sharp 0, or a real
   round), per the brief's personality.
7. **The three cliched looks.** The clusters AI design converges on regardless of
   subject:
   - cream background (~#F4F1EA) + a high-contrast serif display + a terracotta
     accent;
   - near-black background + a single bright acid-green or vermilion accent;
   - broadsheet layout: hairline rules, zero radius, dense newspaper columns.
   All three are legitimate for some briefs; none should be the default an unset
   axis falls into. If the result is unmistakably one of these and the brief did not
   ask for it, that is a blocker, not a deduction.

## How this doc is used

- **`design-reviewer`** reads this list and names tells by number against the
  running build (it is cited in the agent's authority).
- **`skil_website-design`** runs the pass-2 "would I produce this for any other
  brief?" critique against this list before any page is built.
- **The gates** enforce the mechanizable subset: `check-tokens` (tell 5),
  `check-no-raw-values`, axe/Lighthouse (the benchmarks).
- **Anneal:** when a tell slips past review into a shipped site, add it here (or
  sharpen an existing entry) so the next review catches it. This list grows from
  real escapes, not speculation.
