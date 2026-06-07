// Tiny synthesized Web-Audio SFX kit. Every sound is built from oscillators and
// a single noise buffer at play time, so there are NO asset files and the whole
// kit works offline inside the PWA. Audio is unlocked on the first user gesture
// (the global button juice calls unlockAudio on pointerdown), after which any
// timer chime or reveal sting can actually play.
//
// One mute toggle gates every sound (persisted in localStorage). Haptics are a
// separate silent channel and fire independently of mute; visual motion is
// gated separately by prefers-reduced-motion in styles.css / util.ts.

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

const MUTE_KEY = 'crew_muted_v1';
let muted = readMuted();

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* storage unavailable: the choice just won't survive a reload */
  }
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

function ctx(): AudioContext | null {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && Ctor) audioCtx = new Ctor();
    return audioCtx;
  } catch {
    return null;
  }
}

// Unlock / resume the context. Safe to call repeatedly; cheap when already
// running. Called from the global pointerdown juice so the first tap anywhere
// arms the audio for the rest of the session.
export function unlockAudio(): void {
  const c = ctx();
  if (c && c.state === 'suspended') void c.resume();
}

// A short oscillator blip with a fast attack and exponential release. `from`/`to`
// sweep the pitch (equal = a flat tone). All sounds are layered from this.
function tone(
  c: AudioContext,
  opts: {
    type: OscillatorType;
    from: number;
    to?: number;
    dur: number;
    gain: number;
    delay?: number;
  },
): void {
  const { type, from, dur, gain } = opts;
  const to = opts.to ?? from;
  const t0 = c.currentTime + (opts.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
  osc.connect(g);
  g.connect(c.destination);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function noise(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const len = Math.floor(c.sampleRate * 0.4);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

// A bandpass-swept noise burst: the "pass it on" whoosh.
function whoosh(c: AudioContext): void {
  const t0 = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(380, t0);
  bp.frequency.exponentialRampToValueAtTime(2200, t0 + 0.25);
  bp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
  src.connect(bp);
  bp.connect(g);
  g.connect(c.destination);
  src.start(t0);
  src.stop(t0 + 0.34);
}

export type Sfx = 'tap' | 'pop' | 'whoosh' | 'success' | 'fail';

export function playSfx(name: Sfx): void {
  if (muted) return;
  const c = ctx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  try {
    switch (name) {
      case 'tap':
        // Subtle, high, quick: this fires on EVERY button, so it stays quiet.
        tone(c, { type: 'triangle', from: 520, to: 380, dur: 0.05, gain: 0.05 });
        break;
      case 'pop':
        // A round upward blip for a reveal / snap.
        tone(c, { type: 'sine', from: 300, to: 760, dur: 0.12, gain: 0.16 });
        break;
      case 'whoosh':
        whoosh(c);
        break;
      case 'success':
        // A little major arpeggio (C-E-G), the banger / win sting.
        [523.25, 659.25, 783.99].forEach((f, i) =>
          tone(c, { type: 'sine', from: f, dur: 0.2, gain: 0.13, delay: i * 0.08 }),
        );
        break;
      case 'fail':
        // A short descending buzz, the "got away" womp.
        tone(c, { type: 'sawtooth', from: 300, to: 150, dur: 0.33, gain: 0.12 });
        break;
    }
  } catch {
    /* a single failed sound never breaks the round */
  }
}

// A rising tick whose pitch climbs with `progress` (0..1). Used for the
// hold-to-reveal bar filling and the scoreboard tally climbing.
export function playTick(progress = 0): void {
  if (muted) return;
  const c = ctx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  const p = Math.max(0, Math.min(1, progress));
  try {
    tone(c, { type: 'triangle', from: 500 + p * 900, dur: 0.035, gain: 0.05 });
  } catch {
    /* ignore */
  }
}

// Silent tactile channel. Independent of the mute toggle (it makes no sound)
// and a no-op where the Vibration API is absent (most desktops, iOS Safari).
export function haptic(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* vibration unsupported */
  }
}

// End-of-timer alarm (Impostor discussion clock, Crowned defence countdown).
// Two-note attention chime; the audio respects mute, the buzz always fires so a
// muted phone still signals time is up.
export function playChime(): void {
  if (!muted) {
    const c = ctx();
    if (c) {
      try {
        if (c.state === 'suspended') void c.resume();
        [880, 1320].forEach((f, i) => tone(c, { type: 'sine', from: f, dur: 0.35, gain: 0.3, delay: i * 0.18 }));
      } catch {
        /* ignore */
      }
    }
  }
  haptic([120, 60, 120]);
}
