---
description: Build a website end-to-end from the reusable infrastructure: scaffold, decide fresh identity, compose, gate, review, ship.
---

# /comd_build-site

The runbook for a `website` build. Wraps the loop in
`docs/website-build-workflow.md` and `rule_website_build` into one walked path, so
every site clears the same quality floor while spending its identity fresh. The
shared parts (floor, tooling, token architecture) are never re-derived; only the
VALUES (palette, pairing, layout, signature, copy) are decided per build.

Usage: `/comd_build-site <name>` (a lowercase kebab-case slug), with a brief
(subject, audience, the page's one job, real content, deploy target). If the brief
is thin, infer and state the subject before designing.

## The walk

1. **Intake.** Fill the brief: subject, audience, the page's one job, the real
   content, constraints, deploy target. Confirm it or state the inference and
   proceed. This is the Understand + Specify of `rule_dev_loop`.

2. **Scaffold.** `uv run tools/scaffold.py website <name>` (or `/comd_new-product
   website <name>`). Stamps `templates/website` into `products/<name>`: the token
   contract, the primitives, the gate suite, the OG route, all wired. Then `npm
   --prefix products/<name> install`.

3. **Decide fresh identity** (the cheap place to get taste right). Run
   `skil_website-design`: the brainstorm -> critique-against-defaults loop produces
   a per-project direction plan (palette, display/body pairing, layout concept, the
   one signature element). Run the "would I produce this for any other brief?"
   critique against `docs/website-reference.md`. Then WRITE the result, replacing
   the EXAMPLE values:
   - the palette + dark set into `src/styles/tokens/brand.css`;
   - the pairing into `astro.config.mjs` `experimental.fonts` (keep the cssVariable
     role names);
   - swap the OG faces in `src/assets/og/` to match, if the pairing changed.
   Show the owner the direction plan before composing (the one taste checkpoint).

4. **Compose.** Build the pages from the primitives, themed only through roles.
   Write real copy (copy-as-design-material; no lorem, no fabricated claims). Spend
   boldness on the signature element; keep the rest quiet.

5. **Gate.** `npm --prefix products/<name> run verify` (static, must pass), then
   `npm --prefix products/<name> run verify:full` locally (axe + Lighthouse, where
   a browser exists). Green is the mechanical floor.

6. **Review.** Run `design-reviewer` on the running build (light/dark x
   mobile/desktop) and score `skil_website-quality`. Resolve every blocker/major or
   record a justification. This is the agent-judged half of the floor.

7. **Ship.** Branch -> PR -> CI green -> squash-merge (autonomous, `rule_operating`).
   Production deploy / tag is the floor and needs an explicit order.

8. **Anneal.** Any AI-tell that slipped becomes a row in `docs/website-reference.md`;
   any gate gap becomes a new check.

## Definition of done

The full DoD is in `docs/website-build-workflow.md`: gates green, tokens honest
(real values, no dead token), design distinct (not one of the three AI looks,
deliberate pairing, design-reviewer OK or findings resolved), responsive in light
and dark, real copy, optimized assets (a real 1200x630 OG), and the owner has seen
the light/dark x mobile/desktop screenshots for anything shipped or paid-for.
