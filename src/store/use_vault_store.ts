"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  CartonRiddleId,
  RidiculousRewardId,
} from "@/features/discovery/define_carton_riddle_registry_feature";
import type {
  BonusYolkPuzzleId,
  HiddenHintFragmentId,
} from "@/features/discovery/define_hidden_yolk_puzzle_registry_feature";

interface PersistedVaultStateRecord {
  discovered_secrets?: string[];
  is_glitch_mode_active?: boolean;
  solved_carton_riddles?: CartonRiddleId[];
  ridiculous_rewards?: RidiculousRewardId[];
  revealed_hidden_hint_fragments?: HiddenHintFragmentId[];
  solved_bonus_yolk_puzzles?: BonusYolkPuzzleId[];
  desktop_window_layout_map?: Record<string, PersistedDesktopWindowLayoutRecord>;
}

interface PersistedDesktopWindowLayoutRecord {
  offset_x_px?: number;
  offset_y_px?: number;
  is_minimized?: boolean;
}

export interface DesktopWindowLayoutRecord {
  offset_x_px: number;
  offset_y_px: number;
  is_minimized: boolean;
}

export interface VaultState {
  discovered_secrets: string[];
  is_glitch_mode_active: boolean;
  solved_carton_riddles: CartonRiddleId[];
  ridiculous_rewards: RidiculousRewardId[];
  revealed_hidden_hint_fragments: HiddenHintFragmentId[];
  solved_bonus_yolk_puzzles: BonusYolkPuzzleId[];
  desktop_window_layout_map: Record<string, DesktopWindowLayoutRecord>;
  add_discovery: (id: string) => void;
  trigger_glitch: () => void;
  unlock_carton_reward: (
    riddleId: CartonRiddleId,
    rewardId: RidiculousRewardId,
  ) => void;
  reveal_hidden_hint_fragment: (fragmentId: HiddenHintFragmentId) => void;
  solve_bonus_yolk_puzzle: (puzzleId: BonusYolkPuzzleId) => void;
  set_desktop_window_offset: (
    windowId: string,
    offsetXPx: number,
    offsetYPx: number,
  ) => void;
  set_desktop_window_minimized: (windowId: string, isMinimized: boolean) => void;
  reset_desktop_window_layout: (windowId: string) => void;
  reset_vault_debug: () => void;
}

const buildDefaultDesktopWindowLayoutFeature = (): DesktopWindowLayoutRecord => ({
  offset_x_px: 0,
  offset_y_px: 0,
  is_minimized: false,
});

const sanitizeDesktopWindowLayoutMapFeature = (
  persistedLayoutMap: Record<string, PersistedDesktopWindowLayoutRecord> | undefined,
): Record<string, DesktopWindowLayoutRecord> => {
  if (!persistedLayoutMap) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(persistedLayoutMap).map(([windowId, layoutRecord]) => [
      windowId,
      {
        offset_x_px:
          typeof layoutRecord.offset_x_px === "number" ? layoutRecord.offset_x_px : 0,
        offset_y_px:
          typeof layoutRecord.offset_y_px === "number" ? layoutRecord.offset_y_px : 0,
        is_minimized:
          typeof layoutRecord.is_minimized === "boolean" ? layoutRecord.is_minimized : false,
      },
    ]),
  );
};

