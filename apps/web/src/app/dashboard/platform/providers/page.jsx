import PlatformProvidersClient from "@/components/client/PlatformProvidersClient";
import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export const metadata = {
  title: "Platform Providers",
};

export default function PlatformProvidersPage() {
  return (
    <ClientGuard anyOf={[PERMISSIONS.PLATFORM.SERVICE_PROVIDERS.READ]}>
      <PlatformProvidersClient />
    </ClientGuard>
  );
}
