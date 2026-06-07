import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { SYNC_PROMPTS } from '../decks';
import type { OptionPrompt } from '../decks';
import * as M from '../measure';
import { Screen, RosterEditor, RoundFooter, Scoreboard, PassAndPeek, HowToPlay } from '../kernel';
import { Avatar } from '../characters';
import { pick } from '../util';
import { unlockAudio, playSfx, haptic } from '../audio';
import { tagsFor } from '../types';
import type { Roster } from '../types';

// ---------------------------------------------------------------------------
// Sync. Prove the room thinks alike, and find where it secretly doesn't.
// Everyone privately picks one option; the reveal clusters the picks. The
// scoring TOGGLE is the mode, not a setting:
//   Co-op   -> one room score (how many sat in a cluster of >=2), warm on-ramp.
//   Versus  -> +1 per OTHER player who shares your pick, keeps it sweaty.
// Default Co-op: it can't go wrong in a cold room.
// ---------------------------------------------------------------------------

type Phase = 'setup' | 'pick' | 'reveal';
type ScoringMode = 'coop' | 'versus';
const MIN_PLAYERS = 3;

function coopLabel(matched: number, n: number): string {
  if (matched === 0) return 'Total strangers';
  const frac = matched / n;
  if (frac <= 0.34) return 'A couple of kindred spirits';
  if (frac <= 0.5) return 'Some common ground';
  if (frac <= 0.74) return 'On the same wavelength';
  if (frac < 1) return 'Almost one brain';
  return 'HIVE MIND';
}

