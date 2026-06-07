// Modes share one grammar (pass-and-peek) but each scores differently.
export type Mode = 'impostor' | 'sync' | 'hivemind' | 'confessions' | 'crowned';

export interface SessionTags {
  groupSize: number;
  ageBand: string; // teens | 20s | 30s | 40s+ | mixed
  relationship: string; // close friends | family | work | acquaintances | mixed
}

// The roster is captured once and carried across modes within a session, so a
// group that switches from Impostor to Sync doesn't re-enter every name.
export interface Roster {
  players: string[];
  ageBand: string;
  relationship: string;
}

export const AGE_BANDS = ['teens', '20s', '30s', '40s+', 'mixed'];
export const RELATIONSHIPS = ['close friends', 'family', 'work', 'acquaintances', 'mixed'];

export function tagsFor(roster: Roster): SessionTags {
  return { groupSize: roster.players.length, ageBand: roster.ageBand, relationship: roster.relationship };
}
