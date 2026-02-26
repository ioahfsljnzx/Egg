"use client";

import { AnimatePresence, motion } from "framer-motion";
import type * as PhaserRuntimeNamespace from "phaser";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { handleGlitchTriggerFeature } from "@/features/discovery/handle_glitch_trigger_feature";
import type { CartonStoryScriptBundle } from "@/features/discovery/define_carton_story_script_type";
import type {
  GameRuntimeEvent,
  TriggerGlitchGameEvent,
} from "@/features/game/define_game_event_type";
import { useVaultStore } from "@/store/use_vault_store";

const formatVaultRevealSignalFeature = (event: GameRuntimeEvent): string => {
  if (event.action === "unlock" && event.subject === "vault") {
    return `Carton handshake logged: ${event.secret_id}`;
  }

  if (event.action === "trigger" && event.subject === "glitch") {
    return `Carton seam detected: ${event.type.replaceAll("_", " ")}`;
  }

  return "Anomalous signal detected.";
};

interface RenderGameSurfaceComponentProps {
  carton_story_script_bundle: CartonStoryScriptBundle;
}

export function RenderGameSurfaceComponent({
  carton_story_script_bundle,
}: RenderGameSurfaceComponentProps) {
  const servedScreenHeadline = carton_story_script_bundle.served_screen_headline;
  const servedScreenCritiqueLines = carton_story_script_bundle.served_screen_critique_lines;
  const greatWhiskingCallLine = carton_story_script_bundle.great_whisking_call_line;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<PhaserRuntimeNamespace.Game | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isSurfaceReady, setIsSurfaceReady] = useState(false);
  const [isHiddenLayerPanelVisible, setIsHiddenLayerPanelVisible] = useState(false);
  const [hasHiddenLayerPing, setHasHiddenLayerPing] = useState(false);
  const [vaultRevealSignal, setVaultRevealSignal] = useState<string>(
    "Carton archive available.",
  );

  const isGlitchModeActive = useVaultStore((state) => state.is_glitch_mode_active);
  const discoveredSecretCount = useVaultStore((state) => state.discovered_secrets.length);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let isDisposed = false;

    const bootstrapGameFeature = async (): Promise<void> => {
      const [PhaserRuntime, { EscapeRunnerScene }] = await Promise.all([
        import("phaser"),
        import("@/features/game/scenes/build_escape_runner_scene_feature"),
      ]);

      if (isDisposed || !containerRef.current) {
        return;
      }

      const scene = new EscapeRunnerScene({
        on_game_event: (event) => {
          if (event.action === "trigger" && event.subject === "glitch") {
            setVaultRevealSignal(formatVaultRevealSignalFeature(event));
            const unlockEvent = handleGlitchTriggerFeature(event);
            setVaultRevealSignal(formatVaultRevealSignalFeature(unlockEvent));
            setHasHiddenLayerPing(true);
          }
        },
        served_overlay_copy: {
          headline: servedScreenHeadline,
          critique_lines: servedScreenCritiqueLines,
          great_whisking_ready_line: greatWhiskingCallLine,
        },
      });

      gameRef.current = new PhaserRuntime.Game({
        type: PhaserRuntime.AUTO,
        width: 960,
        height: 540,
        parent: containerRef.current,
        backgroundColor: "#070d12",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 980 },
            debug: false,
          },
        },
        scale: {
          mode: PhaserRuntime.Scale.FIT,
          autoCenter: PhaserRuntime.Scale.CENTER_BOTH,
          width: 960,
          height: 540,
        },
        scene: [scene],
      });

      setIsSurfaceReady(true);
    };

    void bootstrapGameFeature();

    return () => {
      isDisposed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      setIsSurfaceReady(false);
    };
  }, [greatWhiskingCallLine, servedScreenCritiqueLines, servedScreenHeadline]);

  const hasVaultAccess = hasMounted && (isGlitchModeActive || discoveredSecretCount > 0);
  const showHiddenLayerPanel = hasVaultAccess && isHiddenLayerPanelVisible;
  const hiddenLayerSubtext =
    carton_story_script_bundle.enter_carton_tip_lines[0] ??
    "Sir Toasty is yelling about invisible giants and a charging pad.";

  useEffect(() => {
    if (!hasVaultAccess) {
      setIsHiddenLayerPanelVisible(false);
      setHasHiddenLayerPing(false);
      return;
    }

    if (discoveredSecretCount > 0 && vaultRevealSignal === "Carton archive available.") {
      setVaultRevealSignal("Archived Carton breach available.");
    }
  }, [discoveredSecretCount, hasVaultAccess, vaultRevealSignal]);

  const handleHiddenEggClickFeature = (): void => {
    if (!hasVaultAccess) {
      const syntheticHiddenEggTriggerEvent: TriggerGlitchGameEvent = {
        action: "trigger",
        subject: "glitch",
        type: "hidden_pixel_click",
        occurred_at_ms: Date.now(),
      };

      setVaultRevealSignal(formatVaultRevealSignalFeature(syntheticHiddenEggTriggerEvent));
      const unlockEvent = handleGlitchTriggerFeature(syntheticHiddenEggTriggerEvent);
      setVaultRevealSignal(formatVaultRevealSignalFeature(unlockEvent));
      setHasHiddenLayerPing(false);
      setIsHiddenLayerPanelVisible(true);
      return;
    }

    setHasHiddenLayerPing(false);
    setIsHiddenLayerPanelVisible((currentValue) => !currentValue);
  };

  return (
    <section className="fixed inset-0 z-30 bg-[#03060a]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,175,77,0.12),transparent_42%),radial-gradient(circle_at_82%_20%,rgba(255,107,53,0.1),transparent_40%),linear-gradient(180deg,#05090f_0%,#03070b_60%,#02060a_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className="relative overflow-hidden bg-black sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl"
          style={{
            width: "min(100vw, 177.78vh)",
            height: "min(56.25vw, 100vh)",
          }}
        >
          <div ref={containerRef} className="h-full w-full" />

          {!isSurfaceReady ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#02050a]">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-xs tracking-[0.16em] text-slate-300">
                BOOTING SURFACE RUNTIME
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={handleHiddenEggClickFeature}
        aria-label="Inspect hidden egg"
        className={[
          "absolute left-4 top-4 z-40 inline-flex h-8 w-6 items-center justify-center rounded-full border transition",
          hasVaultAccess
            ? "border-amber-200/35 bg-amber-100/5 text-amber-100/80 hover:border-amber-200/60 hover:bg-amber-100/10"
            : "border-white/10 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/35",
          hasHiddenLayerPing ? "animate-pulse shadow-[0_0_18px_rgba(255,179,64,0.25)]" : "",
        ].join(" ")}
      >
        <span className="relative block h-5 w-4 rounded-[999px] border border-current/80">
          <span className="absolute left-1/2 top-[55%] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current/70" />
        </span>
      </button>

      <AnimatePresence>
        {showHiddenLayerPanel ? (
          <motion.aside
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute bottom-4 right-4 z-40 w-[min(90vw,360px)] rounded-2xl border border-ember-300/30 bg-[#0b1117]/90 p-4 shadow-2xl backdrop-blur"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember-300">
              The Carton Is Open
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{vaultRevealSignal}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {carton_story_script_bundle.manifesto_quote_line}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {hiddenLayerSubtext}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-mono text-xs text-slate-400">
                {discoveredSecretCount} secret
                {discoveredSecretCount === 1 ? "" : "s"} discovered
              </p>
              <Link
                href="/vault"
                className="inline-flex items-center rounded-lg border border-ember-300/40 bg-ember-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ember-100 transition hover:bg-ember-300/20"
              >
                Enter Carton
              </Link>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
