import { useEffect, useState } from 'react';
import { CONFESSION_PROMPTS } from '../decks';
import type { Confession } from '../decks';
import * as M from '../measure';
import { Screen, RosterEditor, RoundFooter, Scoreboard, HowToPlay, PassAndPeek, CountVal } from '../kernel';
import { pick, prefersReducedMotion } from '../util';
import { unlockAudio, playSfx, haptic } from '../audio';
import { tagsFor } from '../types';
import type { Roster } from '../types';

const COUNT_MS = 1300;

// ---------------------------------------------------------------------------
// Confessions / Guess the Count. Find out how wild the room is without anyone
// admitting which one they are. Each player FIRST privately guesses how many
// will say yes, THEN privately answers yes/no. The reveal is a COUNT ONLY
// ("4 of 7"), never a per-name breakdown; closest guesser(s) score.
//
// ANONYMITY IS THE MECHANIC and it is enforced in the data layer: the per-player
// yes/no answers are reduced to a count the instant the round closes and are
// NEVER stored in state, localStorage, or the log. Only yesCount + N leave this
// function. (See measure.ts anonymity rule.)
// ---------------------------------------------------------------------------

type Phase = 'setup' | 'guess' | 'answer' | 'reveal';
const MIN_PLAYERS = 3;

function CountStepper({ max, prompt, onLock }: { max: number; prompt: string; onLock: (n: number) => void }) {
  const [v, setV] = useState(Math.round(max / 2));
  return (
    <>
      <h2 className="prompt-q">How many will say yes?</h2>
      <p className="confess-prompt">Someone who {prompt}</p>
      <div className="stepper">
        <button className="step-btn" onClick={() => setV((x) => Math.max(0, x - 1))}>
          &minus;
        </button>
        <div className="step-val">{v}</div>
        <button className="step-btn" onClick={() => setV((x) => Math.min(max, x + 1))}>
          +
        </button>
      </div>
      <p className="hint">Out of {max}. Lock it in privately.</p>
      <button className="btn btn-primary" onClick={() => onLock(v)}>
        Lock and pass
      </button>
    </>
  );
}

export default function Confessions({
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
  const n = players.length;
  const [phase, setPhase] = useState<Phase>('setup');
  const [roundIndex, setRoundIndex] = useState(0);
  const [prompt, setPrompt] = useState<Confession>(CONFESSION_PROMPTS[0]);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [yesCount, setYesCount] = useState(0);
  const [closest, setClosest] = useState<number[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [banged, setBanged] = useState(false);

  // The count ticks up under rising ticks (CountVal sound), then lands with a
  // pop + thump as the .count-suspense scale punch fires. Under reduced motion
  // the number snaps, so the landing fires at once.
  useEffect(() => {
    if (phase !== 'reveal') return;
    const land = () => {
      playSfx('pop');
      haptic([12, 30, 90]);
    };
    if (prefersReducedMotion()) {
      land();
      return;
    }
    const id = window.setTimeout(land, COUNT_MS);
    return () => clearTimeout(id);
  }, [phase]);

  function startGame() {
    unlockAudio();
    M.startSession(tagsFor(roster), 'confessions');
    setScores(new Array(n).fill(0));
    setRoundIndex(0);
    beginRound(0);
  }

  function beginRound(idx: number) {
    const p = pick(CONFESSION_PROMPTS);
    setPrompt(p);
    setGuesses([]);
    setClosest([]);
    setBanged(false);
    M.log('round_start', { roundIndex: idx, promptId: p.id });
    setPhase('guess');
  }

  function onGuesses(result: number[]) {
    setGuesses(result);
    setPhase('answer');
  }

  // Reduce answers to a COUNT immediately. `result` (the per-player yes/no
  // vector) is read once here and then dropped: it is never set into state or
  // passed to the log. Only the aggregate survives.
  function onAnswers(result: boolean[]) {
    const yes = result.filter(Boolean).length;
    const errors = guesses.map((g) => Math.abs(g - yes));
    const minErr = Math.min(...errors);
    const closestIdx = errors.map((e, i) => (e === minErr ? i : -1)).filter((i) => i >= 0);
    setScores((prev) => prev.map((s, i) => s + (errors[i] === minErr ? 1 : 0)));
    const meanErr = errors.reduce((a, b) => a + b, 0) / (errors.length || 1);
    setYesCount(yes);
    setClosest(closestIdx);
    M.markReveal({
      promptId: prompt.id,
      yesCount: yes,
      N: n,
      yesRate: n ? yes / n : 0,
      guessError: meanErr,
      closest: closestIdx,
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
        <h2>Confessions: who's playing?</h2>
        <p className="hint">Answers stay anonymous. Only the count is ever shown.</p>
        <HowToPlay
          goal="Find out how wild the room is, without anyone admitting which one they are."
          steps={[
            "A prompt appears (like 'Someone who has texted an ex this year'). First, pass the phone and each person privately guesses how many people will say yes.",
            'Pass it again. Each person privately answers yes or no.',
            'Only the total is revealed (like 4 of 7), never who said what. Whoever guessed the total closest scores.',
          ]}
        />
        <RosterEditor roster={roster} setRoster={setRoster} min={MIN_PLAYERS} />
        <button className="btn btn-primary" disabled={n < MIN_PLAYERS} onClick={startGame}>
          {n < MIN_PLAYERS ? `Add ${MIN_PLAYERS - n} more` : 'Start'}
        </button>
        <button className="btn btn-ghost" onClick={onExitToHome}>
          Back
        </button>
      </Screen>
    );
  }

  if (phase === 'guess') {
    return (
      <PassAndPeek<number>
        key={`g${roundIndex}`}
        players={players}
        renderPrivate={(i, commit) => <CountStepper key={i} max={n} prompt={prompt.text} onLock={commit} />}
        onDone={onGuesses}
      />
    );
  }

  if (phase === 'answer') {
    return (
      <PassAndPeek<boolean>
        key={`a${roundIndex}`}
        players={players}
        passVerb="Now pass back to"
        renderPrivate={(_i, commit) => (
          <>
            <h2 className="prompt-q">Is this you? (stays secret)</h2>
            <p className="confess-prompt">Someone who {prompt.text}</p>
            <div className="opt-list two">
              <button className="opt-btn side-yes" onClick={() => commit(true)}>
                Yes
              </button>
              <button className="opt-btn side-no" onClick={() => commit(false)}>
                No
              </button>
            </div>
            <p className="hint">Only the count is revealed. Never who.</p>
          </>
        )}
        onDone={onAnswers}
      />
    );
  }

  // reveal: count only, no names
  return (
    <Screen scroll>
      <p className="pass-label">Confessions</p>
      <div className="count-reveal verdict-in">
        <span className="count-suspense">
          <CountVal value={yesCount} durationMs={COUNT_MS} sound />
        </span>{' '}
        <span className="count-of">of {n}</span>
      </div>
      <p className="reveal-line">said yes to:</p>
      <p className="confess-prompt center">Someone who {prompt.text}</p>

      <p className="reveal-line">
        Closest guess: <strong>{closest.map((i) => players[i]).join(', ')}</strong>
      </p>
      <Scoreboard players={players} scores={scores} />

      <RoundFooter banged={banged} onBang={() => { if (!banged) { setBanged(true); M.markBanger(roundIndex); } }} onNext={nextRound} onEnd={endGame} />
    </Screen>
  );
}
