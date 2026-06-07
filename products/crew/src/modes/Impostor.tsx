import { useEffect, useRef, useState } from 'react';
import { WORDS, CATEGORIES } from '../words';
import * as M from '../measure';
import { Screen, RosterEditor, RoundFooter, Scoreboard, HowToPlay, HoldToReveal } from '../kernel';
import { Avatar } from '../characters';
import { fireConfetti } from '../confetti';
import { shuffle, fmtTime } from '../util';
import { unlockAudio, playChime, playSfx, haptic } from '../audio';
import { tagsFor } from '../types';
import type { Roster } from '../types';

// ---------------------------------------------------------------------------
// Impostor (flagship). Everyone gets the secret word except the impostor(s);
// the table argues, votes, and the reveal is the payoff. This is the original
// phase-1 prototype, lifted intact into the multi-mode shell. It keeps its own
// mid-game snapshot/resume (a passed phone gets locked and fat-fingered; losing
// the round to that is the worst feeling in a party game).
// ---------------------------------------------------------------------------

type Phase = 'setup' | 'deal' | 'discuss' | 'vote' | 'reveal';

const MIN_PLAYERS = 4;
const GAME_KEY = 'crew_game_v1';
const MID_GAME: Phase[] = ['deal', 'discuss', 'vote', 'reveal'];

export interface ImpostorSnapshot {
  v: number;
  phase: Phase;
  players: string[];
  ageBand: string;
  relationship: string;
  impostorCount: number;
  discussSeconds: number;
  category: string;
  roundIndex: number;
  word: string;
  roundCategory: string;
  impostors: number[];
  dealPointer: number;
  accused: number | null;
  scores: number[];
  banged: boolean;
  timeLeft: number;
  sessionStart: number;
}

export function loadImpostorSnapshot(): ImpostorSnapshot | null {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as ImpostorSnapshot;
    if (s && s.v === 1 && MID_GAME.includes(s.phase) && Array.isArray(s.players)) return s;
  } catch {
    /* corrupt snapshot: ignore */
  }
  return null;
}

export function clearImpostorSnapshot(): void {
  try {
    localStorage.removeItem(GAME_KEY);
  } catch {
    /* ignore */
  }
}

