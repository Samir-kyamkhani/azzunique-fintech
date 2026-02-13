import ClientGuard from "@/components/ClientGuard";
import PlatformProviderDetailsClient from "@/components/client/PlatformProviderDetailsClient";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function PlatformProviderDetailsPage({ params }) {
  return (
    <ClientGuard anyOf={[PERMISSIONS.PLATFORM.PROVIDERS.READ]}>
      <PlatformProviderDetailsClient providerId={params.id} />
    </ClientGuard>
  );
}
