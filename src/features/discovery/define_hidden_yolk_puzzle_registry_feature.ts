export type HiddenHintFragmentId =
  | "help_msg_staple_fragment"
  | "vault_status_led_fragment"
  | "boot_log_checksum_fragment"
  | "carton_corner_star_fragment"
  | "breach_terminal_hash_fragment"
  | "receipt_notes_margin_fragment"
  | "post_credits_waffle_iron_fragment";

export type BonusYolkPuzzleId =
  | "breach_receipt_alignment_bonus_puzzle"
  | "monocle_checksum_bonus_puzzle"
  | "taskbar_clock_bonus_puzzle"
  | "waffle_iron_players_bonus_puzzle"
  | "scrambled_patch_v2_bonus_puzzle"
  | "installer_wizard_paradox_bonus_puzzle";

export interface HiddenHintFragmentRecord {
  id: HiddenHintFragmentId;
  title: string;
  source_window_label: string;
  hint_text: string;
  unlocks_puzzle_ids: BonusYolkPuzzleId[];
}

export interface BonusYolkPuzzleRecord {
  id: BonusYolkPuzzleId;
  title: string;
  prompt: string;
  accepted_answers: string[];
  reward_title: string;
  reward_effect_copy: string;
  required_hint_fragment_ids: HiddenHintFragmentId[];
  required_bonus_puzzle_ids: BonusYolkPuzzleId[];
  source_kind: "vault_lab" | "discovery_route";
}

const hiddenHintFragmentRegistry: Record<HiddenHintFragmentId, HiddenHintFragmentRecord> = {
  help_msg_staple_fragment: {
    id: "help_msg_staple_fragment",
    title: "Bent Staple",
    source_window_label: "help.msg",
    hint_text:
      "Sir Toasty doodled: 'The ring sees the checksum. Count glowing circles, not corners.'",
    unlocks_puzzle_ids: ["monocle_checksum_bonus_puzzle"],
  },
  vault_status_led_fragment: {
    id: "vault_status_led_fragment",
    title: "Status LED Smear",
    source_window_label: "vault_status.sys",
    hint_text:
      "One module is lying. The answer is the thing pretending to be an eye, not a light.",
    unlocks_puzzle_ids: ["monocle_checksum_bonus_puzzle"],
  },
  boot_log_checksum_fragment: {
    id: "boot_log_checksum_fragment",
    title: "Checksum Scratch",
    source_window_label: "boot_log.tmp",
    hint_text:
      "Boot line 04 repeats the same noun as the hidden trigger. Sir Toasty calls this 'subtle.'",
    unlocks_puzzle_ids: ["monocle_checksum_bonus_puzzle"],
  },
  carton_corner_star_fragment: {
    id: "carton_corner_star_fragment",
    title: "Corner Spark",
    source_window_label: "carton.png",
    hint_text:
      "The sparkle in the lower-right hums in 4:24 time. Check the desktop clock when it lies.",
    unlocks_puzzle_ids: ["taskbar_clock_bonus_puzzle"],
  },
  breach_terminal_hash_fragment: {
    id: "breach_terminal_hash_fragment",
    title: "Hash Smudge",
    source_window_label: "breach_terminal.log",
    hint_text:
      "Terminal note: 'Pad / Unit / Yolks / Whisking' is not just a clue; it is an ordering ritual.",
    unlocks_puzzle_ids: ["taskbar_clock_bonus_puzzle"],
  },
  receipt_notes_margin_fragment: {
    id: "receipt_notes_margin_fragment",
    title: "Margin Crumb",
    source_window_label: "receipt_notes.tmp",
    hint_text:
      "The fake clock in the taskbar always prints the same impossible time. Read it as letters.",
    unlocks_puzzle_ids: ["taskbar_clock_bonus_puzzle"],
  },
  post_credits_waffle_iron_fragment: {
    id: "post_credits_waffle_iron_fragment",
    title: "Waffle Iron Warning",
    source_window_label: "post_credits.arc",
    hint_text:
      "Post-credits whisper: 'Don't look under the Waffle Iron.' Sir Toasty immediately turns this into three more tests.",
    unlocks_puzzle_ids: [
      "waffle_iron_players_bonus_puzzle",
      "scrambled_patch_v2_bonus_puzzle",
      "installer_wizard_paradox_bonus_puzzle",
    ],
  },
};

