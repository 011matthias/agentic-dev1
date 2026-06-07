---
description: Reload context from the latest checkpoint and project state.
---

# /comd_resume

Reload working context at the start of a session. See `rule_session_start`.

Steps:

1. Read the latest `docs/sessions/{date}.md` checkpoint; pull its next-steps.
2. Load all `memory/` files + `MEMORY.md`.
3. Read `docs/friction-register.md` for open patterns; run
   `tools/friction-watch.py`.
4. List open PRs and in-flight branches (`gh pr list`, `git branch -v`).
5. Print the session header and state the resumed intent plus the band
   (`rule_operating`).
