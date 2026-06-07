# CREW architecture

Read this before changing CREW (`rule_dev_loop` non-negotiable 1: understand
before you change). It maps the parts, the one contract that holds them together,
and the surfaces that are risky to touch.

CREW is a single-device, pass-and-play party game. One phone goes around the
room. Stack: Vite + React 18 + TypeScript, PWA, fully client-side (no server, no
accounts, works offline). Native iOS is the intended path once the phase-1 bet is
verified.

## The one idea: a shared pass-and-peek grammar

Every mode is the same interaction loop: a neutral "pass to X" gate that reveals
nothing, then that player holds to reveal a private card, hides, and passes on.
That loop lives once in the kernel; modes reuse it. The kernel's own rule, stated
in its header: **new modes add screens, they do not fork the kernel primitives.**

## Module map

| File | Role |
|------|------|
| `src/main.tsx` | Entry. Mounts `MuteToggle` outside `App` (so it survives every route) + `App`. Registers the service worker in PROD only. No `StrictMode` on purpose (see gotchas). |
| `src/App.tsx` | Shell + router (`home` / `stats` / `mode`). Owns the `roster`, persists it, lists the modes (`MODES`), routes the common props into each mode. |
| `src/kernel.tsx` | The shared grammar: `Screen`, `useButtonJuice`, `MuteToggle`, `Stat`, `CountVal`, `Scoreboard`, `RoundFooter`, `HowToPlay`, `RosterEditor`, `HoldToReveal`, `PassAndPeek<T>`. |
| `src/measure.ts` | First-class measurement (the point of phase 1). Event log + stats + export. |
| `src/types.ts` | `Mode` union, `Roster`, `SessionTags`, `tagsFor`, the age/relationship vocabularies. |
| `src/modes/*.tsx` | One file per mode: `Impostor`, `Sync`, `HiveMind`, `Confessions`, `Crowned`. |
| `src/words.ts` | Impostor's secret-word deck (`WORDS`, `CATEGORIES`); the tunable surface. |
| `src/decks.ts` | Prompt content for the about-each-other modes. |
| `src/characters.tsx` | `Avatar`, the `CHARACTERS` cast, `characterFor`, `HOST`. |
| `src/audio.ts` | Web-Audio SFX kit: `playSfx`, `playTick`, `playChime`, `haptic`, mute state, `unlockAudio`. |
| `src/confetti.ts`, `src/util.ts` | `fireConfetti`; `shuffle`, `fmtTime`, `prefersReducedMotion`. |
| `src/styles.css` | All styling, including the animations that must stay CSS-driven (see gotchas). |

## The mode contract

A mode is a default-exported component that takes the common props from `App`:

```ts
{ roster, setRoster, onExitToStats, onExitToHome }   // Impostor also takes resume
```

It runs its own phase state machine and emits the standard measurement events at
the standard moments (see below). It reuses kernel primitives for anything
shared: `PassAndPeek<T>` for private input, `RoundFooter` for the reveal footer,
`Scoreboard`, `HoldToReveal`. Scoring is per-mode and lives inside the mode.

Impostor is the flagship and the reference implementation. Its phases:
`setup -> deal -> discuss -> vote -> reveal`. It is also the only mode that
persists a mid-game snapshot for resume (a passed phone gets locked or
fat-fingered; losing the round to that is the worst feeling in a party game).

## Adding a mode (the most common change)

1. Add the id to the `Mode` union in `types.ts`.
2. Add a `modes/<Name>.tsx`, default-exported, taking the common props.
3. Drive the private input with `PassAndPeek`; end each round on `RoundFooter`.
4. Emit the standard events: `startSession` at game start, `round_start` per
   round, `markReveal` at the reveal (mode-specific signals ride in its payload),
   `markBanger` / `markNextRound` from the footer, `session_end` at exit.
5. Register it: add to `MODES` and `MODE_AV` in `App.tsx`, and to `App`'s mode
   `switch`.
6. Do not fork the kernel primitives; if one genuinely does not fit, extend it
   in `kernel.tsx` so every mode benefits.

## Measurement (`measure.ts`)

Build-once-run-forever, not a debug overlay. Events log to `localStorage`
(`crew_logs_v1`, keyed by session-start epoch) and are designed to also POST to a
remote endpoint (`REMOTE_ENDPOINT`, off until ~week 3; flip it on and the same
events stream to one place).

- **Primary signal:** time-to-next-round (`markNextRound`), passive and
  uncontaminated. Lower means the room wanted more.
- **Secondary:** the one-tap banger (positive-only; absence is weak, not a clean
  dud, the room may just be laughing too hard to tap).
- **Event shape:** `{ t, rel, type, mode, ...payload }`. Standard types:
  `session_start`, `round_start`, `reveal`, `banger`, `next_round`, `session_end`.
- **catchRate** is Impostor-specific: only reveals carrying a boolean `caught`
  count toward it, so other modes do not dilute it.
- **Anonymity rule (Confessions):** log only the aggregate `yesCount` and `N`,
  never the per-player yes/no vector. Keep this invariant in any Confessions work.

## State and persistence

Three `localStorage` keys, each versioned in its own shape:

- `crew_roster_v1`: the roster (names + group tags), lifted in `App` so switching
  modes does not re-enter names; survives reload.
- `crew_logs_v1`: the measurement log, keyed by session-start epoch.
- `crew_game_v1`: Impostor's mid-game snapshot (`v: 1`), written on every
  in-round change and cleared on exit. `loadImpostorSnapshot` validates `v` and
  phase before offering resume.

On reload mid-game, `M.resumeSession(start, mode)` re-attaches to the same
measurement session; without it, events strand under key `"0"`.

## Blast radius (touch carefully)

- **`kernel.tsx` primitives**: every mode depends on them. Changing `PassAndPeek`,
  `RoundFooter`, or `HoldToReveal` is a change to all five modes; verify each.
- **`measure.ts` event names and payload keys**: they are the stats schema, the
  export schema, and the future remote schema. `catchRate` keys on `caught`;
  `replays` count `next_round`. Renaming silently breaks aggregation.
- **The `localStorage` keys and the snapshot `v` field**: a shape change needs a
  version bump plus migration, or resume and stats break for returning players.

## Gotchas (load-bearing)

- **No `StrictMode`** (`main.tsx`). Re-enabling it double-invokes effects in dev,
  which double-fires the discussion timer and the measurement events.
- **Press-squash must stay pure CSS** (`:active` + spring in `styles.css`), not a
  JS class. A React re-render strips an imperatively-added class; the CSS form
  cannot be stripped. `useButtonJuice` only adds the tap SFX and haptic.
- **Service worker is PROD-only.** In dev it would cache the Vite HMR server and
  serve stale modules.
- **`MuteToggle` is mounted outside `App`** so it stays reachable on every screen,
  including mid-pass and reveal.

## Build and run

```
cd products/crew
npm install
npm run dev        # Vite prints a Network URL; open it on a phone on the same Wi-Fi
npm run build      # tsc --noEmit && vite build
```

From the repo root, `uv run tools/verify.py crew` runs the same build as the bar.
