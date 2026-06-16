# Rules (under active co-design)

The `.claude/rules/` set is the always-on constraint layer. For agentic-dev1 it is
being authored from scratch by the owner rather than ported wholesale from
agentic-ops.

## Written

The three foundations:

- `rule_dev_loop` : the foundational rule. The lifecycle spine
  (Understand -> Specify -> Plan -> Implement -> Verify -> Review -> Integrate ->
  Learn) plus the three non-negotiables (understand before change; verify behavior
  not state; anneal every failure). Non-negotiable 2 has its executable form in
  `tools/verify.py`.
- `rule_operating` : how we work; lean and floor-gated autonomy, the carried
  reflexes, the session rhythm.
- `rule_session_start` : the open-of-session protocol (load memory, header, band,
  open threads).

The phase and decision rules that attach to them:

- `rule_behaviors` : the decision-time gates (B1 ask-first, input interpretation,
  B2 verify-before-done, B3 suspect-your-change, the 3-iteration cap, the ship
  gate, friction logging). Gives the seeded advisory hooks their dev1 contract.
- `rule_anti_slop` : voice and code-comment discipline. Re-points the em-dash gate
  onto dev1 prose (no longer inert).
- `rule_code_review` : the Review phase made concrete; the lenses and the
  merge-blocking gate. Pairs with the `code-reviewer` agent and `comd_review`.
- `rule_testing` : the Verify phase made concrete per archetype; test adequacy
  (`prove it bites`), the mechanical vs agent-judged layers, and the per-archetype
  verify profiles. Pairs with `skil_crew-verify` (the reference mechanical
  instance) and the `design-reviewer` agent (the agent-judged half).

## Still to write (a hook or a cycle will earn each)

- `rule_no_auto_commit` : the tiered B6 ship gate. The hook is active and the
  contract lives inline in `rule_operating` + `rule_behaviors` until the standalone
  rule is worth extracting.
- `rule_session-pressure` : pressure bands and adaptive behavior; the
  session-pressure-meter hook is already active.
- `rule_release` : semver tags + changelog; release stays on the gated floor
  (Cycle 9).
- `rule_dependency_hygiene` : pinned lockfiles, audit, no secret-bearing deps.

## How hooks and rules relate

The hooks are wired and active whether or not their companion rule file exists:
they do not read rule files at runtime (rule references in hook output are advisory
pointers). Writing a rule sharpens the agent's behavior; it does not toggle a hook.

Two seeded hooks still carry consultancy-era policy inert in this repo until
re-pointed during the rule design: the no-auto-commit prototype carve-out
(`local-web` paths) and the gate-skip MCP patterns (Make / n8n). The third, the
em-dash gate, has been re-pointed onto dev1 prose (`rule_anti_slop`). Re-point the
remaining two when their companion rules are written.
