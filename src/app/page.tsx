import { RenderGameSurfaceComponent } from "@/components/render_game_surface_component";
import { readCartonStoryScriptFeature } from "@/features/discovery/read_carton_story_script_feature";

export default async function HomePage() {
  const cartonStoryScriptBundle = await readCartonStoryScriptFeature();

  return <RenderGameSurfaceComponent carton_story_script_bundle={cartonStoryScriptBundle} />;
}
