import type {
  TriggerGlitchGameEvent,
  UnlockVaultGameEvent,
} from "@/features/game/define_game_event_type";
import { vaultBootSecretId } from "@/features/discovery/define_secret_registry_feature";
import { useVaultStore } from "@/store/use_vault_store";

export const handleGlitchTriggerFeature = (
  triggerEvent: TriggerGlitchGameEvent,
): UnlockVaultGameEvent => {
  const vaultState = useVaultStore.getState();

  vaultState.trigger_glitch();
  vaultState.add_discovery(vaultBootSecretId);

  return {
    action: "unlock",
    subject: "vault",
    type: "feature",
    secret_id: vaultBootSecretId,
    occurred_at_ms: Math.max(Date.now(), triggerEvent.occurred_at_ms),
  };
};
