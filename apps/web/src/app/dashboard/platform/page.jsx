"use client";

import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  return (
    <ClientGuard
      anyOf={[
        PERMISSIONS.PLATFORM.SERVICES.READ,
        PERMISSIONS.PLATFORM.PROVIDERS.READ,
        PERMISSIONS.PLATFORM.TENANTS.READ,
      ]}
      redirectMap={[
        {
          path: "/dashboard/platform/services",
          perm: PERMISSIONS.PLATFORM.SERVICES.READ,
        },
        {
          path: "/dashboard/platform/providers",
          perm: PERMISSIONS.PLATFORM.PROVIDERS.READ,
        },
        {
          path: "/dashboard/platform/providers",
          perm: PERMISSIONS.PLATFORM.TENANTS.READ,
        },
      ]}
    >
      <div />
    </ClientGuard>
  );
}
