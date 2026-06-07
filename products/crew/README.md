# CREW - Impostor (phase 1 prototype)

Single-device, pass-and-play party game. One phone goes around a room: everyone
gets a secret word except the impostor, then the table argues over who's faking
it. This is the phase-1 prototype whose only job is to answer one question:

> Does Impostor on a passed phone make a room laugh hard enough to want another round?

## Run it

```bash
npm install
npm run dev
```

Vite prints a **Network** URL (e.g. `http://192.168.x.x:5173`). Open that on any
phone on the same Wi-Fi; no install needed. The owner's phone is the only one
used during a round (it gets passed around).

## The bet & the measurement

Measurement is a first-class part of the build, not a debug overlay. Every
session logs to `localStorage` (interface is ready to also POST to a Cloudflare
Worker + D1 endpoint at ~week 3 - see `src/measure.ts`).

- **Primary signal:** time-to-next-round (how long the table sits on the reveal
  before asking for another round; lower = they wanted more).
- **Secondary:** one-tap "banger" at reveal (positive-only; no tap is NOT a
  clean dud).
- Also tracked: rounds/session, replays, session length, catch-rate, group tags.

Open **Session data** from the home screen (or after a game) to see the live
stats and export every session as JSON.

**Success metric for phase 1:** >=70% of playtest sessions trigger a voluntary
replay AND median session >=15 min. Run it with FRESH groups of 5-7.

## Stack

Vite + React + TypeScript, web/PWA. Intentional migration to native iOS once the
core bet is verified. No server, no accounts, fully client-side.

## Tuning the deck

`src/words.ts` is the tunable surface. After each playtest batch: prune the duds
(longest time-to-next-round), clone variants of the bangers.
