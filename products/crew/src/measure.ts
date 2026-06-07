import type { Mode, SessionTags } from './types';

// ---------------------------------------------------------------------------
// Measurement system. FIRST-CLASS, build-once-run-forever (not a debug overlay).
// Phase-1: logs to localStorage. The log interface is designed to ALSO target a
// remote endpoint (Cloudflare Worker -> D1) so nothing is stranded on devices;
// flip REMOTE_ENDPOINT on at ~week 3 and the same events stream to one place.
//
// Primary signal: time-to-next-round (passive, uncontaminated).
// Secondary: one-tap 'banger' (positive-only; absence is weak/ambiguous, NOT a
// clean dud, because the room may just be laughing too hard to tap).
//
// Mode-agnostic: every mode logs round_start / reveal / next_round / banger with
// its own payload. Mode-specific signals (matchRate, splitRatio, guessError,
// crownMargin) ride inside the reveal payload and survive in the export.
//
// ANONYMITY RULE (Confessions): only ever log the AGGREGATE yes-count, never the
// per-player yes/no vector. The reveal payload for Confessions carries yesCount
// and N, nothing that maps an answer back to a person.
// ---------------------------------------------------------------------------

export interface LogEvent {
  t: number; // epoch ms
  rel: number; // ms since session start
  type: string;
  [k: string]: unknown;
}

const STORAGE_KEY = 'crew_logs_v1';
const REMOTE_ENDPOINT: string | null = null; // wire at ~week 3

let sessionStart = 0;
let sessionMode: Mode | null = null;
let events: LogEvent[] = [];
let revealShownAt = 0;

export function startSession(tags: SessionTags, mode: Mode): number {
  sessionStart = Date.now();
  sessionMode = mode;
  events = [];
  revealShownAt = 0;
  log('session_start', { tags, mode });
  return sessionStart;
}

// The session key (== sessionStart epoch). Persisted with a mode's game snapshot
// so a reload can re-attach to the same measurement session instead of opening a
// new one and stranding events under key "0".
export function getSessionStart(): number {
  return sessionStart;
}

// Re-attach to a session already in localStorage after a page reload. Restores
// the in-memory event buffer so subsequent events append to the right session,
// and re-arms time-to-next-round if the reload landed on the reveal screen.
export function resumeSession(start: number, mode: Mode): void {
  if (!start) return;
  sessionStart = start;
  sessionMode = mode;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    events = Array.isArray(all[String(start)]) ? all[String(start)] : [];
  } catch {
    events = [];
  }
  const last = events[events.length - 1];
  revealShownAt = last && last.type === 'reveal' ? last.t : 0;
}

export function log(type: string, payload: Record<string, unknown> = {}): void {
  const now = Date.now();
  const e: LogEvent = {
    t: now,
    rel: sessionStart ? now - sessionStart : 0,
    type,
    ...(sessionMode ? { mode: sessionMode } : {}),
    ...payload,
  };
  events.push(e);
  persist();
  if (REMOTE_ENDPOINT) {
    try {
      fetch(REMOTE_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(e),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* ignore network errors during playtests */
    }
  }
}

// Sets the reveal timestamp AND logs the round outcome, so time-to-next-round
// flows from one call. Payload is mode-specific (Impostor: {word,category,caught};
// Sync: {clusters,matchRate,...}; Confessions: {yesCount,N,...} aggregate only).
export function markReveal(payload: Record<string, unknown>): void {
  revealShownAt = Date.now();
  log('reveal', payload);
}

export function markBanger(roundIndex: number): void {
  log('banger', { roundIndex });
}

// Returns ms the table sat on the reveal before asking for another round.
export function markNextRound(): number | null {
  const ttn = revealShownAt ? Date.now() - revealShownAt : null;
  log('next_round', { timeToNextRoundMs: ttn });
  revealShownAt = 0;
  return ttn;
}

function persist(): void {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    all[String(sessionStart)] = events;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* localStorage may be unavailable; ignore */
  }
}

export interface SessionStats {
  rounds: number;
  replays: number; // voluntary next-rounds
  sessionLengthMs: number;
  medianTtnMs: number | null;
  catchRate: number | null; // Impostor only: fraction of rounds impostor caught
  bangers: number;
}

function statsFromEvents(evs: LogEvent[], lengthMs: number): SessionStats {
  const rounds = evs.filter((e) => e.type === 'round_start').length;
  const nexts = evs.filter((e) => e.type === 'next_round');
  const ttnList = nexts
    .map((e) => e.timeToNextRoundMs as number | null)
    .filter((v): v is number => typeof v === 'number');
  // catchRate is Impostor-specific: only reveals that carry a boolean `caught`
  // count toward the denominator, so other modes' reveals don't dilute it.
  const caughtReveals = evs.filter((e) => e.type === 'reveal' && typeof e.caught === 'boolean');
  const caught = caughtReveals.filter((e) => e.caught === true).length;
  return {
    rounds,
    replays: nexts.length,
    sessionLengthMs: lengthMs,
    medianTtnMs: median(ttnList),
    catchRate: caughtReveals.length ? caught / caughtReveals.length : null,
    bangers: evs.filter((e) => e.type === 'banger').length,
  };
}

export function currentStats(): SessionStats {
  return statsFromEvents(events, sessionStart ? Date.now() - sessionStart : 0);
}

// Aggregate across EVERY session ever stored on this device, not just the live
// one. The live dashboard reads in-memory `events`, which resets on reload; this
// reads the persisted log so the numbers survive a refresh and accumulate.
export interface AllTimeStats extends SessionStats {
  sessions: number;
}

export function allTimeStats(): AllTimeStats {
  let all: Record<string, LogEvent[]> = {};
  try {
    all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    all = {};
  }
  const sessions = Object.values(all).filter(Array.isArray) as LogEvent[][];
  let length = 0;
  const merged: LogEvent[] = [];
  for (const evs of sessions) {
    for (const e of evs) merged.push(e);
    const last = evs[evs.length - 1];
    if (last && typeof last.rel === 'number') length += last.rel;
  }
  return { ...statsFromEvents(merged, length), sessions: sessions.length };
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Download every stored session as JSON (until the remote endpoint is wired).
export function exportAllJSON(): void {
  const data = localStorage.getItem(STORAGE_KEY) || '{}';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crew-logs-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