export default function Impostor({
  roster,
  setRoster,
  onExitToStats,
  onExitToHome,
  resume,
}: {
  roster: Roster;
  setRoster: (r: Roster) => void;
  onExitToStats: () => void;
  onExitToHome: () => void;
  resume?: ImpostorSnapshot | null;
}) {
  const r = resume ?? null;
  const [phase, setPhase] = useState<Phase>(r ? r.phase : 'setup');

  // Impostor-specific setup (roster names + tags live in the shared roster).
  const [impostorCount, setImpostorCount] = useState(r ? r.impostorCount : 1);
  const [discussSeconds, setDiscussSeconds] = useState(r ? r.discussSeconds : 120);
  const [category, setCategory] = useState(r ? r.category : 'all');

  // round
  const [roundIndex, setRoundIndex] = useState(r ? r.roundIndex : 0);
  const [word, setWord] = useState(r ? r.word : '');
  const [roundCategory, setRoundCategory] = useState(r ? r.roundCategory : '');
  const [impostors, setImpostors] = useState<number[]>(r ? r.impostors : []);
  const [dealPointer, setDealPointer] = useState(r ? r.dealPointer : 0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [accused, setAccused] = useState<number | null>(r ? r.accused : null);
  const [scores, setScores] = useState<number[]>(r ? r.scores : []);
  const [banged, setBanged] = useState(r ? r.banged : false);
  const [timeLeft, setTimeLeft] = useState(r ? r.timeLeft : 0);
  const [paused, setPaused] = useState(r ? r.phase === 'discuss' : false);
  const alarmedRef = useRef(false);

  // On resume, re-attach the measurement session so events append in place.
  useEffect(() => {
    if (r) {
      M.resumeSession(r.sessionStart, 'impostor');
      unlockAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const players = roster.players;

  useEffect(() => {
    if (phase !== 'discuss' || paused || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [phase, paused, timeLeft]);

  // Fire the alarm exactly once when the discussion clock reaches zero.
  useEffect(() => {
    if (phase !== 'discuss') {
      alarmedRef.current = false;
      return;
    }
    if (timeLeft === 0 && !alarmedRef.current) {
      alarmedRef.current = true;
      playChime();
    }
  }, [phase, timeLeft]);

  // Snapshot the round on every change; clear it the moment we leave the game.
  useEffect(() => {
    if (MID_GAME.includes(phase)) {
      const snap: ImpostorSnapshot = {
        v: 1,
        phase,
        players,
        ageBand: roster.ageBand,
        relationship: roster.relationship,
        impostorCount,
        discussSeconds,
        category,
        roundIndex,
        word,
        roundCategory,
        impostors,
        dealPointer,
        accused,
        scores,
        banged,
        timeLeft,
        sessionStart: M.getSessionStart(),
      };
      try {
        localStorage.setItem(GAME_KEY, JSON.stringify(snap));
      } catch {
        /* storage full / unavailable: resume simply won't be offered */
      }
    } else {
      clearImpostorSnapshot();
    }
  }, [
    phase,
    players,
    roster.ageBand,
    roster.relationship,
    impostorCount,
    discussSeconds,
    category,
    roundIndex,
    word,
    roundCategory,
    impostors,
    dealPointer,
    accused,
    scores,
    banged,
    timeLeft,
  ]);

  function startGame() {
    unlockAudio();
    M.startSession(tagsFor(roster), 'impostor');
    setScores(new Array(players.length).fill(0));
    setRoundIndex(0);
    beginRound(0);
  }

  function beginRound(idx: number) {
    const pool = category === 'all' ? WORDS : WORDS.filter((w) => w.category === category);
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const maxImps = Math.max(1, players.length - 2);
    const imps = shuffle(players.map((_, i) => i)).slice(0, Math.min(impostorCount, maxImps));
    setWord(picked.word);
    setRoundCategory(picked.category);
    setImpostors(imps);
    setDealPointer(0);
    setCardFlipped(false);
    setAccused(null);
    setBanged(false);
    setPaused(false);
    M.log('round_start', {
      roundIndex: idx,
      word: picked.word,
      category: picked.category,
      impostorCount: imps.length,
    });
    setPhase('deal');
  }

  function advanceDeal() {
    unlockAudio();
    if (dealPointer + 1 < players.length) {
      setDealPointer((p) => p + 1);
      setCardFlipped(false);
    } else {
      M.log('deal_done');
      M.log('discuss_start');
      setTimeLeft(discussSeconds);
      setPhase('discuss');
    }
  }

  function callVote() {
    M.log('discuss_end', { remainingSec: timeLeft });
    setPhase('vote');
  }

  function castVote(i: number) {
    const caught = impostors.includes(i);
    setAccused(i);
    // The signature reveal: a one-shot sting at the verdict (the .hitstop wrapper
    // punches in sync). Caught -> win arpeggio + confetti; got away -> womp + a
    // longer buzz.
    if (caught) {
      fireConfetti();
      playSfx('success');
      haptic([30, 40, 140]);
    } else {
      playSfx('fail');
      haptic(220);
    }
    M.log('vote_cast', { accusedIndex: i, caught });
    setScores((prev) => {
      const next = [...prev];
      if (caught) {
        players.forEach((_, idx) => {
          if (!impostors.includes(idx)) next[idx] += 1;
        });
      } else {
        impostors.forEach((idx) => {
          next[idx] += 2;
        });
      }
      return next;
    });
    M.markReveal({ word, category: roundCategory, caught });
    setPhase('reveal');
  }

  function tapBanger() {
    if (banged) return;
    setBanged(true);
    M.markBanger(roundIndex);
  }

  function nextRound() {
    M.markNextRound();
    const idx = roundIndex + 1;
    setRoundIndex(idx);
    beginRound(idx);
  }

  function endGame() {
    M.log('session_end', { ...M.currentStats() });
    clearImpostorSnapshot();
    onExitToStats();
  }

  // -------------------------------------------------------------------------

  if (phase === 'setup') {
    const tooMany = impostorCount > players.length - 2;
    return (
      <Screen scroll>
        <h2>Impostor: who's playing?</h2>
        <HowToPlay
          goal="Find the impostor who doesn't know the secret word."
          steps={[
            'Pass the phone around. Everyone secretly sees the same word, except one person who is told they are the impostor.',
            'Go around the circle and each say one clue about the word out loud. The impostor has to bluff without knowing it.',
            'When the timer ends, talk it over and vote for who you think is faking.',
            'Catch the impostor and the group scores. If the impostor survives the vote, they score instead.',
          ]}
        />
        <RosterEditor roster={roster} setRoster={setRoster} min={MIN_PLAYERS} />

        <div className="field">
          <label>Impostors</label>
          <div className="seg">
            {[1, 2].map((n) => (
              <button
                key={n}
                className={`seg-btn ${impostorCount === n ? 'on' : ''}`}
                onClick={() => setImpostorCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Category</label>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">Everything</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Discussion timer</label>
          <div className="seg">
            {[90, 120, 180].map((s) => (
              <button
                key={s}
                className={`seg-btn ${discussSeconds === s ? 'on' : ''}`}
                onClick={() => setDiscussSeconds(s)}
              >
                {fmtTime(s)}
              </button>
            ))}
          </div>
        </div>

        {tooMany && (
          <p className="hint warn">Need at least 2 non-impostors. Add more players or fewer impostors.</p>
        )}
        <button
          className="btn btn-primary"
          disabled={players.length < MIN_PLAYERS || tooMany}
          onClick={startGame}
        >
          {players.length < MIN_PLAYERS ? `Add ${MIN_PLAYERS - players.length} more` : 'Deal roles'}
        </button>
        <button className="btn btn-ghost" onClick={onExitToHome}>
          Back
        </button>
      </Screen>
    );
  }

  if (phase === 'deal') {
    const name = players[dealPointer];
    const isImpostor = impostors.includes(dealPointer);
    return (
      <Screen>
        {!cardFlipped ? (
          <>
            <p className="pass-label">Pass the phone to</p>
            <div className="pass-avatar">
              <Avatar key={dealPointer} index={dealPointer} size={148} ring pop />
            </div>
            <div className="pass-name">{name}</div>
            <p className="hint">Don't let anyone else see.</p>
            <HoldToReveal label={`I'm ${name}, hold to reveal`} onReveal={() => setCardFlipped(true)} />
          </>
        ) : (
          <>
            {isImpostor ? (
              <div className="card card-impostor card-flip">
                <div className="card-kicker">your role</div>
                <div className="card-main">YOU ARE THE IMPOSTOR</div>
                <div className="card-sub">You don't know the word. Blend in. Don't get caught.</div>
              </div>
            ) : (
              <div className="card card-word card-flip">
                <div className="card-kicker">{roundCategory}</div>
                <div className="card-main">{word}</div>
                <div className="card-sub">Give clues. Find the impostor who doesn't know it.</div>
              </div>
            )}
            <button className="btn btn-primary" onClick={advanceDeal}>
              Hide &amp; pass
            </button>
          </>
        )}
        <div className="deal-progress">
          {dealPointer + 1} / {players.length}
        </div>
      </Screen>
    );
  }

  if (phase === 'discuss') {
    return (
      <Screen>
        <p className="pass-label">Discuss</p>
        <div
          className={`timer ${timeLeft === 0 ? 'timer-done' : timeLeft <= 10 ? 'timer-low' : ''}`}
          role="timer"
          aria-live="polite"
        >
          {fmtTime(timeLeft)}
        </div>
        <p className="tagline">
          Go around the circle. Each person says one clue about the word. The impostor is faking it,
          listen for who's vague.
        </p>
        <div className="timer-controls">
          <button
            className="btn btn-secondary"
            onClick={() => setPaused((p) => !p)}
            disabled={timeLeft === 0}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              alarmedRef.current = false;
              setTimeLeft((t) => t + 30);
            }}
          >
            +30s
          </button>
        </div>
        <button className="btn btn-primary" onClick={callVote}>
          {timeLeft === 0 ? "Time's up, vote" : 'Call the vote'}
        </button>
      </Screen>
    );
  }

  if (phase === 'vote') {
    return (
      <Screen scroll>
        <h2>Who's the impostor?</h2>
        <p className="hint">Talk it out, then tap who the group accuses.</p>
        <div className="vote-grid">
          {players.map((p, i) => (
            <button key={i} className="vote-btn" onClick={() => castVote(i)}>
              <Avatar index={i} size={48} ring />
              <span>{p}</span>
            </button>
          ))}
        </div>
      </Screen>
    );
  }

  // reveal
  const caught = accused !== null && impostors.includes(accused);
  const impostorNames = impostors.map((i) => players[i]).join(', ');
  return (
    <Screen scroll>
      <div className="reveal-stage hitstop">
        <div className={`verdict verdict-in ${caught ? 'good' : 'bad'}`}>
          {caught ? 'Caught!' : 'They got away'}
        </div>
        <div className={`reveal-avatar ${caught ? '' : 'shake'}`}>
          {impostors.map((i) => (
            <Avatar key={i} index={i} size={116} ring />
          ))}
        </div>
      </div>
      <p className="reveal-line">
        The impostor was <strong>{impostorNames}</strong>.
      </p>
      <p className="reveal-line">
        The word was <strong>{word}</strong>.
      </p>

      <Scoreboard players={players} scores={scores} />

      <RoundFooter banged={banged} onBang={tapBanger} onNext={nextRound} onEnd={endGame} />
    </Screen>
  );
}
