---
name: skil_game-feel-review
description: Review the game feel (juice, responsiveness, loop rhythm) of a web/DOM pass-and-play party game like CREW. Use after a UI, audio, animation, or round-flow change, before declaring it "feels good", or when a playtest reports the game feels flat or confusing. Scores seven feel dimensions 0-2 against the running build and names the top concrete feel blockers. Pairs with webapp-testing (drives the build) and rule_code_review (the correctness side); this skill is the feel side.
---

# Game-feel review (CREW and web pass-and-play)

Correctness is `rule_code_review`'s job. This is the other half: does the thing
feel good in the hand. A party game lives or dies on feel, and feel is the one
property a passing build and a green test say nothing about. This skill scores it.

Scope: a single-device, pass-and-play web/DOM game. CREW is the reference (Vite +
React + TS, one phone around the room, the kernel's pass-and-peek grammar). The
rubric is engine-agnostic for that shape; it is NOT calibrated for action,
economy, or retention-loop games (where the source rubric below comes from).

Attribution: the seven-dimension structure and the loop-closure idea are adapted
from the feel-pass rubric in `fagemx/gstack-game` (MIT), re-calibrated for local
pass-and-play and stripped of all gstack ecosystem machinery (no telemetry, no
router, no prompts). The scoring and the CREW grounding are original.

## How to run it

Feel is observed on the running build, never inferred from source. Order of
preference:

1. **Drive the build** (when `webapp-testing` is vendored): boot the product with
   its `with_server.py`, drive a full round with Playwright, capture screenshots
   at each phase transition and the console/network, and read the persisted
   `localStorage` after the round. Score from what the build actually did.
2. **Read the feel-bearing source** when you cannot run it: for CREW that is
   `src/kernel.tsx` (the `useButtonJuice`, `HoldToReveal`, `PassAndPeek`,
   `RoundFooter` primitives), `src/audio.ts` (the SFX/haptic kit and the timing of
   `playSfx`/`haptic` calls), `src/styles.css` (the `:active` press-squash spring,
   reveal animations, `prefers-reduced-motion` branches), and the mode's reveal
   path. Source-only scoring is a fallback; say so in the output and cap any
   responsiveness/timing dimension you could not observe.

Apply it per-mode where modes differ at the reveal (Impostor's vote/reveal is not
Confessions' count reveal).

## The seven dimensions (score each 0 / 1 / 2)

`0` = absent or broken, `1` = present but weak, `2` = strong. For each, the CREW
anchor names where the feel lives.

1. **Tap responsiveness.** Every interactive tap answers in under ~100ms with
   sound, haptic, and a visual press. CREW anchor: `useButtonJuice` (tap SFX +
   haptic) and the pure-CSS `:active` press-squash. A tap with no sub-100ms
   acknowledgement scores 0 regardless of what happens later.
2. **Turn-handoff clarity.** The "pass to X" gate reveals nothing private, names
   the next holder unambiguously, and the hold-to-reveal makes the holder
   deliberate. A handoff a drunk player at arm's length cannot parse scores low.
   CREW anchor: `PassAndPeek` neutral gate + `HoldToReveal`.
3. **Reveal payoff.** The reveal lands with weight proportional to the stakes: a
   sting, a hit-stop or count-up, confetti where earned, not an instant text swap.
   CREW anchor: reveal stings/hit-stops, `CountVal` count-up, `fireConfetti`, the
   `.count-suspense` punch.
4. **Round-loop rhythm.** From reveal to the next round is short and the footer
   invites the next round more than it invites quitting. This is the dimension the
   primary metric measures. CREW anchor: `RoundFooter`, `markNextRound`
   (time-to-next-round is the primary signal; a sluggish loop shows up here).
5. **Shared-screen legibility.** One phone, one reader, a loud room: text size,
   contrast, and the amount on screen at the decisive moment are readable at
   arm's length without leaking the private part to onlookers. Overload or a
   privacy leak scores low.
6. **Loop-closure / session viability.** A session naturally wants another round
   and closes cleanly rather than fizzling. The CREW success bar is the reference:
   a voluntary replay and a median session around 15 minutes. A flow that dead-ends
   after one round, or never offers a clean exit, scores low.
7. **Measurement integrity (CREW-specific).** A feel change must not corrupt the
   measurement that proves it. The standard events still fire at the standard
   moments, exactly once (no `StrictMode` double-fire), and no feel feature logs
   anything it should not (the Confessions anonymity invariant). A juice change
   that double-fires `round_start` or strands events scores 0 here, however good it
   feels, because it blinds phase 1. CREW anchor: `measure.ts` event/payload
   schema; `rule_code_review` invariants.

## Output

Report, do not edit. Emit:

```
GAME-FEEL REVIEW: <mode or screen> (<ran build | source-only>)
1. Tap responsiveness        2/2  <one line of evidence>
2. Turn-handoff clarity      1/2  ...
... (all seven)
TOTAL: N/14   verdict: <shipped-feel | needs-a-pass | flat>

Top feel blockers (most leverage first):
1. <screen/component @ timing>: what is missing, the concrete fix.
2. ...
3. ...
```

Verdict bands: `12-14` shipped-feel, `8-11` needs-a-pass, `<8` flat. A `0` on
dimension 1 (tap) or 7 (measurement integrity) caps the verdict at
`needs-a-pass` no matter the total: an unfelt tap or a corrupted metric is a
blocker, not an average.

Name at most three blockers, the highest-leverage first, each anchored to a
screen/component and a moment. Do not list every dimension that scored below 2;
list the ones worth fixing next. An honest `flat` with three concrete fixes is
worth more than a padded list. Do not invent feel problems to look thorough, and
do not call something `shipped-feel` to be encouraging; this review is only
useful if it is trusted.
