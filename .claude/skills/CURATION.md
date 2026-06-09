# Skills Curation Log (agentic-dev1)

**Curation bar.** Every skill earns its place. A skill we will not use this quarter is slop: it dilutes search, slows context load, and hides which capabilities are load-bearing. Reject the generic (advice the base model already applies) and the duplicative (covered by an existing harness primitive: rule_dev_loop, rule_operating, rule_behaviors, rule_anti_slop, rule_code_review + the code-reviewer agent, tools/verify.py). Prefer fewer high-fit skills over many. When the genuine gap is CREW-specific and no external skill covers it, write our own rather than vendor a near-miss.

First product is CREW: a Vite 6 + React 18 + TypeScript, fully client-side pass-and-play party game (PWA now, native iOS intended later) with first-class localStorage measurement. Verified harness state at curation time: `.claude/skills/` was empty; `products/crew/package.json` declares only `dev`/`build`/`typecheck` (no `verify` script, no `vite-plugin-pwa`), so `tools/verify.py` falls back to `npm run build` for the product, build-only, not behavioral.

Sourced 2026-06-09 by a Workflow fan-out (5 source-verify agents, 4 per-slot evaluators, 1 synthesis) over five named GitHub repos, all confirmed to exist. See `docs/sessions/2026-06-09.md`.

---

## Slot: web/app (CREW UI + verification)

| Skill | Source | License | Verdict | Why |
|---|---|---|---|---|
| frontend-design | anthropics/skills (document-skills plugin) | Apache-2.0 (LICENSE.txt verified) | kept (vendor) | Art-direction / anti-slop enforcement surface for CREW UI; framework-agnostic, covers React; aligns with rule_anti_slop. Stops at static UI aesthetics (no game-feel), gap routed to write-our-own. |
| webapp-testing | anthropics/skills (document-skills plugin) | Apache-2.0 (LICENSE.txt verified) | kept (vendor) | Closes the real Verify-phase gap: with_server.py boots `vite` (port 5173) + scripted Playwright (screenshots, console, networkidle). verify.py is build-only per product. Black-box scripts, near-zero context cost. |
| react-state-management | wshobson/agents | MIT | rejected | Generic React-state advice the base model already applies, bundled with out-of-scope React Query server-state. CREW's real state concern (localStorage schema/migration/measurement) is uncovered here. |
| persona agents: frontend-developer, react-specialist, typescript-pro | wshobson/agents, VoltAgent | MIT | rejected | Duplicate base-model + harness capability; persona agents add no signal a single-owner harness lacks. |
| web-artifacts-builder | document-skills plugin | Apache-2.0 | rejected | Targets single-file Claude artifacts, not a multi-file Vite app. Wrong shape. |

## Slot: mobile/native

| Skill | Source | License | Verdict | Why |
|---|---|---|---|---|
| progressive-web-app | davila7/claude-code-templates | MIT (repo SPDX verified) | rejected (folded into write-our-own) | Only candidate touching the current PWA phase; its durable value (iOS-Safari standalone meta tags, manifest/maskable icons, no-beforeinstallprompt) is narrow. Vanilla-JS, says nothing about Vite/vite-plugin-pwa or React 18, omits localStorage measurement. The adapted slice is so thin it is better authored fresh on CREW's stack; folded into skil_pwa-install-and-measure rather than vendored. |
| vabole/apple-skills | vabole/apple-skills | MIT | rejected (bookmark) | Strong, fresh native-iOS suite (iOS 26+, SwiftUI/HIG/Liquid Glass, 20+ skills) but native iOS is "intended later", not scheduled; zero Swift in the codebase, runtime (SwiftUI vs RN/Expo) undecided. Vendoring a Swift suite into a React harness today is hoarding. Bookmark; re-evaluate the HIG + iOS-dev-coordinator subset when a native target is committed. |
| mobile-ios-design | wshobson/agents | MIT | rejected | Phase-premature AND dominated: for the eventual native phase vabole/apple-skills is fresher and broader. |

## Slot: games (game-feel / juice)

