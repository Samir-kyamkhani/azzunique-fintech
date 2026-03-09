"use client";

import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  return (
    <ClientGuard
      anyOf={[
        PERMISSIONS.PLATFORM_SERVICES.READ,
        PERMISSIONS.PLATFORM_SERVICE_PROVIDERS.READ,
        PERMISSIONS.PLATFORM_SERVICE_TENANTS.READ,
      ]}
      redirectMap={[
        {
          path: "/dashboard/platform/services",
          perm: PERMISSIONS.PLATFORM_SERVICES.READ,
        },
        {
          path: "/dashboard/platform/providers",
          perm: PERMISSIONS.PLATFORM_SERVICE_PROVIDERS.READ,
        },
        {
          path: "/dashboard/platform/tenants",
          perm: PERMISSIONS.PLATFORM_SERVICE_TENANTS.READ,
        },
      ]}
    >
      <div />
    </ClientGuard>
  );
}
