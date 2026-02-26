"use client";

import { motion, useDragControls, useMotionValue } from "framer-motion";
import Image from "next/image";
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type GreatWhiskingPopupId = string;

type GreatWhiskingPopupAccentTone = "cyan" | "pink" | "mint" | "amber" | "lavender";

interface GreatWhiskingPopupRecord {
  id: GreatWhiskingPopupId;
  title_text: string;
  caption_text: string;
  object_position_value: string;
  rotation_class_name: string;
  placement_class_name: string;
  accent_tone: GreatWhiskingPopupAccentTone;
}

interface RenderGreatWhiskingPopupSwarmComponentProps {
  great_whisking_call_line: string;
  great_whisking_story_text: string;
  ui_theme?: "retro_desktop" | "neon";
  context_label?: string;
  class_name?: string;
  auto_summon_on_mount?: boolean;
}

interface RenderDraggableGreatWhiskingPopupWindowComponentProps {
  popup_record: GreatWhiskingPopupRecord;
  is_collapsed: boolean;
  is_retro_desktop_theme: boolean;
  drag_constraints_ref: RefObject<HTMLDivElement | null>;
  z_index_value: number;
  on_activate_popup: (popupId: GreatWhiskingPopupId) => void;
  on_toggle_popup_collapsed: (popupId: GreatWhiskingPopupId) => void;
}

const greatWhiskingPopupRecords: GreatWhiskingPopupRecord[] = [
  {
    id: "binary_peel",
    title_text: "chef_binary_peel.sys",
    caption_text:
      "Chef reaches forward, then dissolves into falling green binary while the wallpaper peels off the simulation.",
    object_position_value: "50% 38%",
    rotation_class_name: "sm:-rotate-2",
    placement_class_name: "left-2 top-2 sm:left-3 sm:top-3",
    accent_tone: "mint",
  },
  {
    id: "kazoo_demise",
    title_text: "kazoo_scream.wav",
    caption_text:
      "The Chef tries to scream, but only kazoo audio exits. Sir Toasty calls this a dignified ending.",
    object_position_value: "44% 32%",
    rotation_class_name: "sm:rotate-1",
    placement_class_name: "right-2 top-5 sm:right-3 sm:top-4",
    accent_tone: "amber",
  },
  {
    id: "sink_jam_hole",
    title_text: "jam_hole_sink.exe",
    caption_text:
      "The sink drain becomes a Black Hole of Pure Jam and starts eating all practical narrative stakes.",
    object_position_value: "52% 61%",
    rotation_class_name: "sm:-rotate-1",
    placement_class_name: "left-[4%] top-[20%] sm:left-[6%] sm:top-[18%]",
    accent_tone: "lavender",
  },
  {
    id: "disco_stove",
    title_text: "stove_disco_ball.vfx",
    caption_text:
      "Stove ascends and spins like a disco ball while bacon glow-sticks attempt a Broadway routine.",
    object_position_value: "50% 72%",
    rotation_class_name: "sm:rotate-2",
    placement_class_name: "right-[5%] top-[26%] sm:right-[7%] sm:top-[24%]",
    accent_tone: "cyan",
  },
  {
    id: "egg_volution",
    title_text: "egg_volution_wings.mech",
    caption_text:
      "The egg grows spoon-wings and a crown of toast crumbs. Reality loses the argument immediately.",
    object_position_value: "51% 53%",
    rotation_class_name: "sm:-rotate-2",
    placement_class_name: "left-[20%] top-[12%] sm:left-[22%] sm:top-[13%]",
    accent_tone: "pink",
  },
  {
    id: "receipt_lawn_chair",
    title_text: "receipt_lawn_chair.rig",
    caption_text:
      "Sir Toasty lounges in a receipt-chair and drinks a juice box labelled NOT FOR EGGS. Extremely professional.",
    object_position_value: "49% 42%",
    rotation_class_name: "sm:rotate-1",
    placement_class_name: "left-[1%] top-[42%] sm:left-[2%] sm:top-[41%]",
    accent_tone: "amber",
  },
  {
    id: "void_toaster_backbone",
    title_text: "fiber_backbone.map",
    caption_text:
      "The road-crossing myth gets patched into a fiber-optic route diagram that points directly into the toaster void.",
    object_position_value: "58% 48%",
    rotation_class_name: "sm:-rotate-1",
    placement_class_name: "right-[1%] top-[47%] sm:right-[2%] sm:top-[46%]",
    accent_tone: "mint",
  },
  {
    id: "installer_wizard_crash",
    title_text: "installer_wizard.crash",
    caption_text:
      "The Chicken was a crashed installer wizard. Sir Toasty insists this explains every breakfast mystery ever logged.",
    object_position_value: "54% 36%",
    rotation_class_name: "sm:rotate-2",
    placement_class_name: "left-[14%] top-[57%] sm:left-[16%] sm:top-[57%]",
    accent_tone: "lavender",
  },
  {
    id: "waffle_iron_warning",
    title_text: "waffle_iron_warning.sys",
    caption_text:
      "Do not look under the Waffle Iron. That is where The Real Players are allegedly warehoused.",
    object_position_value: "50% 60%",
    rotation_class_name: "sm:-rotate-2",
    placement_class_name: "right-[14%] top-[63%] sm:right-[18%] sm:top-[62%]",
    accent_tone: "pink",
  },
  {
    id: "scrambled_patch_v2",
    title_text: "scrambled_patch_v2.0.iso",
    caption_text:
      "Meta-Restart package queued. Next playthrough flagged as Version 2.0: The Scrambled Patch.",
    object_position_value: "46% 56%",
    rotation_class_name: "sm:rotate-1",
    placement_class_name: "left-[34%] top-[36%] sm:left-[36%] sm:top-[35%]",
    accent_tone: "cyan",
  },
];

