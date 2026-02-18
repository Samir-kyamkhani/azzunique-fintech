import TenantServicesClient from "@/components/client/TenantServicesClient";
import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export const metadata = {
  title: "Tenant Services",
};

export default function TenantServicesPage() {
  return (
    <ClientGuard anyOf={[PERMISSIONS.PLATFORM.SERVICE_TENANTS.READ]}>
      <TenantServicesClient />
    </ClientGuard>
  );
}
