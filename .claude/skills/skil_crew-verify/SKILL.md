---
name: skil_crew-verify
description: Drive a real headless CREW pass-and-play round and assert the rule_code_review invariants against the running build (Confessions anonymity, no measurement double-fire, event schema, localStorage keys + snapshot v). Wired as products/crew's npm verify, so tools/verify.py runs it. Use before declaring a CREW change correct, after touching measurement / Confessions / main.tsx / the kernel, or to verify behavior rather than just that it compiled. Pairs with skil_game-feel-review (the feel side) and rule_code_review (the human review side); this is the executable behavioral side.
---

# CREW behavioral verification (skil_crew-verify)

`tools/verify.py crew` is build-only until a product ships an npm `verify`
script. A green `tsc --noEmit && vite build` proves the code compiles and bundles;
it proves nothing about what the running game actually logs. This recipe is the
behavioral half: it drives a real pass-and-play round headless and asserts the
invariants `rule_code_review` names for CREW from what the build did, not from
reading the source.

It is the executable form of the Cycle-4 anneal: "Confessions anonymity has no
test." Now it does.

The executable is `products/crew/verify/round.py` (the product owns its own test;
this skill is the recipe that explains what it proves and when to reach for it).

## What it asserts (each invariant maps to rule_code_review)

| Invariant (rule_code_review lens) | How it is proven | Tier |
|---|---|---|
| **Confessions anonymity** (lens 4): only the aggregate `yesCount`/`N` is logged, never the per-player yes/no vector | Drive a round; read `crew_logs_v1`; assert no event carries a boolean array and every `reveal` key is in the aggregate allow-set | runtime |
| **No measurement double-fire** (lens 1/3): each standard event fires once per its moment | Assert exact event counts for a 2-round game (`session_start`x1, `round_start`x2, `reveal`x2, `next_round`x1, `banger`x1, `session_end`x1) | runtime |
| **Measurement schema** (lens 4): every event carries `{t, rel, type, mode, ...}` | Assert the shape of every logged event; `next_round` carries a numeric `timeToNextRoundMs` | runtime |
| **No StrictMode** (gotcha): `main.tsx` never renders it | Source tripwire on the JSX element (not the bare word the comment uses) | static |
| **Press-squash stays pure CSS** (invariant): `:active` + a scale, strippable-by-React class avoided | Source tripwire: `styles.css` carries the `:active` scale press-squash | static |
| **localStorage keys + snapshot v** (blast radius): the three versioned keys and the Impostor snapshot `v` | Source tripwire on `crew_roster_v1` / `crew_logs_v1` / `crew_game_v1` / `v: 1`; runtime re-checks the keys after the round | static + runtime |
| **Event vocabulary** (blast radius): a rename breaks aggregation silently | Source tripwire that every standard event name is still emitted | static |

## Two tiers, on purpose

- **static** source tripwires run with no browser. They catch the cheap, common
  regressions (a renamed key, a re-enabled StrictMode) everywhere and always.
- **runtime** drives a real headless Confessions round with Playwright and asserts
  the anonymity / double-fire / schema invariants a passing build cannot. It needs
  chromium. If chromium or playwright is absent the runtime tier SKIPs loudly and
  the static tier still gates, so `tools/verify.py` stays runnable on a machine
  without a browser provisioned. The SKIP is never silent: a real round failure
  after a successful browser launch is a FAIL, not a skip.

Confessions is the driven mode because it is the anonymity-bearing one and the
anneal target. The StrictMode gotcha is caught statically rather than at runtime
because Confessions emits its measurement in event handlers, not effects, so a
re-enabled StrictMode would not double its events; the static tripwire is the
correct guard for that gotcha. (Validated by mutation test: enabling StrictMode
trips the static tier while the Confessions round still passes.)

## How to run it

```
# The wired path: build + the round, picked up with no central-list edit.
uv run tools/verify.py crew

# From the product, the same npm script verify.py calls:
cd products/crew && npm run verify

# The round alone (skips the build), e.g. to iterate on the assertions:
uv run --no-project --with playwright python products/crew/verify/round.py
```

First run on a fresh machine needs the browser once:
`uv run --no-project --with playwright playwright install chromium`. Without it the
runtime tier SKIPs and tells you that command.

## Approach and attribution

The runtime tier uses the `webapp-testing` approach (headless chromium driving the
real DOM, reconnaissance-then-action on discovered selectors). It launches its own
vite dev server inline rather than through that skill's `with_server.py` CLI, so
the npm `verify` one-liner needs no nested-quote shell handling on Windows and the
product carries no dependency on the skill tree's layout. It drives the **dev**
server, not preview, because StrictMode's double-invoke is a dev-only behavior, so
dev is the correct environment to prove measurement does not double-fire.

## Extending it

A new mode that emits the standard events is covered by the schema and double-fire
assertions as soon as the round drives it. To add a mode-specific invariant (an
Impostor `caught`-only catchRate, a Crowned vote tally), add an assertion to
`check_logs` and, if it needs the mode played, a small driver alongside
`drive_confessions_round`. Keep the anonymity allow-set tight: a new reveal key is
a deliberate decision, and the test should make you justify it.
