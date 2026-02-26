export type RidiculousRewardId =
  | "mustache_disguises_reward"
  | "kazoo_soundwaves_reward"
  | "platform_shoes_reward"
  | "sprinkle_rain_reward"
  | "towel_whipstream_reward";

export type CartonRiddleId =
  | "soda_bottle_riddle"
  | "candle_riddle"
  | "keyboard_riddle"
  | "sponge_riddle"
  | "towel_riddle";

export interface RidiculousRewardRecord {
  id: RidiculousRewardId;
  title: string;
  tagline: string;
  game_break_effect: string;
}

export interface CartonRiddleRecord {
  id: CartonRiddleId;
  object_label: string;
  title: string;
  prompt: string;
  accepted_answers: string[];
  hint_lines: [string, string, string];
  reward_id: RidiculousRewardId;
  sir_toasty_intro: string;
}

const ridiculousRewardRegistry: Record<RidiculousRewardId, RidiculousRewardRecord> = {
  mustache_disguises_reward: {
    id: "mustache_disguises_reward",
    title: "Mustache Disguises",
    tagline: "Identity fog for Data-Logistics Units.",
    game_break_effect:
      "The Pan loses tracking confidence and drifts farther behind the egg.",
  },
  kazoo_soundwaves_reward: {
    id: "kazoo_soundwaves_reward",
    title: "Kazoo Soundwaves",
    tagline: "Weaponized toot geometry.",
    game_break_effect:
      "Press K to blast a nearby hazard into garnish particles.",
  },
  platform_shoes_reward: {
    id: "platform_shoes_reward",
    title: "Platform-Shoes",
    tagline: "Certified floating footwear for unreasonable jumps.",
    game_break_effect: "Unlocks a mid-air jump and boosts jump height slightly.",
  },
  sprinkle_rain_reward: {
    id: "sprinkle_rain_reward",
    title: "Sprinkle Rain",
    tagline: "Meteorology, but edible and glittery.",
    game_break_effect:
      "Gravity gets weird and floaty, like the kitchen is rehearsing zero-g disco.",
  },
  towel_whipstream_reward: {
    id: "towel_whipstream_reward",
    title: "Towel Whipstream",
    tagline: "A dry towel moving faster than good judgment.",
    game_break_effect:
      "Obstacle flow slows and spacing loosens as slipstream nonsense bends timing.",
  },
};

const cartonRiddleRegistry: CartonRiddleRecord[] = [
  {
    id: "soda_bottle_riddle",
    object_label: "Soda Bottle",
    title: "Fizz Oracle #1",
    prompt:
      "I hiss when opened, sing when shaken, and become more useful after a burp. What am I?",
    accepted_answers: ["soda bottle", "bottle", "pop bottle"],
    hint_lines: [
      "Listen for the answer with your elbows.",
      "The cap is a tiny moon with commitment issues.",
      "It is the fizzy container, not the soda itself.",
    ],
    reward_id: "sprinkle_rain_reward",
    sir_toasty_intro:
      "SIR TOASTY (slide whistle): The bubbles know the map, kid. Ask the plastic prophet.",
  },
  {
    id: "candle_riddle",
    object_label: "Candle",
    title: "Wax Tribunal",
    prompt:
      "I shrink while I work, cry while I glow, and vanish if the room sneezes too hard. What am I?",
    accepted_answers: ["candle"],
    hint_lines: [
      "It is a legal torch for very tiny juries.",
      "It melts on purpose and pretends that is a personality.",
      "It is the thing with wax and a wick.",
    ],
    reward_id: "mustache_disguises_reward",
    sir_toasty_intro:
      "SIR TOASTY (rubber duck): Fire is just nervous light in a suit. Name the suit.",
  },
  {
    id: "keyboard_riddle",
    object_label: "Keyboard",
    title: "Spacebar Gospel",
    prompt:
      "I have keys but no locks, a space but no room, and I launch chaos whenever thumbs get ambitious. What am I?",
    accepted_answers: ["keyboard", "computer keyboard"],
    hint_lines: [
      "The answer lives under your fingers and judges your spelling.",
      "Its loudest key is secretly a rectangle.",
      "It is a keyboard. Sir Toasty cannot believe you needed the third hint.",
    ],
    reward_id: "platform_shoes_reward",
    sir_toasty_intro:
      "SIR TOASTY (slide whistle interrupt): Space is a button, not a place. This is why giants lose their chargers.",
  },
  {
    id: "sponge_riddle",
    object_label: "Sponge",
    title: "Absorbency Prophecy",
    prompt:
      "I am full of holes, hoard puddles, and somehow improve a disaster by becoming part of it. What am I?",
    accepted_answers: ["sponge"],
    hint_lines: [
      "The answer is a loaf-shaped cloud that hates grime.",
      "It drinks sinks for sport.",
      "It is a sponge.",
    ],
    reward_id: "kazoo_soundwaves_reward",
    sir_toasty_intro:
      "SIR TOASTY (rubber duck, distant): The porous rectangle holds a note longer than a trumpet if you insult it nicely.",
  },
  {
    id: "towel_riddle",
    object_label: "Towel",
    title: "Dryness Contradiction",
    prompt:
      "I get wetter while drying everything else and still demand respect on a hook. What am I?",
    accepted_answers: ["towel", "a towel"],
    hint_lines: [
      "Fabric thunder. Bathroom cape. Corridor serpent.",
      "It performs heroism after showers.",
      "Classic riddle answer: towel.",
    ],
    reward_id: "towel_whipstream_reward",
    sir_toasty_intro:
      "SIR TOASTY (slide whistle into static): The answer hangs around until needed, unlike most prophecies.",
  },
];

const normalizeCartonAnswerFeature = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const listCartonRiddlesFeature = (): CartonRiddleRecord[] => cartonRiddleRegistry;

export const resolveCartonRiddleFeature = (
  riddleId: CartonRiddleId,
): CartonRiddleRecord | null =>
  cartonRiddleRegistry.find((record) => record.id === riddleId) ?? null;

export const listRidiculousRewardsFeature = (): RidiculousRewardRecord[] =>
  Object.values(ridiculousRewardRegistry);

export const resolveRidiculousRewardFeature = (
  rewardId: RidiculousRewardId,
): RidiculousRewardRecord | null => ridiculousRewardRegistry[rewardId] ?? null;

export const verifyCartonRiddleAnswerFeature = (
  riddle: CartonRiddleRecord,
  candidateAnswer: string,
): boolean => {
  const normalizedCandidateAnswer = normalizeCartonAnswerFeature(candidateAnswer);

  return riddle.accepted_answers.some(
    (acceptedAnswer) => normalizeCartonAnswerFeature(acceptedAnswer) === normalizedCandidateAnswer,
  );
};
