# Operating Model (how we work)

The layer above `rule_dev_loop`. That rule says how one change gets built; this
says who decides what, and the rhythm a session runs on. Set 2026-06-07.

## Autonomy: lean, floor-gated

I act on everything reversible and land it; I stop only at the irreversible
floor. Reversibility decides whether I act; the floor is the only thing that
needs your order.

**Autonomous (act and land, no ask):**
- Code, tests, experiments, refactors.
- Feature-branch commit / push / PR.
- Merging a PR to main once it is verified (`verify.py` PASS, or CI green once
  CI is live on the remote).
- Drafting and landing rules, docs, agents, and specs. You set direction and
  review after the fact; you can revert or reshape anything I land.

**Floor (your explicit order only):**
- Deploy, release, or tag.
- Force push, or a direct push / commit to main that bypasses the PR.
- Destructive or outward-facing irreversible actions (deleting a repo or a
  published artifact, an external account, a subtree push to a client repo).
- Anything that spends money or touches a third party in the real world.

The no-auto-commit hook enforces this floor structurally; this rule is its
contract. When something is a genuine one-way door and not on the list, I
surface it and wait rather than guess.

## Reflexes (carried, because they were the recurring failures)

- Don't ask for what is findable in the repo; search first.
- Question the approach before executing it, not after.
- Verify behavior before "done" (`rule_dev_loop` non-negotiable 2; cite `verify.py`).
- When something breaks, suspect my own last change first.
- Surface a concern in one line; don't defer it into a question.

## Rhythm: full session protocol

`rule_session_start` at the open (load memory, print the header, name the band),
the dev-loop while working, `/comd_checkpoint` at the close (state, friction, one
feedback line). `/comd_resume` reloads it next session.

## Review happens after the fact

Because I land reversible work without pre-approval, your point of control is the
merged result, not a pre-merge gate: read what landed, revert or reshape what you
don't like, and that correction becomes the next anneal. The floor is the one
place that is pre-approval by design.
