import { useEffect, useState } from 'react';
import * as M from './measure';
import { Screen, Stat, useButtonJuice } from './kernel';
import { Avatar, HOST, characterFor } from './characters';
import type { Mode, Roster } from './types';

// Which cast face peeks out of each mode card on the home screen.
const MODE_AV: Record<Mode, number> = { impostor: 0, sync: 1, hivemind: 5, confessions: 2, crowned: 3 };
import Impostor, { loadImpostorSnapshot, type ImpostorSnapshot } from './modes/Impostor';
import Sync from './modes/Sync';
import HiveMind from './modes/HiveMind';
import Confessions from './modes/Confessions';
import Crowned from './modes/Crowned';

// ---------------------------------------------------------------------------
// Top-level shell. CREW is one pass-and-peek grammar with several modes; this
// routes between the mode picker, a running mode, and the shared Session-data
// screen. The roster (names + group tags) is lifted here so a group that
// switches modes doesn't re-enter every name, and it survives a reload.
// ---------------------------------------------------------------------------

type Route =
  | { screen: 'home' }
  | { screen: 'stats' }
  | { screen: 'mode'; mode: Mode; resume: ImpostorSnapshot | null };

const ROSTER_KEY = 'crew_roster_v1';

function loadRoster(): Roster {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (raw) {
      const r = JSON.parse(raw);
      if (r && Array.isArray(r.players)) {
        return { players: r.players, ageBand: r.ageBand ?? 'mixed', relationship: r.relationship ?? 'close friends' };
      }
    }
  } catch {
    /* ignore */
  }
  return { players: [], ageBand: 'mixed', relationship: 'close friends' };
}

const MODES: { id: Mode; name: string; blurb: string }[] = [
  { id: 'impostor', name: 'Impostor', blurb: 'Everyone gets a secret word, except one faker. Find them.' },
  { id: 'sync', name: 'Sync', blurb: 'Everyone answers the same question. See how often you match.' },
  { id: 'hivemind', name: 'Hive Mind', blurb: 'Vote on a hot take. Go with the crowd to score.' },
  { id: 'confessions', name: 'Confessions', blurb: 'Anonymous yes or no questions. Guess how many said yes.' },
  { id: 'crowned', name: 'Crowned', blurb: 'Vote someone an absurd title, then they defend it.' },
];

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: 'home' });
  const [roster, setRoster] = useState<Roster>(loadRoster);
  const [resumeSnap, setResumeSnap] = useState<ImpostorSnapshot | null>(() => loadImpostorSnapshot());

  // Arm the global button juice (press-squash + tap SFX + haptic on every button).
  useButtonJuice();

  useEffect(() => {
    try {
      localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
    } catch {
      /* ignore */
    }
  }, [roster]);

  function openMode(mode: Mode) {
    setResumeSnap(null);
    setRoute({ screen: 'mode', mode, resume: null });
  }
  function openResume() {
    const snap = resumeSnap;
    setResumeSnap(null);
    setRoute({ screen: 'mode', mode: 'impostor', resume: snap });
  }

  // -------------------------------------------------------------------------

  if (route.screen === 'mode') {
    const common = {
      roster,
      setRoster,
      onExitToStats: () => setRoute({ screen: 'stats' }),
      onExitToHome: () => setRoute({ screen: 'home' }),
    };
    switch (route.mode) {
      case 'impostor':
        return <Impostor {...common} resume={route.resume} />;
      case 'sync':
        return <Sync {...common} />;
      case 'hivemind':
        return <HiveMind {...common} />;
      case 'confessions':
        return <Confessions {...common} />;
      case 'crowned':
        return <Crowned {...common} />;
    }
  }

  if (route.screen === 'stats') {
    return <StatsScreen onHome={() => setRoute({ screen: 'home' })} />;
  }

  // home: mode picker
  return (
    <Screen scroll>
      <div className="hero">
        <h1 className="logo">CREW</h1>
        <div className="subtitle">Party modes</div>
        <p className="tagline">One phone. Pass it around. Pick a mode and play.</p>
      </div>

      <div className="host-greet">
        <Avatar char={HOST} size={48} ring />
        <span className="host-line">
          Hi, I'm <strong>{HOST.name}</strong>. Pick a mode and I'll explain it. Tap "How to play" on
          any mode.
        </span>
      </div>

      {resumeSnap && (
        <button className="btn btn-primary" onClick={openResume}>
          Resume Impostor game
        </button>
      )}

      <div className="mode-list">
        {MODES.map((m) => (
          <button key={m.id} className="mode-card" onClick={() => openMode(m.id)}>
            <span className="mode-name">{m.name}</span>
            <span className="mode-blurb">{m.blurb}</span>
            <span className="mode-av">
              <Avatar char={characterFor(MODE_AV[m.id])} size={78} />
            </span>
          </button>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={() => setRoute({ screen: 'stats' })}>
        Session data
      </button>
      <p className="home-foot">Pass and play · 3-8 players · no accounts, works offline</p>
    </Screen>
  );
}

function StatsScreen({ onHome }: { onHome: () => void }) {
  const s = M.currentStats();
  const at = M.allTimeStats();
  const liveRounds = s.rounds > 0;
  return (
    <Screen scroll>
      <h2>Session data</h2>

      <div className="stat-section-label">{liveRounds ? 'This session' : 'All time (this device)'}</div>
      {liveRounds ? (
        <div className="stat-grid">
          <Stat label="Rounds" value={String(s.rounds)} />
          <Stat label="Replays" value={String(s.replays)} />
          <Stat label="Session" value={`${Math.round(s.sessionLengthMs / 60000)}m`} />
          <Stat
            label="Median time-to-next"
            value={s.medianTtnMs == null ? '-' : `${(s.medianTtnMs / 1000).toFixed(1)}s`}
          />
          <Stat label="Catch rate" value={s.catchRate == null ? '-' : `${Math.round(s.catchRate * 100)}%`} />
          <Stat label="Bangers" value={String(s.bangers)} />
        </div>
      ) : (
        <div className="stat-grid">
          <Stat label="Sessions" value={String(at.sessions)} />
          <Stat label="Rounds" value={String(at.rounds)} />
          <Stat label="Played" value={`${Math.round(at.sessionLengthMs / 60000)}m`} />
          <Stat
            label="Median time-to-next"
            value={at.medianTtnMs == null ? '-' : `${(at.medianTtnMs / 1000).toFixed(1)}s`}
          />
          <Stat label="Catch rate" value={at.catchRate == null ? '-' : `${Math.round(at.catchRate * 100)}%`} />
          <Stat label="Bangers" value={String(at.bangers)} />
        </div>
      )}

      {liveRounds && at.sessions > 1 && (
        <>
          <div className="stat-section-label">All time · {at.sessions} sessions</div>
          <div className="stat-grid">
            <Stat label="Rounds" value={String(at.rounds)} />
            <Stat label="Catch rate" value={at.catchRate == null ? '-' : `${Math.round(at.catchRate * 100)}%`} />
            <Stat label="Bangers" value={String(at.bangers)} />
          </div>
        </>
      )}

      <p className="hint">
        Primary signal is time-to-next-round (lower = the room wanted more). Catch rate (Impostor) should
        settle near 50 to 60%. Banger taps are positive-only.
      </p>
      <button className="btn btn-primary" onClick={() => M.exportAllJSON()}>
        Export all logs (JSON)
      </button>
      <button className="btn btn-ghost" onClick={onHome}>
        Home
      </button>
    </Screen>
  );
}
