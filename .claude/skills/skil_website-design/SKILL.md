---
name: skil_website-design
description: The per-project DESIGN PROCESS for a website build: turn a brief into a distinctive, intentional visual identity (palette, type pairing, layout concept, one signature element) and write it into the token layer (brand.css + the experimental.fonts pairing). Use at the Direction phase of a website build, before composing any page, or whenever a site risks reading as templated or AI-generic. Operationalizes the vendored frontend-design methodology (brainstorm then critique-against-defaults then build then critique-again; the "would I produce this for any other brief?" test; copy-as-design-material; spend boldness in one place) onto the dev1 website infrastructure. Product-agnostic, founded at the website archetype. Pairs with skil_website-quality (the bar, verifies adequacy) and design-reviewer (the adversarial visual read); this skill DECIDES identity, those VERIFY it.
---

# Website design (the process, any website product)

What makes a site high-quality splits in two. One half is the web-platform bar:
can it be found, does it share, can everyone use it, is it fast. That is
`skil_website-quality`. The other half is identity: does it look like a deliberate
studio made it for this subject, or like a template with the colors changed. This
skill owns identity. It is the judgment layer that decides palette, type, layout,
and the one signature element, and writes that decision into the token layer the
infrastructure already provides.

Founded general. This is keyed to the `website` archetype, not to any one product;
it applies to the first site and the tenth. It is the design twin of
`skil_website-quality`, and deliberately not a product-bound recipe.

## The governing split (do not let it blur)

- **Shared, identical every build:** the quality floor, the tooling, the workflow,
  and the token ARCHITECTURE (the `contract.css` role names, the scales, the
  `@theme` binding). How good and how fast we are is standardized.
- **Fresh, decided here per build from the subject:** the palette, the type
  pairing, the layout concept, the one signature element, the copy. The look is
  never standardized.

The failure mode this skill exists to kill: **infrastructure that becomes a look.**
If output starts converging on a house style (every site cream-and-serif, every
hero a centered headline over a gradient), the toolkit has failed at its job. The
job here is to make distinctiveness the easy path: the brand tokens are generated
fresh per project, the process forces the "would I produce this for any other
brief?" critique, and `design-reviewer` is adversarial about template-genericness.

## Authority and reading

The taste reasoning lives in the vendored `frontend-design` skill (hero-as-thesis,
typography-carries-personality, structure-encodes-meaning, deliberate motion,
match-complexity-to-vision, copy-as-design-material, restraint, and the three
AI-default looks). Read it; this skill does not restate it. What this skill adds is
the operationalization: the concrete loop, the artifact it produces, and how that
artifact lands in dev1's token infrastructure so the gates can check it.

The codified AI-tells you critique against live in `docs/website-reference.md` (the
tell-list `design-reviewer` also reads). The typeface library (four pairings) lives
in `templates/website/src/styles/tokens/README.md`.

## Inputs

The brief: subject, audience, the page's one job, the real content, constraints,
deploy target. If the brief does not pin the subject, pin it yourself in one line
and state the inference (a design means nothing against an unnamed subject). Pull
any owner preferences or prior decisions from memory before deciding.

## The loop

Four passes. Passes 1 and 2 are the cheap place to get identity right, before any
page exists; do not skip pass 2.

### Pass 1: ground in the subject, then brainstorm a compact plan

The subject's own world (its materials, instruments, artifacts, vernacular) is
where distinctive choices come from, not a palette generator. Produce a compact
token plan:

- **Palette:** 4 to 6 named values, written as the eight contract color roles
  (`bg`, `surface`, `text`, `text-muted`, `brand`, `accent`, `border`, `focus`)
  plus the dark set. Use `oklch` so the palette rotates by hue while holding
  contrast. The `accent` is a real second hue you will spend, not a tint of
  `brand`; if you cannot say where it gets used, you do not have one.
- **Type pairing:** a display and a body face, chosen for this subject. Start from
  the four-pairing library (editorial / technical / warm / brutalist) or go beyond
  it; never the defaults that read as templated (no system stack as a brand face,
  no Poppins, no Inter-as-display). Name the weights you will actually load.
- **Layout concept:** one or two sentences plus an ASCII wireframe of the hero and
  the section rhythm. The hero is a thesis: open with the most characteristic thing
  in the subject's world, not a centered headline over a gradient unless that is
  genuinely the strongest move.
- **Signature:** the single element the page is remembered by, embodying the brief.
  One, not five.

### Pass 2: critique against the defaults (the gate)

