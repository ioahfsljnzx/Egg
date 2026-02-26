"use client";

import { motion, useDragControls, useMotionValue } from "framer-motion";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { RenderGreatWhiskingPopupSwarmComponent } from "@/components/render_great_whisking_popup_swarm_component";
import type { CartonStoryScriptBundle } from "@/features/discovery/define_carton_story_script_type";
import {
  listCartonRiddlesFeature,
  listRidiculousRewardsFeature,
  resolveRidiculousRewardFeature,
  verifyCartonRiddleAnswerFeature,
} from "@/features/discovery/define_carton_riddle_registry_feature";
import { useVaultStore } from "@/store/use_vault_store";

interface RenderCartonRiddleGateComponentProps {
  carton_story_script_bundle: CartonStoryScriptBundle;
  presentation_mode?: "full" | "compact";
  ui_theme?: "neon" | "retro_desktop";
}

interface RenderDraggableRiddleWindowShellComponentProps {
  window_id: string;
  drag_constraints_ref: RefObject<HTMLElement | null>;
  z_index_value: number;
  on_activate_window: (windowId: string) => void;
  initial_left_px: number;
  initial_top_px: number;
  width_class_name: string;
  title_text: string;
  title_accent_tone?: "cyan" | "lavender" | "mint" | "amber";
  children: ReactNode;
}

const trimStoryLineFeature = (lineValue: string): string =>
  lineValue
    .replace(/^Tip:\s*/i, "")
    .replace(/^Sir Toasty Says:\s*/i, "Sir Toasty: ")
    .trim();

const joinClassNamesFeature = (...classNames: Array<string | undefined | false>): string =>
  classNames.filter(Boolean).join(" ");

const retroRiddleTitleAccentClassMap: Record<
  NonNullable<RenderDraggableRiddleWindowShellComponentProps["title_accent_tone"]>,
  string
> = {
  cyan: "bg-[linear-gradient(90deg,#6fe8ff_0%,#93d2ff_35%,#abafff_70%,#f398f4_100%)]",
  lavender: "bg-[linear-gradient(90deg,#97d9ff_0%,#a8c2ff_36%,#b8a4ff_70%,#e69fff_100%)]",
  mint: "bg-[linear-gradient(90deg,#84f5df_0%,#9ae8ff_34%,#8fb9ff_70%,#cfa6ff_100%)]",
  amber: "bg-[linear-gradient(90deg,#94dcff_0%,#a8bfff_34%,#ffc780_70%,#ff9dbc_100%)]",
};

