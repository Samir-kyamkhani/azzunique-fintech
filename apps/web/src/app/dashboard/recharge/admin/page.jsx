"use client";

import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  return (
    <ClientGuard
      anyOf={[
        PERMISSIONS.RECHARGE_SERVICE_PAGES.ADMIN.OPERATORS.READ,
        PERMISSIONS.RECHARGE_SERVICE_PAGES.ADMIN.CIRCLES.READ,
      ]}
      redirectMap={[
        {
          path: "/dashboard/recharge/admin/operators",
          perm: PERMISSIONS.RECHARGE_SERVICE_PAGES.ADMIN.OPERATORS.READ,
        },
        {
          path: "/dashboard/recharge/admin/circles",
          perm: PERMISSIONS.RECHARGE_SERVICE_PAGES.ADMIN.CIRCLES.READ,
        },
      ]}
    >
      <div />
    </ClientGuard>
  );
}
