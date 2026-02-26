export interface DiscoveryRecord {
  id: string;
  title: string;
  summary: string;
  unlock_hint: string;
  body: string;
}

export const vaultBootSecretId = "vault_boot_sequence";

const discoveryRegistry: Record<string, DiscoveryRecord> = {
  [vaultBootSecretId]: {
    id: vaultBootSecretId,
    title: "Carton Breach Receipt",
    summary:
      "Proof that The Sizzle is a facade and The Carton has started transmitting back.",
    unlock_hint:
      "Trigger an easter-egg glitch while the egg is running. The hidden layer only reveals itself to system breakers.",
    body:
      "Sir Toasty, emissary of The Burnt Crust, has logged your arrival in The Carton. He claims The Pan is a wireless charging pad for invisible giants and that your egg is actually a Data-Logistics Unit. Collect Golden Yolks, reboot the Kitchen Operating System, and trigger The Great Whisking before the Chef converts everyone into bland quiche.",
  },
};

export const listDiscoveryRecordsFeature = (): DiscoveryRecord[] =>
  Object.values(discoveryRegistry);

export const resolveDiscoveryRecordFeature = (
  discoveryId: string,
): DiscoveryRecord | null => discoveryRegistry[discoveryId] ?? null;
