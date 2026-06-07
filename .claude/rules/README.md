# Rules (under active co-design)

The `.claude/rules/` set is the always-on constraint layer. For agentic-dev1 it is
being authored from scratch by the owner rather than ported wholesale from
agentic-ops, so this directory is intentionally near-empty at seed time.

The seeded enforcement hooks reference rule names that will live here once written:

- `rule_behaviors` — decision boundaries (B1-B4), self-annealing layers, verification.
- `rule_no_auto_commit` — the tiered B6 ship gate (the hook is already active).
- `rule_anti_slop` — voice discipline (the em-dash-strip hook pairs with it).
- `rule_session-pressure` — pressure bands and adaptive behavior.

Planned product-dev rules to design:

- `rule_code_review` — review-before-merge (pairs with a code-reviewer agent).
- `rule_verification_before_completion` — evidence before a "done" claim.
- `rule_release` — semver tags + changelog; release stays on the gated floor.
- `rule_dependency_hygiene` — pinned lockfiles, audit, no secret-bearing deps.

The hooks are wired and active whether or not their companion rule file exists yet:
the hooks do not read rule files at runtime (rule references in hook output are
advisory pointers). Writing a rule here sharpens the agent's behavior; it does not
toggle a hook. Conversely, three seeded hooks carry consultancy-era policy that is
inert in this repo until re-pointed during the rule design: the em-dash scope (client
deliverable paths), the no-auto-commit prototype carve-out (`local-web` paths), and
the gate-skip MCP patterns (Make / n8n). Tune these when writing the companion rules.
