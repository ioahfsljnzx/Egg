export type GlitchTriggerType =
  | "keyboard_sequence"
  | "hidden_pixel_click"
  | "window_resize_burst";

interface BaseGameRuntimeEvent {
  occurred_at_ms: number;
}

export interface TriggerGlitchGameEvent extends BaseGameRuntimeEvent {
  action: "trigger";
  subject: "glitch";
  type: GlitchTriggerType;
}

export interface UnlockVaultGameEvent extends BaseGameRuntimeEvent {
  action: "unlock";
  subject: "vault";
  type: "feature";
  secret_id: string;
}

export interface EggCollisionGameEvent extends BaseGameRuntimeEvent {
  action: "handle";
  subject: "egg_collision";
  type: "event";
  obstacle_key: string;
}

export type GameRuntimeEvent =
  | TriggerGlitchGameEvent
  | UnlockVaultGameEvent
  | EggCollisionGameEvent;

