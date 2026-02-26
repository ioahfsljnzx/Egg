# AGENTS.md: Operational Manual

## 1. Project Snapshot
- **Core Transformation:** Moving the user from "Player" to "System Breaker."
- **Primary Success Metric:** Number of secrets found per session.

## 2. Coding Standards
- **Strict TypeScript:** No `any` types. Define interfaces for all Game Events.
- **Naming Convention:** Use `action_subject_type`.
    - Correct: `unlock_vault_feature.ts`, `handle_egg_collision.ts`
    - Incorrect: `utils.js`, `eggLogic.ts`
- **Functional Components:** React Server Components (RSC) where possible, `use client` for Phaser containers.
- **No Barrel Exports:** Import directly from files to maintain clean tree-shaking and agent clarity.

## 3. Directory Map (Machine-Optimized)
```text
src/
├── app/                  # Next.js App Router (The "Meta" Layer)
│   ├── vault/            # The Secret Inventory UI
│   └── [discovery_id]/   # Dynamic routes for found secrets
├── features/
│   ├── game/             # Phaser logic (The "Surface" Layer)
│   │   ├── scenes/
│   │   └── sprites/
│   └── discovery/        # Logic for "Glitch" triggers, hidden hints, and puzzle state
├── store/
│   └── use_vault_store.ts # Source of Truth for progress
└── components/           # Reusable UI (Shadcn) 
```

## 4. Current Meta Progression (Keep Updated)
- **Core Yolks (5):** Awarded by the main Carton riddle booth. These drive K.O.S. reboot progress and runner rewards.
- **Riddle Booth Sequencing:** The booth must progress through all 5 core riddles in order. Great Whisking finale UI is gated until the 5th core riddle is solved.
- **Riddle UI Secrecy:** The riddle booth UI must not reveal the solution target label (do not render `"Target object: ..."` hints). Answers should only be learned via the riddle/hints/player discovery.
- **Bonus Yolks (Side Puzzles):** Awarded by hidden desktop secrets (clickable fragments inside/behind windows) and side puzzles. These increase Carton complexity tiers.
- **Bonus Puzzle Chaining:** Side puzzles may require previously solved side puzzles (not just hint fragments). Use this for post-credits “afterparty level” progression.
- **Hidden Hint Fragments:** Tiny clickable UI crumbs hidden across Vault + Discovery desktop windows. Fragments unlock side puzzles.
- **Desktop Layout Persistence:** Window drag offsets + minimized states persist in `use_vault_store.ts` (Carton desktop remembers layouts across reloads).
- **Great Whisking Popup Swarm:** Finale mentions can summon a dense popup swarm (using `public/thegreatwhisking.png`) that covers the reveal area. Popup windows are draggable by title bar, minimize to movable strips, and must be cleared to reveal the hidden finale panel. In the riddle booth finale, the swarm auto-summons after the 5th core riddle is cleared.
- **Post-Credits Afterparty Chain:** The `post_credits_arc` story card contains a hidden crumb that unlocks a chained set of bonus “afterparty level” puzzles in `bonus_yolk_lab.exe`, awarding extra Golden Yolks and extending post-credits tier progression.

## 5. Documentation Maintenance Rule
- **Required:** Update `AGENTS.md` whenever progression systems, hidden secret mechanics, puzzle loops, UI architecture, or persisted store shape changes.
- **Required:** If new hidden secrets/puzzles are added, document:
  - where they are hidden (surface area / window names)
  - what they unlock (hint, side puzzle, yolk, tier impact)
  - any new persisted store fields
- **Current Hidden Secret Additions:** `post_credits_arc` (in `story_archive.arc`) now contains a hidden waffle-iron crumb (`*`) that reveals a hint shard and unlocks the post-credits afterparty bonus puzzle chain (Level 1-3), awarding bonus yolks and raising higher Carton tiers.
- **Required:** If new narrative UI gimmicks are added (e.g. pop-up swarms, overlays, hidden reveal layers), document where they appear and the trigger/reveal interaction.
