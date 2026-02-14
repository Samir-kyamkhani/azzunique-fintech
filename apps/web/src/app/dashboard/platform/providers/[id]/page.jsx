import PlatformProviderByServicePage from "@/components/client/PlatformProviderByServiceClient";
import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default async function PlatformProviderDetailsPage({ params }) {
  const { id } = await params;
  return (
    <ClientGuard anyOf={[PERMISSIONS.PLATFORM.PROVIDERS.READ]}>
      <PlatformProviderByServicePage serviceId={id} />
    </ClientGuard>
  );
}
