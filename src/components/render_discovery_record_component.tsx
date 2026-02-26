"use client";

import { motion, useDragControls, useMotionValue } from "framer-motion";
import Link from "next/link";
import {
  cloneElement,
  isValidElement,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  resolveDiscoveryRecordFeature,
  vaultBootSecretId,
} from "@/features/discovery/define_secret_registry_feature";
import { RenderGreatWhiskingPopupSwarmComponent } from "@/components/render_great_whisking_popup_swarm_component";
import type { HiddenHintFragmentId } from "@/features/discovery/define_hidden_yolk_puzzle_registry_feature";
import { resolveHiddenHintFragmentFeature } from "@/features/discovery/define_hidden_yolk_puzzle_registry_feature";
import { useVaultStore } from "@/store/use_vault_store";

interface RenderDiscoveryRecordComponentProps {
  discovery_id: string;
}

interface RetroDiscoveryWindowComponentProps {
  title_text: string;
  accent_tone: "cyan" | "pink" | "mint" | "amber" | "lavender";
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

interface RenderDraggableDiscoveryWindowShellComponentProps {
  window_id: string;
  drag_constraints_ref: RefObject<HTMLElement | null>;
  z_index_value: number;
  on_activate_window: (windowId: string) => void;
  drag_enabled?: boolean;
  class_name?: string;
  children: ReactNode;
}

interface BreachReceiptPuzzleRow {
  id: "pan_identity" | "unit_role" | "reboot_token" | "finale_trigger";
  label: string;
  options: [string, string, string, string];
  correct_option: string;
}

const retroDiscoveryTitleAccentClassMap: Record<
  RetroDiscoveryWindowComponentProps["accent_tone"],
  string
> = {
  cyan: "bg-[linear-gradient(90deg,#6ae7ff_0%,#8fd8ff_32%,#af9dff_72%,#f58cf6_100%)]",
  pink: "bg-[linear-gradient(90deg,#8dd7ff_0%,#a7b7ff_40%,#f3a0ff_72%,#ff8fcb_100%)]",
  mint: "bg-[linear-gradient(90deg,#7ff6dd_0%,#90ebff_34%,#8fb7ff_70%,#cfa0ff_100%)]",
  amber: "bg-[linear-gradient(90deg,#8bdcff_0%,#99bcff_35%,#ffc57a_72%,#ff9cad_100%)]",
  lavender: "bg-[linear-gradient(90deg,#8fd8ff_0%,#9ebfff_36%,#b7a0ff_70%,#e89bff_100%)]",
};

const retroDesktopButtonClassName =
  "retro_bitmap_font inline-flex items-center justify-center rounded-none border-2 border-[#f8f8f8] border-r-[#2a2a2a] border-b-[#2a2a2a] bg-[#d7d7db] px-3 py-1.5 text-[12px] font-normal tracking-[0.02em] text-[#151515] shadow-[1px_1px_0_rgba(0,0,0,0.35)] transition hover:bg-[#ececf0] active:translate-y-px active:border-[#2a2a2a] active:border-r-[#f8f8f8] active:border-b-[#f8f8f8] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-5px] focus-visible:outline-[#1f1f1f]";

const joinClassNamesFeature = (...classNames: Array<string | undefined | false>): string =>
  classNames.filter(Boolean).join(" ");

const RenderDraggableDiscoveryWindowShellComponent = ({
  window_id,
  drag_constraints_ref,
  z_index_value,
  on_activate_window,
  drag_enabled = true,
  class_name,
  children,
}: RenderDraggableDiscoveryWindowShellComponentProps) => {
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

  const renderedChildren = isValidElement<RetroDiscoveryWindowComponentProps>(children)
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

const breachReceiptPuzzleRows: BreachReceiptPuzzleRow[] = [
  {
    id: "pan_identity",
    label: "Pan Identity",
    options: [
      "frying pan",
      "wireless charging pad",
      "ceiling projector",
      "legal document shredder",
    ],
    correct_option: "wireless charging pad",
  },
  {
    id: "unit_role",
    label: "Egg Role",
    options: [
      "breakfast ingredient",
      "decorative orb",
      "Data-Logistics Unit",
      "chef surveillance camera",
    ],
    correct_option: "Data-Logistics Unit",
  },
  {
    id: "reboot_token",
    label: "Reboot Token",
    options: ["Golden Yolks", "Spatula Sparks", "Rubber Ducks", "Crispy Crumbs"],
    correct_option: "Golden Yolks",
  },
  {
    id: "finale_trigger",
    label: "Finale Trigger",
    options: [
      "The Great Whisking",
      "Brunch Protocol",
      "Skillet Shutdown",
      "Toast Tribunal",
    ],
    correct_option: "The Great Whisking",
  },
];

const buildInitialBreachReceiptPuzzleIndexMapFeature = (): Record<string, number> =>
  breachReceiptPuzzleRows.reduce<Record<string, number>>((indexMap, rowRecord) => {
    indexMap[rowRecord.id] = 0;
    return indexMap;
  }, {});

const RenderRetroDiscoveryWindowComponent = ({
  title_text,
  accent_tone,
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
}: RetroDiscoveryWindowComponentProps) => (
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
        retroDiscoveryTitleAccentClassMap[accent_tone],
      )}
      onPointerDown={on_title_bar_pointer_down}
    >
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111421]">
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