export const useVaultStore = create<VaultState>()(
  persist(
    (set) => ({
      discovered_secrets: [],
      is_glitch_mode_active: false,
      solved_carton_riddles: [],
      ridiculous_rewards: [],
      revealed_hidden_hint_fragments: [],
      solved_bonus_yolk_puzzles: [],
      desktop_window_layout_map: {},
      add_discovery: (id) =>
        set((state) => {
          if (state.discovered_secrets.includes(id)) {
            return state;
          }

          return {
            discovered_secrets: [...state.discovered_secrets, id],
          };
        }),
      trigger_glitch: () =>
        set(() => ({
          is_glitch_mode_active: true,
        })),
      unlock_carton_reward: (riddleId, rewardId) =>
        set((state) => {
          const nextSolvedCartonRiddles = state.solved_carton_riddles.includes(riddleId)
            ? state.solved_carton_riddles
            : [...state.solved_carton_riddles, riddleId];
          const nextRidiculousRewards = state.ridiculous_rewards.includes(rewardId)
            ? state.ridiculous_rewards
            : [...state.ridiculous_rewards, rewardId];

          return {
            solved_carton_riddles: nextSolvedCartonRiddles,
            ridiculous_rewards: nextRidiculousRewards,
          };
        }),
      reveal_hidden_hint_fragment: (fragmentId) =>
        set((state) => {
          if (state.revealed_hidden_hint_fragments.includes(fragmentId)) {
            return state;
          }

          return {
            revealed_hidden_hint_fragments: [
              ...state.revealed_hidden_hint_fragments,
              fragmentId,
            ],
          };
        }),
      solve_bonus_yolk_puzzle: (puzzleId) =>
        set((state) => {
          if (state.solved_bonus_yolk_puzzles.includes(puzzleId)) {
            return state;
          }

          return {
            solved_bonus_yolk_puzzles: [...state.solved_bonus_yolk_puzzles, puzzleId],
          };
        }),
      set_desktop_window_offset: (windowId, offsetXPx, offsetYPx) =>
        set((state) => {
          const currentLayoutRecord =
            state.desktop_window_layout_map[windowId] ?? buildDefaultDesktopWindowLayoutFeature();
          const nextOffsetXPx = Math.round(offsetXPx);
          const nextOffsetYPx = Math.round(offsetYPx);

          if (
            currentLayoutRecord.offset_x_px === nextOffsetXPx &&
            currentLayoutRecord.offset_y_px === nextOffsetYPx
          ) {
            return state;
          }

          return {
            desktop_window_layout_map: {
              ...state.desktop_window_layout_map,
              [windowId]: {
                ...currentLayoutRecord,
                offset_x_px: nextOffsetXPx,
                offset_y_px: nextOffsetYPx,
              },
            },
          };
        }),
      set_desktop_window_minimized: (windowId, isMinimized) =>
        set((state) => {
          const currentLayoutRecord =
            state.desktop_window_layout_map[windowId] ?? buildDefaultDesktopWindowLayoutFeature();

          if (currentLayoutRecord.is_minimized === isMinimized) {
            return state;
          }

          return {
            desktop_window_layout_map: {
              ...state.desktop_window_layout_map,
              [windowId]: {
                ...currentLayoutRecord,
                is_minimized: isMinimized,
              },
            },
          };
        }),
      reset_desktop_window_layout: (windowId) =>
        set((state) => {
          if (!(windowId in state.desktop_window_layout_map)) {
            return state;
          }

          const nextDesktopWindowLayoutMap = { ...state.desktop_window_layout_map };
          delete nextDesktopWindowLayoutMap[windowId];

          return {
            desktop_window_layout_map: nextDesktopWindowLayoutMap,
          };
        }),
      reset_vault_debug: () =>
        set(() => ({
          discovered_secrets: [],
          is_glitch_mode_active: false,
          solved_carton_riddles: [],
          ridiculous_rewards: [],
          revealed_hidden_hint_fragments: [],
          solved_bonus_yolk_puzzles: [],
          desktop_window_layout_map: {},
        })),
    }),
    {
      name: "eggcellent-vault-store",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = persistedState as PersistedVaultStateRecord;

        return {
          discovered_secrets: state.discovered_secrets ?? [],
          is_glitch_mode_active: state.is_glitch_mode_active ?? false,
          solved_carton_riddles: state.solved_carton_riddles ?? [],
          ridiculous_rewards: state.ridiculous_rewards ?? [],
          revealed_hidden_hint_fragments: state.revealed_hidden_hint_fragments ?? [],
          solved_bonus_yolk_puzzles: state.solved_bonus_yolk_puzzles ?? [],
          desktop_window_layout_map: sanitizeDesktopWindowLayoutMapFeature(
            state.desktop_window_layout_map,
          ),
        } satisfies Pick<
          VaultState,
          | "discovered_secrets"
          | "is_glitch_mode_active"
          | "solved_carton_riddles"
          | "ridiculous_rewards"
          | "revealed_hidden_hint_fragments"
          | "solved_bonus_yolk_puzzles"
          | "desktop_window_layout_map"
        >;
      },
      partialize: (state) => ({
        discovered_secrets: state.discovered_secrets,
        is_glitch_mode_active: state.is_glitch_mode_active,
        solved_carton_riddles: state.solved_carton_riddles,
        ridiculous_rewards: state.ridiculous_rewards,
        revealed_hidden_hint_fragments: state.revealed_hidden_hint_fragments,
        solved_bonus_yolk_puzzles: state.solved_bonus_yolk_puzzles,
        desktop_window_layout_map: state.desktop_window_layout_map,
      }),
    },
  ),
);
