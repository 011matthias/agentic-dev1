# app template (stub)

Not yet buildable. This archetype is the CREW stack generalized (Vite + React +
TS PWA, per `docs/blueprint.md`), extracted from `products/crew/` into a clean
skeleton, then wired with the app verify profile (Playwright smoke + valid PWA
manifest).

Deferred deliberately: the CREW extraction and the Playwright-smoke verify
pattern are being defined alongside `skil_crew-verify`. Building the app template
here in parallel would fork that pattern. It lands once that work settles.

`scaffold.py app <name>` refuses until this dir carries a `package.json`.

Stack (pre-decided, `docs/blueprint.md`): Vite + React + TS PWA, Cloudflare Pages.
DOM games use this template; canvas games use `templates/game`.
