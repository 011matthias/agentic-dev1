---
name: skil_website-quality
description: The quality bar for a high-quality website of any kind (discoverability/SEO, social + structured metadata, programmatic accessibility, Core Web Vitals / performance, and content that does not read as AI-generic). Use when building or reviewing any `website`-archetype product, before declaring a site done or shipping it. Defines the mechanical gate the website verify profile enforces (Lighthouse perf >= 90 / a11y >= 95, link check, meta/OG presence) and scores the agent-judged web-quality dimensions a number cannot. Product-agnostic, founded at the archetype level; pairs with design-reviewer + frontend-design (the visual half) and rule_testing (the Verify phase). This is the web-platform-quality half.
---

# Website quality (the web-platform bar, any website product)

What makes a site high-quality splits in two. One half is visual: does it look
distinctive, does the type carry personality, does it avoid the AI-default looks.
That half is `frontend-design`'s rubric, judged by the `design-reviewer` agent.
This skill is the other half: the web-platform properties a site is good or bad at
regardless of how it looks; can it be found, does it share correctly, can everyone
use it, is it fast, does the copy say something true. A site can be beautiful and
still score zero here (no title, no alt text, a 4s LCP), and that site is not
high-quality.

Founded general. This is the website twin of `skil_game-feel-review`: it is keyed
to the `website` archetype, not to any one product. It lives at the harness layer
and applies to every `products/<name>` whose archetype is `website`, exactly as
the game-feel skill applies to every web/DOM game. It is deliberately NOT the
`skil_crew-verify` shape (a recipe wired into one product's `verify`); the bar
below is the same bar for the first website and the tenth.

## How to run it

Web quality is read off the running build and its served HTML, never inferred from
the framework. Order of preference:

1. **Drive the build** (`webapp-testing` is vendored). Boot the site, then:
   - run Lighthouse (or read the four category scores) for the performance and
     accessibility budgets and the Core Web Vitals;
   - read the served `<head>` of each route for the required tag set below (the
     framework's source is not the served output: an Astro/SSG build inlines and
     transforms, so inspect `dist/` output or the response, not the `.astro` file);
   - crawl internal + external links for 404s / dead anchors;
   - inspect the DOM for the programmatic a11y a screenshot hides (landmarks,
     heading order, `alt`, form labels, `lang`, focus order);
   - check computed styles and `prefers-reduced-motion`.
2. **Read the built output statically** when you cannot run it: the generated HTML
   `<head>`, `robots.txt`, `sitemap.xml`. Say "static-only" in the output and cap
   any performance dimension you could not measure; Core Web Vitals need a real
   run, not a source read.

Score per route where routes differ (a content article is not the landing hero).

## The mechanical gate (deterministic; the website verify profile)

These pass/fail with no judgment and are what the website archetype's npm `verify`
asserts (the profile lands wired when `templates/website` is filled; until then
run them on demand against any built site). A red gate caps the verdict below at
`needs-a-pass` no matter how the rubric scores.

- **Floor**: install, typecheck, `build` succeed.
- **Lighthouse budget**: performance >= 90, accessibility >= 95 (the
  `rule_testing` website numbers). SEO and best-practices >= 90 are advisory, not
  hard gates.
- **Links**: no broken internal route, asset, or external link; no dead in-page
  anchor.
- **Required `<head>` per route**: a unique descriptive `<title>`;
  `<meta name="description">`; `<link rel="canonical">`; `<meta charset>` and the
  responsive `viewport` meta; `lang` on `<html>`. Open Graph (`og:title`,
  `og:description`, `og:image`, `og:url`, `og:type`) and a Twitter card
  (`twitter:card` + image). A favicon set. At the site root: `robots.txt` and a
  `sitemap.xml`. JSON-LD structured data wherever the page has a real type
  (Organization, Article, Product, BreadcrumbList).

The presence check is mechanical; whether a present tag is *correct* (the canonical
points at the right URL, the OG image is the real share image and the right size)
is rubric dimension 1-2 below.

## The agent-judged rubric (score each 0 / 1 / 2)

`0` = absent or broken, `1` = present but weak, `2` = strong. These are the
properties a presence-check certifies but cannot judge.

1. **SEO substance.** The title and description describe *this* page specifically
   (not a site-wide boilerplate repeated on every route); the heading outline
   (one `h1`, no skipped levels) reflects the real content structure; the canonical
   resolves to the intended URL; the sitemap lists the real routes. Tags present
   but generic ("Home | My Site" on every page) score 1, not 2.
2. **Share preview.** Paste the URL into a card validator's shoes: the OG/Twitter
   tags render a real, correct preview; the `og:image` exists, is the right aspect
   (~1.91:1, >= 1200x630), and is the page's actual share image, not a placeholder
   or a missing 404. A broken or absent preview image scores 0.
3. **Semantic accessibility.** The part Lighthouse's score misses: landmarks
   (`header`/`nav`/`main`/`footer`) present and singular where required; every
   meaningful image has descriptive `alt` (decorative images empty-`alt`, not
   "image"); every form control has an associated label; focus order is logical and
   focus is visible; contrast holds at the decisive moment; `prefers-reduced-motion`
   honored. A missing label or a non-text `alt` on a load-bearing image is a
   blocker, not a deduction.
4. **Performance felt.** Beyond the score: the LCP element is the right one (the
   hero, not a late banner) and paints fast; no layout shift on load (CLS); fonts
   do not FOIT or block render (`font-display`, preloaded); images are sized,
   lazy-loaded below the fold, and in a modern format; the JS shipped is justified
   by what the page does (a content site shipping a megabyte of JS scores low).
5. **Content quality.** The copy says something specific and true to the subject;
   no lorem, no AI-filler, no "Welcome to our website". CTAs name what happens in
   active voice; empty and error states give direction, not mood. This is the
   content edge of `frontend-design`'s copy lens, scored here because a site can
   pass every tag check and still be hollow.
6. **Responsive integrity (web-platform floor).** No horizontal scroll or overflow
   from ~360px up; tap targets >= ~44px; content reflows rather than truncates;
   any claimed mode (dark, print) actually works. A broken small-viewport layout is
   a blocker.

Out of scope here, routed to `design-reviewer`: visual distinctiveness, the
display/body type pairing, motion as art direction, the three AI-default looks.
Run that agent for the visual verdict; this skill does not re-score taste.

## Output

Report, do not edit.

```
WEBSITE QUALITY: <route or site> (<ran build + lighthouse | static-only>)
Mechanical gate: build <PASS|FAIL> | lighthouse perf NN a11y NN | links <OK|N broken> | head: <complete | missing: og:image, canonical, ...>
1. SEO substance           2/2  <one line of evidence>
2. Share preview           1/2  ...
3. Semantic accessibility  2/2  ...
4. Performance felt        1/2  ...
5. Content quality         2/2  ...
6. Responsive integrity    2/2  ...
TOTAL: N/12   verdict: <ship | needs-a-pass | thin>

Top blockers (most leverage first):
1. <route / element>: what is wrong, the concrete fix.
2. ...
3. ...
```

Verdict bands: `10-12` ship, `6-9` needs-a-pass, `<6` thin. A failed mechanical
gate (build red, perf < 90, a11y < 95, or a missing required tag) or a `0` on
dimension 3 (semantic a11y) or 6 (responsive floor) caps the verdict at
`needs-a-pass` regardless of total: an unreachable, unusable, or undiscoverable
page is a blocker, not an average.

Name at most three blockers, highest-leverage first, each anchored to a route and
an element. Do not list every dimension below 2; list the ones worth fixing next.
Do not invent a flaw to look thorough, and do not call a hollow page `ship` to be
encouraging; an honest `thin` with three concrete fixes is worth more than a padded
list, and this review is only useful if it is trusted.

## Calibration

- **Trivial** (a copy fix, a one-route tweak): the existing profile is the test;
  no new check is owed.
- **Standard** (a new page or section): score the affected route; add the new
  route to the link crawl and the sitemap.
- **High-stakes** (a marketing or paid site, anything a user lands on from an ad):
  the full mechanical gate, the rubric, AND `design-reviewer` at Review. Treat the
  metadata and a11y assertions as load-bearing and confirm they would bite (a
  missing `og:image` actually fails the head check, a label removal actually drops
  the a11y score), per `rule_testing`'s prove-it-bites bar.

## Status

Written 2026-06-16 (Cycle 8). Founded general: keyed to the `website` archetype,
applies to any website product, deliberately not coupled to a single product the
way `skil_crew-verify` is wired into CREW. The website twin of
`skil_game-feel-review`. Defines the bar the website verify profile (Lighthouse,
link, meta/OG) enforces mechanically and the `design-reviewer` agent complements on
the visual side; the mechanical tier lands wired when `templates/website` is filled
from the Astro harvest. Pairs with `rule_testing` (the per-archetype Verify phase),
`design-reviewer` + `frontend-design` (the visual half), and `webapp-testing` (the
driver).
