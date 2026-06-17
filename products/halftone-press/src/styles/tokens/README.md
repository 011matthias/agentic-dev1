# Token architecture + typeface library

The styling contract. Two rules govern everything here:

- **contract.css is SHARED** and never edited per project. It is the role names,
  the scales, and the Tailwind `@theme` binding.
- **identity is PER-PROJECT** and lives in exactly two files: `brand.css` (the
  palette) and `astro.config.mjs` `experimental.fonts` (the type pairing).

A component references roles (`bg-surface`, `text-muted`, `font-display`), never
a raw color or face. So re-skinning a whole site is a `brand.css` edit, dark mode
is a cascade switch with no JavaScript, and no primitive hard-codes a value.

## The three tiers

1. **Contract (`contract.css`, shared).** Maps each Tailwind utility namespace to
   a brand variable via `@theme inline` (`--color-bg: var(--bg)`), plus the shared
   scales: a one-ratio type scale with paired line-heights, a single spacing base
   (`--spacing`, so one rhythm governs every `p-*`/`gap-*`), radius, shadow, and
   motion easings/durations. `inline` is load-bearing: it emits the brand var by
   name into each utility, so a `[data-theme]` override re-themes everything with
   no rebuild.
2. **Brand (`brand.css`, per-project).** Assigns the eight color roles a real
   value from the subject and the dark set. The one file a build spends identity
   in. The shipped values are a labeled EXAMPLE; `skil_website-design` regenerates
   them per brief.
3. **Faces (`astro.config.mjs`, per-project).** The Fonts API self-hosts and
   subsets the chosen pairing and exposes it as `--ff-display` / `--ff-body` /
   `--ff-mono`, which the contract binds to `font-display` / `font-body` /
   `font-mono`.

The color roles: `bg`, `surface`, `text`, `text-muted`, `brand`, `accent`,
`border`, `focus`. Every one must be referenced (`verify/check-tokens.mjs` fails
the build on a defined-but-unused role) -- a palette that declares an accent it
never spends is the AI-tell the gate exists to stop.

## The typeface library (the four pairings)

Self-hosted via Astro's Fonts API (no third-party request, no FOIT, metric-matched
fallbacks so there is no layout shift on swap). All faces are on Google Fonts, so
the provider can fetch any of them. The list deliberately avoids the defaults that
read as templated: no Segoe UI / system stack as a brand face, no Poppins, no
Inter as a display face.

`skil_website-design` picks ONE pairing per brief (or replaces it with a better
fit) and wires it in `astro.config.mjs`. The starter ships **editorial**.

| Pairing | Display | Body | Mono / accent | Personality |
|---------|---------|------|---------------|-------------|
| **editorial** | Fraunces (high-contrast serif, optical) | Mulish (humanist sans) | JetBrains Mono | considered, literary, magazine-like |
| **technical** | Space Grotesk (grotesque) | Inter Tight or IBM Plex Sans (body) | JetBrains Mono (accent, used as data/labels) | precise, product, tooling |
| **warm** | Bricolage Grotesque (characterful) | Figtree (friendly neutral) | IBM Plex Mono | approachable, human, rounded |
| **brutalist** | Archivo (variable, push to expanded/heavy) or Anton (condensed) | IBM Plex Sans (plain workhorse) | IBM Plex Mono | loud, structural, confident |

Pairing guidance (the rest is in `skil_website-design`):

- **Contrast between the two faces earns its keep.** Pair a characterful display
  with a quiet body (editorial, warm), or lean the whole page into one strong
  voice (brutalist). Two neutral faces read as no decision.
- **Scale the display, restrain the body.** The display face carries personality
  at `text-4xl`/`text-5xl`; below `text-xl` it usually reads better in the body
  face. Use the display sparingly so it stays a signal.
- **Mono is a utility face**, not decoration: code, data, labels, eyebrows. Two of
  the pairings spend it as a deliberate accent (technical, where labels are mono).

## Swapping the pairing

Three localized edits, no contract change:

1. In `astro.config.mjs`, change each font family's `name` (and `weights` if the
   new face's range differs); keep the `cssVariable` role name.
2. The `<Font>` tags in `Layout.astro` reference the cssVariables, so they need no
   change unless you add or drop a role.
3. Rebuild: the new faces download, subset, and self-host.

## Dark mode

`brand.css` declares the dark palette once (as `--*-dark`) and applies it under
both `@media (prefers-color-scheme: dark)` (following the OS) and
`[data-theme="dark"]` (an explicit toggle). A site is correct in light AND dark by
construction; the gates verify both.