const accentTitleBarClassMap: Record<GreatWhiskingPopupAccentTone, string> = {
  cyan: "bg-[linear-gradient(90deg,#6ae7ff_0%,#8fd8ff_32%,#af9dff_72%,#f58cf6_100%)]",
  pink: "bg-[linear-gradient(90deg,#8dd7ff_0%,#a7b7ff_40%,#f3a0ff_72%,#ff8fcb_100%)]",
  mint: "bg-[linear-gradient(90deg,#7ff6dd_0%,#90ebff_34%,#8fb7ff_70%,#cfa0ff_100%)]",
  amber: "bg-[linear-gradient(90deg,#8bdcff_0%,#99bcff_35%,#ffc57a_72%,#ff9cad_100%)]",
  lavender: "bg-[linear-gradient(90deg,#8fd8ff_0%,#9ebfff_36%,#b7a0ff_70%,#e89bff_100%)]",
};

const joinClassNamesFeature = (...classNames: Array<string | undefined | false>): string =>
  classNames.filter(Boolean).join(" ");

const buildInitialWhiskingPopupZIndexMapFeature = (): Record<GreatWhiskingPopupId, number> =>
  Object.fromEntries(
    greatWhiskingPopupRecords.map((popupRecord, popupIndex) => [popupRecord.id, 20 + popupIndex]),
  );

