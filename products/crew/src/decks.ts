// Content is the tunable surface across every mode. Tag, prune the duds, clone
// the bangers after each playtest batch (see measure.ts + project memory).
// Starter packs are all-ages / clean; spicier bands come later behind a gate.

// --- Sync (option pick -> cluster reveal) ----------------------------------
export interface OptionPrompt {
  id: string;
  text: string;
  options: string[]; // 2-5 options
}

export const SYNC_PROMPTS: OptionPrompt[] = [
  { id: 'sy_snack', text: 'Pick the road-trip snack', options: ['Chips', 'Candy', 'Jerky', 'Fruit', 'Energy drink'] },
  { id: 'sy_season', text: 'Best season', options: ['Spring', 'Summer', 'Autumn', 'Winter'] },
  { id: 'sy_chore', text: 'Worst household chore', options: ['Dishes', 'Laundry', 'Vacuuming', 'Bathroom', 'Bins'] },
  { id: 'sy_fire', text: 'Save in a fire', options: ['Phone', 'Photos', 'Pet', 'Laptop', 'Nothing'] },
  { id: 'sy_holiday', text: 'Most overrated holiday', options: ["New Year's Eve", "Valentine's", 'Halloween', 'Birthdays'] },
  { id: 'sy_pizza', text: 'Pizza topping the table can agree on', options: ['Pepperoni', 'Mushroom', 'Margherita', 'Hawaiian', 'Veggie'] },
  { id: 'sy_dayoff', text: 'Best way to spend a day off', options: ['Sleep in', 'Outdoors', 'See friends', 'Projects', 'Screen time'] },
  { id: 'sy_flatmate', text: 'Worst trait in a flatmate', options: ['Messy', 'Loud', 'Stingy', 'Never home', 'Too clingy'] },
  { id: 'sy_trip', text: 'Group holiday destination', options: ['Beach', 'City', 'Mountains', 'Road trip', 'Staycation'] },
  { id: 'sy_drink', text: 'The superior hot drink', options: ['Coffee', 'Tea', 'Hot chocolate', 'None of these'] },
];

// --- Hive Mind (take -> majority side scores) ------------------------------
export interface Take {
  id: string;
  text: string;
}

export const HIVE_TAKES: Take[] = [
  { id: 'hm_cereal', text: 'Cereal is a soup' },
  { id: 'hm_recline', text: "It's OK to recline your plane seat" },
  { id: 'hm_k', text: "Texting 'k' is rude" },
  { id: 'hm_hotdog', text: 'A hot dog is a sandwich' },
  { id: 'hm_socks', text: 'Socks before pants' },
  { id: 'hm_pineapple', text: 'Pineapple belongs on pizza' },
  { id: 'hm_roll', text: 'The toilet roll goes over, not under' },
  { id: 'hm_late', text: "Saying ‘I'm 5 minutes away’ when you haven't left is fine" },
  { id: 'hm_dinner', text: 'Adults should be allowed cereal for dinner' },
  { id: 'hm_speaker', text: 'Talking on speakerphone in public is rude' },
  { id: 'hm_regift', text: 'Re-gifting is totally acceptable' },
  { id: 'hm_gym', text: "It's fine to skip the gym if it's raining" },
];

// --- Confessions / Guess the Count -----------------------------------------
// Anonymity is the mechanic: only the COUNT is ever revealed or logged.
export interface Confession {
  id: string;
  text: string; // completes "... has / secretly ..."
}

export const CONFESSION_PROMPTS: Confession[] = [
  { id: 'cf_shower', text: 'has sung in the shower today' },
  { id: 'cf_song', text: "secretly likes a song they'd never admit to" },
  { id: 'cf_regift', text: 'has re-gifted a present' },
  { id: 'cf_call', text: 'has pretended to be on a call to avoid someone' },
  { id: 'cf_google', text: 'has googled themselves this week' },
  { id: 'cf_floor', text: 'has eaten food off the floor' },
  { id: 'cf_laugh', text: "has laughed at something they shouldn't have" },
  { id: 'cf_book', text: "has pretended to read a book they didn't finish" },
  { id: 'cf_pet', text: 'has talked to a pet like a person today' },
  { id: 'cf_advert', text: 'has cried at an advert' },
  { id: 'cf_text', text: 'has sent a text to the wrong person' },
  { id: 'cf_password', text: 'still remembers a password from ten years ago' },
];

// --- Crowned (absurd-title vote -> defence -> keep/dethrone) ----------------
export interface Title {
  id: string;
  text: string; // completes "The room crowns one person as the official ..."
}

export const CROWN_TITLES: Title[] = [
  { id: 'cr_silence', text: 'ambassador for awkward silences' },
  { id: 'cr_cult', text: 'most likely to start a cult' },
  { id: 'cr_doom', text: 'group forecaster of doom' },
  { id: 'cr_apoc', text: 'designated survivor of the apocalypse' },
  { id: 'cr_advice', text: 'minister of unsolicited advice' },
  { id: 'cr_reply', text: 'most likely to text back three days later' },
  { id: 'cr_horror', text: 'one who would survive a horror movie longest' },
  { id: 'cr_chat', text: 'official keeper of the group chat' },
  { id: 'cr_stranger', text: 'most likely to befriend a stranger in a queue' },
  { id: 'cr_decisions', text: 'designated driver of bad decisions' },
  { id: 'cr_wedding', text: 'most likely to cry at a wedding' },
  { id: 'cr_snacks', text: 'head of snacks and morale' },
];
