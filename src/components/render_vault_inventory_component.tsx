"use client";

import { AnimatePresence, motion, useDragControls, useMotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  cloneElement,
  isValidElement,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import { RenderCartonRiddleGateComponent } from "@/components/render_carton_riddle_gate_component";
import { RenderGreatWhiskingPopupSwarmComponent } from "@/components/render_great_whisking_popup_swarm_component";
import type { CartonStoryScriptBundle } from "@/features/discovery/define_carton_story_script_type";
import {
  listDiscoveryRecordsFeature,
  resolveDiscoveryRecordFeature,
} from "@/features/discovery/define_secret_registry_feature";
import type {
  BonusYolkPuzzleId,
  HiddenHintFragmentId,
} from "@/features/discovery/define_hidden_yolk_puzzle_registry_feature";
import {
  listBonusYolkPuzzlesFeature,
  listHiddenHintFragmentsFeature,
  listUnlockedBonusYolkPuzzlesFeature,
  resolveHiddenHintFragmentFeature,
  verifyBonusYolkPuzzleAnswerFeature,
} from "@/features/discovery/define_hidden_yolk_puzzle_registry_feature";
import { useVaultStore } from "@/store/use_vault_store";

interface RenderVaultInventoryComponentProps {
  carton_story_script_bundle: CartonStoryScriptBundle;
}

interface StoryProgressViewRecord {
  id: string;
  label: string;
  title: string;
  is_unlocked: boolean;
  body: string;
  note: string;
}

type RetroWindowAccent = "cyan" | "pink" | "mint" | "amber" | "lavender";

interface RenderRetroDesktopWindowComponentProps {
  title_text: string;
  accent: RetroWindowAccent;
  children: ReactNode;
  class_name?: string;
  body_class_name?: string;
  subtitle_text?: string;
  is_window_minimized?: boolean;
  is_window_maximized?: boolean;
  on_title_bar_pointer_down?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  on_focus_window?: () => void;
  on_toggle_minimize_window?: () => void;
  on_toggle_maximize_window?: () => void;
  on_restore_window?: () => void;
}

interface RenderDraggableWindowShellComponentProps {
  window_id: string;
  drag_constraints_ref: RefObject<HTMLElement | null>;
  z_index_value: number;
  on_activate_window: (windowId: string) => void;
  initial_left_px?: number;
  initial_top_px?: number;
  class_name?: string;
  drag_enabled?: boolean;
  children: ReactNode;
}

const retroWindowAccentClassMap: Record<
  RetroWindowAccent,
  {
    title_bar_class_name: string;
    title_text_class_name: string;
  }
> = {
  cyan: {
    title_bar_class_name:
      "bg-[linear-gradient(90deg,#6ae7ff_0%,#8fd8ff_32%,#af9dff_72%,#f58cf6_100%)]",
    title_text_class_name: "text-[#101422]",
  },
  pink: {
    title_bar_class_name:
      "bg-[linear-gradient(90deg,#8dd7ff_0%,#a7b7ff_40%,#f3a0ff_72%,#ff8fcb_100%)]",
    title_text_class_name: "text-[#171220]",
  },
  mint: {
    title_bar_class_name:
      "bg-[linear-gradient(90deg,#7ff6dd_0%,#90ebff_34%,#8fb7ff_70%,#cfa0ff_100%)]",
    title_text_class_name: "text-[#102022]",
  },
  amber: {
    title_bar_class_name:
      "bg-[linear-gradient(90deg,#8bdcff_0%,#99bcff_35%,#ffc57a_72%,#ff9cad_100%)]",
    title_text_class_name: "text-[#1a1410]",
  },
  lavender: {
    title_bar_class_name:
      "bg-[linear-gradient(90deg,#8fd8ff_0%,#9ebfff_36%,#b7a0ff_70%,#e89bff_100%)]",
    title_text_class_name: "text-[#161126]",
  },
};

const retroDesktopButtonClassName =
  "retro_bitmap_font inline-flex items-center justify-center rounded-none border-2 border-[#f8f8f8] border-r-[#2a2a2a] border-b-[#2a2a2a] bg-[#d7d7db] px-3 py-1.5 text-[12px] font-normal tracking-[0.02em] text-[#151515] shadow-[1px_1px_0_rgba(0,0,0,0.35)] transition hover:bg-[#ececf0] active:translate-y-px active:border-[#2a2a2a] active:border-r-[#f8f8f8] active:border-b-[#f8f8f8] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-5px] focus-visible:outline-[#1f1f1f]";

const joinClassNamesFeature = (...classNames: Array<string | undefined | false>): string =>
  classNames.filter(Boolean).join(" ");

const RenderDraggableWindowShellComponent = ({
  window_id,
  drag_constraints_ref,
  z_index_value,
  on_activate_window,
  initial_left_px = 0,
  initial_top_px = 0,
  class_name,
  drag_enabled = true,
  children,
}: RenderDraggableWindowShellComponentProps) => {
  const dragControls = useDragControls();
  const windowOffsetX = useMotionValue(0);
  const windowOffsetY = useMotionValue(0);
  const persistedWindowLayoutRecord = useVaultStore(
    (state) => state.desktop_window_layout_map[window_id],
  );
  const setDesktopWindowOffset = useVaultStore((state) => state.set_desktop_window_offset);
  const setDesktopWindowMinimized = useVaultStore(
    (state) => state.set_desktop_window_minimized,
  );
  const resetDesktopWindowLayout = useVaultStore((state) => state.reset_desktop_window_layout);
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);

  useEffect(() => {
    if (!persistedWindowLayoutRecord) {
      windowOffsetX.set(0);
      windowOffsetY.set(0);
      setIsWindowMinimized(false);
      return;
    }

    if (!isWindowMaximized) {
      windowOffsetX.set(persistedWindowLayoutRecord.offset_x_px);
      windowOffsetY.set(persistedWindowLayoutRecord.offset_y_px);
    }
    setIsWindowMinimized(persistedWindowLayoutRecord.is_minimized);
  }, [isWindowMaximized, persistedWindowLayoutRecord, windowOffsetX, windowOffsetY]);

  const handleTitleBarPointerDownFeature = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    on_activate_window(window_id);

    if (!drag_enabled || isWindowMaximized) {
      return;
    }

    dragControls.start(event);
  };

  const handleToggleMinimizeWindowFeature = (): void => {
    on_activate_window(window_id);
    setIsWindowMinimized((currentValue) => {
      const nextValue = !currentValue;
      setDesktopWindowMinimized(window_id, nextValue);
      return nextValue;
    });
  };

  const handleToggleMaximizeWindowFeature = (): void => {
    on_activate_window(window_id);
    if (isWindowMaximized) {
      windowOffsetX.set(persistedWindowLayoutRecord?.offset_x_px ?? 0);
      windowOffsetY.set(persistedWindowLayoutRecord?.offset_y_px ?? 0);
    } else {
      windowOffsetX.set(0);
      windowOffsetY.set(0);
    }
    setIsWindowMinimized(false);
    setDesktopWindowMinimized(window_id, false);
    setIsWindowMaximized((currentValue) => !currentValue);
  };

  const handleRestoreWindowFeature = (): void => {
    on_activate_window(window_id);
    windowOffsetX.set(0);
    windowOffsetY.set(0);
    setIsWindowMinimized(false);
    setIsWindowMaximized(false);
    resetDesktopWindowLayout(window_id);
  };

  const renderedChildren = isValidElement<RenderRetroDesktopWindowComponentProps>(children)
    ? cloneElement(children, {
        is_window_minimized: isWindowMinimized,
        is_window_maximized: isWindowMaximized,
        on_title_bar_pointer_down: handleTitleBarPointerDownFeature,
        on_focus_window: () => {
          on_activate_window(window_id);
        },
        on_toggle_minimize_window: handleToggleMinimizeWindowFeature,
        on_toggle_maximize_window: handleToggleMaximizeWindowFeature,
        on_restore_window: handleRestoreWindowFeature,
      })
    : children;

  if (!drag_enabled) {
    return (
      <div className={class_name} style={{ zIndex: z_index_value }}>
        {renderedChildren}
      </div>
    );
  }

  return (
    <motion.div
      drag={!isWindowMaximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.04}
      dragConstraints={drag_constraints_ref}
      dragTransition={{ power: 0, timeConstant: 120 }}
      className={class_name}
      style={{
        zIndex: z_index_value,
        x: windowOffsetX,
        y: windowOffsetY,
        left: isWindowMaximized ? 4 : initial_left_px,
        top: isWindowMaximized ? 4 : initial_top_px,
        right:
          isWindowMaximized && (class_name ?? "").includes("absolute") ? 4 : undefined,
        bottom:
          isWindowMaximized && (class_name ?? "").includes("absolute") ? 4 : undefined,
        width:
          isWindowMaximized && !(class_name ?? "").includes("absolute")
            ? "100%"
            : undefined,
        touchAction: "none",
      }}
      onPointerDown={() => {
        on_activate_window(window_id);
      }}
      onDragEnd={() => {
        setDesktopWindowOffset(window_id, windowOffsetX.get(), windowOffsetY.get());
      }}
      whileTap={{ cursor: "grabbing" }}
    >
      {renderedChildren}
    </motion.div>
  );
};

