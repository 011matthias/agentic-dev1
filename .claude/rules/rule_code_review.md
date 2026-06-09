# Code Review (the Review phase, made concrete)

`rule_dev_loop` names Review as a phase with one exit gate: "no unanswered
correctness or regression finding." This rule says who reviews, what they look
for, and what blocks a merge. It pairs with the `code-reviewer` agent (the
independent reader) and `comd_review` (the entry point).

Review is the correctness gate; CI is the mechanical gate. A green PR proves the
build, the lint, and the tests pass; it does not prove the change is correct or
that the tests would catch the failure. For anything past trivial, both gates
clear before merge.

## Who reviews (calibration, from rule_dev_loop)

- **Trivial** (a typo, copy, a one-line localized change): the author's own
  adversarial read, folded into Implement. No agent.
- **Standard** (a feature, a multi-file change): the author runs `comd_review`
  for an independent read, or reads adversarially against the lenses below.
- **High-stakes** (a shared module, a persisted-data or schema change, a security
  surface, anything a user pays for): the `code-reviewer` agent runs, always.
  The author re-reading their own work is not a review; the point of independence
  is that the reviewer reproduces the reasoning instead of trusting the author's
  summary (`rule_dev_loop` non-negotiable 2).

## What every review covers (the lenses)

1. **Correctness.** Does the change do what its acceptance criteria say? Walk the
   edge cases and the error paths, not just the happy path.
2. **Regression / blast radius.** Does it break a caller? Find every dependent
   first: the product's `ARCHITECTURE.md` blast-radius section, plus serena for
   the symbol's references. A change to a shared primitive is a change to every
   user of it; name them and check each.
3. **Test adequacy.** Would the tests actually fail if the behavior regressed, or
   do they assert state instead of behavior? A passing test that cannot catch the
   failure mode is verification theater.
4. **Invariants.** Are the documented invariants preserved? They live in the
   product's ARCHITECTURE (for CREW: the Confessions anonymity rule, no
   `StrictMode`, press-squash stays pure CSS, the measurement event/payload schema,
   the `localStorage` keys and snapshot `v`).
5. **Simplicity and voice.** Does it fork a primitive that should have been
   extended, leave dead code, or carry comments that narrate the obvious
   (`rule_anti_slop`)?

## Stance and output

The reviewer is adversarial: the job is to find what breaks, not to confirm the
work. A finding stands until it is refuted; default to raising it rather than
assuming it is fine.

The reviewer reads and reports; it does not edit. Output is either `OK` or a
numbered findings list, each finding carrying:

- a severity: `blocker` (merge cannot proceed), `major` (a real correctness or
  regression risk; resolve or justify before merge), or `minor` (improve when
  cheap; non-blocking);
- a `file:line` anchor;
- why it is wrong (the reasoning, reproducible), and a suggested direction.

## What blocks the merge

An unresolved `blocker` or `major` correctness/regression/invariant finding
blocks the merge. The author fixes it and the relevant lens is re-checked, or
refutes it with a reason recorded in the PR. `minor` findings do not block; a
deliberately-skipped minor is the author's call. This is the human side of the
`rule_dev_loop` Integrate gate; CI green is the mechanical side.

## Enforcement

`comd_review` spawns the `code-reviewer` agent on the current diff (working tree
or `main...HEAD`) and surfaces the findings. There is no review hook: a review is
a judgment, not a pattern match, so this stays an agent-run gate rather than a
PostToolUse check. The discipline that does fire structurally is the surrounding
loop, branch, PR, CI green, then merge; review slots in before the merge for
standard and high-stakes work.

## Status

Written 2026-06-09 (Cycle 4), with the `code-reviewer` agent and `comd_review`.
First exercised adversarially on a CREW diff (recorded in that session's
checkpoint). Attaches to the Review phase of `rule_dev_loop`; pairs with
`rule_behaviors` (B2/B3) and `rule_anti_slop` (the voice lens).
