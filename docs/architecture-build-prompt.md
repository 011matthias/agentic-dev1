# Build prompt: the best-possible game/app-dev architecture for agentic-dev1

Paste this into a fresh agentic-dev1 session. The goal: make this hub as good as
it can be at building and shipping games and apps. Treat it as several dev-loop
cycles, not one shot.

---

You are in agentic-dev1, a single-owner software-products hub
(`~/Repo/agentic-dev1`, public `github.com/011matthias/agentic-dev1`). Build out
the architecture (rules, commands, agents, and especially skills sourced from
GitHub) so this hub is excellent at game and app development.

## Read first
- `CLAUDE.md`, and `.claude/rules/rule_dev_loop.md`, `rule_operating.md`,
  `rule_session_start.md`.
- All of `memory/` + `MEMORY.md`; the latest `docs/sessions/` checkpoint;
  `docs/friction-register.md`.
- The current `.claude/hooks/`, `tools/`, and `products/crew/`.

## Constraints already set (do not relitigate)
- **Lean autonomous, floor-gated** (`rule_operating`): act on and land reversible
  work, including drafting and merging rules / docs / agents / skills. Stop only at
  the floor (deploy, release, force push, direct-to-main, destructive or
  outward-facing actions).
- **Dev-loop per change** (`rule_dev_loop`): Understand -> Specify -> Plan ->
  Implement -> Verify (`tools/verify.py`) -> Review -> Integrate (branch -> PR ->
  CI-green -> auto-merge) -> Learn. Nothing is "done" without `verify.py` passing.
- **Dev1-native, separate from agentic-ops.** When you touch a seeded hook,
  re-point its advisories to dev1 rules and strip the inert ops domain patterns
  (Make/n8n MCP `scenarios_update`/`n8n_update_full_workflow`, `vercel`/`railway`,
  the `local-web` carve-out, the client-deliverable em-dash scope).
- **Curate, do not hoard.** Every rule, command, agent, and skill must earn its
  place. A skill you will not use is slop. Reject the generic and the duplicative.
- **One PR per piece.** Let CI gate; the merge auto-fires on green.

## Target products the architecture must serve
- **CREW** (`products/crew/`): single-device pass-and-play party game, Vite +
  React + TS PWA, migrating to native iOS once the core bet is verified. Game
  feel / juice is load-bearing.
- **Future**: more web and mobile games and apps. Assume React / TS / Vite / PWA
  and Expo / React Native, with a path to native Swift / SwiftUI.

## Workstreams

### 1. Rules (dev1-native governance)
Write each as a real rule with an executable gate where possible, paired with
re-pointing the matching seeded hook in the same change:
- `rule_behaviors`: decision discipline beyond `rule_operating` (search before you
  ask; question the approach first; suspect your own last change; log friction).
- `rule_anti_slop`: voice + code-comment discipline; in the same change re-point
  `em-dash-strip-gate` scope from client paths to dev1 docs / READMEs.
- `rule_code_review`: review-before-merge; pairs with the code-reviewer agent.
- `rule_testing`: test discipline by product type (unit + integration + e2e /
  playtest for games; component + e2e for apps).
- `rule_product_structure`: the per-product layout standard (src, tests, README,
  ARCHITECTURE.md, a `build`/`verify` npm script so `verify.py` discovers it).
- `rule_release`: semver + CHANGELOG; release stays on the floor.
- `rule_dependency_hygiene`: pinned lockfiles, audit, no secret-bearing deps.
Decide hook-vs-rule per item. Write, exercise on CREW, land, next; do not batch.

### 2. Commands (entry points)
- `comd_new-product`: scaffold `products/{name}/` with a chosen stack + a verify
  recipe + CI wiring.
- `comd_build`: run the dev-loop on a feature.
- `comd_review`: invoke the code-reviewer agent on the diff.
- `comd_ship` / `comd_release`: the integrate / release flow.
- `comd_playtest`: capture playtest signal for a game (CREW's localStorage
  measurement model is the reference).
- `comd_status`: hub overview (products, open PRs, CI, friction).

### 3. Agents (specialists)
- `code-reviewer`: adversarial diff review (correctness, regressions,
  simplification, security).
- `verifier`: independent behavior verification (reproduce, do not trust the
  author's summary).
- `architect` / planner: decompose and plan a feature.
- `debugger`: systematic debugging (hypothesis -> minimal repro -> fix -> verify).
- `game-feel`: review a game's juice (timing, easing, audio, haptics).
- `ui-ux` + accessibility: for apps.
Use parallel review + verify fan-out (the Workflow tool) where it earns its cost.

### 4. Skills: the emphasis. Source the best from GitHub.
This is the highest-leverage workstream. Research, evaluate, and curate the best
open-source Claude Code skills / Agent Skills into `.claude/skills/`, tuned for
game and app dev. Method:
- Use WebSearch + WebFetch (and a skill/agent installer if one is available) to
  find the current best-in-class collections. Starting points to FIND the current
  best (verify each exists and is maintained; do not trust these names blindly):
  - Official: `anthropics/skills` (Agent Skills) and the Claude Code docs.
  - Curated indexes: `hesreallyhim/awesome-claude-code`,
    `VoltAgent/awesome-claude-code-subagents`, `wshobson/agents`,
    `davila7/claude-code-templates`.
- Slots to fill (best skill per slot, adapted to dev1's stack):
  - Web / app: React + Next.js best practices, Tailwind / shadcn UI,
    frontend-design, component composition, web-interface-guidelines,
    accessibility, Playwright web testing, Vite / PWA.
  - Mobile / native: Expo / React Native, and a Swift / SwiftUI path for CREW's
    iOS migration.
  - Games: game design, game feel / juice, Phaser / web-game patterns, Web Audio,
    sprite / asset pipelines, Godot or Unity if a product needs them.
  - Cross-cutting SWE: systematic debugging, verification-before-completion,
    security (OWASP), performance, API-client generation, MCP building.
- For each candidate: read it, judge quality + fit + license, then vendor it into
  `.claude/skills/` with attribution, or adapt it. Reject the generic, the
  unmaintained, and anything that duplicates an existing capability. Keep the
  curation auditable: log what you evaluated, kept, rejected, and why (a
  `.claude/skills/CURATION.md`).
- Where no good skill exists, write one (skill-creator / meta-builder pattern),
  e.g. a CREW-grounded "game-feel review" skill built from its juice work.

## Sequencing (apply the dev-loop; no big-bang)
1. **Comprehension first**: `products/crew/ARCHITECTURE.md` + an
   understand-before-change gate. Highest-leverage missing piece.
2. `rule_behaviors` + `rule_anti_slop` (and the paired hook re-points). Finishes
   the ops-decouple.
3. The `code-reviewer` agent + `rule_code_review` (the Review phase).
4. The skills research + curation pass (the big leverage). A Workflow fan-out over
   the domains above fits well here.
5. Commands + remaining rules as they earn their place.
Exercise each on CREW's next real slice. One PR per piece. Checkpoint at breaks.

## Definition of done
- A dev1 session can take "build feature X in CREW" or "scaffold app Y" and run it
  end to end with strong rules, a real review + verify pass, and the right domain
  skills auto-loading by context.
- The behavioral structure is fully dev1-native: no ops rule-name citations, no
  inert ops domain patterns.
- Every added primitive earns its place; the skills curation is auditable.
- `verify.py all` green, CI green, on main.

Start by reading the files above, then state your plan and the first dev-loop you
will run.
