# Dev Loop (foundational rule)

The one path every unit of work travels, and the three properties that are
never optional. This is the spine of agentic-dev1; specific gates, agents, and
per-product rules attach to it.

## The bet

Remembered intentions decay; structural gates fire. Express every quality
property you care about as something that runs at decision time: a hook, a CI
check, `tools/verify.py`. Rules and memory are the fallback, used only when a
property genuinely cannot be mechanized. agentic-ops proved the inverse the
expensive way: the same failures recurred for weeks through memory and stopped
only once they became hooks. Start from that lesson; do not re-pay for it.

## The spine

Understand -> Specify -> Plan -> Implement -> Verify -> Review -> Integrate -> Learn

| Phase | You produce | Exit gate (checkable) |
|-------|-------------|------------------------|
| Understand | a read of the affected subsystem; update its notes / ARCHITECTURE | you can name what you will touch and what could break |
| Specify | the change in a paragraph: behavior + acceptance criteria | the acceptance criteria are testable |
| Plan | the steps, each with how it will be proven | no step lacks a verification |
| Implement | the code | it builds locally |
| Verify | executed proof | `tools/verify.py <scope>` passes; behavior exercised, not just the build |
| Review | an adversarial read (self, then a reviewer agent for stakes) | no unanswered correctness or regression finding |
| Integrate | feature branch -> PR -> CI -> merge | CI is green (the objective merge signal) |
| Learn | friction logged; the escaped failure turned into a guard | the same failure cannot recur silently |

Naming the spine is diagnostic: when something breaks, you can say which phase
let it through, and put the new guard there.

## Three non-negotiables

These hold on every change, trivial or large. Calibration below says which
phases a small change may compress; none of these three may be skipped.

### 1. Understand before you change

Before editing code you did not just write, read the subsystem you are about to
touch and name its blast radius. Use serena for symbol-level navigation
(definitions, references, call sites) and the product's ARCHITECTURE notes when
present. Most regressions are edits to code the agent never modeled. A one-file,
localized change reads just that file; anything crossing a shared module, shared
state, or more than one file reads the graph first.

### 2. Verify behavior, not state

"Done", "fixed", and "works" require an executed check you can cite, never a
passing build. Run `tools/verify.py <scope>` and cite its result. "It compiles"
and "the file wrote" are state, not behavior. For high-stakes work (a shared
module, persisted data, anything a user pays for), the check is run by an
independent pass that reproduces the behavior, not by reading the author's own
summary. The build being green is necessary, not sufficient.

### 3. Anneal every failure

After any fix that took more than two iterations, or where the owner had to step
in to unblock: ask "how do I stop this whole class, not this instance?" Then
operationalize at the highest level that fits:

- an escaped bug becomes a regression test that would have caught it;
- a recurrent class becomes a structural guard (a hook, a validator, a new
  `verify.py` step);
- a one-off that cannot be mechanized becomes a friction-register row, plus a
  memory when it is preference or taste.

Log the friction at the close of the work, not "later"; context compaction loses
the detail.

## Calibration

- **Trivial** (a typo, copy, a one-line change in a single file): a light
  Understand and a real Verify; Specify, Plan, and Review may be folded in.
- **Standard** (a feature, a multi-file change): the full spine.
- **High-stakes** (shared modules, data migrations, anything paid-for): the full
  spine plus an independent verification pass and an adversarial review.

Nothing in any tier skips Verify.

## Status

This is the first foundational rule, written to be exercised and refined, not
frozen. The companion gates named in `.claude/rules/README.md` (code review,
release, dependency hygiene) attach to the Review, Integrate, and Implement
phases as real friction earns them. Non-negotiable 2 has its executable form
already: `tools/verify.py`.