Hold the plan up to one question, in writing: **"would I produce this for any other
brief?"** Work through a similar prompt in your head; if you would land in the same
place for an unrelated subject, that part is a default, not a choice. Check it
against the three AI looks (cream + high-contrast serif + terracotta; near-black +
one acid accent; broadsheet hairlines + zero radius + dense columns) and the
`website-reference.md` tell-list (gradient-blob hero, every-section-the-same-card,
uniform spacing with no rhythm, defined-but-unused accent, timid radius hedges).
Revise every part that reads generic, and record what you changed and why. Only a
plan that survives this advances to build.

### Pass 3: build (spend boldness in one place)

Write the decision into the infrastructure, do not reinvent it:

- the palette and dark set go into `brand.css` (the per-project values file);
- the pairing goes into `astro.config.mjs` `experimental.fonts` (self-hosted,
  subset), keeping the role-named cssVariables;
- compose the `primitives` into pages; theme only through tier-1 roles.

Spend boldness on the signature element and keep everything around it quiet and
disciplined. Maximalist directions need elaborate execution; minimal directions
need precision in spacing and type. Cut any decoration that does not serve the
brief. Write the copy as you build (next section); placeholder copy makes a design
read as templated as a default palette does.

### Pass 4: critique again on the rendered build

Screenshot the running build at desktop and mobile, light and dark. Judge what it
actually drew, not the plan. Then hand it to `design-reviewer` for the independent
adversarial read and to `skil_website-quality` for the bar. Resolve every blocker
or major before the site is done.

## The artifact

The pass-1/2 output is a written direction plan the owner reviews before any page
is built (the one owner checkpoint where taste is cheap to redirect):

```
DIRECTION: <subject> for <audience>; the page's one job is <X>.
Palette:   bg / surface / text / text-muted / brand / accent / border / focus
           (light + dark), as oklch, with one line on where accent is spent.
Type:      <display> + <body> (+ mono if used); weights; why this pairing for
           this subject.
Layout:    <concept, one or two sentences> + an ASCII wireframe of the hero.
Signature: <the one memorable element>.
Critique:  what in the first draft read as a default, and what changed (the
           answer to "would I produce this for any other brief?").
```

The build output is `brand.css` + the `experimental.fonts` edit + the composed
pages, all over the floor and the gates.

## Copy as design material

Words exist to make the interface easier to use; bring the intentionality you bring
to spacing and color. Write from the user's side of the screen: name things by what
the person controls and recognizes, not by how the system is built. Active voice on
every control, and the name stays constant through the flow ("Publish" produces a
"Published" toast). Treat error and empty states as direction, not mood: say what
happened and how to fix it, in the interface's voice. Be specific over clever. No
lorem, no "Welcome to our website", no fabricated testimonials, credentials, or
metrics (invent nothing that claims to be real).

## Boundaries

- **vs `skil_website-quality`:** this skill asks "is it distinctive and good?";
  quality asks "is it correct, fast, accessible, findable?". This decides identity;
  quality verifies adequacy. Both clear before a site is done. They do not overlap:
  quality owns the mechanical gate and the web-platform rubric; this owns palette,
  type, layout, signature, and copy-as-design.
- **vs `design-reviewer`:** that agent is the independent adversarial READ of the
  rendered build (it reports, does not edit, does not design). This skill is the
  process that PRODUCES the design it reviews. Run the agent at pass 4.
- **vs `frontend-design`:** that vendored skill is the underlying taste authority
  this one operationalizes; defer to it on the reasoning, use this for the loop and
  the artifact.

## Calibration

- **Trivial** (a copy fix, a one-section tweak on an existing site): no new
  direction plan; apply the existing tokens, keep the voice.
- **Standard** (a new page or a new site section): a short direction note for the
  new surface, reusing the established palette and pairing.
- **High-stakes** (a new site, a marketing or paid landing page): the full loop,
  the written direction plan to the owner before build, and `design-reviewer` at
  Review. The pass-2 critique is mandatory, not optional.

## Status

Written 2026-06-17 (website infrastructure, piece 2). Founded general at the
website archetype, the design twin of `skil_website-quality`. Operationalizes the
vendored `frontend-design` methodology onto the dev1 token layer (`contract.css` /
`brand.css` / the Fonts API pairing) and the primitives. Pairs with
`skil_website-quality` (the bar), `design-reviewer` (the adversarial visual read),
`docs/website-build-workflow.md` (the loop this is the Direction phase of), and
`docs/website-reference.md` (the AI-tell checklist the pass-2 critique runs).
