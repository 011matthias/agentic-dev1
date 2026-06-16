# templates/ (the catalyzer spine)

The pre-decided starting points a new product is stamped from. `tools/scaffold.py`
overlays two layers into `products/<name>`:

```
_shared/     archetype-agnostic skeletons, overlaid first
<archetype>/ the stack (package.json, configs, src, lockfile), overlaid second
```

The archetype layer wins on a path collision, so `_shared` sets the common
skeleton (README, ARCHITECTURE, PRODUCT brief, .gitignore) and the archetype
overrides only what differs. Adding the tenth product costs the same as the
second: no central list, CI discovers products by globbing `products/*/package.json`.

## Archetypes

| Archetype | Stack | State |
|-----------|-------|-------|
| `game` | Vite + TS canvas, no framework | ready |
| `app` | Vite + React + TS PWA (also DOM games) | stub; CREW extraction, lands with skil_crew-verify |
| `website` | Astro + Tailwind | stub; filled from the Cycle-6 harvest |

A template is "ready" when it carries a `package.json`. `scaffold.py` refuses a
stub archetype rather than stamp a half-built product. The CI `templates` job
builds every ready template, so a scaffolded product cannot inherit a broken one.

## Substitution tokens

`scaffold.py` replaces these across stamped text files:

| Token | Becomes |
|-------|---------|
| `{{PRODUCT_NAME}}` | the slug (kebab-case dir + npm name) |
| `{{PRODUCT_TITLE}}` | a human title (`--title`, else derived from the slug) |
| `{{ARCHETYPE}}` | website \| app \| game |
| `dev1-template-<archetype>` | the slug (the package.json/lockfile name placeholder) |

The package name uses a valid-npm-name placeholder (`dev1-template-<archetype>`)
rather than `{{...}}` so the template installs in place for the CI build check;
`scaffold.py` rewrites it to the slug in both `package.json` and the lockfile.

## The dev1 manifest block

Each ready template's `package.json` carries a `"dev1"` block that CI and the
ship tooling read instead of a central registry:

```json
"dev1": {
  "archetype": "game",
  "deploy": "cloudflare-pages",
  "status": "scaffolded"
}
```

- `archetype`: which verify profile and quality bar apply.
- `deploy`: the ship target (`comd_ship`, Cycle 9).
- `status`: `scaffolded` -> `building` -> `shipped`, set by hand for now.

## Adding an archetype

Drop a `templates/<archetype>/` with a `package.json` whose `verify` script is
the archetype's quality floor (at least `tsc --noEmit && vite build`), register
the name in `scaffold.py`'s `ARCHETYPES`, and add a row above. The `templates`
CI job builds it automatically once it has a `package.json`.
