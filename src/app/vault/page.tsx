import { RenderVaultInventoryClientShellComponent } from "@/components/render_vault_inventory_client_shell_component";
import { readCartonStoryScriptFeature } from "@/features/discovery/read_carton_story_script_feature";

export default async function VaultPage() {
  const cartonStoryScriptBundle = await readCartonStoryScriptFeature();

  return (
    <main className="-mx-4 -my-8 sm:-mx-6 sm:-my-10">
      <h1 className="sr-only">The Carton Vault</h1>
      <RenderVaultInventoryClientShellComponent
        carton_story_script_bundle={cartonStoryScriptBundle}
      />
    </main>
  );
}