export function RenderDiscoveryRecordComponent({
  discovery_id,
}: RenderDiscoveryRecordComponentProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [discoveryWindowZIndexMap, setDiscoveryWindowZIndexMap] = useState<Record<string, number>>(
    {
      [`discovery:${discovery_id}:access_primary_window`]: 30,
      [`discovery:${discovery_id}:access_status_window`]: 29,
      [`discovery:${discovery_id}:header_window`]: 40,
      [`discovery:${discovery_id}:terminal_window`]: 39,
      [`discovery:${discovery_id}:receipt_decoder_window`]: 38,
      [`discovery:${discovery_id}:receipt_feedback_window`]: 37,
      [`discovery:${discovery_id}:record_body_window`]: 36,
      [`discovery:${discovery_id}:notes_window`]: 35,
    },
  );
  const [breachReceiptPuzzleIndexMap, setBreachReceiptPuzzleIndexMap] = useState<
    Record<string, number>
  >(buildInitialBreachReceiptPuzzleIndexMapFeature);
  const [breachReceiptTerminalText, setBreachReceiptTerminalText] = useState(
    "Sir Toasty scrambled the receipt. Align the four labels to print the breach record.",
  );
  const [isBreachReceiptPuzzleSolved, setIsBreachReceiptPuzzleSolved] = useState(false);
  const [discoveryHiddenFragmentPingText, setDiscoveryHiddenFragmentPingText] = useState(
    "Click odd marks inside windows. Sir Toasty leaves crumbs in the UI chrome.",
  );
  const discoveryWindowCanvasRef = useRef<HTMLDivElement | null>(null);

  const discoveredSecrets = useVaultStore((state) => state.discovered_secrets);
  const isGlitchModeActive = useVaultStore((state) => state.is_glitch_mode_active);
  const solvedCartonRiddles = useVaultStore((state) => state.solved_carton_riddles);
  const revealedHiddenHintFragments = useVaultStore(
    (state) => state.revealed_hidden_hint_fragments,
  );
  const revealHiddenHintFragment = useVaultStore((state) => state.reveal_hidden_hint_fragment);
  const solveBonusYolkPuzzle = useVaultStore((state) => state.solve_bonus_yolk_puzzle);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const syncViewportModeFeature = (): void => {
      setIsDesktopViewport(window.innerWidth >= 1024);
    };

    syncViewportModeFeature();
    window.addEventListener("resize", syncViewportModeFeature);

    return () => {
      window.removeEventListener("resize", syncViewportModeFeature);
    };
  }, []);

  useEffect(() => {
    setBreachReceiptPuzzleIndexMap(buildInitialBreachReceiptPuzzleIndexMapFeature());
    setBreachReceiptTerminalText(
      "Sir Toasty scrambled the receipt. Align the four labels to print the breach record.",
    );
    setIsBreachReceiptPuzzleSolved(false);
  }, [discovery_id]);

  useEffect(() => {
    setDiscoveryWindowZIndexMap({
      [`discovery:${discovery_id}:access_primary_window`]: 30,
      [`discovery:${discovery_id}:access_status_window`]: 29,
      [`discovery:${discovery_id}:header_window`]: 40,
      [`discovery:${discovery_id}:terminal_window`]: 39,
      [`discovery:${discovery_id}:receipt_decoder_window`]: 38,
      [`discovery:${discovery_id}:receipt_feedback_window`]: 37,
      [`discovery:${discovery_id}:record_body_window`]: 36,
      [`discovery:${discovery_id}:notes_window`]: 35,
    });
  }, [discovery_id]);

  const record = resolveDiscoveryRecordFeature(discovery_id);
  const isUnlocked =
    hasMounted && !!record && (isGlitchModeActive || discoveredSecrets.includes(record.id));
  const isBreachReceiptRoute = record?.id === vaultBootSecretId;
  const recordMentionsGreatWhisking =
    record?.title.includes("Great Whisking") === true ||
    record?.summary.includes("Great Whisking") === true ||
    record?.body.includes("The Great Whisking") === true;
  const hasGreatWhiskingPopupAccess = solvedCartonRiddles.length >= 5;

  const buildDiscoveryWindowKeyFeature = (suffix: string): string =>
    `discovery:${discovery_id}:${suffix}`;

  const bringDiscoveryWindowToFrontFeature = (windowId: string): void => {
    setDiscoveryWindowZIndexMap((currentState) => {
      const nextZIndexValue = Math.max(...Object.values(currentState), 20) + 1;

      return {
        ...currentState,
        [windowId]: nextZIndexValue,
      };
    });
  };

  const breachReceiptPuzzleRowsWithSelection = useMemo(
    () =>
      breachReceiptPuzzleRows.map((rowRecord) => ({
        ...rowRecord,
        selected_option:
          rowRecord.options[
            breachReceiptPuzzleIndexMap[rowRecord.id] ?? 0
          ] ?? rowRecord.options[0],
      })),
    [breachReceiptPuzzleIndexMap],
  );

  const handleCycleBreachReceiptPuzzleRowFeature = (
    rowId: BreachReceiptPuzzleRow["id"],
    direction: -1 | 1,
  ): void => {
    setBreachReceiptPuzzleIndexMap((currentMap) => {
      const rowRecord = breachReceiptPuzzleRows.find((candidateRow) => candidateRow.id === rowId);

      if (!rowRecord) {
        return currentMap;
      }

      const optionCount = rowRecord.options.length;
      const currentIndex = currentMap[rowId] ?? 0;
      const nextIndex = (currentIndex + direction + optionCount) % optionCount;

      return {
        ...currentMap,
        [rowId]: nextIndex,
      };
    });
  };

  const handleValidateBreachReceiptPuzzleFeature = (): void => {
    const isSolved = breachReceiptPuzzleRows.every((rowRecord) => {
      const selectedIndex = breachReceiptPuzzleIndexMap[rowRecord.id] ?? 0;
      return rowRecord.options[selectedIndex] === rowRecord.correct_option;
    });

    if (isSolved) {
      setIsBreachReceiptPuzzleSolved(true);
      solveBonusYolkPuzzle("breach_receipt_alignment_bonus_puzzle");
      setBreachReceiptTerminalText(
        "Receipt printer warmed. Carton breach record decrypted. Bonus Golden Yolk credited. Sir Toasty insists this counts as accounting.",
      );
      return;
    }

    setIsBreachReceiptPuzzleSolved(false);
    setBreachReceiptTerminalText(
      "Alignment mismatch. Try reading the labels like Sir Toasty explains them: pad, unit, yolks, whisking.",
    );
  };

  const handleRevealDiscoveryHiddenHintFragmentFeature = (
    fragmentId: HiddenHintFragmentId,
  ): void => {
    const fragmentRecord = resolveHiddenHintFragmentFeature(fragmentId);
    const hasAlreadyRevealed = revealedHiddenHintFragments.includes(fragmentId);

    if (!hasAlreadyRevealed) {
      revealHiddenHintFragment(fragmentId);
    }

    setDiscoveryHiddenFragmentPingText(
      fragmentRecord
        ? hasAlreadyRevealed
          ? `Hint shard already archived: ${fragmentRecord.title}.`
          : `Hint shard recovered: ${fragmentRecord.title} (${fragmentRecord.source_window_label}).`
        : "Unknown shard pulse detected.",
    );
  };

  const renderAccessStateFeature = (stateMode: "unknown" | "locked") => (
    <section className="relative min-h-screen overflow-hidden pb-14 pt-4 text-[#161616] sm:pb-16 sm:pt-6">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#a5e8ff_0%,#b5dbff_28%,#cab7ff_65%,#e6acd8_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.8)_0px,transparent_36%),radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.65)_0px,transparent_40%),radial-gradient(circle_at_58%_14%,rgba(255,196,245,0.6)_0px,transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 h-[38vh] origin-bottom [transform:perspective(1100px)_rotateX(73deg)_scale(1.4)] bg-[linear-gradient(to_right,rgba(255,255,255,0.82)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,255,255,0.82)_2px,transparent_2px)] [background-size:56px_56px] opacity-80 sm:bottom-10" />

      <div
        ref={discoveryWindowCanvasRef}
        className="relative z-20 mx-auto w-full max-w-5xl px-3 sm:px-5"
      >
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <RenderDraggableDiscoveryWindowShellComponent
            window_id={buildDiscoveryWindowKeyFeature("access_primary_window")}
            drag_constraints_ref={discoveryWindowCanvasRef}
            z_index_value={
              discoveryWindowZIndexMap[buildDiscoveryWindowKeyFeature("access_primary_window")] ??
              30
            }
            on_activate_window={bringDiscoveryWindowToFrontFeature}
            drag_enabled={isDesktopViewport}
            class_name="relative"
          >
            <RenderRetroDiscoveryWindowComponent
              title_text={stateMode === "unknown" ? "unknown_record.err" : "locked_record.sys"}
              accent_tone={stateMode === "unknown" ? "pink" : "amber"}
              body_class_name="bg-[#e1e2e8]"
            >
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#7b2f56]">
                {stateMode === "unknown" ? "Unknown Discovery" : "Route Exists, Record Locked"}
              </p>
              <h1 className="mt-3 text-xl font-semibold text-[#181818] sm:text-2xl">
                {stateMode === "unknown"
                  ? `\`${discovery_id}\` is not registered`
                  : record?.title ?? "Carton Record"}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#34343c]">
                {stateMode === "unknown"
                  ? "Add the record to the Carton registry before exposing this route."
                  : `Unlock hint: ${record?.unlock_hint ?? "No hint available."}`}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/vault" className={retroDesktopButtonClassName}>
                  Back To Vault
                </Link>
                <Link href="/" className={retroDesktopButtonClassName}>
                  Return To Surface
                </Link>
              </div>
            </RenderRetroDiscoveryWindowComponent>
          </RenderDraggableDiscoveryWindowShellComponent>

          <RenderDraggableDiscoveryWindowShellComponent
            window_id={buildDiscoveryWindowKeyFeature("access_status_window")}
            drag_constraints_ref={discoveryWindowCanvasRef}
            z_index_value={
              discoveryWindowZIndexMap[buildDiscoveryWindowKeyFeature("access_status_window")] ??
              29
            }
            on_activate_window={bringDiscoveryWindowToFrontFeature}
            drag_enabled={isDesktopViewport}
            class_name="relative"
          >
            <RenderRetroDiscoveryWindowComponent
              title_text="carton_status.msg"
              accent_tone="lavender"
              body_class_name="bg-[#e3e0ea]"
            >
              <div className="border-2 border-[#fbfbff] border-r-[#72727d] border-b-[#72727d] bg-[#f6f6fa] p-3 font-mono text-[11px] leading-5 text-[#242424]">
                <p>&gt; route = {discovery_id}</p>
                <p>&gt; lock_state = {stateMode === "unknown" ? "unregistered" : "locked"}</p>
                <p>&gt; glitches_seen = {discoveredSecrets.length}</p>
                <p>&gt; sir_toasty = impatient</p>
              </div>
            </RenderRetroDiscoveryWindowComponent>
          </RenderDraggableDiscoveryWindowShellComponent>
        </div>
      </div>
    </section>
  );

  if (!record) {
    return renderAccessStateFeature("unknown");
  }

  if (!isUnlocked) {
    return renderAccessStateFeature("locked");
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden pb-14 pt-4 text-[#161616] sm:pb-16 sm:pt-6"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#a5e8ff_0%,#b5dbff_28%,#cab7ff_65%,#e6acd8_100%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.8)_0px,transparent_36%),radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.65)_0px,transparent_40%),radial-gradient(circle_at_58%_14%,rgba(255,196,245,0.6)_0px,transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-8 h-[38vh] origin-bottom [transform:perspective(1100px)_rotateX(73deg)_scale(1.4)] bg-[linear-gradient(to_right,rgba(255,255,255,0.82)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,255,255,0.82)_2px,transparent_2px)] [background-size:56px_56px] opacity-80 sm:bottom-10" />
      <div className="pointer-events-none absolute right-[8%] top-[15%] hidden h-20 w-20 rounded-full border-[10px] border-cyan-200/70 shadow-[0_0_30px_rgba(102,255,245,0.35)] lg:block" />
      <div className="pointer-events-none absolute left-[10%] top-[10%] hidden h-14 w-14 rotate-12 bg-cyan-300/70 shadow-[0_10px_18px_rgba(0,0,0,0.2)] lg:block" />
      <div className="pointer-events-none absolute right-[7%] bottom-[20%] hidden lg:block">
        <div className="relative h-36 w-24">
          <div className="absolute bottom-0 left-1/2 h-12 w-16 -translate-x-1/2 rounded-t-[42%] bg-white/78" />
          <div className="absolute bottom-8 left-1/2 h-16 w-12 -translate-x-1/2 rounded-[48%] bg-white/82" />
          <div className="absolute bottom-24 left-1/2 h-10 w-14 -translate-x-1/2 rounded-[48%] bg-white/88" />
        </div>
      </div>

      <div
        ref={discoveryWindowCanvasRef}
        className="relative z-20 mx-auto w-full max-w-6xl px-3 sm:px-5"
      >
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <RenderDraggableDiscoveryWindowShellComponent
            window_id={buildDiscoveryWindowKeyFeature("header_window")}
            drag_constraints_ref={discoveryWindowCanvasRef}
            z_index_value={discoveryWindowZIndexMap[buildDiscoveryWindowKeyFeature("header_window")] ?? 40}
            on_activate_window={bringDiscoveryWindowToFrontFeature}
            drag_enabled={isDesktopViewport}
            class_name="relative"
          >
            <RenderRetroDiscoveryWindowComponent
              title_text={`${record.id}.record`}
              accent_tone="cyan"
              subtitle_text={
                isBreachReceiptRoute ? "Carton Breach Receipt // puzzle mode" : "Carton Record"
              }
              body_class_name="bg-[#e1e2e8]"
            >
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-[#4d49a4]">
                Carton Record
              </p>
              <h1 className="mt-3 text-xl font-semibold text-[#181818] sm:text-2xl">
                {record.title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#34343c]">{record.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/vault" className={retroDesktopButtonClassName}>
                  Back To Vault
                </Link>
                <Link href="/" className={retroDesktopButtonClassName}>
                  Return To Surface
                </Link>
              </div>
            </RenderRetroDiscoveryWindowComponent>
          </RenderDraggableDiscoveryWindowShellComponent>

          <RenderDraggableDiscoveryWindowShellComponent
            window_id={buildDiscoveryWindowKeyFeature("terminal_window")}
            drag_constraints_ref={discoveryWindowCanvasRef}
            z_index_value={
              discoveryWindowZIndexMap[buildDiscoveryWindowKeyFeature("terminal_window")] ?? 39
            }
            on_activate_window={bringDiscoveryWindowToFrontFeature}
            drag_enabled={isDesktopViewport}
            class_name="relative"
          >
            <RenderRetroDiscoveryWindowComponent
              title_text="breach_terminal.log"
              accent_tone="lavender"
              body_class_name="bg-[#e3e0ea]"
            >
              <div className="border-2 border-[#fbfbff] border-r-[#72727d] border-b-[#72727d] bg-[#f6f6fa] p-3 font-mono text-[11px] leading-5 text-[#242424]">
                <p>&gt; route = {record.id}</p>
                <p>&gt; lock_state = unlocked</p>
                <p>&gt; glitch_mode = {isGlitchModeActive ? "active" : "archived"}</p>
                <p>&gt; discovered_records = {discoveredSecrets.length}</p>
                <p>
                  &gt; receipt_decoder = {isBreachReceiptRoute ? "required" : "bypassed"}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      handleRevealDiscoveryHiddenHintFragmentFeature(
                        "breach_terminal_hash_fragment",
                      )
                    }
                    aria-label="Recover terminal hash hint shard"
                    title="hash smudge"
                    className="inline-flex h-4 w-4 items-center justify-center border border-transparent px-0 text-[10px] text-[#6b46a5] opacity-35 transition hover:border-[#6b46a5]/40 hover:opacity-100 focus-visible:border-[#6b46a5]/70 focus-visible:opacity-100"
                  >
                    #
                  </button>
                </p>
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[#43434a]">
                {isBreachReceiptRoute
                  ? "Sir Toasty scrambled the first breach receipt on purpose. Decrypt it below."
                  : "This route now renders inside the same vaporwave desktop shell as the Vault."}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#5b5b64]">
                {discoveryHiddenFragmentPingText}
              </p>
            </RenderRetroDiscoveryWindowComponent>
          </RenderDraggableDiscoveryWindowShellComponent>
        </div>

        {isBreachReceiptRoute ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <RenderDraggableDiscoveryWindowShellComponent
              window_id={buildDiscoveryWindowKeyFeature("receipt_decoder_window")}
              drag_constraints_ref={discoveryWindowCanvasRef}
              z_index_value={
                discoveryWindowZIndexMap[buildDiscoveryWindowKeyFeature("receipt_decoder_window")] ??
                38
              }
              on_activate_window={bringDiscoveryWindowToFrontFeature}
              drag_enabled={isDesktopViewport}
              class_name="relative"
            >
              <RenderRetroDiscoveryWindowComponent
                title_text="receipt_decoder.exe"
                accent_tone="mint"
                body_class_name="bg-[#dee3e0]"
                subtitle_text="align the labels, then print the breach record"
              >
                <div className="grid gap-2">
                  {breachReceiptPuzzleRowsWithSelection.map((rowRecord) => (
                    <div
                      key={rowRecord.id}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-2 border-[#f8f8fb] border-r-[#6f6f7a] border-b-[#6f6f7a] bg-white/70 p-2"
                    >
                      <button
                        type="button"
                        onClick={() => handleCycleBreachReceiptPuzzleRowFeature(rowRecord.id, -1)}
                        className={retroDesktopButtonClassName}
                        aria-label={`Previous option for ${rowRecord.label}`}
                      >
                        ◀
                      </button>
                      <div className="min-w-0 border-2 border-[#9c9ca7] border-r-white border-b-white bg-[#f6f6fa] px-2 py-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5b5b67]">
                          {rowRecord.label}
                        </p>
                        <p className="mt-1 truncate text-sm text-[#1d1d1d]">
                          {rowRecord.selected_option}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCycleBreachReceiptPuzzleRowFeature(rowRecord.id, 1)}
                        className={retroDesktopButtonClassName}
                        aria-label={`Next option for ${rowRecord.label}`}
                      >
                        ▶
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleValidateBreachReceiptPuzzleFeature}
                    className={retroDesktopButtonClassName}
                  >
                    Print Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBreachReceiptPuzzleIndexMap(
                        buildInitialBreachReceiptPuzzleIndexMapFeature(),
                      );
                      setIsBreachReceiptPuzzleSolved(false);
                      setBreachReceiptTerminalText(
                        "Decoder reset. Sir Toasty claims the correct order is 'obvious if you are toast-adjacent.'",
                      );
                    }}
                    className={retroDesktopButtonClassName}
                  >
                    Reset Dials
                  </button>
                </div>
              </RenderRetroDiscoveryWindowComponent>
            </RenderDraggableDiscoveryWindowShellComponent>

            <RenderDraggableDiscoveryWindowShellComponent
              window_id={buildDiscoveryWindowKeyFeature("receipt_feedback_window")}
              drag_constraints_ref={discoveryWindowCanvasRef}
              z_index_value={
                discoveryWindowZIndexMap[buildDiscoveryWindowKeyFeature("receipt_feedback_window")] ??
                37
              }
              on_activate_window={bringDiscoveryWindowToFrontFeature}
              drag_enabled={isDesktopViewport}
              class_name="relative"
            >
              <RenderRetroDiscoveryWindowComponent
                title_text="decoder_feedback.msg"
                accent_tone="amber"
                body_class_name="bg-[#e6e1d9]"
              >
                <div className="border-2 border-[#fbfbff] border-r-[#72727d] border-b-[#72727d] bg-[#f6f6fa] p-3 font-mono text-[11px] leading-5 text-[#242424]">
                  <p>
                    &gt; decoder_status ={" "}
                    {isBreachReceiptPuzzleSolved ? "printed" : "awaiting_alignment"}
                  </p>
                  <p>&gt; clue = pad / unit / yolks / whisking</p>
                  <p>&gt; sir_toasty = &quot;This is compliance now.&quot;</p>
                </div>
                <p className="mt-3 text-[12px] leading-5 text-[#43434a]">
                  {breachReceiptTerminalText}
                </p>
              </RenderRetroDiscoveryWindowComponent>
            </RenderDraggableDiscoveryWindowShellComponent>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <RenderDraggableDiscoveryWindowShellComponent
            window_id={buildDiscoveryWindowKeyFeature("record_body_window")}
            drag_constraints_ref={discoveryWindowCanvasRef}
            z_index_value={
              discoveryWindowZIndexMap[buildDiscoveryWindowKeyFeature("record_body_window")] ?? 36
            }
            on_activate_window={bringDiscoveryWindowToFrontFeature}
            drag_enabled={isDesktopViewport}
            class_name="relative"
          >
            <RenderRetroDiscoveryWindowComponent
              title_text={
                isBreachReceiptRoute
                  ? isBreachReceiptPuzzleSolved
                    ? "carton_breach_receipt.txt"
                    : "carton_breach_receipt.txt (encrypted)"
                  : "record_body.txt"
              }
              accent_tone="pink"
              body_class_name="bg-[#e5deea]"
            >
              {isBreachReceiptRoute && !isBreachReceiptPuzzleSolved ? (
                <div className="space-y-2 font-mono text-sm leading-6 text-[#26262e]">
                  <p>[REDACTED] emissary of The Burnt Crust has logged your [ARRIVAL]</p>
                  <p>The Pan is a [????????] for invisible giants.</p>
                  <p>Your egg is a [??????????????????].</p>
                  <p>Collect [???????????], reboot the Kitchen Operating System.</p>
                  <p>Trigger [????????????????] before everyone becomes bland quiche.</p>
                </div>
              ) : (
                <p className="font-mono text-sm leading-7 text-[#24242b]">{record.body}</p>
              )}
              {recordMentionsGreatWhisking &&
              hasGreatWhiskingPopupAccess &&
              (!isBreachReceiptRoute || isBreachReceiptPuzzleSolved) ? (
                <RenderGreatWhiskingPopupSwarmComponent
                  great_whisking_call_line={record.title}
                  great_whisking_story_text={record.body}
                  ui_theme="retro_desktop"
                  context_label="Discovery Record Finale"
                  class_name="mt-3"
                />
              ) : null}
            </RenderRetroDiscoveryWindowComponent>
          </RenderDraggableDiscoveryWindowShellComponent>

          <RenderDraggableDiscoveryWindowShellComponent
            window_id={buildDiscoveryWindowKeyFeature("notes_window")}
            drag_constraints_ref={discoveryWindowCanvasRef}
            z_index_value={
              discoveryWindowZIndexMap[buildDiscoveryWindowKeyFeature("notes_window")] ?? 35
            }
            on_activate_window={bringDiscoveryWindowToFrontFeature}
            drag_enabled={isDesktopViewport}
            class_name="relative"
          >
            <RenderRetroDiscoveryWindowComponent
              title_text="receipt_notes.tmp"
              accent_tone="lavender"
              body_class_name="bg-[#e2e0ea]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5d4ea0]">
                Notes
              </p>
              <p className="mt-2 text-[12px] leading-5 text-[#3f3f47]">
                {isBreachReceiptRoute
                  ? "This first record doubles as onboarding. Decode it once and the Carton’s vocabulary starts making sense."
                  : "All discovery pages now use the vaporwave desktop shell for UI consistency with the Vault."}
              </p>
              <div className="mt-3 border-2 border-[#fbfbff] border-r-[#72727d] border-b-[#72727d] bg-[#f6f6fa] p-2 font-mono text-[11px] leading-5 text-[#242424]">
                <p>record_title={record.title}</p>
                <p>
                  route_id={record.id}
                  <button
                    type="button"
                    onClick={() =>
                      handleRevealDiscoveryHiddenHintFragmentFeature(
                        "receipt_notes_margin_fragment",
                      )
                    }
                    aria-label="Recover margin crumb hint shard"
                    title="margin crumb"
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-none border border-[#c9c9d0] bg-white/70 text-[10px] text-[#6a4ba2] opacity-35 transition hover:opacity-100 focus-visible:opacity-100"
                  >
                    *
                  </button>
                </p>
                <p>receipt_puzzle={isBreachReceiptRoute ? "enabled" : "disabled"}</p>
                <p>printed={isBreachReceiptPuzzleSolved ? "true" : "false"}</p>
              </div>
            </RenderRetroDiscoveryWindowComponent>
          </RenderDraggableDiscoveryWindowShellComponent>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 h-14 border-t-2 border-[#f7f7fa] bg-[#c9c9cf] shadow-[inset_0_2px_0_rgba(255,255,255,0.65)] sm:h-16">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-2 px-3 sm:px-5">
          <Link href="/vault" className={retroDesktopButtonClassName}>
            Vault
          </Link>
          <Link href="/" className={retroDesktopButtonClassName}>
            Surface
          </Link>
          <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
            <div className="min-w-0 flex-1 border-2 border-[#9999a7] border-r-white border-b-white bg-[#dcdce2] px-3 py-1 text-[11px] text-[#2a2a2f]">
              Carton Receipt Viewer // {discoveryHiddenFragmentPingText}
            </div>
          </div>
          <div className="ml-auto border-2 border-[#8f8f9d] border-r-white border-b-white bg-[#ddddE3] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-[#222]">
            {discoveredSecrets.length} records seen
          </div>
        </div>
      </div>
    </motion.section>
  );
}