const RenderDraggableRiddleWindowShellComponent = ({
  window_id,
  drag_constraints_ref,
  z_index_value,
  on_activate_window,
  initial_left_px,
  initial_top_px,
  width_class_name,
  title_text,
  title_accent_tone = "cyan",
  children,
}: RenderDraggableRiddleWindowShellComponentProps) => {
  const dragControls = useDragControls();
  const windowOffsetX = useMotionValue(0);
  const windowOffsetY = useMotionValue(0);
  const persistedWindowLayoutRecord = useVaultStore(
    (state) => state.desktop_window_layout_map[`riddle:${window_id}`],
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

    if (isWindowMaximized) {
      return;
    }

    dragControls.start(event);
  };

  const handleToggleMinimizeWindowFeature = (): void => {
    on_activate_window(window_id);
    setIsWindowMinimized((currentValue) => {
      const nextValue = !currentValue;
      setDesktopWindowMinimized(`riddle:${window_id}`, nextValue);
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
    setDesktopWindowMinimized(`riddle:${window_id}`, false);
    setIsWindowMaximized((currentValue) => !currentValue);
  };

  const handleRestoreWindowFeature = (): void => {
    on_activate_window(window_id);
    windowOffsetX.set(0);
    windowOffsetY.set(0);
    setIsWindowMinimized(false);
    setIsWindowMaximized(false);
    resetDesktopWindowLayout(`riddle:${window_id}`);
  };

  return (
    <motion.div
      drag={!isWindowMaximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={drag_constraints_ref}
      className={joinClassNamesFeature("absolute", width_class_name)}
      style={{
        zIndex: z_index_value,
        x: windowOffsetX,
        y: windowOffsetY,
        left: isWindowMaximized ? 8 : initial_left_px,
        top: isWindowMaximized ? 8 : initial_top_px,
        right: isWindowMaximized ? 8 : undefined,
        bottom: isWindowMaximized ? 8 : undefined,
        touchAction: "none",
      }}
      onPointerDown={() => {
        on_activate_window(window_id);
      }}
      onDragEnd={() => {
        setDesktopWindowOffset(`riddle:${window_id}`, windowOffsetX.get(), windowOffsetY.get());
      }}
    >
      <section className="retro_bitmap_font overflow-hidden rounded-none border-2 border-[#f7f7fb] border-r-[#4e4e59] border-b-[#4e4e59] bg-[#d7d8de] shadow-[2px_2px_0_rgba(0,0,0,0.28)]">
        <div
          className={joinClassNamesFeature(
            "flex min-h-8 select-none items-center justify-between border-b-2 border-[#2d2d35] px-2 py-1",
            retroRiddleTitleAccentClassMap[title_accent_tone],
          )}
          onPointerDown={handleTitleBarPointerDownFeature}
        >
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111421]">
            {title_text}
          </p>
          <div className="ml-3 flex items-center gap-1">
            {[
              {
                id: "minimize",
                label: "_",
                on_click: handleToggleMinimizeWindowFeature,
                aria_label: isWindowMinimized ? "Restore window body" : "Minimize window",
              },
              {
                id: "maximize",
                label: isWindowMaximized ? "❐" : "□",
                on_click: handleToggleMaximizeWindowFeature,
                aria_label: isWindowMaximized ? "Restore window size" : "Maximize window",
              },
              {
                id: "restore",
                label: "X",
                on_click: handleRestoreWindowFeature,
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
                  buttonRecord.on_click();
                }}
                className="inline-flex h-4 min-w-4 items-center justify-center border border-black/45 bg-white/60 px-1 text-[9px] font-bold text-black/70 transition hover:bg-white/80 active:translate-y-px"
                aria-label={buttonRecord.aria_label}
              >
                {buttonRecord.label}
              </button>
            ))}
          </div>
        </div>
        {isWindowMinimized ? null : (
          <div
            className={joinClassNamesFeature(
              "border-t border-white/80 bg-[#d7d8de] p-2",
              isWindowMaximized ? "h-[calc(100%-2rem)] overflow-auto" : undefined,
            )}
          >
            {children}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export function RenderCartonRiddleGateComponent({
  carton_story_script_bundle,
  presentation_mode = "full",
  ui_theme = "neon",
}: RenderCartonRiddleGateComponentProps) {
  const solvedCartonRiddles = useVaultStore((state) => state.solved_carton_riddles);
  const ridiculousRewards = useVaultStore((state) => state.ridiculous_rewards);
  const solvedBonusYolkPuzzles = useVaultStore((state) => state.solved_bonus_yolk_puzzles);
  const unlockCartonReward = useVaultStore((state) => state.unlock_carton_reward);

  const [answerDraft, setAnswerDraft] = useState("");
  const [hintTierIndex, setHintTierIndex] = useState(0);
  const [responseText, setResponseText] = useState(
    "Sir Toasty is tuning the rubber duck. Present your answer.",
  );
  const [isAnswerAccepted, setIsAnswerAccepted] = useState(false);
  const [retroRiddleWindowZIndexMap, setRetroRiddleWindowZIndexMap] = useState<
    Record<string, number>
  >({
    prompt_window: 30,
    terminal_window: 29,
    rewards_window: 28,
    tutorial_window: 27,
  });
  const retroRiddleDesktopCanvasRef = useRef<HTMLDivElement | null>(null);

  const cartonRiddles = useMemo(() => listCartonRiddlesFeature(), []);

  const activeRiddle = cartonRiddles.find(
    (riddleRecord) => !solvedCartonRiddles.includes(riddleRecord.id),
  );
  const activeRiddleIndex = activeRiddle
    ? cartonRiddles.findIndex((riddleRecord) => riddleRecord.id === activeRiddle.id)
    : -1;

  useEffect(() => {
    setHintTierIndex(0);
    setAnswerDraft("");
    setIsAnswerAccepted(false);

    if (!activeRiddle) {
      setResponseText(
        "SIR TOASTY (triple slide whistle): You solved the whole carton. The Great Whisking is warming up.",
      );
      return;
    }

    setResponseText(activeRiddle.sir_toasty_intro);
  }, [activeRiddle]);

  const handleAskHintFeature = (): void => {
    if (!activeRiddle) {
      return;
    }

    const nextHintTierIndex = Math.min(2, hintTierIndex + 1);
    setHintTierIndex(nextHintTierIndex);
    setResponseText(`SIR TOASTY: ${activeRiddle.hint_lines[nextHintTierIndex]}`);
  };

  const handleSubmitAnswerFeature = (): void => {
    if (!activeRiddle) {
      return;
    }

    if (verifyCartonRiddleAnswerFeature(activeRiddle, answerDraft)) {
      const rewardRecord = resolveRidiculousRewardFeature(activeRiddle.reward_id);
      const nextSolvedCoreRiddleCount = solvedCartonRiddles.includes(activeRiddle.id)
        ? solvedCartonRiddles.length
        : solvedCartonRiddles.length + 1;

      unlockCartonReward(activeRiddle.id, activeRiddle.reward_id);

      setIsAnswerAccepted(true);
      setResponseText(
        rewardRecord
          ? nextSolvedCoreRiddleCount < cartonRiddles.length
            ? `SIR TOASTY (duck + whistle): Correct. Gate ${nextSolvedCoreRiddleCount}/${cartonRiddles.length} cleared. ${rewardRecord.title} deployed. Next gate is dropping on top of this one.`
            : `SIR TOASTY (duck + whistle siren): Final gate cleared. ${rewardRecord.title} deployed. THE GREAT WHISKING is now authorized.`
          : "SIR TOASTY: Correct. The carton applauds in a legally unclear key.",
      );
      return;
    }

    setIsAnswerAccepted(false);
    setResponseText(
      "SIR TOASTY: Incorrect, but spiritually crunchy. Read the hint backwards with your eyebrows.",
    );
  };

  const kosProgressPercent = Math.round((solvedCartonRiddles.length / cartonRiddles.length) * 100);
  const bonusGoldenYolkCount = solvedBonusYolkPuzzles.length;
  const allRiddlesSolved = activeRiddle === undefined;
  const allRewardRecords = listRidiculousRewardsFeature();
  const isCompactMode = presentation_mode === "compact";
  const isRetroDesktopTheme = ui_theme === "retro_desktop";
  const activeCartonTipLine =
    carton_story_script_bundle.enter_carton_tip_lines[
      (solvedCartonRiddles.length + hintTierIndex) %
        Math.max(1, carton_story_script_bundle.enter_carton_tip_lines.length)
    ] ?? "";
  const hasMustacheTutorialUnlocked = ridiculousRewards.includes("mustache_disguises_reward");
  const bringRetroRiddleWindowToFrontFeature = (windowId: string): void => {
    setRetroRiddleWindowZIndexMap((currentState) => {
      const nextZIndexValue = Math.max(...Object.values(currentState), 20) + 1;

      return {
        ...currentState,
        [windowId]: nextZIndexValue,
      };
    });
  };

  const rootClassName = isRetroDesktopTheme
    ? "retro_bitmap_font rounded-none border-2 border-[#f7f7fb] border-r-[#3f3f48] border-b-[#3f3f48] bg-[#d8d9df] p-4 text-[#1a1a1a] shadow-[2px_2px_0_rgba(0,0,0,0.25)]"
    : "rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5";
  const panelClassName = isRetroDesktopTheme
    ? "rounded-none border-2 border-[#fafafe] border-r-[#6f6f7a] border-b-[#6f6f7a] bg-white/70 p-4"
    : "rounded-xl border border-white/10 bg-black/20 p-4";
  const subtlePanelClassName = isRetroDesktopTheme
    ? "rounded-none border-2 border-[#f7f7fb] border-r-[#7e7e89] border-b-[#7e7e89] bg-white/55 p-4"
    : "rounded-xl border border-white/10 bg-black/20 p-4";
  const accentPanelAmberClassName = isRetroDesktopTheme
    ? "rounded-none border-2 border-[#fff7ea] border-r-[#7a6a5a] border-b-[#7a6a5a] bg-[#fff2dc] p-4"
    : "rounded-xl border border-amber-300/20 bg-black/20 p-4";
  const accentPanelGreenClassName = isRetroDesktopTheme
    ? "rounded-none border-2 border-[#edfff4] border-r-[#5f7564] border-b-[#5f7564] bg-[#edf9ef] p-4"
    : "rounded-xl border border-emerald-300/25 bg-emerald-300/8 p-4";
  const accentPanelGoldClassName = isRetroDesktopTheme
    ? "rounded-none border-2 border-[#fff7ea] border-r-[#7a6a5a] border-b-[#7a6a5a] bg-[#fff4df] p-4"
    : "rounded-xl border border-amber-300/20 bg-amber-300/5 p-4";
  const primaryButtonClassName = isRetroDesktopTheme
    ? "retro_bitmap_font h-11 rounded-none border-2 border-[#f8f8fb] border-r-[#31313a] border-b-[#31313a] bg-[#d8d8dd] px-4 text-[12px] font-normal tracking-[0.02em] text-[#151515] shadow-[1px_1px_0_rgba(0,0,0,0.25)] transition hover:bg-[#ededf2] active:translate-y-px active:border-[#31313a] active:border-r-[#f8f8fb] active:border-b-[#f8f8fb] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-5px] focus-visible:outline-[#1f1f1f]"
    : "h-11 rounded-xl border border-emerald-300/35 bg-emerald-300/10 px-4 text-sm font-semibold tracking-wide text-emerald-100 transition hover:bg-emerald-300/20";
  const secondaryButtonClassName = isRetroDesktopTheme
    ? "retro_bitmap_font h-11 rounded-none border-2 border-[#f8f8fb] border-r-[#31313a] border-b-[#31313a] bg-[#d8d8dd] px-4 text-[12px] font-normal tracking-[0.02em] text-[#151515] shadow-[1px_1px_0_rgba(0,0,0,0.25)] transition hover:bg-[#ededf2] active:translate-y-px active:border-[#31313a] active:border-r-[#f8f8fb] active:border-b-[#f8f8fb] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-5px] focus-visible:outline-[#1f1f1f]"
    : "h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold tracking-wide text-slate-200 transition hover:bg-white/10";
  const inputClassName = isRetroDesktopTheme
    ? "retro_bitmap_font h-11 flex-1 rounded-none border-2 border-[#a3a3af] border-r-white border-b-white bg-[#f6f6fa] px-3 text-[12px] text-[#171717] outline-none ring-0 placeholder:text-[#7c7c88] focus:border-[#7c7c88] focus:border-r-white focus:border-b-white"
    : "h-11 flex-1 rounded-xl border border-white/10 bg-[#070c12] px-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-300/40";
  const smallChipClassName = isRetroDesktopTheme
    ? "rounded-none border border-[#72727d] bg-[#efeff4] px-3 py-2 text-xs text-[#2a2a2a]"
    : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300";
  const footerMutedClassName = isRetroDesktopTheme
    ? "mt-4 text-xs leading-5 text-[#4f4f5a]"
    : "mt-4 text-xs leading-5 text-slate-400";
  const footerFaintClassName = isRetroDesktopTheme
    ? "mt-2 text-xs leading-5 text-[#6a6a75]"
    : "mt-2 text-xs leading-5 text-slate-500";

  return (
    <section className={rootClassName}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            className={
              isRetroDesktopTheme
                ? "text-xs font-semibold uppercase tracking-[0.16em] text-[#5a49b4]"
                : "text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300"
            }
          >
            The Carton // Metaverse Mode
          </p>
          <h3
            className={
              isRetroDesktopTheme
                ? "mt-2 text-xl font-semibold tracking-tight text-[#171717]"
                : "mt-2 text-xl font-semibold tracking-tight text-white"
            }
          >
            {isCompactMode ? "Riddle Booth" : "The Great Whisking Control Booth"}
          </h3>
          {!isCompactMode ? (
            <p
              className={
                isRetroDesktopTheme
                  ? "mt-2 max-w-3xl text-sm leading-6 text-[#3f3f48]"
                  : "mt-2 max-w-3xl text-sm leading-6 text-slate-300"
              }
            >
              Rain falls as sprinkles. Floating platform-shoes drift through neon air.
              The walls taste like the color 7. Sir Toasty, avatar of The Burnt Crust,
              insists The Pan is a wireless charging pad for invisible giants.
            </p>
          ) : (
            <p
              className={
                isRetroDesktopTheme
                  ? "mt-2 max-w-3xl text-sm leading-6 text-[#3f3f48]"
                  : "mt-2 max-w-3xl text-sm leading-6 text-slate-300"
              }
            >
              Sir Toasty is taking answers and handing out physics-breaking rewards.
            </p>
          )}
        </div>
        <div
          className={
            isRetroDesktopTheme
              ? "rounded-none border-2 border-[#f8f8fc] border-r-[#6f6f7a] border-b-[#6f6f7a] bg-[#f0f0f5] px-4 py-3 font-mono text-xs text-[#252525]"
              : "rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-slate-200"
          }
        >
          <p>K.O.S. Reboot: {kosProgressPercent}%</p>
          <p className="mt-1">
            Golden Yolks: {solvedCartonRiddles.length}/5
            {bonusGoldenYolkCount > 0 ? ` + ${bonusGoldenYolkCount} bonus` : ""}
          </p>
        </div>
      </div>

      {!isCompactMode ? (
        <div className={joinClassNamesFeature("mt-4", accentPanelAmberClassName)}>
          <p
            className={
              isRetroDesktopTheme
                ? "font-mono text-xs uppercase tracking-[0.12em] text-[#8f5c18]"
                : "font-mono text-xs uppercase tracking-[0.16em] text-amber-300"
            }
          >
            Mission Override
          </p>
          <p
            className={
              isRetroDesktopTheme
                ? "mt-2 text-sm leading-6 text-[#2d2d2d]"
                : "mt-2 text-sm leading-6 text-slate-200"
            }
          >
            Your Data-Logistics Units are collecting Golden Yolks to reboot the Kitchen
            Operating System. Failure becomes bland, unseasoned quiche. Success triggers
            The Great Whisking and converts the kitchen into a zero-gravity disco.
          </p>
        </div>
      ) : null}

      {!isCompactMode ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className={panelClassName}>
            <p
              className={
                isRetroDesktopTheme
                  ? "text-xs font-semibold uppercase tracking-[0.12em] text-[#3e7ca4]"
                  : "text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200"
              }
            >
              Sir Toasty Manifesto Feed
            </p>
            <p
              className={
                isRetroDesktopTheme
                  ? "mt-2 text-sm leading-6 text-[#252525]"
                  : "mt-2 text-sm leading-6 text-slate-200"
              }
            >
              {carton_story_script_bundle.manifesto_quote_line}
            </p>
            <p
              className={
                isRetroDesktopTheme
                  ? "mt-2 text-xs leading-5 text-[#5a5a65]"
                  : "mt-2 text-xs leading-5 text-slate-400"
              }
            >
              {carton_story_script_bundle.manifesto_story_text}
            </p>
          </div>

          <div className={panelClassName}>
            <p
              className={
                isRetroDesktopTheme
                  ? "text-xs font-semibold uppercase tracking-[0.12em] text-[#9750a8]"
                  : "text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-200"
              }
            >
              Enter The Carton Loading Feed
            </p>
            <p
              className={
                isRetroDesktopTheme
                  ? "mt-2 text-sm leading-6 text-[#252525]"
                  : "mt-2 text-sm leading-6 text-slate-200"
              }
            >
              {trimStoryLineFeature(activeCartonTipLine)}
            </p>
            <p
              className={
                isRetroDesktopTheme
                  ? "mt-2 text-xs leading-5 text-[#5a5a65]"
                  : "mt-2 text-xs leading-5 text-slate-400"
              }
            >
              {carton_story_script_bundle.enter_carton_story_text}
            </p>
          </div>
        </div>
      ) : (
        <div className={joinClassNamesFeature("mt-4", subtlePanelClassName)}>
          <p
            className={
              isRetroDesktopTheme
                ? "text-xs font-semibold uppercase tracking-[0.12em] text-[#3f7c5d]"
                : "text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200"
            }
          >
            Carton Feed
          </p>
          <p
            className={
              isRetroDesktopTheme
                ? "mt-2 text-sm leading-6 text-[#252525]"
                : "mt-2 text-sm leading-6 text-slate-200"
            }
          >
            {trimStoryLineFeature(activeCartonTipLine)}
          </p>
        </div>
      )}

      {isRetroDesktopTheme ? (
        <div
          ref={retroRiddleDesktopCanvasRef}
          className={joinClassNamesFeature(
            "mt-4 relative overflow-hidden border-2 border-[#f7f7fb] border-r-[#5e5e69] border-b-[#5e5e69] bg-[#dfe0e5] p-2",
            isCompactMode ? "min-h-[48rem]" : "min-h-[58rem]",
          )}
        >
          <RenderDraggableRiddleWindowShellComponent
            window_id="prompt_window"
            drag_constraints_ref={retroRiddleDesktopCanvasRef}
            z_index_value={retroRiddleWindowZIndexMap.prompt_window}
            on_activate_window={bringRetroRiddleWindowToFrontFeature}
            initial_left_px={8}
            initial_top_px={8}
            width_class_name="w-[calc(100%_-_1rem)] md:w-[58%]"
            title_text="prompt_window.rdl"
            title_accent_tone="mint"
          >
            <motion.div
              key={activeRiddle?.id ?? "great_whisking_prompt"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={panelClassName}
            >
              {!allRiddlesSolved && activeRiddle ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3f7c5d]">
                        Prompt Window
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-[#171717]">
                        {activeRiddle.title}
                      </h4>
                    </div>
                    <div className={smallChipClassName}>
                      {"Gate "}
                      {activeRiddleIndex + 1}
                      {"/"}
                      {cartonRiddles.length}
                      {" // Reward: "}
                      {resolveRidiculousRewardFeature(activeRiddle.reward_id)?.title}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#232323]">{activeRiddle.prompt}</p>

                  <div className="mt-4 flex flex-col gap-3">
                    <input
                      type="text"
                      value={answerDraft}
                      onChange={(event) => setAnswerDraft(event.target.value)}
                      placeholder="Type the absurdly obvious object"
                      className={inputClassName}
                    />
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleSubmitAnswerFeature}
                        className={primaryButtonClassName}
                      >
                        Solve Gate
                      </button>
                      <button
                        type="button"
                        onClick={handleAskHintFeature}
                        className={secondaryButtonClassName}
                      >
                        Ask Sir Toasty
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3f7c5d]">
                    Prompt Window
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-[#171717]">
                    The Great Whisking Armed
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-[#1f462b]">
                    {carton_story_script_bundle.great_whisking_call_line}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#3d5c45]">
                    {carton_story_script_bundle.great_whisking_story_text}
                  </p>
                  <p className="mt-3 rounded-none border-2 border-[#f7fff8] border-r-[#647a68] border-b-[#647a68] bg-white/65 px-3 py-2 text-xs leading-5 text-[#254a31]">
                    Post-credits protocol queued: {carton_story_script_bundle.post_credits_reveal_line}
                  </p>
                  <RenderGreatWhiskingPopupSwarmComponent
                    great_whisking_call_line={carton_story_script_bundle.great_whisking_call_line}
                    great_whisking_story_text={carton_story_script_bundle.great_whisking_story_text}
                    ui_theme="retro_desktop"
                    context_label="Riddle Booth Finale"
                    auto_summon_on_mount
                    class_name="mt-3"
                  />
                </>
              )}
            </motion.div>
          </RenderDraggableRiddleWindowShellComponent>

          <RenderDraggableRiddleWindowShellComponent
            window_id="terminal_window"
            drag_constraints_ref={retroRiddleDesktopCanvasRef}
            z_index_value={retroRiddleWindowZIndexMap.terminal_window}
            on_activate_window={bringRetroRiddleWindowToFrontFeature}
            initial_left_px={8}
            initial_top_px={isCompactMode ? 278 : 318}
            width_class_name={isCompactMode ? "w-[calc(100%_-_1rem)] md:w-[44%]" : "w-[calc(100%_-_1rem)] md:w-[38%] md:left-auto"}
            title_text="terminal_response.log"
            title_accent_tone="lavender"
          >
            <div className={panelClassName}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a49b4]">
                terminal_response.log
              </p>
              <div
                className={[
                  "mt-3 rounded-none border-2 p-3 text-sm leading-6",
                  isAnswerAccepted
                    ? "border-[#f3fff6] border-r-[#627867] border-b-[#627867] bg-[#effbef] text-[#20482c]"
                    : "border-[#fbfbff] border-r-[#73737e] border-b-[#73737e] bg-white/70 text-[#232323]",
                ].join(" ")}
              >
                {responseText}
              </div>
              <p className="mt-3 text-xs leading-5 text-[#4f4f5a]">
                Hint protocol: the first two hints are deliberately useless. The third one is the one
                Sir Toasty pretends was obvious all along.
              </p>
              {!isCompactMode ? (
                <p className="mt-2 text-xs leading-5 text-[#6a6a75]">
                  Failure-loop script loaded: {carton_story_script_bundle.served_screen_headline}
                </p>
              ) : null}
            </div>
          </RenderDraggableRiddleWindowShellComponent>

          <RenderDraggableRiddleWindowShellComponent
            window_id="rewards_window"
            drag_constraints_ref={retroRiddleDesktopCanvasRef}
            z_index_value={retroRiddleWindowZIndexMap.rewards_window}
            on_activate_window={bringRetroRiddleWindowToFrontFeature}
            initial_left_px={8}
            initial_top_px={isCompactMode ? 438 : 360}
            width_class_name={isCompactMode ? "w-[calc(100%_-_1rem)]" : "w-[calc(100%_-_1rem)] md:w-[58%]"}
            title_text="rewards_manager.exe"
            title_accent_tone="amber"
          >
            <div className={panelClassName}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8f5c18]">
                  rewards_manager.exe
                </p>
                <div className={smallChipClassName}>
                  Unlocked: {ridiculousRewards.length}/{allRewardRecords.length}
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {allRewardRecords.map((rewardRecord) => {
                  const isUnlocked = ridiculousRewards.includes(rewardRecord.id);

                  return (
                    <article
                      key={rewardRecord.id}
                      className={joinClassNamesFeature(
                        "rounded-none border-2 p-3 transition",
                        isUnlocked
                          ? "border-[#fff5e7] border-r-[#7b6b59] border-b-[#7b6b59] bg-white/70"
                          : "border-[#f3f3f7] border-r-[#9a9aa6] border-b-[#9a9aa6] bg-white/35 opacity-80",
                      )}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8f5c18]">
                        {isUnlocked ? "Reward" : "Locked"}
                      </p>
                      <h4 className="mt-2 text-base font-semibold text-[#171717]">
                        {rewardRecord.title}
                      </h4>
                      {!isCompactMode ? (
                        <>
                          <p className="mt-2 text-sm leading-6 text-[#31313a]">
                            {rewardRecord.tagline}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-[#5a5a64]">
                            {rewardRecord.game_break_effect}
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-xs leading-5 text-[#5a5a64]">
                          {rewardRecord.tagline}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </RenderDraggableRiddleWindowShellComponent>

          {!isCompactMode && hasMustacheTutorialUnlocked ? (
            <RenderDraggableRiddleWindowShellComponent
              window_id="tutorial_window"
              drag_constraints_ref={retroRiddleDesktopCanvasRef}
              z_index_value={retroRiddleWindowZIndexMap.tutorial_window}
              on_activate_window={bringRetroRiddleWindowToFrontFeature}
              initial_left_px={8}
              initial_top_px={164}
              width_class_name="w-[calc(100%_-_1rem)] md:w-[38%]"
              title_text="tutorial_patch.msg"
              title_accent_tone="cyan"
            >
              <div className={accentPanelGoldClassName}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8f5c18]">
                  tutorial_patch.msg
                </p>
                <p className="mt-2 text-sm leading-6 text-[#252525]">
                  {carton_story_script_bundle.stiff_upper_lip_command_line}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#5d5d66]">
                  {carton_story_script_bundle.stiff_upper_lip_story_text}
                </p>
              </div>
            </RenderDraggableRiddleWindowShellComponent>
          ) : null}
        </div>
      ) : (
        <>
          {!allRiddlesSolved && activeRiddle ? (
            <motion.div
              key={activeRiddle.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={joinClassNamesFeature("mt-4", panelClassName)}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                    Riddle Gate
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-white">{activeRiddle.title}</h4>
                </div>
                <div className={smallChipClassName}>
                  Reward on solve: {resolveRidiculousRewardFeature(activeRiddle.reward_id)?.title}
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-200">{activeRiddle.prompt}</p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={answerDraft}
                  onChange={(event) => setAnswerDraft(event.target.value)}
                  placeholder="Type the absurdly obvious object"
                  className={inputClassName}
                />
                <button
                  type="button"
                  onClick={handleSubmitAnswerFeature}
                  className={primaryButtonClassName}
                >
                  Solve Gate
                </button>
                <button
                  type="button"
                  onClick={handleAskHintFeature}
                  className={secondaryButtonClassName}
                >
                  Ask Sir Toasty
                </button>
              </div>

              <div
                className={[
                  "mt-4 rounded-xl border p-3 text-sm leading-6",
                  isAnswerAccepted
                    ? "border-emerald-300/25 bg-emerald-300/5 text-emerald-100"
                    : "border-white/10 bg-black/10 text-slate-200",
                ].join(" ")}
              >
                {responseText}
              </div>
            </motion.div>
          ) : (
            <div className={joinClassNamesFeature("mt-4", accentPanelGreenClassName)}>
              <p className="text-sm leading-6 text-emerald-100">
                {carton_story_script_bundle.great_whisking_call_line}
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-200/80">
                {carton_story_script_bundle.great_whisking_story_text}
              </p>
              <p className="mt-3 rounded-lg border border-emerald-300/20 bg-black/10 px-3 py-2 text-xs leading-5 text-emerald-50">
                Post-credits protocol queued: {carton_story_script_bundle.post_credits_reveal_line}
              </p>
              <RenderGreatWhiskingPopupSwarmComponent
                great_whisking_call_line={carton_story_script_bundle.great_whisking_call_line}
                great_whisking_story_text={carton_story_script_bundle.great_whisking_story_text}
                ui_theme="neon"
                context_label="Whisking Finale"
                auto_summon_on_mount
                class_name="mt-3"
              />
            </div>
          )}

          {!isCompactMode && hasMustacheTutorialUnlocked ? (
            <div className={joinClassNamesFeature("mt-4", accentPanelGoldClassName)}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                Protocol Stiff Upper Lip
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {carton_story_script_bundle.stiff_upper_lip_command_line}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {carton_story_script_bundle.stiff_upper_lip_story_text}
              </p>
            </div>
          ) : null}

          {!isCompactMode ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {allRewardRecords.map((rewardRecord) => {
                const isUnlocked = ridiculousRewards.includes(rewardRecord.id);

                return (
                  <article
                    key={rewardRecord.id}
                    className={[
                      "rounded-xl border p-4 transition",
                      isUnlocked
                        ? "border-amber-300/25 bg-amber-300/5"
                        : "border-white/10 bg-black/15 opacity-80",
                    ].join(" ")}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
                      {isUnlocked ? "Ridiculous Reward" : "Locked Reward"}
                    </p>
                    <h4 className="mt-2 text-base font-semibold text-white">{rewardRecord.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{rewardRecord.tagline}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {rewardRecord.game_break_effect}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : null}

          <p className={footerMutedClassName}>
            Hint protocol: the first two hints are deliberately useless. The third one is the one
            Sir Toasty pretends was obvious all along.
          </p>
          {!isCompactMode ? (
            <p className={footerFaintClassName}>
              Failure-loop script loaded: {carton_story_script_bundle.served_screen_headline}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
