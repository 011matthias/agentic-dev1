---
name: gotcha_shared_worktree
description: Two concurrent Claude sessions in one checkout share HEAD/index; a parallel branch switch stomps your commit onto the wrong branch. Recover via push-by-SHA then a guarded disentangle.
metadata:
  type: reference
---

Two sessions running in the SAME working tree share one `.git`, one HEAD, and one
index. A branch switch in either session moves HEAD for BOTH. Seen 2026-06-16: a
parallel Cycle-7 session ran `git checkout -b harness/cycle-7-spine` mid-build, the
shared HEAD moved, and this session's `skil_crew-verify` commit landed on that
branch instead of its own `product/crew/verify-skill`. The reflog is the proof
(`checkout: moving from <mine> to <theirs>` between your branch creation and your
commit). The early tell: untracked files you did not write appear and change
mtime mid-session (untracked files are branch-independent, so another session
writing them is visible even before HEAD moves).

Recovery, no data loss:

1. Immortalize first. `git push origin <my-sha>:refs/heads/<my-branch>` pushes the
   commit by SHA with NO local ref or HEAD change, so it is safe even mid-race.
   Your work is now on the remote regardless of further local churn.
2. Guarded disentangle, in one atomic block: re-read the wrong branch's tip; only
   if it still equals your commit, `git branch -f <my-branch> <sha>`,
   `git switch <my-branch>` (no worktree change when both refs point at the same
   commit), then `git branch -f <their-branch> <their-original-base>` to restore
   their branch. If the tip moved, ABORT and surface (they committed on top of
   yours; force-moving would lose their commit).
3. Stage only explicit paths, never `git add .` / `git add -A`, so you never sweep
   the other session's untracked WIP into your commit.

Structural fix: do not share a worktree. Run a second concurrent session in
`git worktree add ../<name> <branch>` (its own HEAD and index) or stop one. Until
then, every git op you run moves the other session's HEAD too, so the disruption
is mutual; once HEAD has been moved by recovery, the other session must be
re-oriented regardless. Same family as [[gotcha_cross_repo_cwd]]: shared mutable
state leaking across contexts that look independent.
