# Checkpoint 2026-06-16: Cycle 7 spine (mechanical half)

Scope: harness | Band: autonomous (feature branch -> PR -> CI-green merge; floor
untouched). Built in an isolated `git worktree` to stay clear of two parallel
sessions sharing this checkout. Separate dated file on purpose: the canonical
`2026-06-16.md` was being written by a live parallel session.

## Done (merged green)

PR #23 (main `f2b317a`): the Cycle-7 scaffold spine.

- `templates/`: `_shared` overlay (README / ARCHITECTURE / PRODUCT-brief /
  .gitignore) + a real `game` archetype (Vite + TS canvas). `website` and `app`
  are stubs that name their fill source.
- `tools/scaffold.py`: overlays `_shared` then `<archetype>` into
  `products/<name>`, substitutes the product tokens, refuses an existing product
  / stub archetype / invalid slug / token-bearing title. INDEX row added.
- `tools/verify.py --list`: product discovery for CI (existing scopes and flags
  unchanged).
- `.github/workflows/ci.yml`: `products` job loops `verify.py` over discovered
  products (a new product joins CI with no yaml edit); `templates` job builds
  every ready template (rot guard); `hooks` job gained the ARCHITECTURE gate.
- `comd_new-product` command; `tools/tests/test_scaffold.py` (10 tests).

## Verified

- `verify.py harness` PASS 4/4 (ruff, INDEX, ARCHITECTURE, pytest).
- CI `products` + `templates` loops green locally and in CI; crew build 2/2.
- A scaffolded product passes strict `npm ci` (token-substituted lockfile) and
  the ARCHITECTURE gate.
- Independent adversarial review: no blockers/majors; 2 minors fixed (cd-guard
  -safe command wrapper, title token guard), 1 noted (vite dev-server advisory,
  deferred to `rule_dependency_hygiene`).

## Coherence with the parallel chats

- Three sessions shared ONE working tree and HEAD. The crew-verify commit landed
  on this branch when the shared HEAD moved mid-build; recovered via reflog +
  worktree isolation, no data loss, their checkout untouched. The category is
  already annealed (`gotcha_shared_worktree` + the #22 friction row); this session
  validated the worktree-per-session structural fix it prescribes.
- Touched none of the other chats' files: no `products/crew/`, no
  `.claude/skills/`, no `CURATION.md`; the CLAUDE.md edit is a 2-line pointer.

## Next steps (Cycle 7 tail -> Cycle 8)

1. WATCH the cross-PR seam: when the crew-verify PR merges, the product
   -discovering CI runs `verify.py crew` = crew's new `verify` script. If that
   drives headless Playwright, that PR must add a browser-install step to the CI
   `products` job (node + uv only today).
2. Fill the `website` template (Astro, from the Cycle-6 harvest) and the `app`
   template (CREW extraction, alongside `skil_crew-verify`). `scaffold.py` refuses
   each until it carries a `package.json`.
3. Wire the per-archetype verify profiles past the typecheck+build floor:
   Playwright smoke for app/game once the crew-verify pattern settles, Lighthouse
   + meta/OG for website.
4. `design-reviewer` agent + `rule_testing` (Cycle 8).

## Post-merge verification (after #25 Cycle 8 + crew-verify + #26 landed)

`main` `5e8ad11` is green. Next-step 1's seam resolved as designed: crew's
`verify` now ends in a Playwright round (`verify/round.py`), and the
product-discovering CI runs it via `verify.py crew` with no yaml edit (latest
main run: `product:crew npm run verify` PASS).

Open finding (the crew-verify owner's call, not changed here): crew's verify
passes in ~4.6s in CI, and the `products` job sets up node + uv but NOT Playwright
browser binaries (no `playwright install` in `ci.yml`, confirmed on `main`). A
real headless round needs chromium, so the browser assertions are not exercised
in CI; the green is build + typecheck, not the anonymity/measurement round. Fix
is one of: add `playwright install chromium` to the `products` job, or have
`round.py` fail loud (not skip) when no browser is present so the gap is visible.
Left untouched to avoid overriding a verify contract a parallel session owns; the
product-discovering CI is correct, the gap is in what crew's own script asserts
under CI.

Lesson worth carrying: a CI job can go green while a product's headline
behavioral check silently no-ops for want of a runtime dependency. Green at the
job level is necessary, not sufficient (`rule_dev_loop` non-negotiable 2); a
verify script that can skip its core assertion should fail loud instead.
