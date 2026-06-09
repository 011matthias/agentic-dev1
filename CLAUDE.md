# agentic-dev1

Software-products hub. A single-owner workspace for building and shipping several
products, each self-contained under `products/{name}/`. The governance and test
harness is seeded from the agentic-ops self-annealing system, stripped to its
domain-agnostic core and re-pointed at software engineering rather than automation
consultancy.

## Structure

```
CLAUDE.md                 # this charter
.claude/
  hooks/                  # enforcement layer (wired via tools/wire-hooks.py)
  rules/                  # always-on constraints (under active co-design)
  agents/                 # task specialists (under active co-design)
  skills/                 # on-demand domain knowledge
  commands/               # user-facing entry points
tools/                    # harness scripts + tests (see tools/INDEX.md)
  tests/                  # enforcement-layer regression suite (pytest)
products/
  crew/                   # first product: CREW party game (Vite + React + TS PWA)
docs/
  friction-register.md    # self-annealing log
  sessions/               # session logs
memory/                   # committed project knowledge base (MEMORY.md = index)
```

## Products

Each product is self-contained: its own source, dependencies, tests, README, and
build. The hub provides the shared harness (enforcement hooks, CI gates, the
self-annealing loop); it does not share runtime code between products.

- **crew**; single-device pass-and-play party game (Impostor + about-each-other
  modes). `cd products/crew && npm install && npm run dev`.

## Harness

**Enforcement hooks.** Nine hooks enforce decision-time gates. They are wired into the
gitignored `.claude/settings.local.json` by `tools/wire-hooks.py`, which is the
tracked single source of truth and self-heals at session start (`--ensure`). If the
layer is ever silently stripped (a device sync, a settings reset), the next session
re-wires it.

Active gates:
- **no-auto-commit (B6)**; tiered ship gate. Feature-branch commit / push / PR-open
  run autonomously; `gh pr merge` auto-fires on CI-green; main / force / deploy / tag
  stay on the gated floor and need an explicit order.
- **cd-guard**; refuses `cd X && ...` that persists shell cwd across hook runs; use
  `git -C`, `npm --prefix`, a subshell, or absolute paths.
- **session-pressure-meter**; counts tool calls + files, advises checkpointing.
- **input-classifier / stop-b1 / post-action / gate-skip**; input-interpretation and
  verification-discipline advisories.
- **em-dash-strip / anti-slop**; voice discipline (scope pending the rule design).

**CI.** `.github/workflows/ci.yml` runs the enforcement-layer pytest suite, ruff (the
real-bug ruleset), and the `tools/INDEX.md` membership gate, and builds each product.
A green PR has passed all of these; that is the objective signal the B6 auto-merge
keys on.

**Self-annealing loop.** After a fix or correction, ask "how do I prevent this whole
category?" and operationalize the answer as a hook or tool (preferred), a rule, or a
memory. Friction is logged to `docs/friction-register.md`; `tools/friction-watch.py`
surfaces patterns at session start.

## How we work

The operating model is `rule_operating`: lean and floor-gated. Reversible work
(code, tests, feature-branch commit/push/PR, merging a verified PR, drafting and
landing rules/docs) runs autonomously; only the irreversible floor (deploy,
release, tag, force push, direct-to-main, destructive or outward-facing actions)
needs an explicit order. Review happens after the fact.

How a change is built is `rule_dev_loop`: Understand -> Specify -> Plan ->
Implement -> Verify -> Review -> Integrate -> Learn, with three non-negotiables
(understand before change; verify behavior via `tools/verify.py`, not state;
anneal every failure into a guard).

Session rhythm is the full protocol: `rule_session_start` at the open,
`/comd_checkpoint` at the close, `/comd_resume` to reload.

## Git workflow

Feature branches; direct push to `main` is gated. Branch naming:
`product/{name}/{desc}`, `harness/{desc}`, `docs/{desc}`. Merge via PR once CI is green.

## Gotchas

- **Windows git-read mangling.** Git-Bash on this machine mangles
  `git show <rev>:<path>` and `git cat-file -e <rev>:<path>` (silent empty output).
  Use `git ls-tree <rev> -- <path>` and `git cat-file -p <blob>` instead.
- **cd-guard.** Never lead a Bash command with `cd dir && ...`; see above.

## Status

The mechanical harness (hooks, tools, CI, tests, CREW) is in place, and the
operating foundation is written: `rule_operating` (how we work), `rule_dev_loop`
(how a change is built), and `rule_session_start` plus the checkpoint/resume
commands (session rhythm). Still to write as real friction earns them:
`rule_anti_slop` (and re-pointing the inert em-dash gate), `rule_code_review`,
`rule_release`, `rule_dependency_hygiene`, plus the agent set. See
`.claude/rules/README.md`.
