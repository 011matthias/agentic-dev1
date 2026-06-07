export interface WordEntry {
  category: string;
  word: string;
}

// Starter pack for phase-1 playtests. All-ages, clean. ~80 words.
// This is the tunable surface: prune the duds, clone the bangers after each
// playtest batch (see measure.ts + project memory build-time improvement loop).
export const WORDS: WordEntry[] = [
  // Food & drink
  { category: 'Food & drink', word: 'Pizza' },
  { category: 'Food & drink', word: 'Sushi' },
  { category: 'Food & drink', word: 'Pancakes' },
  { category: 'Food & drink', word: 'Coffee' },
  { category: 'Food & drink', word: 'Ice cream' },
  { category: 'Food & drink', word: 'Spaghetti' },
  { category: 'Food & drink', word: 'Tacos' },
  { category: 'Food & drink', word: 'Popcorn' },
  { category: 'Food & drink', word: 'Smoothie' },
  { category: 'Food & drink', word: 'Chocolate' },
  { category: 'Food & drink', word: 'Burger' },
  { category: 'Food & drink', word: 'Cheese' },

  // Places
  { category: 'Places', word: 'Beach' },
  { category: 'Places', word: 'Airport' },
  { category: 'Places', word: 'Library' },
  { category: 'Places', word: 'Gym' },
  { category: 'Places', word: 'Hospital' },
  { category: 'Places', word: 'Castle' },
  { category: 'Places', word: 'Supermarket' },
  { category: 'Places', word: 'Cinema' },
  { category: 'Places', word: 'Mountain' },
  { category: 'Places', word: 'Desert' },
  { category: 'Places', word: 'Zoo' },
  { category: 'Places', word: 'Subway' },

  // Animals
  { category: 'Animals', word: 'Penguin' },
  { category: 'Animals', word: 'Elephant' },
  { category: 'Animals', word: 'Octopus' },
  { category: 'Animals', word: 'Kangaroo' },
  { category: 'Animals', word: 'Hedgehog' },
  { category: 'Animals', word: 'Dolphin' },
  { category: 'Animals', word: 'Owl' },
  { category: 'Animals', word: 'Crocodile' },
  { category: 'Animals', word: 'Squirrel' },
  { category: 'Animals', word: 'Flamingo' },
  { category: 'Animals', word: 'Sloth' },
  { category: 'Animals', word: 'Shark' },

  // Objects
  { category: 'Objects', word: 'Umbrella' },
  { category: 'Objects', word: 'Toothbrush' },
  { category: 'Objects', word: 'Candle' },
  { category: 'Objects', word: 'Backpack' },
  { category: 'Objects', word: 'Mirror' },
  { category: 'Objects', word: 'Guitar' },
  { category: 'Objects', word: 'Telescope' },
  { category: 'Objects', word: 'Stapler' },
  { category: 'Objects', word: 'Lantern' },
  { category: 'Objects', word: 'Compass' },
  { category: 'Objects', word: 'Pillow' },
  { category: 'Objects', word: 'Kettle' },

  // Activities
  { category: 'Activities', word: 'Camping' },
  { category: 'Activities', word: 'Skiing' },
  { category: 'Activities', word: 'Karaoke' },
  { category: 'Activities', word: 'Fishing' },
  { category: 'Activities', word: 'Painting' },
  { category: 'Activities', word: 'Bowling' },
  { category: 'Activities', word: 'Gardening' },
  { category: 'Activities', word: 'Surfing' },
  { category: 'Activities', word: 'Baking' },
  { category: 'Activities', word: 'Hiking' },
  { category: 'Activities', word: 'Dancing' },
  { category: 'Activities', word: 'Yoga' },

  // Movies & shows (broad, recognisable)
  { category: 'Movies & shows', word: 'Titanic' },
  { category: 'Movies & shows', word: 'Jurassic Park' },
  { category: 'Movies & shows', word: 'Frozen' },
  { category: 'Movies & shows', word: 'Harry Potter' },
  { category: 'Movies & shows', word: 'Star Wars' },
  { category: 'Movies & shows', word: 'The Lion King' },
  { category: 'Movies & shows', word: 'Friends' },
  { category: 'Movies & shows', word: 'Spider-Man' },
  { category: 'Movies & shows', word: 'Batman' },
  { category: 'Movies & shows', word: 'Shrek' },

  // Things that happen
  { category: 'Everyday', word: 'Traffic jam' },
  { category: 'Everyday', word: 'Birthday party' },
  { category: 'Everyday', word: 'Job interview' },
  { category: 'Everyday', word: 'First date' },
  { category: 'Everyday', word: 'Haircut' },
  { category: 'Everyday', word: 'Sunburn' },
  { category: 'Everyday', word: 'Wedding' },
  { category: 'Everyday', word: 'Road trip' },
  { category: 'Everyday', word: 'Snow day' },
  { category: 'Everyday', word: 'Power outage' },
];

export const CATEGORIES: string[] = Array.from(new Set(WORDS.map((w) => w.category)));
