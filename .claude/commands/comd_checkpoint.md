---
description: Save a session checkpoint for continuity (state + friction + next steps).
---

# /comd_checkpoint

Save the current session state so the next session resumes without loss. See
`rule_session_start`.

Steps:

1. Write to `docs/sessions/{YYYY-MM-DD}.md` (append if it exists) with:
   - What was done this session (specific bullets).
   - Current state: open PRs, branches in flight, what is verified vs pending.
   - Next steps (concrete and actionable).
   - Decisions made, and why.
2. Append any friction events to `docs/friction-register.md`, one row each:
   `| date | scope | type | description | resolved | fix |`.
3. Surface one strategic-feedback line: what worked, one suggestion, one health
   note.
4. `--mini`: write only state + next-steps; skip the feedback section.

Checkpoints are docs; they land under the lean-autonomous model (`rule_operating`).
