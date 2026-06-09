---
name: project_crew_game
description: CREW party game; concept, modes, and build state. First product in agentic-dev1, lives in products/crew/.
metadata:
  type: project
---

CREW is a single-device, pass-and-play party game. One phone goes around a room;
modes split into Impostor (secret-word bluffing) and about-each-other modes
(Confessions, Crowned, HiveMind, Sync). One interaction grammar, "the room is the
loop", a 7 EUR one-time unlock, with a personal side-bet mechanic. Stack: Vite +
React + TypeScript, web/PWA, fully client-side (no server, no accounts); intentional
migration to native iOS once the core bet is verified.

Phase-1 measurement is first-class: every session logs to localStorage
(time-to-next-round as the primary signal, a one-tap "banger" at reveal as secondary).
Success metric: at least 70% of playtest sessions trigger a voluntary replay and
median session at least 15 min, run with fresh groups of 5-7.

Build state at migration (2026-06-07): multi-mode shell with per-mode signature
reveals + self-hosted fonts; the "juice" pass (Web-Audio SFX kit + mute toggle +
global button juice + reveal stings and hit-stops) was Playwright-verified.
Press-squash must be pure CSS (`:active` + spring), NOT a JS class (React strips it).
Migrated from the standalone `crew-sandbox` repo into `products/crew/`. NEXT: owner
ship-order, then a real-room playtest with fresh groups.
