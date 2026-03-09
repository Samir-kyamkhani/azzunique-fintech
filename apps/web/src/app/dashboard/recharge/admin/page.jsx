"use client";

import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  return (
    <ClientGuard
      anyOf={[
        PERMISSIONS.RECHARGE_SERVICE_PAGES_ADMIN_OPERATORS.READ,
        PERMISSIONS.RECHARGE_SERVICE_PAGES_ADMIN_CIRCLES.READ,
      ]}
      redirectMap={[
        {
          path: "/dashboard/recharge/admin/operators",
          perm: PERMISSIONS.RECHARGE_SERVICE_PAGES_ADMIN_OPERATORS.READ,
        },
        {
          path: "/dashboard/recharge/admin/circles",
          perm: PERMISSIONS.RECHARGE_SERVICE_PAGES_ADMIN_CIRCLES.READ,
        },
      ]}
    >
      <div />
    </ClientGuard>
  );
}
