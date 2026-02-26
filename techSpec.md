# Technical Specification: The Eggcellent Adventure (MVP)
**Project Title:** The Eggcellent Adventure  
**Status:** Initial Ignition  
**Version:** 1.0.0  

@AI_AGENT: This document is iterative. You are required to update the Implementation Plan and Decision Log as you execute tasks.

## 1. Executive Summary
A platformer-ARG hybrid where a standard "infinite runner" (Egg escaping a Frying Pan) serves as a front for a hidden narrative discovery engine. The primary goal is for players to "glitch" the game to unlock a hidden Vault of secrets and meta-narrative pages.

## 2. Scope & Goals
- **In-Scope:** - Basic platformer mechanics (Run/Jump/Collision).
    - "Glitch Triggers" (Input combinations, window events, or hidden pixel clicks).
    - **The Vault:** A persistent inventory of "Easter Eggs" found.
    - **Meta-Routes:** Dynamic Next.js pages unlocked via the Vault.
- **Out-of-Scope:** Advanced level design, multiplayer, or complex enemy AI.

## 3. Tech Stack
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **Game Layer:** Phaser 3 (embedded in a React component).
- **State Management:** Zustand (with `persist` for LocalStorage sync).
- **Animations:** Framer Motion (for meta-UI glitches).

## 4. Machine-Optimized Data Schema
### Global State (Zustand)
```typescript
interface VaultState {
  discovered_secrets: string[]; // Array of unique IDs
  is_glitch_mode_active: boolean;
  add_discovery: (id: string) => void;
  trigger_glitch: () => void;
}
```

## 5. Implementation Plan (Updated 2026-02-25)
- [x] Read `AGENTS.md` and `techSpec.md` and confirm naming and architecture constraints.
- [x] Initialize a Next.js 15 (App Router) project in the current workspace with TypeScript and Tailwind CSS.
- [x] Create the AGENTS-defined directory map under `src/` for app/game/discovery/store/components.
- [x] Implement `use_vault_store.ts` using Zustand + `persist` (LocalStorage-backed progress).
- [x] Build a baseline Phaser 3 runner scene (egg escaping frying pan) embedded in a client React component.
- [x] Prioritize and implement glitch triggers (keyboard sequence, hidden pixel click, window resize burst).
- [x] Bridge glitch runtime events into persistent Vault unlock state and hidden meta-route UI.
- [x] Add `/vault` and dynamic `src/app/[discovery_id]/page.tsx` routes backed by a discovery registry.
- [x] Run validation (`npm run typecheck`, `npm run lint`) and fix integration issues.
- [x] Refactor the home route to a surface-first full-screen runtime with no visible meta chrome until a secret event fires.
- [x] Polish the runner loop with parallax layers, obstacle variety, scoring pacing, restart flow, VFX, and audio feedback.
- [x] Keep glitch triggers hidden in the visible UI while preserving the unlock bridge to the Vault.
- [x] Require obstacle dodging (obstacle contact ends the run instead of allowing multiple tanked hits).
- [x] Gate the hidden-layer popup UI behind a clickable hidden egg control instead of auto-showing on unlock.
- [x] Apply the Carton Matrix mission override (Dual Reality Protocol, Sir Toasty/The Burnt Crust, and Great Whisking narrative framing).
- [x] Add Carton riddle-gate logic (Soda Bottle, Candle, Keyboard, Sponge, Towel) with surreal hint progression.
- [x] Persist solved Carton riddles and ridiculous rewards in the vault store.
- [x] Integrate ridiculous rewards into the runner to break Sizzle physics (kazoo blasts, platform-shoes jumps, floaty gravity, pan tracking disruption, slipstream timing).
- [x] Load Sir Toasty story/progression scripts from handoff markdown docs (`sirToastyManafesto.md`, `enterTheCarton.md`, `stiffUpperLip.md`, `greatWhisking.md`, `postCredits.md`, `servedScreen.md`) and surface them in the Carton/vault progression UI.
- [x] Apply the `servedScreen` script to the runner loss overlay (Sir Toasty critique + "Bribe the Toaster" butter-shield restart when Golden Yolks exist).
- [x] Harden dev/runtime routing around `/vault` and `/favicon.ico` by simplifying the metadata icon route and moving the vault dynamic `ssr:false` import into a client shell component.
- [x] Refactor `/vault` into a minimal-first Carton landing view using `public/carton.png` with a small icon-triggered modal that reveals more modules as Golden Yolks/discoveries increase.
- [x] Redesign the Vault as a vaporwave desktop-style scene (retro window chrome, taskbar, floating motifs, embedded artwork hotspot, and desktop-themed modal windows).

## 6. Decision Log (Updated 2026-02-25)
- 2026-02-24: Scaffolded Next.js manually (instead of `create-next-app`) to preserve root handoff docs (`AGENTS.md`, `techSpec.md`) in-place.
- 2026-02-24: Chose Next.js 15.5.x to satisfy the "14+" requirement while using modern App Router defaults.
- 2026-02-24: Implemented Phaser assets as generated textures (no external image pipeline) to keep the MVP self-contained.
- 2026-02-24: Centralized secret metadata in a discovery registry so `/vault` and `src/app/[discovery_id]/page.tsx` share the same source of truth.
- 2026-02-24: Treated the Vault route as "hidden but present": route exists immediately, but content and UI access are gated by persisted glitch state.
- 2026-02-24: Emitted typed runtime events from the Phaser scene and used a dedicated glitch handler to update Zustand, preserving the Game-vs-Meta bridge.
- 2026-02-24: Refactored `/` into a full-screen surface runtime so first-time players perceive a standalone endless runner before any meta UI is exposed.
- 2026-02-24: Replaced explanatory in-page game hints with hidden glitch triggers to preserve the discovery fantasy while keeping the unlock path intact.
- 2026-02-24: Implemented generated sprite assets + synthesized Web Audio SFX to improve game feel without introducing external binary assets in the handoff.
- 2026-02-24: Changed obstacle collisions to end the run immediately so the core loop requires dodging instead of tanking hits.
- 2026-02-24: Added a hidden egg UI trigger that reveals the Vault popup on demand, preventing the hidden-layer panel from auto-appearing after unlock.
- 2026-02-24: Re-themed the hidden layer as The Carton and introduced Sir Toasty / The Burnt Crust as the absurd guide persona.
- 2026-02-24: Implemented a riddle-gate progression in the vault so meta unlocks now produce gameplay-affecting rewards instead of only lore pages.
- 2026-02-24: Routed Carton rewards back into the Sizzle runner loop to reinforce the dual-reality design with tangible physics changes.
- 2026-02-25: Added a server-side story-script loader that reads the handoff markdown files directly and passes curated Sir Toasty/Carton copy into the Surface and Vault layers.
- 2026-02-25: Moved `/vault`'s `next/dynamic(..., { ssr: false })` usage into a dedicated client-shell component to satisfy Next 15 server-component restrictions while avoiding fragile dev SSR for motion/Zustand UI.
- 2026-02-25: Simplified `src/app/icon.tsx` to plain `next/og` shapes (and edge runtime) to reduce dev-time metadata icon rendering failures affecting `/favicon.ico`.
- 2026-02-25: Changed the Vault UX to a staged console pattern: the base route shows only an opening storyline preview + carton art, while a hidden egg icon opens a modal that grows from compact riddle booth to richer records/archive panels as progress increases.
- 2026-02-25: Re-skinned the Vault into a vaporwave desktop UI inspired by retro web portfolios/Win95 window chrome while preserving the progressive unlock behavior and hidden hotspot interaction inside `carton.png`.
