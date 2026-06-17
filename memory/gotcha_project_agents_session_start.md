---
name: gotcha_project_agents_session_start
description: Project agents (.claude/agents/) only load into the Agent registry at SESSION START; you cannot invoke one (even a pre-existing one) if the registry for the running session lacks it. Apply its rubric via a general-purpose agent, or restart.
metadata:
  type: reference
---

The `Agent` tool can only spawn `subagent_type`s that were in the registry when the
session started. Project agents under `.claude/agents/` (e.g. `design-reviewer`,
`code-reviewer`) load at session start; if the current session's registry does not
include one, invoking it fails with "agent type not found" and the available list
is only the built-ins (`claude`, `general-purpose`, `Explore`, `Plan`, ...). This
is not limited to same-session authoring: it recurred 2026-06-17 at the website
proof's Review step, where `design-reviewer` was authored in an earlier session yet
still absent from this session's registry.

Work around it, do not block on it:

- **Apply the rubric via `general-purpose`.** Spawn a `general-purpose` agent and
  tell it to READ the agent's definition file (`.claude/agents/<name>.md`) plus any
  authority it cites (for design-reviewer: `docs/website-reference.md`) and apply
  them to the target. This preserves the INDEPENDENCE that matters (a fresh context
  reproducing the judgment), which is the substantive point of the review. It
  returned a real, useful design review (0 blockers / 3 majors / 2 minors) this way.
- **Or restart** the session so the agent registers, then invoke it by type.

Either path keeps the Review gate real. The failure mode to avoid is treating the
missing agent type as a reason to skip the independent review. Same family as the
2026-06-16 missed-tool friction (graduated here after a second occurrence).