const RenderDraggableGreatWhiskingPopupWindowComponent = ({
  popup_record,
  is_collapsed,
  is_retro_desktop_theme,
  drag_constraints_ref,
  z_index_value,
  on_activate_popup,
  on_toggle_popup_collapsed,
}: RenderDraggableGreatWhiskingPopupWindowComponentProps) => {
  const dragControls = useDragControls();
  const windowOffsetX = useMotionValue(0);
  const windowOffsetY = useMotionValue(0);
  const hasHydratedInitialFocusRef = useRef(false);

  const handleTitleBarPointerDownFeature = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    on_activate_popup(popup_record.id);
    dragControls.start(event);
  };

  useEffect(() => {
    if (hasHydratedInitialFocusRef.current) {
      return;
    }

    hasHydratedInitialFocusRef.current = true;
    windowOffsetX.set(0);
    windowOffsetY.set(0);
  }, [windowOffsetX, windowOffsetY]);

  return (
    <motion.section
      drag
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={drag_constraints_ref}
      dragTransition={{ power: 0, timeConstant: 110 }}
      className={joinClassNamesFeature(
        "retro_bitmap_font absolute overflow-hidden rounded-none border-2 border-[#f7f7fb] border-r-[#3e3e49] border-b-[#3e3e49] bg-[#d7d8de] shadow-[3px_3px_0_rgba(0,0,0,0.28)]",
        is_collapsed
          ? "w-[min(78%,16rem)] sm:w-[14.5rem]"
          : "w-[min(94%,20.5rem)] sm:w-[18.75rem] md:w-[20.5rem]",
        popup_record.placement_class_name,
        popup_record.rotation_class_name,
        !is_retro_desktop_theme ? "border-white/20 bg-[#121722]/95 backdrop-blur" : undefined,
      )}
      style={{
        zIndex: z_index_value,
        x: windowOffsetX,
        y: windowOffsetY,
        touchAction: "none",
      }}
      onPointerDown={() => {
        on_activate_popup(popup_record.id);
      }}
      whileTap={{ cursor: "grabbing" }}
    >
      <div
        onPointerDown={handleTitleBarPointerDownFeature}
        className={joinClassNamesFeature(
          "flex min-h-8 cursor-grab touch-none items-center justify-between border-b-2 border-[#2d2d35] px-2 py-1 active:cursor-grabbing",
          is_retro_desktop_theme
            ? accentTitleBarClassMap[popup_record.accent_tone]
            : "bg-[linear-gradient(90deg,#111827_0%,#1f2937_35%,#312e81_75%,#7c3aed_100%)]",
        )}
        title="Drag by the title bar"
      >
        <p
          className={joinClassNamesFeature(
            "truncate text-[11px] font-semibold uppercase tracking-[0.1em]",
            is_retro_desktop_theme ? "text-[#111421]" : "text-white",
          )}
        >
          {popup_record.title_text}
        </p>
        <div className="ml-2 flex items-center gap-1">
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => on_toggle_popup_collapsed(popup_record.id)}
            className="inline-flex h-4 min-w-4 items-center justify-center border border-black/45 bg-white/65 px-1 text-[9px] font-bold text-black/80"
            aria-label={is_collapsed ? "Restore popup" : "Minimize popup"}
            title={is_collapsed ? "Restore popup" : "Minimize popup"}
          >
            {is_collapsed ? "+" : "_"}
          </button>
        </div>
      </div>

      {is_collapsed ? (
        <div
          className={joinClassNamesFeature(
            "border-t px-2 py-1",
            is_retro_desktop_theme
              ? "border-white/80 bg-[#ededf2] text-[#353542]"
              : "border-white/10 bg-black/30 text-slate-200",
          )}
        >
          <p className="truncate text-[10px] leading-4">
            minimized // drag title bar to clear the reveal
          </p>
        </div>
      ) : (
        <div
          className={joinClassNamesFeature(
            "border-t p-2",
            is_retro_desktop_theme
              ? "border-white/80 bg-[#e4e5ea] text-[#21212a]"
              : "border-white/10 bg-black/30 text-white",
          )}
        >
          <div
            className={joinClassNamesFeature(
              "relative h-28 overflow-hidden rounded-none border-2 md:h-32",
              is_retro_desktop_theme
                ? "border-[#fbfbff] border-r-[#71717d] border-b-[#71717d] bg-black"
                : "border-white/10 bg-black",
            )}
          >
            <Image
              src="/thegreatwhisking.png"
              alt="The Great Whisking celebratory scene"
              fill
              sizes="(min-width: 768px) 328px, 92vw"
              className="object-cover"
              style={{ objectPosition: popup_record.object_position_value }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.22))]" />
          </div>
          <p
            className={
              is_retro_desktop_theme
                ? "mt-2 text-[11px] leading-5 text-[#3d3d46]"
                : "mt-2 text-xs leading-5 text-slate-200"
            }
          >
            {popup_record.caption_text}
          </p>
        </div>
      )}
    </motion.section>
  );
};

