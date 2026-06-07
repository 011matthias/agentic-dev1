import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { AGE_BANDS, RELATIONSHIPS } from './types';
import type { Roster } from './types';
import { Avatar, CHARACTERS, characterFor } from './characters';
import { prefersReducedMotion } from './util';
import { fireConfetti } from './confetti';
import { haptic, isMuted, playSfx, playTick, toggleMuted, unlockAudio } from './audio';

// ---------------------------------------------------------------------------
// Shared UI kernel. Every mode reuses these so the pass-and-peek grammar, the
// roster, the scoreboard, and the reveal footer look and behave identically
// across modes. New modes should add screens, not fork these.
// ---------------------------------------------------------------------------

export function Screen({ children, scroll }: { children: React.ReactNode; scroll?: boolean }) {
  return <div className={`screen ${scroll ? 'screen-scroll' : ''}`}>{children}</div>;
}

// Global button juice. One delegated pointerdown listener gives EVERY <button>
// in every mode a quiet tap click + a light haptic, and arms the audio context
// on the first tap anywhere. The press-squash itself is pure CSS (:active +
// spring transition in styles.css) so it can't be stripped by a React re-render
// the way an imperative class would be; the click is gated by the mute toggle
// (inside playSfx). Call once at the app root.
export function useButtonJuice(): void {
  useEffect(() => {
    function onDown(e: PointerEvent) {
      const el = e.target as HTMLElement | null;
      const btn = el?.closest('button');
      if (!btn || btn.disabled) return;
      unlockAudio();
      playSfx('tap');
      haptic(8);
    }
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, []);
}

// A persistent mute control. Fixed top-right so it's reachable from any screen
// (home, mid-pass, reveal). Mounted once at the app root.
export function MuteToggle() {
  const [muted, setMuted] = useState(isMuted());
  return (
    <button
      className="mute-toggle"
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
      aria-pressed={muted}
      onClick={() => {
        const next = toggleMuted();
        setMuted(next);
        if (!next) {
          // Confirm unmute audibly (and arm the context if it wasn't yet).
          unlockAudio();
          playSfx('pop');
        }
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {muted ? (
          <path d="M17 9l5 6M22 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path
            d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// Counts up from zero to `value` on mount (a satisfying tally at the reveal).
// Snaps straight to the value under reduced-motion. With `sound`, each integer
// step plays a tick whose pitch rises as the tally climbs.
export function CountVal({
  value,
  durationMs = 650,
  sound = false,
}: {
  value: number;
  durationMs?: number;
  sound?: boolean;
}) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));
  const prevRef = useRef(0);
  useEffect(() => {
    if (prefersReducedMotion() || value === 0) {
      setShown(value);
      return;
    }
    let raf = 0;
    let startedAt = 0;
    prevRef.current = 0;
    const tick = (ts: number) => {
      if (!startedAt) startedAt = ts;
      const p = Math.min(1, (ts - startedAt) / durationMs);
      const v = Math.round((1 - Math.pow(1 - p, 3)) * value);
      setShown(v);
      if (sound && v > prevRef.current) {
        playTick(p);
        prevRef.current = v;
      }
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs, sound]);
  return <>{shown}</>;
}

export function Scoreboard({ players, scores, unit }: { players: string[]; scores: number[]; unit?: string }) {
  const order = players.map((_, i) => i).sort((a, b) => scores[b] - scores[a]);
  const top = Math.max(0, ...scores);
  return (
    <div className="scoreboard">
      {order.map((i, rank) => {
        const isWinner = scores[i] === top && top > 0;
        return (
          <div
            className={`score-row ${isWinner ? 'winner' : ''}`}
            key={i}
            style={{ '--i': rank } as CSSProperties}
          >
            <span className="score-who">
              <Avatar index={i} size={30} ring />
              {players[i]}
            </span>
            <span className="score-val">
              {/* Only the top row ticks audibly, so a full board doesn't rattle. */}
              <CountVal value={scores[i]} sound={isWinner} />
              {unit ? ` ${unit}` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// The reveal footer shared by every mode: positive-only banger tap, next round,
// end game. Centralised so the measurement taps fire consistently.
export function RoundFooter({
  banged,
  onBang,
  onNext,
  onEnd,
  nextLabel = 'Next round',
}: {
  banged: boolean;
  onBang: () => void;
  onNext: () => void;
  onEnd: () => void;
  nextLabel?: string;
}) {
  // The banger is the positive-only "that was great" tap; give it the biggest
  // footer payoff: a confetti burst from low (near the button), a win sting, and
  // a celebratory buzz. Fires once, then the button reads as logged.
  function bang() {
    if (!banged) {
      fireConfetti({ count: 70, originY: 0.82 });
      playSfx('success');
      haptic([12, 24, 60]);
    }
    onBang();
  }
  return (
    <>
      <button className={`btn btn-banger ${banged ? 'banged' : ''}`} onClick={bang}>
        {banged ? 'Logged a banger' : 'That round was a banger'}
      </button>
      <button className="btn btn-primary" onClick={onNext}>
        {nextLabel}
      </button>
      <button className="btn btn-ghost" onClick={onEnd}>
        End game
      </button>
    </>
  );
}

// Optional per-mode rules. Collapsed by default (native <details>, so it needs
// no state and is keyboard/screen-reader accessible); a tap on a cold-room
// table opens a plain-language goal + numbered steps.
export function HowToPlay({ goal, steps }: { goal: string; steps: string[] }) {
  return (
    <details className="howto">
      <summary className="howto-summary">How to play</summary>
      <div className="howto-body">
        <p className="howto-goal">{goal}</p>
        <ol className="howto-steps">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </details>
  );
}

// Shared roster fields (names + group tags). Captured once, carried across modes
// within a session. `min` and `recommend` drive the player-count hints.
export function RosterEditor({
  roster,
  setRoster,
  min,
}: {
  roster: Roster;
  setRoster: (r: Roster) => void;
  min: number;
}) {
  const [draft, setDraft] = useState('');
  const nextChar = characterFor(roster.players.length);

  function addPlayer() {
    const n = draft.trim();
    if (!n) return;
    setRoster({ ...roster, players: [...roster.players, n] });
    setDraft('');
  }
  function addCharacter() {
    // Append the next cast member by name so the avatar (index-derived) lines up
    // with the name. No keyboard needed: the fast path on a passed phone.
    setRoster({ ...roster, players: [...roster.players, nextChar.name] });
  }
  function quickCrew() {
    const need = Math.max(min, 5);
    setRoster({ ...roster, players: CHARACTERS.slice(0, need).map((c) => c.name) });
  }
  function removePlayer(idx: number) {
    setRoster({ ...roster, players: roster.players.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <div className="add-row">
        <input
          className="text-input"
          value={draft}
          placeholder="Add a name"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
        />
        <button className="btn btn-add" onClick={addPlayer} aria-label="Add name">
          +
        </button>
      </div>

      <div className="quick-add">
        <button className="chip-add" onClick={addCharacter}>
          <Avatar char={nextChar} size={26} ring />
          Add {nextChar.name}
        </button>
        {roster.players.length === 0 && (
          <button className="chip-add" onClick={quickCrew}>
            Quick crew of {Math.max(min, 5)}
          </button>
        )}
      </div>

      <div className="player-list">
        {roster.players.map((p, i) => (
          <div className="player-row" key={i}>
            <span className="player-who">
              <Avatar index={i} size={30} ring />
              {p}
            </span>
            <button className="chip-remove" onClick={() => removePlayer(i)}>
              remove
            </button>
          </div>
        ))}
        {roster.players.length === 0 && (
          <p className="hint">3 to 8 players. Tap a character or type names.</p>
        )}
      </div>

      <div className="field">
        <label>This group is... (helps tune the deck)</label>
        <div className="seg wrap">
          {RELATIONSHIPS.map((r) => (
            <button
              key={r}
              className={`seg-btn sm ${roster.relationship === r ? 'on' : ''}`}
              onClick={() => setRoster({ ...roster, relationship: r })}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="seg wrap">
          {AGE_BANDS.map((a) => (
            <button
              key={a}
              className={`seg-btn sm ${roster.ageBand === a ? 'on' : ''}`}
              onClick={() => setRoster({ ...roster, ageBand: a })}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// Press-and-hold to reveal a private card. A plain tap does nothing, which
// prevents accidental flashes while the phone is mid-pass; holding fills a bar
// and reveals at the end. Keyboard users press Enter/Space to reveal at once.
export function HoldToReveal({
  label,
  onReveal,
  holdMs = 500,
}: {
  label: string;
  onReveal: () => void;
  holdMs?: number;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);
  const ticker = useRef<number | null>(null);

  function stopTicks() {
    if (ticker.current != null) {
      clearInterval(ticker.current);
      ticker.current = null;
    }
  }

  function reveal() {
    // The payoff at the end of the fill: a pop + a firmer buzz.
    playSfx('pop');
    haptic([10, 20]);
    onReveal();
  }

  function start() {
    if (timer.current != null) return;
    setHolding(true);
    // Rising ticks track the bar filling, so the hold has audible tension.
    let elapsed = 0;
    const stepMs = 60;
    ticker.current = window.setInterval(() => {
      elapsed += stepMs;
      playTick(Math.min(1, elapsed / holdMs));
    }, stepMs);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      stopTicks();
      setHolding(false);
      reveal();
    }, holdMs);
  }
  function cancel() {
    if (timer.current != null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    stopTicks();
    setHolding(false);
  }

  // Clear any pending timers if the button unmounts mid-hold (e.g. a fast pass).
  useEffect(() => {
    return () => {
      if (timer.current != null) clearTimeout(timer.current);
      stopTicks();
    };
  }, []);

  return (
    <button
      className={`btn btn-primary hold-btn ${holding ? 'holding' : ''}`}
      onPointerDown={(e) => {
        e.preventDefault();
        start();
      }}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          reveal();
        }
      }}
      style={{ '--hold-ms': `${holdMs}ms` } as CSSProperties}
    >
      <span className="hold-fill" aria-hidden="true" />
      <span className="hold-label">{label}</span>
    </button>
  );
}

// Generic pass-and-peek collector. Privacy by sequence: a neutral "pass to X"
// gate reveals nothing, then the named player taps privately and hides. Drives
// every non-Impostor private input (Sync pick, Hive Mind side, Confessions
// count-guess + yes/no, Crowned crown vote). Key it by round so it resets.
export function PassAndPeek<T>({
  players,
  passVerb = 'Pass the phone to',
  instruction = "Don't let anyone else see.",
  renderPrivate,
  onDone,
}: {
  players: string[];
  passVerb?: string;
  instruction?: string;
  renderPrivate: (playerIndex: number, commit: (value: T) => void) => React.ReactNode;
  onDone: (values: T[]) => void;
}) {
  const [pointer, setPointer] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const valuesRef = useRef<T[]>([]);

  function commit(value: T) {
    valuesRef.current = [...valuesRef.current, value];
    if (pointer + 1 < players.length) {
      setPointer(pointer + 1);
      setFlipped(false);
    } else {
      onDone(valuesRef.current);
    }
  }

  const name = players[pointer];
  return (
    <Screen scroll>
      {!flipped ? (
        <>
          <p className="pass-label">{passVerb}</p>
          <div className="pass-avatar">
            <Avatar key={pointer} index={pointer} size={148} ring pop />
          </div>
          <div className="pass-name">{name}</div>
          <p className="hint">{instruction}</p>
          <HoldToReveal label={`I'm ${name}, hold to reveal`} onReveal={() => setFlipped(true)} />
        </>
      ) : (
        <div className="peek-in">{renderPrivate(pointer, commit)}</div>
      )}
      <div className="deal-progress">
        {pointer + 1} / {players.length}
      </div>
    </Screen>
  );
}