| Skill | Source | License | Verdict | Why |
|---|---|---|---|---|
| gstack-game feel-pass + build-playability-review | fagemx/gstack-game | MIT (GitHub API SPDX verified) | adapted (reference only) | Best game-feel substance found anywhere: 7-dimension feel rubric + loop-closure check, engine-agnostic, anti-AI vocabulary aligned with rule_anti_slop. But entangled with gstack machinery (~/.gstack telemetry, bin scripts, a 27-skill workflow router, AskUserQuestion gating) that conflicts with rule_operating's lean autonomous posture; rubric is calibrated for action/economy/retention games, not local pass-and-play. Mine the rubric + loop-closure check as scaffold (MIT permits with attribution); do NOT vendor the plumbing. |
| Claude-Code-Game-Studios | Donchitos | MIT | rejected | Wrong engine (Godot/Unity/Unreal, no web/DOM) and wrong shape (49-agent studio hierarchy) for a lean single-owner React harness. |
| claude-code-game-development | HermeticOrmus | MIT | rejected | Low traction, generic game-dev framing, nothing CREW-specific. |
| animate-skill | delphi-ai/animate-skill | NONE (no LICENSE, SPDX null) | rejected | Two strikes: no license (not vendorable) and it is web-motion, not game-feel (would duplicate the web/app slot). Also stale. |

## Slot: cross-cutting SWE

| Skill | Source | License | Verdict | Why |
|---|---|---|---|---|
| webapp-testing | anthropics/skills | Apache-2.0 (LICENSE.txt verified) | kept (vendor) | Same pickup as web/app slot; one copy serves both. Closes the executed-behavior gap rule_dev_loop's Verify phase requires but verify.py (build-only per product) does not provide. |
| javascript-testing-patterns | wshobson/agents | MIT | rejected | Well-written but mostly generic/backend JS (supertest, DI); the CREW-relevant Vitest + Testing-Library slice is small and greenfield-trivial to author against CREW's actual game model. |
| debugging-strategies | wshobson/agents | MIT | rejected | Direct duplicate of the systematic-debugging skill + rule_dev_loop's anneal step. |
| code-review-excellence + *-reviewer agents | wshobson/agents, VoltAgent | MIT | rejected | Direct duplicate of rule_code_review + the code-reviewer agent, which already enumerate CREW invariants (Confessions anonymity, no StrictMode, pure-CSS press-squash, measurement schema, localStorage keys/snapshot v). |

---

## Authored (write-our-own), genuine gaps no external skill covers

| Skill | Slot | Why external coverage fails |
|---|---|---|
| skil_game-feel-review | games | No surveyed source codifies game-feel review for a web/DOM pass-and-play party game; the only substance (gstack feel-pass) is mis-calibrated for action/economy games and ships ecosystem plumbing that fights rule_operating. Authored CREW-grounded, mining gstack's rubric (MIT-attributed). |
| skil_crew-verify | cross-cutting SWE | webapp-testing supplies HOW to drive a Vite app headless; it knows nothing of CREW's invariants. This recipe drives a full pass-and-play round, then asserts the invariants named in rule_code_review (Confessions anonymity, no StrictMode, pure-CSS press-squash, measurement schema, localStorage keys + snapshot v). Registers as products/crew's npm `verify` script so verify.py picks it up with no central-list edit. |
| skil_pwa-install-and-measure | mobile/native | Every external source omits both halves of CREW's current-phase need: installable-PWA packaging on Vite + vite-plugin-pwa + React 18, AND the first-class localStorage measurement layer (versioned schema, migration, QuotaExceeded handling). Absorbs the only durable slice of davila7's progressive-web-app. |

---

## Action status (updated as actioned)

Ordered by leverage. The synthesis named vendoring `webapp-testing` the single highest-leverage action: it closes the one verified gap (products/crew has no npm `verify` script, so verify.py is build-only) and one copy serves both the web/app and cross-cutting slots.

| # | Action | Skill | Status |
|---|---|---|---|
| 1 | write | skil_game-feel-review | DONE (this cycle; CREW-grounded, gstack rubric attributed) |
| 2 | vendor | webapp-testing (Apache-2.0) | PENDING, highest leverage; copy into `.claude/skills/webapp-testing/` with the Apache NOTICE; black-box (invoke via `--help`, do not ingest). Keystone for skil_game-feel-review + skil_crew-verify. |
| 3 | vendor | frontend-design (Apache-2.0) | PENDING; copy into `.claude/skills/frontend-design/` with attribution. |
| 4 | write | skil_crew-verify | PENDING; pairs with Cycle 6 `rule_testing`. Drives a real round via webapp-testing, asserts the rule_code_review invariants, registers as products/crew npm `verify`. Closes the Cycle-4 anneal (Confessions anonymity has no test). |
| 5 | write | skil_pwa-install-and-measure | DEFERRED; lower priority, build when the install/measurement work is scheduled. |

Native-iOS skills (vabole/apple-skills, wshobson mobile-ios-design) are bookmarked, not rejected on merit; re-evaluate when a native target is committed.
