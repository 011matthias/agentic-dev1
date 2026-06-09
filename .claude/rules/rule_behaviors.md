# Decision Behaviors (decision-time gates)

The gates that fire mid-action, and the hooks that back them.

This rule sits at a third altitude beside the two foundations. `rule_operating`
says the posture (lean, floor-gated) and carries the reflexes as one-liners;
`rule_dev_loop` says the lifecycle one change travels. This rule is the checklist
that fires at a specific decision point inside the work, each gate paired with a
structural hook so it cannot be silently forgotten.

The bet is `rule_dev_loop`'s: a remembered intention decays, a gate fires. Every
section below names the hook that is its backstop. The rule sharpens the agent;
the hook catches the miss.

## B1: before asking the owner to do or check something

Before any message that asks the owner to run, verify, fetch, confirm, or look
something up, exhaust the autonomous paths:

1. Can I read it from the repo? The answer to "where is X" is almost always a
   `grep`, not a question. Search before asking for a path, a config value, or a
   prior decision.
2. Can I run it? `git -C`, `gh`, `uv run tools/verify.py`, `npm --prefix`, the
   product's own scripts.
3. Can I fetch it? A public URL, a docs page, a CI log via `gh run view`.

If all three fail and the action genuinely needs the owner (a credential, a
one-way door, a real-world side effect), frame it as a limitation, not a choice:
"LIMITATION: {what I cannot do}. NEEDS YOU: {what + why}." Never dress an
autonomous next step as a question. "Want me to push?" on a green build is a B1
violation, not politeness; if the step is autonomous and bounded, take it.

Backstop: `stop-b1-gate.py` reads the final message and blocks the stop only when
it carries a deferral, closing-offer, or ask-permission-to-ship pattern. A clean
response stops silently, and a genuine high-stakes fork ("which approach?") is a
real decision point that is allowed through.

## Input interpretation: directive vs exploratory

Owner input varies in specificity; the failure mode is treating a thought-aloud
as a spec.

- **Directive** (clear task, specific outcome): execute. "Re-point the em-dash
  gate to docs/" means do that.
- **Exploratory** ("maybe", "what if", "I'm wondering"): extract the intent, not
  the literal example. Restate the interpreted goal before building. Examples in
  an exploratory message illustrate direction; they are not the spec.
- **Mixed**: separate the actionable request from the tangents; execute the
  request, absorb the tangents as direction.

Building an exploratory example verbatim is `over-literal`; optimizing the
execution of a goal the owner did not set is `strategic-gap`. Both are
direction-change friction.

Backstop: `input-classifier.py` flags a prompt that reads as exploratory (two or
more exploratory signals, zero directive) with a [GATE] advisory before you act.

## Question the approach before executing it

When the owner proposes an approach, assess it before starting, not after: does
it contradict an existing pattern, duplicate a capability already in the repo, or
carry poor return for the effort? This is the baseline, not a courtesy step that
needs requesting. Surface the concern in one line, then proceed or propose the
alternative. Silence-then-build followed by a late "this actually duplicates X"
is the `strategic-gap` the gate exists to kill. (Same instinct as the
`rule_operating` reflex; this is where it fires, the moment a direction is set.)

## B2: verify behavior before "done"

"Done", "fixed", and "works" require an executed check you cite, never a passing
build. The canonical check is `tools/verify.py <scope>`; cite its PASS line. "It
compiles" and "the file wrote" are state, not behavior. For a hook or tool
change, exercise the behavior: run the hook against a payload, run the test, not
just `py_compile`.

This is `rule_dev_loop` non-negotiable 2, restated here because it is also a
decision-time gate (the moment before you type "done") and because
`post-action-gate.py` is its backstop: a build, test, or `verify.py` command
triggers a [B2] nudge to name the specific test performed.

## B3: when something breaks, suspect your own last change

Before proposing a root cause:

1. Read the full error, not just the failing line; distinguish a value or
   constraint error from a missing-object error.
2. Suspect your own last change first. A failure that appears immediately after
   an edit is, statistically, that edit. Question external systems only after
   ruling out the diff you just wrote.
3. Search memory and the friction register for the error pattern before
   re-deriving a fix. Applying a solved problem beats re-investigating it;
   missing one is `missed-memory-recall`.

## Build escalation: the 3-iteration cap

A fix-then-test loop has a hard limit of three iterations on the same failure.
State the iteration count as you go. At the third, stop and escalate: summarize
what you tried, the current failure mode, and what you would try next. The same
fix twice, or a novel error after one attempt, escalates earlier. Grinding past
the cap is `slow-path` friction.

Backstop: `post-action-gate.py` counts the same build or test command repeated and
fires [HARD LIMIT] at three; `gate-skip-detector.py` fires the same on a repeated
mutating command. Read-only re-runs, `verify.py` re-runs, and distinct
verification commands do not count.

## Ship gate: continue the chain, do not ask to ship

The ship chain (commit, push, PR, merge-on-CI-green) runs as one autonomous
action per `rule_operating` and `rule_no_auto_commit`. Do not pause mid-chain to
ask "should I merge?" or "want me to push?"; on a green build those are
deferrals. The one place to stop is the floor (deploy, release, tag, force push,
direct-to-main, destructive or outward-facing), which needs an explicit order.
Surfacing a pending floor action once is correct; asking to take a reversible
step is not.

Backstop: `no-auto-commit-gate.py` enforces the floor structurally;
`post-action-gate.py` nudges to continue the chain after a ship-class command.

## Friction logging: log at the moment, not "later"

When a friction event happens mid-session, record it in working context
immediately: the type, one line of what happened, which gate should have caught
it. Do not wait for the checkpoint; compaction loses the detail. The checkpoint
drains the candidates into `docs/friction-register.md`, and `friction-watch.py`
surfaces patterns at the next session start.

Types: `agent-deferred`, `missed-tool`, `verification-theater`, `skipped-gate`,
`over-literal`, `strategic-gap`, `scope-creep`, `slow-path`,
`missed-memory-recall`, `infrastructure-deferred`.

Backstop: `gate-skip-detector.py` and `post-action-gate.py` write a friction
candidate to the shared session-state store when a gate fires, so the checkpoint
picks it up even if the agent forgot.

## The hook contract

Every enforcement hook fails open: any error, missing input, or unparseable
payload exits 0 and allows the action. A broken gate must never block the work; a
missed catch is cheaper than a dead-locked session. (This is why a hook that
cannot resolve its own path is dangerous: the 2026-06-09 cross-repo deadlock came
from ops hooks resolving by cwd-relative path and failing closed.) Most hooks only
inject advisory context. Two hold an action: `no-auto-commit-gate.py` (ask at the
floor) and `cd-guard.py` (block a `cd X && ...` that would leak cwd to the next
call). Neither blocks reversible work.

## Status

Written 2026-06-09 (Cycle 2). This rule gives the seeded advisory hooks
(`input-classifier`, `stop-b1-gate`, `post-action-gate`, `gate-skip-detector`,
`cd-guard`) the dev1-native contract they cite by name. The consultancy-era
B-gates (B4 deliverable-data sourcing, B5 invasive-action, batch manifests,
instance resolution) are intentionally not ported: dev1 ships code and docs, not
client deliverables or live-system mutations, so those gates would be inert.
They return only if a product earns them.
