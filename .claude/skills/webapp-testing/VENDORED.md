# Vendored: webapp-testing

Third-party skill vendored verbatim from the Anthropic skills collection. Not
authored here; do not edit the vendored files (see "Updating" below).

- Source: https://github.com/anthropics/skills
- Upstream path: `skills/webapp-testing`
- Pinned commit: `57546260929473d4e0d1c1bb75297be2fdfa1949`
- Vendored: 2026-06-16
- License: Apache-2.0 (see `LICENSE.txt`)

## What it is

A Playwright toolkit for driving and testing a local web app: it boots the dev
server (`scripts/with_server.py`) and then runs scripted Playwright (screenshots,
console and network capture, `networkidle` waits). This closes the Verify-phase
gap `tools/verify.py` leaves open: verify.py is build-only per product, so it
proves a product compiles, not that it behaves.

## How to use it

Black-box. Invoke the scripts with `--help` first; do not read the source unless a
customized solution is genuinely required (that is the point of vendoring a tool
rather than reimplementing it, and the scripts are large enough to pollute
context):

    python .claude/skills/webapp-testing/scripts/with_server.py --help

`skil_game-feel-review` and the planned `skil_crew-verify` compose on top of this.

## Updating

Do not edit the vendored files; editing diverges from upstream and breaks the
Apache-2.0 retention hygiene. To update, re-vendor from a newer upstream commit
and bump the pinned SHA above. The em-dash strip gate skips any skill directory
that ships a `LICENSE.txt`, so these files stay byte-faithful.
