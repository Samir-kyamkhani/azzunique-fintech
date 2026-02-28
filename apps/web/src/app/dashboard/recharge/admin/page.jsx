"use client";

import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  return (
    <ClientGuard
      anyOf={[
        PERMISSIONS.SERVICES_PAGES.RECHARGE.ADMIN.OPERATORS.READ,
        PERMISSIONS.SERVICES_PAGES.RECHARGE.ADMIN.CIRCLES.READ,
      ]}
      redirectMap={[
        {
          path: "/dashboard/recharge/admin/operators",
          perm: PERMISSIONS.SERVICES_PAGES.RECHARGE.ADMIN.OPERATORS.READ,
        },
        {
          path: "/dashboard/recharge/admin/circles",
          perm: PERMISSIONS.SERVICES_PAGES.RECHARGE.ADMIN.CIRCLES.READ,
        },
      ]}
    >
      <div />
    </ClientGuard>
  );
}