const bonusYolkPuzzleRegistry: Record<BonusYolkPuzzleId, BonusYolkPuzzleRecord> = {
  breach_receipt_alignment_bonus_puzzle: {
    id: "breach_receipt_alignment_bonus_puzzle",
    title: "Receipt Alignment Bonus",
    prompt:
      "Complete the Carton Breach Receipt decoder to print the first decrypted onboarding record.",
    accepted_answers: ["auto-awarded-from-receipt-decoder"],
    reward_title: "Golden Yolk // Accounting Exemption",
    reward_effect_copy:
      "Awards 1 bonus Golden Yolk and bumps Carton complexity tier calculations.",
    required_hint_fragment_ids: [],
    required_bonus_puzzle_ids: [],
    source_kind: "discovery_route",
  },
  monocle_checksum_bonus_puzzle: {
    id: "monocle_checksum_bonus_puzzle",
    title: "Monocle Checksum",
    prompt:
      "A hidden object is repeated across the desktop and the art trigger. Name the glowing thing Sir Toasty keeps treating like a scanner.",
    accepted_answers: ["monocle", "ring", "glowing ring", "toast monocle"],
    reward_title: "Golden Yolk // Monocle Checksum",
    reward_effect_copy:
      "Awards 1 bonus Golden Yolk. The Carton desktop raises complexity earlier.",
    required_hint_fragment_ids: [
      "help_msg_staple_fragment",
      "vault_status_led_fragment",
      "boot_log_checksum_fragment",
    ],
    required_bonus_puzzle_ids: [],
    source_kind: "vault_lab",
  },
  taskbar_clock_bonus_puzzle: {
    id: "taskbar_clock_bonus_puzzle",
    title: "Clock That Lies",
    prompt:
      "The vaporwave taskbar clock displays an impossible placeholder. What time does The Carton keep printing?",
    accepted_answers: ["4:24 pm", "4 24 pm", "424 pm", "4:24"],
    reward_title: "Golden Yolk // Time Crumb",
    reward_effect_copy:
      "Awards 1 bonus Golden Yolk and unlocks later-tier windows faster.",
    required_hint_fragment_ids: [
      "carton_corner_star_fragment",
      "breach_terminal_hash_fragment",
      "receipt_notes_margin_fragment",
    ],
    required_bonus_puzzle_ids: [],
    source_kind: "vault_lab",
  },
  waffle_iron_players_bonus_puzzle: {
    id: "waffle_iron_players_bonus_puzzle",
    title: "Afterparty Level 1 // Waffle Iron Leak",
    prompt:
      "Post-credits protocol warning: Where does Sir Toasty claim the 'Real Players' are hidden?",
    accepted_answers: ["waffle iron", "the waffle iron"],
    reward_title: "Golden Yolk // Waffle Iron Leak",
    reward_effect_copy:
      "Awards 1 bonus Golden Yolk and unlocks the next afterparty level in the bonus lab.",
    required_hint_fragment_ids: ["post_credits_waffle_iron_fragment"],
    required_bonus_puzzle_ids: [],
    source_kind: "vault_lab",
  },
  scrambled_patch_v2_bonus_puzzle: {
    id: "scrambled_patch_v2_bonus_puzzle",
    title: "Afterparty Level 2 // Scrambled Patch",
    prompt:
      "The post-credits Meta-Restart reframes the next playthrough as which version label?",
    accepted_answers: [
      "version 2.0",
      "the scrambled patch",
      "version 2.0 the scrambled patch",
      "scrambled patch",
    ],
    reward_title: "Golden Yolk // Scrambled Patch v2.0",
    reward_effect_copy:
      "Awards 1 bonus Golden Yolk and escalates Carton complexity into post-credits tiers.",
    required_hint_fragment_ids: ["post_credits_waffle_iron_fragment"],
    required_bonus_puzzle_ids: ["waffle_iron_players_bonus_puzzle"],
    source_kind: "vault_lab",
  },
  installer_wizard_paradox_bonus_puzzle: {
    id: "installer_wizard_paradox_bonus_puzzle",
    title: "Afterparty Level 3 // Poultry Paradox",
    prompt:
      "According to Sir Toasty, what was 'The Chicken' actually pretending to be?",
    accepted_answers: [
      "installer wizard",
      "an installer wizard",
      "crashed installer wizard",
      "a crashed installer wizard",
    ],
    reward_title: "Golden Yolk // Poultry Paradox",
    reward_effect_copy:
      "Awards 1 bonus Golden Yolk and fully unlocks the post-credits afterparty chain.",
    required_hint_fragment_ids: ["post_credits_waffle_iron_fragment"],
    required_bonus_puzzle_ids: ["waffle_iron_players_bonus_puzzle", "scrambled_patch_v2_bonus_puzzle"],
    source_kind: "vault_lab",
  },
};

const normalizeHiddenPuzzleAnswerFeature = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const listHiddenHintFragmentsFeature = (): HiddenHintFragmentRecord[] =>
  Object.values(hiddenHintFragmentRegistry);

export const resolveHiddenHintFragmentFeature = (
  fragmentId: HiddenHintFragmentId,
): HiddenHintFragmentRecord | null => hiddenHintFragmentRegistry[fragmentId] ?? null;

export const listBonusYolkPuzzlesFeature = (): BonusYolkPuzzleRecord[] =>
  Object.values(bonusYolkPuzzleRegistry);

export const resolveBonusYolkPuzzleFeature = (
  puzzleId: BonusYolkPuzzleId,
): BonusYolkPuzzleRecord | null => bonusYolkPuzzleRegistry[puzzleId] ?? null;

export const verifyBonusYolkPuzzleAnswerFeature = (
  puzzleRecord: BonusYolkPuzzleRecord,
  candidateAnswer: string,
): boolean => {
  const normalizedCandidateAnswer = normalizeHiddenPuzzleAnswerFeature(candidateAnswer);

  return puzzleRecord.accepted_answers.some(
    (acceptedAnswer) =>
      normalizeHiddenPuzzleAnswerFeature(acceptedAnswer) === normalizedCandidateAnswer,
  );
};

export const listUnlockedBonusYolkPuzzlesFeature = (
  revealedHintFragmentIds: HiddenHintFragmentId[],
  solvedBonusYolkPuzzleIds: BonusYolkPuzzleId[] = [],
): BonusYolkPuzzleRecord[] =>
  listBonusYolkPuzzlesFeature().filter((puzzleRecord) =>
    puzzleRecord.required_hint_fragment_ids.every((fragmentId) =>
      revealedHintFragmentIds.includes(fragmentId),
    ) &&
    puzzleRecord.required_bonus_puzzle_ids.every((puzzleId) =>
      solvedBonusYolkPuzzleIds.includes(puzzleId),
    ),
  );