export default function Sync({
  roster,
  setRoster,
  onExitToStats,
  onExitToHome,
}: {
  roster: Roster;
  setRoster: (r: Roster) => void;
  onExitToStats: () => void;
  onExitToHome: () => void;
}) {
  const players = roster.players;
  const [phase, setPhase] = useState<Phase>('setup');
  const [scoringMode, setScoringMode] = useState<ScoringMode>('coop');
  const [roundIndex, setRoundIndex] = useState(0);
  const [prompt, setPrompt] = useState<OptionPrompt>(SYNC_PROMPTS[0]);
  const [picks, setPicks] = useState<number[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [roomScore, setRoomScore] = useState(0);
  const [roundMatched, setRoundMatched] = useState(0);
  const [banged, setBanged] = useState(false);

  // Soft buzz as the clusters fly in, then a pop + hit-stop as the top cluster
  // snaps together (~0.3s into the magnetize stagger).
  useEffect(() => {
    if (phase !== 'reveal') return;
    haptic([14, 40, 26]);
    const id = window.setTimeout(() => playSfx('pop'), 300);
    return () => clearTimeout(id);
  }, [phase]);

  function startGame() {
    unlockAudio();
    M.startSession(tagsFor(roster), 'sync');
    setScores(new Array(players.length).fill(0));
    setRoomScore(0);
    setRoundIndex(0);
    beginRound(0);
  }

  function beginRound(idx: number) {
    const p = pick(SYNC_PROMPTS);
    setPrompt(p);
    setPicks([]);
    setBanged(false);
    M.log('round_start', { roundIndex: idx, promptId: p.id, scoringMode });
    setPhase('pick');
  }

  function onPicks(result: number[]) {
    const counts = new Map<number, number>();
    result.forEach((o) => counts.set(o, (counts.get(o) ?? 0) + 1));
    const top = Math.max(...counts.values());
    const n = players.length;
    let matched = 0;
    result.forEach((o) => {
      if ((counts.get(o) ?? 0) >= 2) matched++;
    });
    if (scoringMode === 'versus') {
      setScores((prev) => prev.map((s, i) => s + ((counts.get(result[i]) ?? 1) - 1)));
    } else {
      setRoomScore((prev) => prev + matched);
    }
    setRoundMatched(matched);
    setPicks(result);
    const clusters = [...counts.entries()].map(([o, c]) => ({ option: prompt.options[o], count: c }));
    M.markReveal({
      promptId: prompt.id,
      clusters,
      topClusterSize: top,
      matchRate: top / n,
      matchedCount: matched,
      scoringMode,
    });
    setPhase('reveal');
  }

  function nextRound() {
    M.markNextRound();
    const idx = roundIndex + 1;
    setRoundIndex(idx);
    beginRound(idx);
  }

  function endGame() {
    M.log('session_end', { ...M.currentStats() });
    onExitToStats();
  }

  // -------------------------------------------------------------------------

  if (phase === 'setup') {
    return (
      <Screen scroll>
        <h2>Sync: who's playing?</h2>
        <HowToPlay
          goal="Answer the same question as everyone else and see how often you match."
          steps={[
            'Pass the phone around. Each person privately picks one option for the prompt, then hides it.',
            "Everyone's picks are revealed, grouped by what they chose.",
            'Co-op: the whole table scores together for landing in the same group, no loser. Versus: you score for every other person who picked the same as you.',
          ]}
        />
        <RosterEditor roster={roster} setRoster={setRoster} min={MIN_PLAYERS} />

        <div className="field">
          <label>Scoring (this is the mode)</label>
          <div className="seg">
            <button
              className={`seg-btn ${scoringMode === 'coop' ? 'on' : ''}`}
              onClick={() => setScoringMode('coop')}
            >
              Co-op
            </button>
            <button
              className={`seg-btn ${scoringMode === 'versus' ? 'on' : ''}`}
              onClick={() => setScoringMode('versus')}
            >
              Versus
            </button>
          </div>
          <p className="hint">
            {scoringMode === 'coop'
              ? 'The whole table scores together for matching. Warm, no loser.'
              : '+1 for every other player who shares your pick. Sweaty.'}
          </p>
        </div>

        <button className="btn btn-primary" disabled={players.length < MIN_PLAYERS} onClick={startGame}>
          {players.length < MIN_PLAYERS ? `Add ${MIN_PLAYERS - players.length} more` : 'Start'}
        </button>
        <button className="btn btn-ghost" onClick={onExitToHome}>
          Back
        </button>
      </Screen>
    );
  }

  if (phase === 'pick') {
    return (
      <PassAndPeek<number>
        key={roundIndex}
        players={players}
        renderPrivate={(_i, commit) => (
          <>
            <h2 className="prompt-q">{prompt.text}</h2>
            <p className="hint">Tap your pick, then hide and pass.</p>
            <div className="opt-list">
              {prompt.options.map((o, oi) => (
                <button key={oi} className="opt-btn" onClick={() => commit(oi)}>
                  {o}
                </button>
              ))}
            </div>
          </>
        )}
        onDone={onPicks}
      />
    );
  }

  // reveal: cluster view
  const groups = new Map<number, number[]>();
  picks.forEach((o, pi) => {
    const arr = groups.get(o) ?? [];
    arr.push(pi);
    groups.set(o, arr);
  });
  const entries = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  const top = entries[0]?.[1].length ?? 0;

  return (
    <Screen scroll>
      <p className="pass-label">Sync</p>
      <h2 className="prompt-q">{prompt.text}</h2>

      <div className="clusters">
        {entries.map(([o, members]) => {
          const isTop = members.length === top && top >= 2;
          return (
          <div
            key={o}
            className={`cluster ${isTop ? 'top hitstop' : ''}`}
            style={isTop ? ({ '--hitstop-delay': '0.3s' } as CSSProperties) : undefined}
          >
            <div className="cluster-head">
              <span className="cluster-opt">{prompt.options[o]}</span>
              <span className="cluster-count">{members.length}</span>
            </div>
            <div className="cluster-chips">
              {members.map((pi, mi) => {
                // Deterministic scatter (golden-angle) so each avatar flies in
                // from its own direction and snaps to the cluster.
                const ang = (pi * 137.5 * Math.PI) / 180;
                return (
                  <span
                    className="chip chip-mag"
                    key={pi}
                    style={
                      {
                        '--mx': `${Math.round(Math.cos(ang) * 42)}px`,
                        '--my': `${Math.round(Math.sin(ang) * 30)}px`,
                        '--mag-delay': `${mi * 55}ms`,
                      } as CSSProperties
                    }
                  >
                    <Avatar index={pi} size={24} ring />
                    {players[pi]}
                  </span>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>

      {scoringMode === 'coop' ? (
        <div className="coop-score">
          <div className="coop-label">{coopLabel(roundMatched, players.length)}</div>
          <div className="coop-detail">
            {roundMatched} of {players.length} matched this round · room total {roomScore}
          </div>
        </div>
      ) : (
        <Scoreboard players={players} scores={scores} />
      )}

      <RoundFooter banged={banged} onBang={() => { if (!banged) { setBanged(true); M.markBanger(roundIndex); } }} onNext={nextRound} onEnd={endGame} />
    </Screen>
  );
}