const buildStorySnippetFeature = (storyText: string): string =>
  storyText
    .split("\n")
    .map((lineValue) => lineValue.trim())
    .find((lineValue) => lineValue.length > 42 && !lineValue.endsWith(":")) ??
  storyText;

const truncateStoryTextFeature = (storyText: string, maxLength: number): string => {
  if (storyText.length <= maxLength) {
    return storyText;
  }

  return `${storyText.slice(0, maxLength - 1).trimEnd()}…`;
};

const formatCoreBonusYolkReadoutFeature = (
  coreGoldenYolkCount: number,
  bonusGoldenYolkCount: number,
): string =>
  bonusGoldenYolkCount > 0
    ? `${coreGoldenYolkCount}/5 core + ${bonusGoldenYolkCount} bonus`
    : `${coreGoldenYolkCount}/5`;

const maximumCartonComplexityTierCount = 7;

const resolveCartonComplexityTierFeature = (
  discoveredSecretCount: number,
  goldenYolkCount: number,
): number => {
  const complexityScore = goldenYolkCount * 2 + Math.max(0, discoveredSecretCount - 1);

  if (complexityScore >= 10) {
    return 6;
  }

  if (complexityScore >= 8) {
    return 5;
  }

  if (complexityScore >= 6) {
    return 4;
  }

  if (complexityScore >= 4) {
    return 3;
  }

  if (complexityScore >= 2) {
    return 2;
  }

  if (complexityScore >= 1) {
    return 1;
  }

  return 0;
};

