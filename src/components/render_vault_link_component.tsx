"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useVaultStore } from "@/store/use_vault_store";

export function RenderVaultLinkComponent() {
  const [hasMounted, setHasMounted] = useState(false);

  const isGlitchModeActive = useVaultStore((state) => state.is_glitch_mode_active);
  const discoveredSecrets = useVaultStore((state) => state.discovered_secrets);
  const resetVaultDebug = useVaultStore((state) => state.reset_vault_debug);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const hasVaultAccess =
    hasMounted &&
    (isGlitchModeActive || discoveredSecrets.includes("vault_boot_sequence"));

  return (
    <aside className="vault_frame scanline_overlay relative flex flex-col gap-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
          Meta Layer Gate
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
          Hidden Vault Route
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This panel mirrors the persistent Zustand state. The route is visible
          only after the game emits a glitch trigger and the vault store records
          the discovery.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
          `use_vault_store`
        </p>
        <div className="mt-3 space-y-2 font-mono text-xs text-slate-200">
          <p>
            is_glitch_mode_active:{" "}
            <span className={hasVaultAccess ? "text-emerald-300" : "text-rose-300"}>
              {hasMounted ? String(isGlitchModeActive) : "hydrating"}
            </span>
          </p>
          <p>discovered_secrets: [{hasMounted ? discoveredSecrets.join(", ") : ""}]</p>
        </div>
      </div>

      {hasVaultAccess ? (
        <Link
          href="/vault"
          className="inline-flex items-center justify-center rounded-xl border border-ember-300/40 bg-ember-300/10 px-4 py-3 text-sm font-semibold tracking-wide text-ember-100 transition hover:bg-ember-300/20"
        >
          Open Vault Inventory
        </Link>
      ) : (
        <div className="rounded-xl border border-dashed border-white/15 bg-black/15 px-4 py-3 text-sm leading-6 text-slate-300">
          Vault route still masked. Break the runner first.
        </div>
      )}

      <button
        type="button"
        onClick={resetVaultDebug}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/10"
      >
        Reset Local Progress (Debug)
      </button>
    </aside>
  );
}

