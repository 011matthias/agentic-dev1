import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { CROWN_TITLES } from '../decks';
import type { Title } from '../decks';
import * as M from '../measure';
import { Screen, RosterEditor, RoundFooter, Scoreboard, PassAndPeek, HowToPlay } from '../kernel';
import { Avatar } from '../characters';
import { pick, fmtTime } from '../util';
import { unlockAudio, playChime, playSfx, haptic } from '../audio';
import { tagsFor } from '../types';
import type { Roster } from '../types';

// A glossy 3D-emoji style gold crown, drawn inline so it can drop onto the
// crowned avatar (the .crown-drop keyframes live in styles.css). Gems echo the
// app's pink / teal / purple accents.
function Crown({ size = 58 }: { size?: number }) {
  return (
    <svg
      className="crown"
      width={size}
      height={Math.round(size * 0.74)}
      viewBox="0 0 60 44"
      aria-hidden="true"
    >
      <path
        d="M5 39 L3 13 L18 27 L30 5 L42 27 L57 13 L55 39 Z"
        fill="#ffd24a"
        stroke="#d98a14"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="3" cy="12" r="3.6" fill="#ff7ec9" stroke="#fff7e0" strokeWidth="1.2" />
      <circle cx="30" cy="4" r="4" fill="#5fe0d0" stroke="#fff7e0" strokeWidth="1.2" />
      <circle cx="57" cy="12" r="3.6" fill="#9b8cff" stroke="#fff7e0" strokeWidth="1.2" />
      <circle cx="18" cy="35" r="2.4" fill="#ff7ec9" />
      <circle cx="30" cy="35" r="2.4" fill="#5fe0d0" />
      <circle cx="42" cy="35" r="2.4" fill="#9b8cff" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Crowned. The table crowns one person for an absurd title, then makes them
// defend it. This is the mode that imports the post-reveal VERBAL beat: a 30s
// defence, then a KEEP / DETHRONE vote. Warm because the crown is absurd and
// the defence is the payoff, not a penalty. Badge-only by default; an optional
// toggle adds +1 to the final crown-holder for groups that want a leaderboard.
// ---------------------------------------------------------------------------

type Phase = 'setup' | 'vote' | 'crowned' | 'defence' | 'judge' | 'result';
const MIN_PLAYERS = 3;
const DEFENCE_SECONDS = 30;

export default function Crowned({
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
  const [pointsMode, setPointsMode] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [title, setTitle] = useState<Title>(CROWN_TITLES[0]);
  const [crownedList, setCrownedList] = useState<number[]>([]);
  const [runnerUp, setRunnerUp] = useState<number[]>([]);
  const [crownMargin, setCrownMargin] = useState(0);
  const [finalHolders, setFinalHolders] = useState<number[]>([]);
  const [dethroned, setDethroned] = useState(false);
  const [badges, setBadges] = useState<number[]>([]);
  const [points, setPoints] = useState<number[]>([]);
  const [defenceLeft, setDefenceLeft] = useState(DEFENCE_SECONDS);
  const [banged, setBanged] = useState(false);
  const defenceEndedRef = useRef(false);

  const crownedNames = crownedList.map((i) => players[i]).join(' & ');

  // Defence countdown.
  useEffect(() => {
    if (phase !== 'defence' || defenceLeft <= 0) return;
    const id = setInterval(() => setDefenceLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, defenceLeft]);

  // When the clock runs out, the crown-holder is treated as having defended.
  useEffect(() => {
    if (phase === 'defence' && defenceLeft === 0 && !defenceEndedRef.current) {
      playChime();
      endDefence(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, defenceLeft]);

  // Coronation: a fanfare buzz as the crown begins to drop, then a win sting +
  // hit-stop punch landing with the crown (~0.42s into crown-drop).
  useEffect(() => {
    if (phase !== 'crowned') return;
    haptic([18, 50, 18, 50, 140]);
    const id = window.setTimeout(() => playSfx('success'), 420);
    return () => clearTimeout(id);
  }, [phase]);

  function startGame() {
    M.startSession(tagsFor(roster), 'crowned');
    setBadges(new Array(players.length).fill(0));
    setPoints(new Array(players.length).fill(0));
    setRoundIndex(0);
    beginRound(0);
  }

  function beginRound(idx: number) {
    const t = pick(CROWN_TITLES);
    setTitle(t);
    setCrownedList([]);
    setRunnerUp([]);
    setFinalHolders([]);
    setDethroned(false);
    setBanged(false);
    M.log('round_start', { roundIndex: idx, titleId: t.id });
    setPhase('vote');
  }

  function onVotes(votes: number[]) {
    const tally = new Array(players.length).fill(0);
    votes.forEach((t) => (tally[t] += 1));
    const top = Math.max(...tally);
    const crowned = tally.map((c, i) => (c === top ? i : -1)).filter((i) => i >= 0);
    const restIdx = players.map((_, i) => i).filter((i) => !crowned.includes(i));
    let runner: number[] = [];
    if (restIdx.length) {
      const r = Math.max(...restIdx.map((i) => tally[i]));
      runner = restIdx.filter((i) => tally[i] === r);
    }
    setCrownedList(crowned);
    setRunnerUp(runner);
    setCrownMargin(votes.length ? top / votes.length : 0);
    setPhase('crowned');
  }

  function startDefence() {
    unlockAudio();
    defenceEndedRef.current = false;
    setDefenceLeft(DEFENCE_SECONDS);
    setPhase('defence');
  }

  function endDefence(spoke: boolean) {
    if (defenceEndedRef.current) return;
    defenceEndedRef.current = true;
    M.log('defence_end', { spoke, durationUsed: DEFENCE_SECONDS - defenceLeft });
    setPhase('judge');
  }

  function onJudge(judgements: boolean[]) {
    const keep = judgements.filter(Boolean).length;
    const total = judgements.length;
    const isDethroned = total - keep > keep;
    const holders = isDethroned ? runnerUp : crownedList;
    setDethroned(isDethroned);
    setFinalHolders(holders);
    setBadges((prev) => prev.map((b, i) => b + (holders.includes(i) ? 1 : 0)));
    if (pointsMode) setPoints((prev) => prev.map((p, i) => p + (holders.includes(i) ? 1 : 0)));
    M.markReveal({
      titleId: title.id,
      crownedId: crownedList,
      runnerUpId: runnerUp,
      crownMargin,
      dethroned: isDethroned,
      keepRatio: total ? keep / total : 0,
    });
    setPhase('result');
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
        <h2>Crowned: who's playing?</h2>
        <HowToPlay
          goal="Crown someone for an absurd title, then make them defend it."
          steps={[
            'An absurd title appears. Pass the phone; each person privately votes for who fits it best. Voting for yourself is allowed.',
            'The winner is crowned and gets 30 seconds to plead their case or just accept it.',
            'The room votes to Keep or Dethrone them. If dethroned, the runner-up takes the crown. Hold the crown and you collect the title.',
          ]}
        />
        <RosterEditor roster={roster} setRoster={setRoster} min={MIN_PLAYERS} />
        <div className="field">
          <label>Scoring</label>
          <div className="seg">
            <button className={`seg-btn ${!pointsMode ? 'on' : ''}`} onClick={() => setPointsMode(false)}>
              Titles only
            </button>
            <button className={`seg-btn ${pointsMode ? 'on' : ''}`} onClick={() => setPointsMode(true)}>
              Titles + points
            </button>
          </div>
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
        key={`v${roundIndex}`}
        players={players}
        renderPrivate={(_i, commit) => (
          <>
            <h2 className="prompt-q">Crown one person as the official {title.text}</h2>
            <p className="hint">Tap a name, then hide and pass. Voting for yourself is allowed.</p>
            <div className="vote-grid">
              {players.map((p, i) => (
                <button key={i} className="vote-btn" onClick={() => commit(i)}>
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
        onDone={onVotes}
      />
    );
  }

  if (phase === 'crowned') {
    return (
      <Screen>
        <p className="pass-label">The crown goes to</p>
        <div className="crown-stage hitstop" style={{ '--hitstop-delay': '0.42s' } as CSSProperties}>
          {crownedList.map((i) => (
            <div className="crowned-one" key={i}>
              <Crown />
              <Avatar index={i} size={104} ring pop />
              <span className="crowned-name">{players[i]}</span>
            </div>
          ))}
        </div>
        <p className="confess-prompt center">Official {title.text}</p>
        <p className="hint">{Math.round(crownMargin * 100)}% of the room agreed.</p>
        <button className="btn btn-primary" onClick={startDefence}>
          Defend it ({DEFENCE_SECONDS}s)
        </button>
      </Screen>
    );
  }

  if (phase === 'defence') {
    return (
      <Screen>
        <p className="pass-label">{crownedNames} defends</p>
        <div className={`timer ${defenceLeft === 0 ? 'timer-done' : defenceLeft <= 5 ? 'timer-low' : ''}`} role="timer" aria-live="polite">
          {fmtTime(defenceLeft)}
        </div>
        <p className="tagline">Plead your case for the title, or just accept the crown.</p>
        <button className="btn btn-secondary" onClick={() => endDefence(true)}>
          Rest my case
        </button>
        <button className="btn btn-primary" onClick={() => endDefence(false)}>
          Accept the crown
        </button>
      </Screen>
    );
  }

  if (phase === 'judge') {
    return (
      <PassAndPeek<boolean>
        key={`j${roundIndex}`}
        players={players}
        passVerb="Vote: pass to"
        renderPrivate={(_i, commit) => (
          <>
            <h2 className="prompt-q">Keep {crownedNames} as {title.text}?</h2>
            <div className="opt-list two">
              <button className="opt-btn side-yes" onClick={() => commit(true)}>
                Keep
              </button>
              <button className="opt-btn side-no" onClick={() => commit(false)}>
                Dethrone
              </button>
            </div>
          </>
        )}
        onDone={onJudge}
      />
    );
  }

  // result
  const finalNames = finalHolders.map((i) => players[i]).join(' & ');
  return (
    <Screen scroll>
      <p className="pass-label">Crowned</p>
      {finalHolders.length ? (
        <>
          <div className={`verdict verdict-in ${dethroned ? 'bad' : 'good'}`}>
            {dethroned ? 'Dethroned!' : 'The crown holds'}
          </div>
          <div className="pass-name">{finalNames}</div>
          <p className="confess-prompt center">Official {title.text}</p>
        </>
      ) : (
        <div className="verdict verdict-in bad">The crown went vacant</div>
      )}

      <div className="stat-section-label">Titles held</div>
      <Scoreboard players={players} scores={badges} unit="titles" />
      {pointsMode && (
        <>
          <div className="stat-section-label">Points</div>
          <Scoreboard players={players} scores={points} />
        </>
      )}

      <RoundFooter banged={banged} onBang={() => { if (!banged) { setBanged(true); M.markBanger(roundIndex); } }} onNext={nextRound} onEnd={endGame} nextLabel="Next title" />
    </Screen>
  );
}
