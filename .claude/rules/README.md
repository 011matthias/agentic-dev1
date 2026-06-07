# Rules (under active co-design)

The `.claude/rules/` set is the always-on constraint layer. For agentic-dev1 it is
being authored from scratch by the owner rather than ported wholesale from
agentic-ops.

## Written

- `rule_dev_loop` : the foundational rule. The lifecycle spine
  (Understand -> Specify -> Plan -> Implement -> Verify -> Review -> Integrate ->
  Learn) plus the three non-negotiables (understand before change; verify behavior
  not state; anneal every failure). Non-negotiable 2 has its executable form in
  `tools/verify.py`.

## Referenced by seeded hooks, still to write

- `rule_behaviors` : decision boundaries (B1-B4) and the self-annealing layers
  not already covered by the dev-loop rule.
- `rule_no_auto_commit` : the tiered B6 ship gate (the hook is already active).
- `rule_anti_slop` : voice discipline (the em-dash-strip hook pairs with it).
- `rule_session-pressure` : pressure bands and adaptive behavior.

## Planned product-dev rules

- `rule_code_review` : review-before-merge, attaches to the Review phase
  (pairs with a code-reviewer agent).
- `rule_release` : semver tags + changelog; release stays on the gated floor.
- `rule_dependency_hygiene` : pinned lockfiles, audit, no secret-bearing deps.

(verification-before-completion is folded into `rule_dev_loop` non-negotiable 2.)

## How hooks and rules relate

The hooks are wired and active whether or not their companion rule file exists:
they do not read rule files at runtime (rule references in hook output are advisory
pointers). Writing a rule sharpens the agent's behavior; it does not toggle a hook.

Three seeded hooks still carry consultancy-era policy that is inert in this repo
until re-pointed during the rule design: the em-dash scope (client-deliverable
paths), the no-auto-commit prototype carve-out (`local-web` paths), and the
gate-skip MCP patterns (Make / n8n). Re-point these when writing the companion
rules. The em-dash gate being inert is already visible: several seed docs carry
em-dashes the gate would otherwise have stripped, which is the kind of escaped
failure non-negotiable 3 (anneal) turns into a re-pointed gate rather than a manual
clean-up.
