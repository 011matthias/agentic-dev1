import type { CSSProperties } from 'react';

// ---------------------------------------------------------------------------
// The cast. Characters are the friendliness layer: a player is a glossy 3D face
// + a color, not typed text. Art is Microsoft's Fluent 3D Emoji (MIT licensed),
// pre-rendered PNGs in /public/avatars, which is exactly how a polished party
// app (Splash) ships characters: rendered art, not procedural shapes.
//
// Identity is derived from the player's INDEX in the roster (characterFor(i)),
// so the roster shape never changes and every mode gets avatars by passing the
// index. `color` is the ring/glow accent, chosen to match each render's hue.
// ---------------------------------------------------------------------------

export interface Character {
  id: string; // matches /avatars/<id>.png
  name: string;
  color: string;
}

// Ordered so consecutive players get distinct hues.
export const CHARACTERS: Character[] = [
  { id: 'fox', name: 'Fox', color: '#ff8c42' },
  { id: 'frog', name: 'Frog', color: '#5fbf6a' },
  { id: 'panda', name: 'Panda', color: '#9b8cff' },
  { id: 'lion', name: 'Lion', color: '#ffc23d' },
  { id: 'penguin', name: 'Penguin', color: '#4aa3e0' },
  { id: 'bear', name: 'Bear', color: '#c08552' },
  { id: 'wolf', name: 'Wolf', color: '#8f9bb3' },
  { id: 'chicken', name: 'Chicken', color: '#ffd84d' },
  { id: 'koala', name: 'Koala', color: '#b9c0c9' },
  { id: 'hamster', name: 'Hamster', color: '#e89a5c' },
  { id: 'owl', name: 'Owl', color: '#d0a36a' },
  { id: 'hedgehog', name: 'Hedgehog', color: '#a8855f' },
];

// A distinct host mascot (not in the player cast) that fronts the home screen.
export const HOST: Character = { id: 'unicorn', name: 'Pip', color: '#ff7ec9' };

export function characterFor(index: number): Character {
  return CHARACTERS[((index % CHARACTERS.length) + CHARACTERS.length) % CHARACTERS.length];
}

export function colorFor(index: number): string {
  return characterFor(index).color;
}

// One avatar: a glossy 3D face on a soft colored disc with an accent ring.
export function Avatar({
  index,
  char,
  size = 44,
  ring = false,
  pop = false,
}: {
  index?: number;
  char?: Character;
  size?: number;
  ring?: boolean;
  pop?: boolean; // spring entrance (pass-to-X, coronation)
}) {
  const c = char ?? characterFor(index ?? 0);
  return (
    <span
      className={`avatar3d ${ring ? 'avatar3d-ring' : ''} ${pop ? 'avatar3d-pop' : ''}`}
      style={{ width: size, height: size, '--ac': c.color } as CSSProperties}
    >
      <img src={`/avatars/${c.id}.png`} alt={c.name} draggable={false} />
    </span>
  );
}
