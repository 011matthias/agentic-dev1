---
name: feedback-found-capabilities-archetype-level
description: Owner wants reusable capabilities founded at the archetype level, not coupled to the current product.
metadata:
  type: feedback
---

When building a capability the harness should own (a quality bar, a verify
profile, a skill), found it at the **archetype** level so it serves any product
of that shape, not bound to whichever product is in flight. The owner gave this
on the website builder: "make it more generally founded, don't specify the
website-building skill on the ongoing CREW project."

**Why:** product-bound capabilities do not generalize; the catalyzer's whole
premise (`docs/blueprint.md`) is pre-deciding the reusable layer once. A skill
keyed to one product is a near-miss for the second product.

**How to apply:** mirror the existing split. Archetype-level skills are general
and product-agnostic (`skil_game-feel-review` for any web/DOM game,
`skil_website-quality` for any website); the product-bound shape
(`skil_crew-verify`, wired into one product's `verify`) is reserved for what is
genuinely specific to that product. Default new skills to the general shape;
reach for the bound shape only when the knowledge cannot exist without the
product. See [[project_crew_game]].