const RenderRetroDesktopWindowComponent = ({
  title_text,
  accent,
  children,
  class_name,
  body_class_name,
  subtitle_text,
  is_window_minimized = false,
  is_window_maximized = false,
  on_title_bar_pointer_down,
  on_focus_window,
  on_toggle_minimize_window,
  on_toggle_maximize_window,
  on_restore_window,
}: RenderRetroDesktopWindowComponentProps) => {
  const accentClasses = retroWindowAccentClassMap[accent];

  return (
    <section
      className={joinClassNamesFeature(
        "retro_bitmap_font relative overflow-hidden rounded-none border-2 border-[#f3f3f7] border-r-[#30303a] border-b-[#30303a] bg-[#d7d7dc] shadow-[3px_3px_0_rgba(0,0,0,0.35)]",
        is_window_maximized ? "h-full" : undefined,
        class_name,
      )}
      onPointerDownCapture={() => {
        on_focus_window?.();
      }}
    >
      <div
        className={joinClassNamesFeature(
          "relative flex min-h-8 select-none items-center justify-between border-b-2 border-[#2d2d35] px-2 py-1",
          accentClasses.title_bar_class_name,
        )}
        onPointerDown={on_title_bar_pointer_down}
      >
        <div className="min-w-0">
          <p
            className={joinClassNamesFeature(
              "truncate text-[11px] font-semibold uppercase tracking-[0.1em]",
              accentClasses.title_text_class_name,
            )}
          >
            {title_text}
          </p>
          {subtitle_text ? (
            <p className="mt-0.5 truncate text-[10px] text-black/70">{subtitle_text}</p>
          ) : null}
        </div>
        <div className="ml-3 flex items-center gap-1">
          {[
            {
              id: "minimize",
              label: "_",
              on_click: on_toggle_minimize_window,
              aria_label: is_window_minimized ? "Restore window body" : "Minimize window",
            },
            {
              id: "maximize",
              label: is_window_maximized ? "❐" : "□",
              on_click: on_toggle_maximize_window,
              aria_label: is_window_maximized ? "Restore window size" : "Maximize window",
            },
            {
              id: "restore",
              label: "X",
              on_click: on_restore_window,
              aria_label: "Reset window position and state",
            },
          ].map((buttonRecord) => (
            <button
              key={buttonRecord.id}
              type="button"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                buttonRecord.on_click?.();
              }}
              className="inline-flex h-4 min-w-4 items-center justify-center border border-black/45 bg-white/60 px-1 text-[9px] font-bold text-black/70 transition hover:bg-white/80 active:translate-y-px disabled:cursor-default disabled:hover:bg-white/60"
              aria-label={buttonRecord.aria_label}
              disabled={!buttonRecord.on_click}
            >
              {buttonRecord.label}
            </button>
          ))}
        </div>
      </div>
      {is_window_minimized ? null : (
        <div
          className={joinClassNamesFeature(
            "relative border-t border-white/80 bg-[#d7d7dc] p-3 text-[#161616]",
            is_window_maximized ? "h-[calc(100%-2rem)] overflow-auto" : undefined,
            body_class_name,
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
};

export function RenderVaultInventoryComponent({
  carton_story_script_bundle,
}: RenderVaultInventoryComponentProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isCartonModalOpen, setIsCartonModalOpen] = useState(false);
  const [isRiddleBoothVisible, setIsRiddleBoothVisible] = useState(false);
  const [bonusYolkPuzzleAnswerDraftMap, setBonusYolkPuzzleAnswerDraftMap] = useState<
    Partial<Record<BonusYolkPuzzleId, string>>
  >({});
  const [bonusYolkLabStatusText, setBonusYolkLabStatusText] = useState(
    "Hidden fragments can unlock side puzzles. Solve them for bonus Golden Yolks.",
  );
  const [hiddenFragmentPingText, setHiddenFragmentPingText] = useState(
    "Desktop crumbs are scattered behind windows.",
  );
  const [desktopWindowZIndexMap, setDesktopWindowZIndexMap] = useState<Record<string, number>>({
    manifesto_window: 34,
    carton_window: 40,
    help_window: 28,
    vault_status_window: 27,
    boot_log_window: 26,
  });
  const [modalWindowZIndexMap, setModalWindowZIndexMap] = useState<Record<string, number>>({
    modal_story_window: 40,
    modal_module_window: 39,
    modal_riddle_window: 38,
    modal_hidden_hints_window: 37,
    modal_bonus_yolk_window: 36,
    modal_records_window: 34,
    modal_archive_window: 33,
    modal_diagnostics_window: 32,
  });
  const desktopWindowCanvasRef = useRef<HTMLDivElement | null>(null);
  const modalWindowCanvasRef = useRef<HTMLDivElement | null>(null);

  const discoveredSecrets = useVaultStore((state) => state.discovered_secrets);
  const isGlitchModeActive = useVaultStore((state) => state.is_glitch_mode_active);
  const solvedCartonRiddles = useVaultStore((state) => state.solved_carton_riddles);
  const ridiculousRewards = useVaultStore((state) => state.ridiculous_rewards);
  const revealedHiddenHintFragments = useVaultStore(
    (state) => state.revealed_hidden_hint_fragments,
  );
  const solvedBonusYolkPuzzles = useVaultStore((state) => state.solved_bonus_yolk_puzzles);
  const revealHiddenHintFragment = useVaultStore((state) => state.reveal_hidden_hint_fragment);
  const solveBonusYolkPuzzle = useVaultStore((state) => state.solve_bonus_yolk_puzzle);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!isCartonModalOpen) {
      return;
    }

    const handleEscapeKeyFeature = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsCartonModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscapeKeyFeature);

    return () => {
      window.removeEventListener("keydown", handleEscapeKeyFeature);
    };
  }, [isCartonModalOpen]);

  const hasAccess = hasMounted && (isGlitchModeActive || discoveredSecrets.length > 0);

  if (!hasAccess) {
    return (
      <section className="relative min-h-[70vh] overflow-hidden bg-[linear-gradient(180deg,#9fe8ff_0%,#aad4ff_34%,#d0b1ff_74%,#f0a4d2_100%)] p-4 sm:p-6">
        <div className="absolute inset-x-0 bottom-0 h-14 bg-[#c9c9ce] border-t-2 border-[#f7f7fa] shadow-[inset_0_2px_0_rgba(255,255,255,0.65)]" />
        <div className="relative z-10 mx-auto max-w-2xl pt-8">
          <RenderRetroDesktopWindowComponent
            title_text="access_denied.exe"
            accent="pink"
            body_class_name="bg-[#d7d7dc]"
          >
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#8b2758]">
              The Carton is still folded shut
            </p>
            <p className="mt-3 text-sm leading-6 text-[#242424]">
              The Sizzle is still masking the Metaverse. Trigger an easter egg in the
              runner to reveal the neon carton seam.
            </p>
            <div className="mt-4">
              <Link href="/" className={retroDesktopButtonClassName}>
                Return To Surface
              </Link>
            </div>
          </RenderRetroDesktopWindowComponent>
        </div>
      </section>
    );
  }

  const discoveredSecretCount = discoveredSecrets.length;
  const coreGoldenYolkCount = solvedCartonRiddles.length;
  const bonusGoldenYolkCount = solvedBonusYolkPuzzles.length;
  const goldenYolkCount = coreGoldenYolkCount + bonusGoldenYolkCount;
  const complexityTier = resolveCartonComplexityTierFeature(
    discoveredSecretCount,
    goldenYolkCount,
  );
  const hiddenHintFragmentRecords = listHiddenHintFragmentsFeature();
  const allBonusYolkPuzzles = listBonusYolkPuzzlesFeature();
  const unlockedBonusYolkPuzzles = listUnlockedBonusYolkPuzzlesFeature(
    revealedHiddenHintFragments,
    solvedBonusYolkPuzzles,
  );
  const vaultLabBonusYolkPuzzles = unlockedBonusYolkPuzzles.filter(
    (puzzleRecord) => puzzleRecord.source_kind === "vault_lab",
  );
  const totalVaultLabBonusYolkPuzzleCount = allBonusYolkPuzzles.filter(
    (puzzleRecord) => puzzleRecord.source_kind === "vault_lab",
  ).length;

  const knownRecords = listDiscoveryRecordsFeature();
  const discoveredRecords = discoveredSecrets
    .map((secretId) => resolveDiscoveryRecordFeature(secretId))
    .filter((record): record is NonNullable<typeof record> => record !== null);

  const hasMustacheTutorialUnlocked = ridiculousRewards.includes("mustache_disguises_reward");
  const allRiddlesSolved = coreGoldenYolkCount >= 5;

  const storyProgressRecords: StoryProgressViewRecord[] = [
    {
      id: "manifesto_arc",
      label: "Manifesto",
      title: "The Burnt Crust Opening Manifesto",
      is_unlocked: true,
      body: carton_story_script_bundle.manifesto_quote_line,
      note: buildStorySnippetFeature(carton_story_script_bundle.manifesto_story_text),
    },
    {
      id: "enter_carton_arc",
      label: "Transition",
      title: "Enter The Carton",
      is_unlocked: true,
      body:
        carton_story_script_bundle.enter_carton_tip_lines[
          Math.min(
            coreGoldenYolkCount,
            carton_story_script_bundle.enter_carton_tip_lines.length - 1,
          )
        ] ?? carton_story_script_bundle.enter_carton_story_text,
      note: buildStorySnippetFeature(carton_story_script_bundle.enter_carton_story_text),
    },
    {
      id: "stiff_upper_lip_arc",
      label: "Reward Tutorial",
      title: "Protocol Stiff Upper Lip",
      is_unlocked: hasMustacheTutorialUnlocked,
      body: hasMustacheTutorialUnlocked
        ? carton_story_script_bundle.stiff_upper_lip_command_line
        : "Unlock after solving Sir Toasty's first gate and deploying Mustache Disguises.",
      note: buildStorySnippetFeature(carton_story_script_bundle.stiff_upper_lip_story_text),
    },
    {
      id: "served_screen_arc",
      label: "Failure Loop",
      title: carton_story_script_bundle.served_screen_headline,
      is_unlocked: true,
      body:
        carton_story_script_bundle.served_screen_critique_lines[0] ??
        carton_story_script_bundle.served_screen_story_text,
      note: buildStorySnippetFeature(carton_story_script_bundle.served_screen_story_text),
    },
    {
      id: "great_whisking_arc",
      label: "Finale",
      title: "The Great Whisking",
      is_unlocked: allRiddlesSolved,
      body: allRiddlesSolved
        ? carton_story_script_bundle.great_whisking_call_line
        : "Unlocks after all five absurd riddle gates are solved.",
      note: buildStorySnippetFeature(carton_story_script_bundle.great_whisking_story_text),
    },
    {
      id: "post_credits_arc",
      label: "Post-Credits",
      title: "The Poultry Paradox",
      is_unlocked: allRiddlesSolved,
      body: allRiddlesSolved
        ? carton_story_script_bundle.post_credits_reveal_line
        : "Post-credits lore appears after The Great Whisking completes.",
      note: buildStorySnippetFeature(carton_story_script_bundle.post_credits_story_text),
    },
  ];

  const beginningStoryPreview = truncateStoryTextFeature(
    buildStorySnippetFeature(carton_story_script_bundle.manifesto_story_text),
    265,
  );

  const cartonFeedPreview =
    carton_story_script_bundle.enter_carton_tip_lines[
      Math.min(coreGoldenYolkCount, carton_story_script_bundle.enter_carton_tip_lines.length - 1)
    ] ?? carton_story_script_bundle.enter_carton_story_text;

  const showDiscoveryRecordsPanel = complexityTier >= 2;
  const showStoryArchivePanel = complexityTier >= 3;
  const showDiagnosticsPanel = complexityTier >= 4;
  const shouldRenderFullRiddleBooth = goldenYolkCount >= 2;

  const handleOpenCartonModalFeature = (): void => {
    setIsCartonModalOpen(true);
  };

  const handleCloseCartonModalFeature = (): void => {
    setIsCartonModalOpen(false);
  };

  const handleToggleRiddleBoothFeature = (): void => {
    setIsRiddleBoothVisible((currentValue) => !currentValue);
  };

  const handleRevealHiddenHintFragmentFeature = (fragmentId: HiddenHintFragmentId): void => {
    const fragmentRecord = resolveHiddenHintFragmentFeature(fragmentId);
    const hasAlreadyRevealed = revealedHiddenHintFragments.includes(fragmentId);

    if (!hasAlreadyRevealed) {
      revealHiddenHintFragment(fragmentId);
    }

    setHiddenFragmentPingText(
      fragmentRecord
        ? hasAlreadyRevealed
          ? `Hint shard already archived: ${fragmentRecord.title}.`
          : `Hint shard recovered: ${fragmentRecord.title} (${fragmentRecord.source_window_label}).`
        : "Unknown hint shard pinged.",
    );
  };

  const handleSetBonusYolkPuzzleAnswerDraftFeature = (
    puzzleId: BonusYolkPuzzleId,
    nextValue: string,
  ): void => {
    setBonusYolkPuzzleAnswerDraftMap((currentState) => ({
      ...currentState,
      [puzzleId]: nextValue,
    }));
  };

  const handleSubmitBonusYolkPuzzleFeature = (puzzleId: BonusYolkPuzzleId): void => {
    const puzzleRecord = vaultLabBonusYolkPuzzles.find((record) => record.id === puzzleId);

    if (!puzzleRecord) {
      setBonusYolkLabStatusText("Puzzle not available yet. Keep collecting hint fragments.");
      return;
    }

    if (solvedBonusYolkPuzzles.includes(puzzleId)) {
      setBonusYolkLabStatusText(`${puzzleRecord.title} already solved. Yolk already credited.`);
      return;
    }

    const candidateAnswer = bonusYolkPuzzleAnswerDraftMap[puzzleId] ?? "";
    const isCorrect = verifyBonusYolkPuzzleAnswerFeature(puzzleRecord, candidateAnswer);

    if (!isCorrect) {
      setBonusYolkLabStatusText(
        `Incorrect. Sir Toasty says to reread the shards from ${puzzleRecord.required_hint_fragment_ids.length} windows.`,
      );
      return;
    }

    solveBonusYolkPuzzle(puzzleId);
    setBonusYolkLabStatusText(
      `${puzzleRecord.reward_title} credited. ${puzzleRecord.reward_effect_copy}`,
    );
  };

  const bringDesktopWindowToFrontFeature = (windowId: string): void => {
    setDesktopWindowZIndexMap((currentState) => {
      const nextZIndexValue = Math.max(...Object.values(currentState), 20) + 1;

      return {
        ...currentState,
        [windowId]: nextZIndexValue,
      };
    });
  };

  const bringModalWindowToFrontFeature = (windowId: string): void => {
    setModalWindowZIndexMap((currentState) => {
      const nextZIndexValue = Math.max(...Object.values(currentState), 20) + 1;

      return {
        ...currentState,
        [windowId]: nextZIndexValue,
      };
    });
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden pb-14 pt-4 text-[#161616] sm:pb-16 sm:pt-6"
      style={{
        fontFamily:
          '"MS Sans Serif","Trebuchet MS","Verdana","Segoe UI",sans-serif',
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#a5e8ff_0%,#b5dbff_28%,#cab7ff_65%,#e6acd8_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.8)_0px,transparent_36%),radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.65)_0px,transparent_40%),radial-gradient(circle_at_58%_14%,rgba(255,196,245,0.6)_0px,transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[43vh] bg-[linear-gradient(180deg,transparent_0%,rgba(213,174,255,0.25)_30%,rgba(235,168,214,0.42)_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-8 h-[38vh] origin-bottom [transform:perspective(1100px)_rotateX(73deg)_scale(1.4)] bg-[linear-gradient(to_right,rgba(255,255,255,0.82)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,255,255,0.82)_2px,transparent_2px)] [background-size:56px_56px] opacity-80 sm:bottom-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(20,9,32,0)_0%,rgba(30,10,40,0.18)_30%,rgba(10,8,18,0.34)_100%)]" />

      <div className="pointer-events-none absolute right-[8%] top-[18%] hidden h-20 w-20 rounded-full border-[10px] border-cyan-200/70 shadow-[0_0_30px_rgba(102,255,245,0.35)] lg:block" />
      <div className="pointer-events-none absolute left-[6%] top-[8%] hidden h-14 w-14 rounded-full border-[8px] border-cyan-100/65 opacity-70 lg:block" />
      <div className="pointer-events-none absolute left-[14%] bottom-[18%] hidden h-16 w-16 rotate-12 bg-cyan-300/70 shadow-[0_10px_18px_rgba(0,0,0,0.2)] lg:block" />
      <div className="pointer-events-none absolute right-[6%] bottom-[20%] hidden lg:block">
        <div className="relative h-40 w-28">
          <div className="absolute bottom-0 left-1/2 h-14 w-20 -translate-x-1/2 rounded-t-[40%] bg-white/75 shadow-[0_0_20px_rgba(255,255,255,0.45)]" />
          <div className="absolute bottom-10 left-1/2 h-20 w-14 -translate-x-1/2 rounded-[46%] bg-white/80" />
          <div className="absolute bottom-28 left-1/2 h-14 w-16 -translate-x-1/2 rounded-[48%] bg-white/88" />
          <div className="absolute bottom-36 left-1/2 h-8 w-[4.5rem] -translate-x-1/2 rounded-full bg-white/88" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-[52%] bottom-[22%] hidden translate-x-[-50%] items-end gap-8 lg:flex">
        {[0, 1, 2].map((columnIndex) => (
          <div key={columnIndex} className="relative h-44 w-8 bg-white/60 shadow-[0_0_20px_rgba(255,255,255,0.35)]">
            <div className="absolute -top-2 left-1/2 h-3 w-10 -translate-x-1/2 rounded-sm border border-white/70 bg-white/80" />
            <div className="absolute -bottom-2 left-1/2 h-3 w-10 -translate-x-1/2 rounded-sm border border-white/70 bg-white/75" />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute left-3 top-16 z-10 hidden flex-col gap-4 md:flex">
        {[
          { label: "story.txt", accent: "bg-cyan-200/75" },
          { label: "carton.exe", accent: "bg-fuchsia-200/75" },
          { label: "surface.lnk", accent: "bg-emerald-200/75" },
        ].map((iconRecord) => (
          <div key={iconRecord.label} className="flex w-20 flex-col items-center gap-1 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-white/70 bg-white/35 shadow-[2px_2px_0_rgba(0,0,0,0.25)] backdrop-blur-sm">
              <div className={joinClassNamesFeature("h-6 w-6 border border-black/30", iconRecord.accent)} />
            </div>
            <p className="bg-white/45 px-1 text-[10px] leading-4 text-[#121212] shadow-[1px_1px_0_rgba(255,255,255,0.5)]">
              {iconRecord.label}
            </p>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-10 hidden md:block">
        <RenderRetroDesktopWindowComponent
          title_text="now_playing.wav"
          accent="lavender"
          class_name="w-56"
          body_class_name="bg-[#e6e6ea]"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 border-2 border-white border-r-[#2e2e2e] border-b-[#2e2e2e] bg-[linear-gradient(135deg,#8bdcff_0%,#9dafff_45%,#ff8fd9_100%)]" />
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-[#2a2a2a]">
                Nobody Here
              </p>
              <p className="mt-1 text-[10px] text-[#464646]">play // cassette glitch</p>
            </div>
          </div>
        </RenderRetroDesktopWindowComponent>
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 sm:px-5">
        <div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <RenderRetroDesktopWindowComponent
              title_text="carton_boot_manifesto.txt"
              accent="cyan"
              class_name="lg:mt-10"
              body_class_name="bg-[#dfe0e4]"
              subtitle_text="Sir Toasty / Burnt Crust transmission"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#6440a1]">
                First Transmission
              </p>
              <p className="mt-3 text-sm leading-6 text-[#222]">{beginningStoryPreview}</p>
              <div className="mt-4 border-2 border-white border-r-[#7f7f8e] border-b-[#7f7f8e] bg-white/60 p-2">
                <p className="font-mono text-xs leading-5 text-[#2b2b2b]">
                  {carton_story_script_bundle.manifesto_quote_line}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="border border-[#6f6f79] bg-[#f1f1f4] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#232323]">
                  Secrets {discoveredSecretCount}
                </span>
                <span className="border border-[#6f6f79] bg-[#f1f1f4] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#232323]">
                  Yolks {goldenYolkCount} ({formatCoreBonusYolkReadoutFeature(coreGoldenYolkCount, bonusGoldenYolkCount)})
                </span>
                <span className="border border-[#6f6f79] bg-[#f1f1f4] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#232323]">
                  Tier {complexityTier + 1}
                </span>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#4a4a4a]">
                {truncateStoryTextFeature(cartonFeedPreview, 120)}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#744ba2]">
                The console trigger is hidden directly in the carton artwork.
              </p>
            </RenderRetroDesktopWindowComponent>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.28, ease: "easeOut" }}
            className="lg:translate-y-6"
          >
            <div className="lg:hidden">
              <RenderRetroDesktopWindowComponent
                title_text="carton.png"
                accent="pink"
                subtitle_text="double-click the wrong thing, probably"
                body_class_name="bg-[#d9d9de] p-2"
              >
                <div className="relative aspect-square overflow-hidden border-2 border-[#f3f3f7] border-r-[#3a3a44] border-b-[#3a3a44] bg-black">
                  <Image
                    src="/carton.png"
                    alt="The Carton vault artwork"
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                    priority={false}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.14),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/35 px-3 py-2 backdrop-blur-[1px]">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-cyan-100">
                      Carton Console wallpaper
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-white/70">
                      Hidden hotspot embedded in the toast monocle.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCartonModalFeature}
                    aria-label="Open Carton Console"
                    title="Carton seam"
                    className="group absolute left-[58.7%] top-[15.2%] z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <span className="pointer-events-none absolute inset-1 rounded-full border border-cyan-100/90 opacity-0 transition duration-200 group-hover:opacity-30 group-focus-visible:opacity-70" />
                    <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_28px_rgba(135,255,247,0.45)] opacity-0 transition duration-200 group-hover:opacity-45 group-focus-visible:opacity-75" />
                    <span className="sr-only">Hidden Carton Console trigger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRevealHiddenHintFragmentFeature("carton_corner_star_fragment")}
                    aria-label="Recover hidden corner spark hint shard"
                    title="corner spark"
                    className="group absolute bottom-[3.6%] right-[3.6%] z-10 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-transparent outline-none"
                  >
                    <span className="pointer-events-none absolute inset-1 rotate-45 border border-white/70 opacity-0 transition group-hover:opacity-70 group-focus-visible:opacity-80" />
                    <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.0)_65%)] opacity-10 transition group-hover:opacity-40" />
                  </button>
                </div>
              </RenderRetroDesktopWindowComponent>
            </div>

            <div
              ref={desktopWindowCanvasRef}
              className="relative hidden h-[40rem] rounded-none border-2 border-white/30 border-r-black/20 border-b-black/20 bg-transparent lg:block"
            >
              <RenderDraggableWindowShellComponent
                window_id="help_window"
                drag_constraints_ref={desktopWindowCanvasRef}
                z_index_value={desktopWindowZIndexMap.help_window}
                on_activate_window={bringDesktopWindowToFrontFeature}
                class_name="absolute w-[16rem] cursor-grab"
                initial_left_px={20}
                initial_top_px={278}
              >
                <RenderRetroDesktopWindowComponent
                  title_text="help.msg"
                  accent="lavender"
                  body_class_name="bg-[#e2e3e8]"
                >
                  <p className="text-xs text-[#222]">Want to see more?</p>
                  <p className="mt-2 text-[12px] leading-5 text-[#3f3f46]">
                    Open the Carton Console. It starts minimal and mutates into a mess as
                    more eggs are discovered.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleOpenCartonModalFeature}
                      className={retroDesktopButtonClassName}
                    >
                      Open Console
                    </button>
                    <Link href="/" className={retroDesktopButtonClassName}>
                      Surface
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevealHiddenHintFragmentFeature("help_msg_staple_fragment")}
                    aria-label="Recover hint shard hidden in help message"
                    title="bent staple"
                    className="absolute bottom-1 right-1 inline-flex h-4 w-4 items-center justify-center rounded-none border border-[#777] bg-[#efeff4] text-[10px] text-[#444] opacity-30 transition hover:opacity-100 focus-visible:opacity-100"
                  >
                    *
                  </button>
                </RenderRetroDesktopWindowComponent>
              </RenderDraggableWindowShellComponent>

              <RenderDraggableWindowShellComponent
                window_id="vault_status_window"
                drag_constraints_ref={desktopWindowCanvasRef}
                z_index_value={desktopWindowZIndexMap.vault_status_window}
                on_activate_window={bringDesktopWindowToFrontFeature}
                class_name="absolute w-[22rem] cursor-grab"
                initial_left_px={176}
                initial_top_px={316}
              >
                <RenderRetroDesktopWindowComponent
                  title_text="vault_status.sys"
                  accent="mint"
                  body_class_name="bg-[#e1e2e7]"
                >
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                      { label: "Riddle Booth", value: "Available", active: true },
                      {
                        label: "Records",
                        value: showDiscoveryRecordsPanel ? "Unlocked" : "Locked",
                        active: showDiscoveryRecordsPanel,
                      },
                      {
                        label: "Archive",
                        value: showStoryArchivePanel ? "Unlocked" : "Locked",
                        active: showStoryArchivePanel,
                      },
                    ].map((tileRecord) => (
                      <div
                        key={tileRecord.label}
                        className={joinClassNamesFeature(
                          "border-2 p-2",
                          tileRecord.active
                            ? "border-[#f7f7fa] border-r-[#64646f] border-b-[#64646f] bg-white/70"
                            : "border-[#f2f2f5] border-r-[#8d8d98] border-b-[#8d8d98] bg-white/35 opacity-80",
                        )}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5a5a67]">
                          {tileRecord.label}
                        </p>
                        <p className="mt-1 font-mono text-xs text-[#202020]">{tileRecord.value}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRevealHiddenHintFragmentFeature("vault_status_led_fragment")}
                    aria-label="Recover hidden hint shard from status LED"
                    title="status led smear"
                    className="absolute right-2 top-2 h-3 w-3 rounded-full border border-[#2f5f46] bg-[#5ef1a7]/60 opacity-35 transition hover:opacity-100 focus-visible:opacity-100"
                  />
                  <p className="mt-3 text-[12px] leading-5 text-[#3c3c44]">
                    Great Whisking readiness: {coreGoldenYolkCount}/5 core yolks
                    {bonusGoldenYolkCount > 0 ? ` (+${bonusGoldenYolkCount} bonus)` : ""}.
                    Ridiculous rewards unlocked: {ridiculousRewards.length}.
                  </p>
                </RenderRetroDesktopWindowComponent>
              </RenderDraggableWindowShellComponent>

              <RenderDraggableWindowShellComponent
                window_id="boot_log_window"
                drag_constraints_ref={desktopWindowCanvasRef}
                z_index_value={desktopWindowZIndexMap.boot_log_window}
                on_activate_window={bringDesktopWindowToFrontFeature}
                class_name="absolute w-[14.5rem] cursor-grab"
                initial_left_px={386}
                initial_top_px={392}
              >
                <RenderRetroDesktopWindowComponent
                  title_text="boot_log.tmp"
                  accent="amber"
                  body_class_name="bg-[#e4e1e8]"
                >
                  <div className="h-24 overflow-auto border-2 border-[#fbfbfd] border-r-[#71717d] border-b-[#71717d] bg-[#f4f4f7] p-2 font-mono text-[11px] leading-5 text-[#252525]">
                    <p>&gt; carton online</p>
                    <p>&gt; seam scan: {discoveredSecretCount} anomalies</p>
                    <p>
                      &gt; yolk frequency:{" "}
                      {formatCoreBonusYolkReadoutFeature(coreGoldenYolkCount, bonusGoldenYolkCount)}
                    </p>
                    <p>&gt; rewards deployed: {ridiculousRewards.length}</p>
                    <p>&gt; console tier: {complexityTier + 1}/{maximumCartonComplexityTierCount}</p>
                    <p>
                      &gt; checksum: 7A-
                      <button
                        type="button"
                        onClick={() =>
                          handleRevealHiddenHintFragmentFeature("boot_log_checksum_fragment")
                        }
                        aria-label="Recover checksum hint shard"
                        title="checksum scratch"
                        className="inline-flex h-4 w-4 items-center justify-center border border-transparent px-0 text-[10px] text-[#6b46a5] opacity-40 transition hover:border-[#6b46a5]/40 hover:opacity-100 focus-visible:border-[#6b46a5]/70 focus-visible:opacity-100"
                      >
                        #
                      </button>
                      -24
                    </p>
                  </div>
                </RenderRetroDesktopWindowComponent>
              </RenderDraggableWindowShellComponent>

              <RenderDraggableWindowShellComponent
                window_id="carton_window"
                drag_constraints_ref={desktopWindowCanvasRef}
                z_index_value={desktopWindowZIndexMap.carton_window}
                on_activate_window={bringDesktopWindowToFrontFeature}
                class_name="absolute w-[33rem] cursor-grab"
                initial_left_px={72}
                initial_top_px={8}
              >
                <RenderRetroDesktopWindowComponent
                  title_text="carton.png"
                  accent="pink"
                  subtitle_text="drag me around if you want to snoop"
                  body_class_name="bg-[#d9d9de] p-2"
                >
                  <div className="relative aspect-square overflow-hidden border-2 border-[#f3f3f7] border-r-[#3a3a44] border-b-[#3a3a44] bg-black">
                    <Image
                      src="/carton.png"
                      alt="The Carton vault artwork"
                      fill
                      sizes="(min-width: 1024px) 33rem, 100vw"
                      className="object-cover object-center"
                      priority={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.14),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-white/15 bg-black/35 px-3 py-2 backdrop-blur-[1px]">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-cyan-100">
                        Carton Console wallpaper
                      </p>
                      <p className="mt-1 text-[11px] leading-4 text-white/70">
                        Hidden hotspot embedded in the toast monocle.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCartonModalFeature}
                      aria-label="Open Carton Console"
                      title="Carton seam"
                      className="group absolute left-[58.7%] top-[15.2%] z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      <span className="pointer-events-none absolute inset-1 rounded-full border border-cyan-100/90 opacity-0 transition duration-200 group-hover:opacity-30 group-focus-visible:opacity-70" />
                      <span className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_28px_rgba(135,255,247,0.45)] opacity-0 transition duration-200 group-hover:opacity-45 group-focus-visible:opacity-75" />
                      <span className="sr-only">Hidden Carton Console trigger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleRevealHiddenHintFragmentFeature("carton_corner_star_fragment")
                      }
                      aria-label="Recover hidden corner spark hint shard"
                      title="corner spark"
                      className="group absolute bottom-[3.6%] right-[3.6%] z-10 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full bg-transparent outline-none"
                    >
                      <span className="pointer-events-none absolute inset-1 rotate-45 border border-white/70 opacity-0 transition group-hover:opacity-70 group-focus-visible:opacity-80" />
                      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.0)_65%)] opacity-10 transition group-hover:opacity-40" />
                    </button>
                  </div>
                </RenderRetroDesktopWindowComponent>
              </RenderDraggableWindowShellComponent>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-4 lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.24, ease: "easeOut" }}
          >
            <RenderRetroDesktopWindowComponent
              title_text="help.msg"
              accent="lavender"
              body_class_name="bg-[#e2e3e8]"
            >
              <p className="font-mono text-xs text-[#222]">Want to see more?</p>
              <p className="mt-2 text-[12px] leading-5 text-[#3f3f46]">
                Open the Carton Console. It starts minimal and mutates into a mess as
                more eggs are discovered.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOpenCartonModalFeature}
                  className={retroDesktopButtonClassName}
                >
                  Open Console
                </button>
                <Link href="/" className={retroDesktopButtonClassName}>
                  Surface
                </Link>
              </div>
              <button
                type="button"
                onClick={() => handleRevealHiddenHintFragmentFeature("help_msg_staple_fragment")}
                aria-label="Recover hint shard hidden in help message"
                title="bent staple"
                className="absolute bottom-1 right-1 inline-flex h-4 w-4 items-center justify-center rounded-none border border-[#777] bg-[#efeff4] text-[10px] text-[#444] opacity-30 transition hover:opacity-100 focus-visible:opacity-100"
              >
                *
              </button>
            </RenderRetroDesktopWindowComponent>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.24, ease: "easeOut" }}
          >
            <RenderRetroDesktopWindowComponent
              title_text="vault_status.sys"
              accent="mint"
              body_class_name="bg-[#e1e2e7]"
            >
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Riddle Booth", value: "Available", active: true },
                  {
                    label: "Records",
                    value: showDiscoveryRecordsPanel ? "Unlocked" : "Locked",
                    active: showDiscoveryRecordsPanel,
                  },
                  {
                    label: "Archive",
                    value: showStoryArchivePanel ? "Unlocked" : "Locked",
                    active: showStoryArchivePanel,
                  },
                ].map((tileRecord) => (
                  <div
                    key={tileRecord.label}
                    className={joinClassNamesFeature(
                      "border-2 p-2",
                      tileRecord.active
                        ? "border-[#f7f7fa] border-r-[#64646f] border-b-[#64646f] bg-white/70"
                        : "border-[#f2f2f5] border-r-[#8d8d98] border-b-[#8d8d98] bg-white/35 opacity-80",
                    )}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5a5a67]">
                      {tileRecord.label}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[#202020]">{tileRecord.value}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleRevealHiddenHintFragmentFeature("vault_status_led_fragment")}
                aria-label="Recover hidden hint shard from status LED"
                title="status led smear"
                className="absolute right-2 top-2 h-3 w-3 rounded-full border border-[#2f5f46] bg-[#5ef1a7]/60 opacity-35 transition hover:opacity-100 focus-visible:opacity-100"
              />
              <p className="mt-3 text-[12px] leading-5 text-[#3c3c44]">
                Great Whisking readiness: {coreGoldenYolkCount}/5 core yolks
                {bonusGoldenYolkCount > 0 ? ` (+${bonusGoldenYolkCount} bonus)` : ""}.
                Ridiculous rewards unlocked: {ridiculousRewards.length}.
              </p>
            </RenderRetroDesktopWindowComponent>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.24, ease: "easeOut" }}
          >
            <RenderRetroDesktopWindowComponent
              title_text="boot_log.tmp"
              accent="amber"
              body_class_name="bg-[#e4e1e8]"
            >
              <div className="h-24 overflow-auto border-2 border-[#fbfbfd] border-r-[#71717d] border-b-[#71717d] bg-[#f4f4f7] p-2 font-mono text-[11px] leading-5 text-[#252525]">
                <p>&gt; carton online</p>
                <p>&gt; seam scan: {discoveredSecretCount} anomalies</p>
                <p>
                  &gt; yolk frequency:{" "}
                  {formatCoreBonusYolkReadoutFeature(coreGoldenYolkCount, bonusGoldenYolkCount)}
                </p>
                <p>&gt; rewards deployed: {ridiculousRewards.length}</p>
                <p>&gt; console tier: {complexityTier + 1}/{maximumCartonComplexityTierCount}</p>
                <p>
                  &gt; checksum: 7A-
                  <button
                    type="button"
                    onClick={() => handleRevealHiddenHintFragmentFeature("boot_log_checksum_fragment")}
                    aria-label="Recover checksum hint shard"
                    title="checksum scratch"
                    className="inline-flex h-4 w-4 items-center justify-center border border-transparent px-0 text-[10px] text-[#6b46a5] opacity-40 transition hover:border-[#6b46a5]/40 hover:opacity-100 focus-visible:border-[#6b46a5]/70 focus-visible:opacity-100"
                  >
                    #
                  </button>
                  -24
                </p>
              </div>
            </RenderRetroDesktopWindowComponent>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 h-14 border-t-2 border-[#f7f7fa] bg-[#c9c9cf] shadow-[inset_0_2px_0_rgba(255,255,255,0.65)] sm:h-16">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-2 px-3 sm:px-5">
          <button type="button" onClick={handleOpenCartonModalFeature} className={retroDesktopButtonClassName}>
            Carton
          </button>
          <Link href="/" className={retroDesktopButtonClassName}>
            Surface
          </Link>
          <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
            <div className="min-w-0 flex-1 border-2 border-[#9999a7] border-r-white border-b-white bg-[#dcdce2] px-3 py-1 text-[11px] text-[#2a2a2f]">
              {"CartonDesktop.exe // "}
              {hiddenFragmentPingText}
              {" // shards "}
              {revealedHiddenHintFragments.length}
              {" // side-yolks "}
              {solvedBonusYolkPuzzles.length}
            </div>
          </div>
          <div className="ml-auto border-2 border-[#8f8f9d] border-r-white border-b-white bg-[#ddddE3] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-[#222]">
            {goldenYolkCount} yolks ({formatCoreBonusYolkReadoutFeature(coreGoldenYolkCount, bonusGoldenYolkCount)})
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCartonModalOpen ? (
          <div className="fixed inset-0 z-50">
            <motion.button
              type="button"
              aria-label="Close Carton Console"
              onClick={handleCloseCartonModalFeature}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,255,247,0.18),transparent_45%),radial-gradient(circle_at_80%_18%,rgba(255,142,228,0.18),transparent_42%),rgba(7,10,16,0.72)] backdrop-blur-[3px]"
            />

            <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-5">
              <motion.section
                role="dialog"
                aria-modal="true"
                aria-label="Carton Console"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(event) => event.stopPropagation()}
                className="relative z-10 flex w-full max-w-6xl flex-col overflow-hidden rounded-none border-2 border-[#f5f5f9] border-r-[#2d2d35] border-b-[#2d2d35] bg-[#cfd0d6] shadow-[6px_6px_0_rgba(0,0,0,0.42)]"
              >
                <div className="flex items-center justify-between gap-2 border-b-2 border-[#2b2b35] bg-[linear-gradient(90deg,#74ebff_0%,#90ceff_32%,#b19bff_66%,#f78fe8_100%)] px-3 py-1.5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#111420]">
                      CartonDesktop.exe // The Carton Console
                    </p>
                    <p className="mt-0.5 text-[10px] text-black/70">
                      Complexity tier {complexityTier + 1} of {maximumCartonComplexityTierCount}
                    </p>
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    {["_", "[]", "X"].map((buttonText) => (
                      <button
                        key={buttonText}
                        type="button"
                        onClick={buttonText === "X" ? handleCloseCartonModalFeature : undefined}
                        className="inline-flex h-5 min-w-5 items-center justify-center border border-black/50 bg-white/65 px-1 text-[10px] font-bold text-black/80 hover:bg-white/80"
                        aria-label={buttonText === "X" ? "Close" : undefined}
                      >
                        {buttonText}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  ref={modalWindowCanvasRef}
                  className="relative max-h-[82vh] overflow-y-auto bg-[linear-gradient(180deg,#d9e0ef_0%,#d8d1e6_44%,#d9c9e2_100%)] p-3 sm:p-4"
                >
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(177,152,232,0.12)_40%,rgba(116,235,255,0.12)_100%)]" />
                  <div className="relative z-10 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                    <RenderDraggableWindowShellComponent
                      window_id="modal_story_window"
                      drag_constraints_ref={modalWindowCanvasRef}
                      z_index_value={modalWindowZIndexMap.modal_story_window}
                      on_activate_window={bringModalWindowToFrontFeature}
                      class_name="relative cursor-grab"
                    >
                      <RenderRetroDesktopWindowComponent
                        title_text="opening_story.arc"
                        accent="cyan"
                        body_class_name="bg-[#e4e5ea]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5f5f69]">
                          Opening Storyline
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#232323]">
                          {beginningStoryPreview}
                        </p>
                        <div className="mt-3 border-2 border-[#fafafd] border-r-[#73737e] border-b-[#73737e] bg-white/75 p-2">
                          <p className="font-mono text-xs leading-5 text-[#2b2b2b]">
                            {carton_story_script_bundle.manifesto_quote_line}
                          </p>
                        </div>
                      </RenderRetroDesktopWindowComponent>
                    </RenderDraggableWindowShellComponent>

                    <RenderDraggableWindowShellComponent
                      window_id="modal_module_window"
                      drag_constraints_ref={modalWindowCanvasRef}
                      z_index_value={modalWindowZIndexMap.modal_module_window}
                      on_activate_window={bringModalWindowToFrontFeature}
                      class_name="relative cursor-grab"
                    >
                      <RenderRetroDesktopWindowComponent
                        title_text="module_unlocks.cfg"
                        accent="amber"
                        body_class_name="bg-[#e4e1e8]"
                      >
                        <div className="grid gap-2 text-xs">
                          {[
                            { label: "Riddle Booth", active: true },
                            { label: "Discovery Records", active: showDiscoveryRecordsPanel },
                            { label: "Story Archive", active: showStoryArchivePanel },
                            { label: "Diagnostics", active: showDiagnosticsPanel },
                          ].map((moduleRecord) => (
                            <div
                              key={moduleRecord.label}
                              className={joinClassNamesFeature(
                                "flex items-center justify-between border-2 px-2 py-1.5",
                                moduleRecord.active
                                  ? "border-[#fbfbff] border-r-[#6b6b78] border-b-[#6b6b78] bg-white/70"
                                  : "border-[#f3f3f7] border-r-[#9a9aa8] border-b-[#9a9aa8] bg-white/35 text-[#666]",
                              )}
                            >
                              <span className="font-mono text-[11px] uppercase tracking-[0.08em]">
                                {moduleRecord.label}
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                                {moduleRecord.active ? "Unlocked" : "Locked"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </RenderRetroDesktopWindowComponent>
                    </RenderDraggableWindowShellComponent>
                  </div>

                  <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleRiddleBoothFeature}
                      className={retroDesktopButtonClassName}
                    >
                      {isRiddleBoothVisible ? "Hide Riddle Booth" : "Open Riddle Booth"}
                    </button>
                    <Link href="/" className={retroDesktopButtonClassName}>
                      Return To Surface
                    </Link>
                    <div className="ml-auto border-2 border-[#9a9aa7] border-r-white border-b-white bg-[#e7e7ec] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#252525]">
                      Yolk freq {formatCoreBonusYolkReadoutFeature(coreGoldenYolkCount, bonusGoldenYolkCount)}
                    </div>
                  </div>

                  {isRiddleBoothVisible ? (
                    <div className="relative z-10 mt-3">
                      <RenderDraggableWindowShellComponent
                        window_id="modal_riddle_window"
                        drag_constraints_ref={modalWindowCanvasRef}
                        z_index_value={modalWindowZIndexMap.modal_riddle_window}
                        on_activate_window={bringModalWindowToFrontFeature}
                        class_name="relative cursor-grab"
                      >
                        <RenderRetroDesktopWindowComponent
                          title_text={
                            shouldRenderFullRiddleBooth
                              ? "riddle_booth.exe"
                              : "riddle_booth_lite.exe"
                          }
                          accent="mint"
                          body_class_name="bg-[#d7d8de] p-2"
                        >
                          <div className="border-2 border-[#fbfbff] border-r-[#5f5f69] border-b-[#5f5f69] bg-[#ececf2] p-1.5">
                            <RenderCartonRiddleGateComponent
                              carton_story_script_bundle={carton_story_script_bundle}
                              presentation_mode={shouldRenderFullRiddleBooth ? "full" : "compact"}
                              ui_theme="retro_desktop"
                            />
                          </div>
                        </RenderRetroDesktopWindowComponent>
                      </RenderDraggableWindowShellComponent>
                    </div>
                  ) : (
                    <div className="relative z-10 mt-3">
                      <RenderDraggableWindowShellComponent
                        window_id="modal_riddle_window"
                        drag_constraints_ref={modalWindowCanvasRef}
                        z_index_value={modalWindowZIndexMap.modal_riddle_window}
                        on_activate_window={bringModalWindowToFrontFeature}
                        class_name="relative cursor-grab"
                      >
                        <RenderRetroDesktopWindowComponent
                          title_text="riddle_booth_idle.msg"
                          accent="lavender"
                          body_class_name="bg-[#e3e0ea]"
                        >
                          <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#252525]">
                            Riddle Booth Idle
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#34343a]">
                            Start with the first Sir Toasty gate. The booth renders in compact
                            mode first, then expands as Golden Yolks are collected.
                          </p>
                        </RenderRetroDesktopWindowComponent>
                      </RenderDraggableWindowShellComponent>
                    </div>
                  )}

                  {revealedHiddenHintFragments.length > 0 ? (
                    <div className="relative z-10 mt-3">
                      <RenderDraggableWindowShellComponent
                        window_id="modal_hidden_hints_window"
                        drag_constraints_ref={modalWindowCanvasRef}
                        z_index_value={modalWindowZIndexMap.modal_hidden_hints_window}
                        on_activate_window={bringModalWindowToFrontFeature}
                        class_name="relative cursor-grab"
                      >
                        <RenderRetroDesktopWindowComponent
                          title_text="hint_shards.msg"
                          accent="lavender"
                          body_class_name="bg-[#e3e0ea]"
                          subtitle_text={`${revealedHiddenHintFragments.length}/${hiddenHintFragmentRecords.length} shards archived`}
                        >
                          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#38384a]">
                            Hidden desktop crumbs
                          </p>
                          <div className="mt-3 grid gap-2">
                            {revealedHiddenHintFragments.map((fragmentId) => {
                              const fragmentRecord = resolveHiddenHintFragmentFeature(fragmentId);

                              if (!fragmentRecord) {
                                return null;
                              }

                              return (
                                <article
                                  key={fragmentId}
                                  className="border-2 border-[#fafafe] border-r-[#6e6e79] border-b-[#6e6e79] bg-white/72 p-2.5"
                                >
                                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a4ba2]">
                                    {fragmentRecord.source_window_label}
                                  </p>
                                  <h4 className="mt-1 text-sm font-semibold text-[#1f1f1f]">
                                    {fragmentRecord.title}
                                  </h4>
                                  <p className="mt-1 text-[12px] leading-5 text-[#36363f]">
                                    {fragmentRecord.hint_text}
                                  </p>
                                </article>
                              );
                            })}
                          </div>
                          <p className="mt-3 text-[12px] leading-5 text-[#4d4d59]">
                            {hiddenFragmentPingText}
                          </p>
                        </RenderRetroDesktopWindowComponent>
                      </RenderDraggableWindowShellComponent>
                    </div>
                  ) : null}

                  {revealedHiddenHintFragments.length > 0 ? (
                    <div className="relative z-10 mt-3">
                      <RenderDraggableWindowShellComponent
                        window_id="modal_bonus_yolk_window"
                        drag_constraints_ref={modalWindowCanvasRef}
                        z_index_value={modalWindowZIndexMap.modal_bonus_yolk_window}
                        on_activate_window={bringModalWindowToFrontFeature}
                        class_name="relative cursor-grab"
                      >
                        <RenderRetroDesktopWindowComponent
                          title_text="bonus_yolk_lab.exe"
                          accent="amber"
                          body_class_name="bg-[#e6e1d9]"
                          subtitle_text={`${solvedBonusYolkPuzzles.filter((puzzleId) =>
                            allBonusYolkPuzzles.some(
                              (puzzleRecord) =>
                                puzzleRecord.id === puzzleId &&
                                puzzleRecord.source_kind === "vault_lab",
                            ),
                          ).length}/${totalVaultLabBonusYolkPuzzleCount} vault side-yolks`}
                        >
                          <div className="border-2 border-[#fbfbff] border-r-[#72727d] border-b-[#72727d] bg-[#f6f6fa] p-2 font-mono text-[11px] leading-5 text-[#242424]">
                            <p>hint_shards={revealedHiddenHintFragments.length}</p>
                            <p>vault_lab_puzzles_unlocked={vaultLabBonusYolkPuzzles.length}</p>
                            <p>bonus_yolks_credited={bonusGoldenYolkCount}</p>
                          </div>

                          {vaultLabBonusYolkPuzzles.length === 0 ? (
                            <p className="mt-3 text-sm leading-6 text-[#3f3f47]">
                              Keep moving windows and clicking odd pixels. Hidden shards will unlock side puzzles here.
                            </p>
                          ) : (
                            <div className="mt-3 grid gap-3">
                              {vaultLabBonusYolkPuzzles.map((puzzleRecord) => {
                                const isSolved = solvedBonusYolkPuzzles.includes(puzzleRecord.id);
                                const answerDraft = bonusYolkPuzzleAnswerDraftMap[puzzleRecord.id] ?? "";

                                return (
                                  <article
                                    key={puzzleRecord.id}
                                    className={joinClassNamesFeature(
                                      "border-2 p-2.5",
                                      isSolved
                                        ? "border-[#fff7ea] border-r-[#7a6a5a] border-b-[#7a6a5a] bg-white/70"
                                        : "border-[#fafafe] border-r-[#6e6e79] border-b-[#6e6e79] bg-white/72",
                                    )}
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#8f5c18]">
                                          Side Puzzle
                                        </p>
                                        <h4 className="mt-1 text-sm font-semibold text-[#1f1f1f]">
                                          {puzzleRecord.title}
                                        </h4>
                                      </div>
                                      <span className="border border-[#61616f] bg-[#f2f2f6] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2a2a2a]">
                                        {isSolved ? "Yolk Credited" : "Unlocked"}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-[12px] leading-5 text-[#33333a]">
                                      {puzzleRecord.prompt}
                                    </p>
                                    <p className="mt-1 text-[11px] leading-5 text-[#5b5b64]">
                                      Reward: {puzzleRecord.reward_title}
                                    </p>

                                    {!isSolved ? (
                                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                        <input
                                          type="text"
                                          value={answerDraft}
                                          onChange={(event) =>
                                            handleSetBonusYolkPuzzleAnswerDraftFeature(
                                              puzzleRecord.id,
                                              event.target.value,
                                            )
                                          }
                                          placeholder="Type your answer"
                                          className="retro_bitmap_font h-10 flex-1 rounded-none border-2 border-[#a3a3af] border-r-white border-b-white bg-[#f6f6fa] px-3 text-[12px] text-[#171717] outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleSubmitBonusYolkPuzzleFeature(puzzleRecord.id)}
                                          className={retroDesktopButtonClassName}
                                        >
                                          Credit Yolk
                                        </button>
                                      </div>
                                    ) : null}
                                  </article>
                                );
                              })}
                            </div>
                          )}

                          <p className="mt-3 text-[12px] leading-5 text-[#43434a]">
                            {bonusYolkLabStatusText}
                          </p>
                        </RenderRetroDesktopWindowComponent>
                      </RenderDraggableWindowShellComponent>
                    </div>
                  ) : null}

                  {showDiscoveryRecordsPanel ? (
                    <div className="relative z-10 mt-3">
                      <RenderDraggableWindowShellComponent
                        window_id="modal_records_window"
                        drag_constraints_ref={modalWindowCanvasRef}
                        z_index_value={modalWindowZIndexMap.modal_records_window}
                        on_activate_window={bringModalWindowToFrontFeature}
                        class_name="relative cursor-grab"
                      >
                        <RenderRetroDesktopWindowComponent
                          title_text="discovery_records.db"
                          accent="cyan"
                          body_class_name="bg-[#e4e5eb]"
                          subtitle_text={`${discoveredRecords.length}/${knownRecords.length} discovered`}
                        >
                          <div className="grid gap-2">
                            {discoveredRecords.map((record) => (
                              <article
                                key={record.id}
                                className="border-2 border-[#f9f9fc] border-r-[#6e6e79] border-b-[#6e6e79] bg-white/70 p-2.5"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#7a3f1c]">
                                      Carton Record
                                    </p>
                                    <h4 className="mt-1 text-sm font-semibold text-[#1e1e1e]">
                                      {record.title}
                                    </h4>
                                    <p className="mt-1 text-[12px] leading-5 text-[#3e3e45]">
                                      {truncateStoryTextFeature(record.summary, 150)}
                                    </p>
                                  </div>
                                  <Link href={`/${record.id}`} className={retroDesktopButtonClassName}>
                                    Open
                                  </Link>
                                </div>
                              </article>
                            ))}
                          </div>
                        </RenderRetroDesktopWindowComponent>
                      </RenderDraggableWindowShellComponent>
                    </div>
                  ) : null}

                  {showStoryArchivePanel ? (
                    <div className="relative z-10 mt-3">
                      <RenderDraggableWindowShellComponent
                        window_id="modal_archive_window"
                        drag_constraints_ref={modalWindowCanvasRef}
                        z_index_value={modalWindowZIndexMap.modal_archive_window}
                        on_activate_window={bringModalWindowToFrontFeature}
                        class_name="relative cursor-grab"
                      >
                        <RenderRetroDesktopWindowComponent
                          title_text="story_archive.arc"
                          accent="pink"
                          body_class_name="bg-[#e6e0ea]"
                        >
                          <div className="grid gap-2">
                            {storyProgressRecords.map((storyRecord) => (
                              <article
                                key={storyRecord.id}
                                className={joinClassNamesFeature(
                                  "relative border-2 p-2.5",
                                  storyRecord.is_unlocked
                                    ? "border-[#fafafe] border-r-[#6e6e79] border-b-[#6e6e79] bg-white/72"
                                    : "border-[#f5f5f8] border-r-[#9494a2] border-b-[#9494a2] bg-white/38 opacity-90",
                                )}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#7a4aa0]">
                                      {storyRecord.label}
                                    </p>
                                    <h4 className="mt-1 text-sm font-semibold text-[#1f1f1f]">
                                      {storyRecord.title}
                                    </h4>
                                  </div>
                                  <span className="border border-[#61616f] bg-[#f2f2f6] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2a2a2a]">
                                    {storyRecord.is_unlocked ? "Unlocked" : "Locked"}
                                  </span>
                                </div>
                                <p className="mt-2 text-[12px] leading-5 text-[#33333a]">
                                  {storyRecord.body}
                                </p>
                                <p className="mt-1 text-[11px] leading-5 text-[#5b5b64]">
                                  {truncateStoryTextFeature(storyRecord.note, 190)}
                                </p>
                                {storyRecord.id === "post_credits_arc" && storyRecord.is_unlocked ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRevealHiddenHintFragmentFeature(
                                        "post_credits_waffle_iron_fragment",
                                      )
                                    }
                                    aria-label="Recover post-credits hint shard"
                                    title="waffle iron seam"
                                    className="absolute bottom-1.5 right-1.5 inline-flex h-4 w-4 items-center justify-center border border-transparent bg-transparent p-0 text-[10px] leading-none text-[#7b4db0] opacity-25 transition hover:border-[#7b4db0]/45 hover:opacity-100 focus-visible:border-[#7b4db0]/70 focus-visible:opacity-100"
                                  >
                                    *
                                  </button>
                                ) : null}
                                {storyRecord.id === "great_whisking_arc" && storyRecord.is_unlocked ? (
                                  <RenderGreatWhiskingPopupSwarmComponent
                                    great_whisking_call_line={
                                      carton_story_script_bundle.great_whisking_call_line
                                    }
                                    great_whisking_story_text={
                                      carton_story_script_bundle.great_whisking_story_text
                                    }
                                    ui_theme="retro_desktop"
                                    context_label="Story Archive Finale"
                                    class_name="mt-2"
                                  />
                                ) : null}
                              </article>
                            ))}
                          </div>
                        </RenderRetroDesktopWindowComponent>
                      </RenderDraggableWindowShellComponent>
                    </div>
                  ) : null}

                  {showDiagnosticsPanel ? (
                    <div className="relative z-10 mt-3">
                      <RenderDraggableWindowShellComponent
                        window_id="modal_diagnostics_window"
                        drag_constraints_ref={modalWindowCanvasRef}
                        z_index_value={modalWindowZIndexMap.modal_diagnostics_window}
                        on_activate_window={bringModalWindowToFrontFeature}
                        class_name="relative cursor-grab"
                      >
                        <RenderRetroDesktopWindowComponent
                          title_text="diagnostics.log"
                          accent="lavender"
                          body_class_name="bg-[#e3e1e8]"
                        >
                          <div className="border-2 border-[#fafafd] border-r-[#72727d] border-b-[#72727d] bg-[#f6f6f9] p-2 font-mono text-[11px] leading-5 text-[#252525]">
                            <p>known_records={knownRecords.length}</p>
                            <p>discovered_records={discoveredRecords.length}</p>
                            <p>ridiculous_rewards={ridiculousRewards.length}</p>
                            <p>great_whisking_readiness={coreGoldenYolkCount}/5</p>
                            <p>bonus_yolks={bonusGoldenYolkCount}</p>
                            <p>
                              carton_console_tier={complexityTier + 1}/
                              {maximumCartonComplexityTierCount}
                            </p>
                          </div>
                        </RenderRetroDesktopWindowComponent>
                      </RenderDraggableWindowShellComponent>
                    </div>
                  ) : null}
                </div>

                <div className="border-t-2 border-[#f4f4f8] bg-[#d0d1d7] px-3 py-2 text-[11px] text-[#2d2d34] shadow-[inset_0_2px_0_rgba(255,255,255,0.6)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="border border-[#8e8e9a] bg-[#ececf1] px-2 py-1 font-mono uppercase tracking-[0.06em]">
                      CartonDesktop.exe
                    </span>
                    <span className="font-mono uppercase tracking-[0.06em]">
                      click the toast monocle to reopen this console
                    </span>
                  </div>
                </div>
              </motion.section>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
