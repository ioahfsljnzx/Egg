"use client";

import dynamic from "next/dynamic";

import type { CartonStoryScriptBundle } from "@/features/discovery/define_carton_story_script_type";

const RenderVaultInventoryComponent = dynamic(
  () =>
    import("@/components/render_vault_inventory_component").then(
      (moduleRecord) => moduleRecord.RenderVaultInventoryComponent,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="relative min-h-[70vh] overflow-hidden bg-[linear-gradient(180deg,#a5e8ff_0%,#b5dbff_28%,#cab7ff_65%,#e6acd8_100%)] p-4 sm:p-6">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.8)_0px,transparent_36%),radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.65)_0px,transparent_40%),radial-gradient(circle_at_58%_14%,rgba(255,196,245,0.6)_0px,transparent_34%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-8 h-[34vh] origin-bottom [transform:perspective(1100px)_rotateX(73deg)_scale(1.4)] bg-[linear-gradient(to_right,rgba(255,255,255,0.82)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,255,255,0.82)_2px,transparent_2px)] [background-size:56px_56px] opacity-80 sm:bottom-10" />
        <div className="relative z-10 mx-auto max-w-2xl pt-8">
          <section className="retro_bitmap_font overflow-hidden rounded-none border-2 border-[#f3f3f7] border-r-[#30303a] border-b-[#30303a] bg-[#d7d7dc] shadow-[3px_3px_0_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b-2 border-[#2d2d35] bg-[linear-gradient(90deg,#6ae7ff_0%,#8fd8ff_32%,#af9dff_72%,#f58cf6_100%)] px-2 py-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#111421]">
                boot_carton_archive.exe
              </p>
              <div className="flex items-center gap-1" aria-hidden="true">
                {["_", "□", "X"].map((buttonLabel) => (
                  <span
                    key={buttonLabel}
                    className="inline-flex h-4 min-w-4 items-center justify-center border border-black/45 bg-white/60 px-1 text-[9px] font-bold text-black/70"
                  >
                    {buttonLabel}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-white/80 bg-[#e1e2e8] p-4 text-[#181818]">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#4d49a4]">
                Booting Carton Archive
              </p>
              <p className="mt-3 text-sm leading-6 text-[#34343c]">
                Sir Toasty is calibrating the riddle booth and rehydrating the vault state.
              </p>
            </div>
          </section>
        </div>
      </section>
    ),
  },
);

interface RenderVaultInventoryClientShellComponentProps {
  carton_story_script_bundle: CartonStoryScriptBundle;
}

export function RenderVaultInventoryClientShellComponent({
  carton_story_script_bundle,
}: RenderVaultInventoryClientShellComponentProps) {
  return <RenderVaultInventoryComponent carton_story_script_bundle={carton_story_script_bundle} />;
}
