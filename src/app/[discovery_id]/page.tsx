import { RenderDiscoveryRecordComponent } from "@/components/render_discovery_record_component";

interface DiscoveryPageProps {
  params: Promise<{
    discovery_id: string;
  }>;
}

export default async function DiscoveryPage({ params }: DiscoveryPageProps) {
  const { discovery_id } = await params;

  return (
    <main className="-mx-4 -my-8 flex flex-col gap-6 sm:-mx-6 sm:-my-10">
      <RenderDiscoveryRecordComponent discovery_id={discovery_id} />
    </main>
  );
}
