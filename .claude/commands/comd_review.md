---
description: Run an independent adversarial review of the current diff before merge.
---

# /comd_review

Review the current change before it merges, the Review phase of `rule_dev_loop`.
See `rule_code_review` for the lenses and the merge-blocking gate.

Steps:

1. Resolve the diff scope: the working-tree + staged diff by default, or
   `main...HEAD` for the current branch, or a PR number if one is given as an
   argument.
2. Spawn the `code-reviewer` agent on that scope. It reads the diff and the
   touched subsystem (the product `ARCHITECTURE.md` blast-radius section, serena
   for callers), applies the lenses, and returns `OK` or a numbered,
   severity-banded findings list.
3. Surface the findings verbatim. For each `blocker` / `major`: fix it and
   re-check the relevant lens, or refute it with a reason recorded in the PR.
   `minor` findings are the author's call.
4. Merge only once no `blocker` / `major` correctness, regression, or invariant
   finding is open (the human gate) and CI is green (the mechanical gate).

Use for standard and high-stakes changes. Trivial one-line changes fold the
review into the author's own read (`rule_code_review` calibration).
