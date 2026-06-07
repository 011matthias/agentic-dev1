import { useEffect, useState } from 'react';
import { HIVE_TAKES } from '../decks';
import type { Take } from '../decks';
import * as M from '../measure';
import type { CSSProperties } from 'react';
import { Screen, RosterEditor, RoundFooter, Scoreboard, PassAndPeek, HowToPlay } from '../kernel';
import { pick } from '../util';
import { unlockAudio, playSfx, haptic } from '../audio';
import { tagsFor } from '../types';
import type { Roster } from '../types';

// ---------------------------------------------------------------------------
// Hive Mind. Stop thinking what you think, think what the room thinks. Draw a
// take, everyone taps a side, +1 to everyone on the BIGGER side. Rewarding the
// majority is the counterintuitive warm move: your honest answer never costs
// you, and the argument that produces IS the game. The Black Sheep deck inverts
// it (the minority scores) for the Wild crowd.
// ---------------------------------------------------------------------------

type Phase = 'setup' | 'vote' | 'reveal';
const MIN_PLAYERS = 3;
const SIDES = ['Yes', 'No'];

export default function HiveMind({
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
  const [inverted, setInverted] = useState(false); // Black Sheep deck
  const [roundIndex, setRoundIndex] = useState(0);
  const [take, setTake] = useState<Take>(HIVE_TAKES[0]);
  const [sides, setSides] = useState<number[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [banged, setBanged] = useState(false);

  // A thud as the split bars slam out, then a pop + hit-stop as the winning
  // count punches in (~0.45s, matching the .split-num.win pop-in).
  useEffect(() => {
    if (phase !== 'reveal') return;
    haptic([22, 30, 60]);
    const id = window.setTimeout(() => playSfx('pop'), 450);
    return () => clearTimeout(id);
  }, [phase]);

  function startGame() {
    unlockAudio();
    M.startSession(tagsFor(roster), 'hivemind');
    setScores(new Array(players.length).fill(0));
    setRoundIndex(0);
    beginRound(0);
  }

  function beginRound(idx: number) {
    const t = pick(HIVE_TAKES);
    setTake(t);
    setSides([]);
    setBanged(false);
    M.log('round_start', { roundIndex: idx, takeId: t.id, inverted });
    setPhase('vote');
  }

  function winningCountOf(counts: number[]): number {
    const nonzero = counts.filter((c) => c > 0);
    return inverted ? Math.min(...nonzero) : Math.max(...counts);
  }

  function onVotes(result: number[]) {
    const counts = [0, 0];
    result.forEach((s) => counts[s]++);
    const winning = winningCountOf(counts);
    setScores((prev) => prev.map((s, i) => s + (counts[result[i]] === winning ? 1 : 0)));
    setSides(result);
    const lo = Math.min(...counts);
    const hi = Math.max(...counts);
    M.markReveal({
      takeId: take.id,
      sideCounts: { Yes: counts[0], No: counts[1] },
      splitRatio: hi ? lo / hi : 0,
      inverted,
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
        <h2>Hive Mind: who's playing?</h2>
        <HowToPlay
          goal="Pick the side you think most of the room will pick."
          steps={[
            "A hot take appears (like 'Pineapple belongs on pizza'). Pass the phone; each person privately taps Yes or No.",
            'The split is revealed.',
            'Everyone on the bigger side scores a point. The Black Sheep deck flips it, so the smaller side scores instead.',
          ]}
        />
        <RosterEditor roster={roster} setRoster={setRoster} min={MIN_PLAYERS} />

        <div className="field">
          <label>Deck</label>
          <div className="seg">
            <button className={`seg-btn ${!inverted ? 'on' : ''}`} onClick={() => setInverted(false)}>
              Hive Mind
            </button>
            <button className={`seg-btn ${inverted ? 'on' : ''}`} onClick={() => setInverted(true)}>
              Black Sheep
            </button>
          </div>
          <p className="hint">
            {inverted
              ? 'The MINORITY side scores. Be the odd one out.'
              : 'The BIGGER side scores. Being basic is the winning play.'}
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

  if (phase === 'vote') {
    return (
      <PassAndPeek<number>
        key={roundIndex}
        players={players}
        renderPrivate={(_i, commit) => (
          <>
            <h2 className="prompt-q">{take.text}</h2>
            <p className="hint">Tap your side, then hide and pass.</p>
            <div className="opt-list two">
              <button className="opt-btn side-yes" onClick={() => commit(0)}>
                Yes
              </button>
              <button className="opt-btn side-no" onClick={() => commit(1)}>
                No
              </button>
            </div>
          </>
        )}
        onDone={onVotes}
      />
    );
  }

  // reveal: split bar
  const counts = [0, 0];
  sides.forEach((s) => counts[s]++);
  const n = players.length;
  const winning = winningCountOf(counts);
  return (
    <Screen scroll>
      <p className="pass-label">{inverted ? 'Black Sheep' : 'Hive Mind'}</p>
      <h2 className="prompt-q">{take.text}</h2>

      <div className="split hitstop" style={{ '--hitstop-delay': '0.45s' } as CSSProperties}>
        {SIDES.map((label, si) => (
          <div key={si} className="split-row">
            <span className="split-label">{label}</span>
            <div className="split-track">
              <div
                className={`split-fill ${counts[si] === winning && counts[si] > 0 ? 'win' : ''}`}
                style={{ width: `${n ? (counts[si] / n) * 100 : 0}%` }}
              />
            </div>
            <span className={`split-num ${counts[si] === winning && counts[si] > 0 ? 'win' : ''}`}>
              {counts[si]}
            </span>
          </div>
        ))}
      </div>
      <p className="hint">
        {inverted ? 'Minority' : 'Majority'} side scored. {counts[0] === counts[1] ? 'Dead even, everyone scores.' : ''}
      </p>

      <Scoreboard players={players} scores={scores} />

      <RoundFooter banged={banged} onBang={() => { if (!banged) { setBanged(true); M.markBanger(roundIndex); } }} onNext={nextRound} onEnd={endGame} />
    </Screen>
  );
}
