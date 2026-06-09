# Anti-Slop (voice + code-comment discipline)

Every paragraph, bullet, and comment in a dev1 artifact earns its keep or it is
deleted. This is not a client-facing professionalism rule (dev1 has no clients);
it is a signal-density rule for an internal knowledge base that gets read at every
session start and every understand-phase. Slop dilutes that signal: an unearned
paragraph teaches the reader to skim, and a comment that restates the line it sits
above trains the reader to ignore comments.

The two foundations set the substance; this rule sets the prose. It applies to
docs, READMEs, rules, memory, commit bodies, and code comments.

## Prose: what counts as slop

- **Padding for the appearance of thoroughness.** Volume that carries no new
  information. If a sentence does not add something the prior sentences did not
  establish, cut it.
- **Symmetry illusion.** N items do not require N sentences of the same shape and
  the same density. When values vary under one intuitive rule, state the rule once
  and stop. Three-part lists where two carry the load collapse to two.
- **Empty section intros.** Do not open a section by summarizing what it is about
  to say. Start it.
- **Headings that restate the body.** If the H2 reads "Why X happens" and the body
  opens "X happens because Y", fold the heading into the sentence.
- **Closing meta-summaries.** "In summary", "in conclusion", "the bottom line".
  The last sentence is the close; do not announce it.
- **Hedging and buffer language.** "It's worth noting", "keep in mind", "to be
  clear", "as you can see".
- **Corporate thesaurus.** robust, leverage, ensure, facilitate, comprehensive,
  streamline, optimize, holistic, drive, unlock, empower. And the sentence-opening
  adverbs: notably, importantly, interestingly, fundamentally, essentially.
- **Performed humanness.** "Honestly,", "Look,", "Here's the thing,", "At the end
  of the day". The opposite failure mode of the corporate thesaurus, equally slop.
- **"Not just X but Y."** Just say what it is.

What is NOT slop: a specific fact, number, or constraint with its source, even when
long; a brief note before a code or config block that the block needs; a comment
that explains a non-obvious WHY. Length earned by load-bearing detail is fine.

## Code comments: WHY, not WHAT

A comment restates the code is slop; the code already says what it does. A comment
earns its place when it carries what the code cannot:

- the reason a non-obvious choice was made (a constraint, a platform quirk, a
  past failure the line guards against);
- an invariant the reader must preserve;
- a pointer to the incident or rule that explains the shape.

The seeded hooks are the house style: the `F2a / F2b / F2c` comments in
`gate-skip-detector.py` explain why each exemption exists and which false-positive
it closed. Match that. Delete comments that narrate self-evident mechanics.

## Em-dashes

Strip the em-dash character (the `—`, U+2014) from dev1 prose. It is the single
strongest "written by an autocomplete" tell, and it is mechanically removable, so
it is removed rather than remembered. The conventional replacement is a semicolon
(`; `), a colon, a comma, or two sentences; pick what preserves the meaning.

Dev1 divergence from the consultancy rule: ` -- ` (space hyphen hyphen space) is
NOT banned here. In a code and CLI repo it is a legitimate end-of-options separator
(`git ls-tree <rev> -- <path>`), and stripping it would corrupt the very command
examples the docs exist to show. The gate strips the em-dash character only.

## Enforcement

- `tools/strip-em-dash.py` mechanically replaces a spaced em-dash with `; ` in
  markdown prose, skipping fenced and indented code, and leaving ` -- ` untouched.
- `em-dash-strip-gate.py` (PostToolUse on Write/Edit) runs that tool on any dev1
  markdown (`.md` / `.markdown` / `.mdx`) outside vendored trees (`node_modules`,
  `dist`, `build`). It mutates the file and emits a re-read advisory, so the
  em-dash discipline does not depend on agent recall (the consultancy version
  failed by recall three sessions running; the gate is the Layer-1 fix).

The prose-slop and code-comment parts are not mechanizable into a gate without a
high false-positive rate, so they stay agent discipline, run at write time on every
paragraph and comment. The em-dash slice is the one part cheap enough to automate,
so it is automated.

## Status

Written 2026-06-09 (Cycle 3). Re-points the seeded em-dash gate (previously scoped
to consultancy client-facing paths, inert in this repo) onto dev1 prose, and cleans
the em-dashes the inert gate let into the seed docs. Pairs with `rule_behaviors`
(the decision-time gates) and the two foundations.