export function RenderGreatWhiskingPopupSwarmComponent({
  great_whisking_call_line,
  great_whisking_story_text,
  ui_theme = "retro_desktop",
  context_label = "Great Whisking",
  class_name,
  auto_summon_on_mount = false,
}: RenderGreatWhiskingPopupSwarmComponentProps) {
  const [isSwarmVisible, setIsSwarmVisible] = useState(false);
  const [collapsedPopupIdList, setCollapsedPopupIdList] = useState<GreatWhiskingPopupId[]>([]);
  const [isRevealPanelExpanded, setIsRevealPanelExpanded] = useState(false);
  const [popupZIndexMap, setPopupZIndexMap] = useState<Record<GreatWhiskingPopupId, number>>(() =>
    buildInitialWhiskingPopupZIndexMapFeature(),
  );
  const popupCanvasRef = useRef<HTMLDivElement | null>(null);

  const collapsedPopupIdSet = useMemo(
    () => new Set<GreatWhiskingPopupId>(collapsedPopupIdList),
    [collapsedPopupIdList],
  );
  const collapsedPopupCount = collapsedPopupIdList.length;
  const remainingPopupCount = greatWhiskingPopupRecords.length - collapsedPopupCount;
  const isUnderlyingRevealVisible = isSwarmVisible && remainingPopupCount === 0;
  const isRetroDesktopTheme = ui_theme === "retro_desktop";

  const containerClassName = isRetroDesktopTheme
    ? "retro_bitmap_font rounded-none border-2 border-[#f7f7fb] border-r-[#6f6f7a] border-b-[#6f6f7a] bg-[#ececf3] p-2"
    : "rounded-xl border border-white/10 bg-black/15 p-3";
  const triggerButtonClassName = isRetroDesktopTheme
    ? "retro_bitmap_font inline-flex items-center rounded-none border-2 border-[#f8f8fb] border-r-[#31313a] border-b-[#31313a] bg-[#d8d8dd] px-3 py-1.5 text-[12px] text-[#151515] shadow-[1px_1px_0_rgba(0,0,0,0.25)] transition hover:bg-[#ededf2] active:translate-y-px active:border-[#31313a] active:border-r-[#f8f8fb] active:border-b-[#f8f8fb]"
    : "inline-flex items-center rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/90 transition hover:bg-white/15";
  const statusChipClassName = isRetroDesktopTheme
    ? "rounded-none border border-[#73737f] bg-[#f5f5f9] px-2 py-1 text-[10px] text-[#2d2d35]"
    : "rounded-md border border-white/10 bg-black/20 px-2 py-1 text-[10px] text-white/70";
  const revealPanelClassName = isRetroDesktopTheme
    ? "rounded-none border-2 border-[#fbfbff] border-r-[#6d6d78] border-b-[#6d6d78] bg-white/75 p-3 text-[#232323]"
    : "rounded-lg border border-white/10 bg-black/20 p-3 text-slate-100";

  const resetWhiskingPopupSwarmStateFeature = (): void => {
    setPopupZIndexMap(buildInitialWhiskingPopupZIndexMapFeature());
    setCollapsedPopupIdList([]);
    setIsRevealPanelExpanded(false);
  };

  const handleSummonWhiskingPopupSwarmFeature = (): void => {
    setIsSwarmVisible(true);
    resetWhiskingPopupSwarmStateFeature();
  };

  const handleToggleWhiskingPopupCollapsedFeature = (popupId: GreatWhiskingPopupId): void => {
    setCollapsedPopupIdList((currentList) =>
      currentList.includes(popupId)
        ? currentList.filter((currentPopupId) => currentPopupId !== popupId)
        : [...currentList, popupId],
    );
  };

  const handleCollapseAllWhiskingPopupsFeature = (): void => {
    setCollapsedPopupIdList(greatWhiskingPopupRecords.map((popupRecord) => popupRecord.id));
  };

  const bringWhiskingPopupToFrontFeature = (popupId: GreatWhiskingPopupId): void => {
    setPopupZIndexMap((currentMap) => {
      const nextZIndexValue = Math.max(...Object.values(currentMap), 20) + 1;

      if (currentMap[popupId] === nextZIndexValue) {
        return currentMap;
      }

      return {
        ...currentMap,
        [popupId]: nextZIndexValue,
      };
    });
  };

  useEffect(() => {
    if (!auto_summon_on_mount) {
      return;
    }

    setIsSwarmVisible(true);
    resetWhiskingPopupSwarmStateFeature();
  }, [auto_summon_on_mount]);

  return (
    <section className={joinClassNamesFeature(containerClassName, class_name)}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSummonWhiskingPopupSwarmFeature}
          className={triggerButtonClassName}
        >
          Summon Whisking Popups ({greatWhiskingPopupRecords.length})
        </button>
        {isSwarmVisible ? (
          <button
            type="button"
            onClick={handleCollapseAllWhiskingPopupsFeature}
            className={triggerButtonClassName}
          >
            Minimize All
          </button>
        ) : null}
        <span className={statusChipClassName}>
          {context_label}
          {" // "}
          {remainingPopupCount}
          {" popup"}
          {remainingPopupCount === 1 ? "" : "s"} blocking the reveal
        </span>
      </div>

      <p
        className={
          isRetroDesktopTheme
            ? "mt-2 text-[11px] leading-5 text-[#4d4d59]"
            : "mt-2 text-xs leading-5 text-slate-300"
        }
      >
        Sir Toasty calls this &quot;Protocol Omelet-Geddon.&quot; Minimize the spam windows, then
        drag the minimized strips out of the way to clear the finale reveal.
      </p>

      <div
        ref={popupCanvasRef}
        className={joinClassNamesFeature(
          "relative mt-3 overflow-hidden",
          isRetroDesktopTheme
            ? "rounded-none border-2 border-[#f7f7fb] border-r-[#656571] border-b-[#656571] bg-[#d9dae2] p-2"
            : "rounded-lg border border-white/10 bg-black/20 p-2",
          isSwarmVisible ? "min-h-[34rem] md:min-h-[40rem]" : "min-h-[10rem]",
        )}
      >
        <div
          className={joinClassNamesFeature(
            revealPanelClassName,
            "relative z-0 transition",
            isSwarmVisible && !isUnderlyingRevealVisible ? "blur-[2px] opacity-75" : "",
          )}
        >
          <p
            className={
              isRetroDesktopTheme
                ? "font-mono text-[10px] uppercase tracking-[0.08em] text-[#6a4ba2]"
                : "font-mono text-[10px] uppercase tracking-[0.12em] text-fuchsia-200"
            }
          >
            Behind The Popups
          </p>
          <p
            className={
              isRetroDesktopTheme
                ? "mt-2 text-sm leading-6 text-[#1f1f1f]"
                : "mt-2 text-sm leading-6 text-slate-100"
            }
          >
            {great_whisking_call_line}
          </p>
          <p
            className={
              isRetroDesktopTheme
                ? "mt-2 text-xs leading-5 text-[#4e4e58]"
                : "mt-2 text-xs leading-5 text-slate-300"
            }
          >
            {isRevealPanelExpanded
              ? great_whisking_story_text
              : "Minimize and move the popup swarm to unspool the victory sequence. Sir Toasty says spoilers should arrive in windows."}
          </p>
          {isUnderlyingRevealVisible ? (
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => setIsRevealPanelExpanded((currentValue) => !currentValue)}
                className={triggerButtonClassName}
              >
                {isRevealPanelExpanded ? "Hide Finale Debrief" : "Reveal Finale Debrief"}
              </button>
              {isRevealPanelExpanded ? (
                <div
                  className={
                    isRetroDesktopTheme
                      ? "rounded-none border-2 border-[#f7fff8] border-r-[#657b69] border-b-[#657b69] bg-white/70 p-2"
                      : "rounded-md border border-emerald-300/20 bg-emerald-300/10 p-2"
                  }
                >
                  <p
                    className={
                      isRetroDesktopTheme
                        ? "text-[12px] leading-5 text-[#254a31]"
                        : "text-xs leading-5 text-emerald-100"
                    }
                  >
                    Sir Toasty postscript: the player is now &quot;The New Architect.&quot; Suggested
                    next action: go fry some code somewhere else. Then read the post-credits file and
                    click suspicious pixels.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {isSwarmVisible
          ? greatWhiskingPopupRecords.map((popupRecord) => (
              <RenderDraggableGreatWhiskingPopupWindowComponent
                key={popupRecord.id}
                popup_record={popupRecord}
                is_collapsed={collapsedPopupIdSet.has(popupRecord.id)}
                is_retro_desktop_theme={isRetroDesktopTheme}
                drag_constraints_ref={popupCanvasRef}
                z_index_value={popupZIndexMap[popupRecord.id] ?? 20}
                on_activate_popup={bringWhiskingPopupToFrontFeature}
                on_toggle_popup_collapsed={handleToggleWhiskingPopupCollapsedFeature}
              />
            ))
          : null}

        {isSwarmVisible && !isUnderlyingRevealVisible ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-2">
            <div
              className={
                isRetroDesktopTheme
                  ? "retro_bitmap_font rounded-none border-2 border-[#fafafe] border-r-[#6e6e79] border-b-[#6e6e79] bg-[#f4f4f8] px-3 py-1 text-[11px] text-[#2a2a33]"
                  : "rounded-md border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/90 backdrop-blur"
              }
            >
              Minimize or move {remainingPopupCount} popup{remainingPopupCount === 1 ? "" : "s"}
              {" "}
              to reveal the finale panel
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
