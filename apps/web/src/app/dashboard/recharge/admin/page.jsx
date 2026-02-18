"use client";

import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  return (
    <ClientGuard
      anyOf={[
        PERMISSIONS.RECHARGE.ADMIN.OPERATORS.READ,
        PERMISSIONS.RECHARGE.ADMIN.CIRCLES.READ,
      ]}
      redirectMap={[
        {
          path: "/dashboard/recharge/admin/operators",
          perm: PERMISSIONS.RECHARGE.ADMIN.OPERATORS.READ,
        },
        {
          path: "/dashboard/recharge/admin/circles",
          perm: PERMISSIONS.RECHARGE.ADMIN.CIRCLES.READ,
        },
      ]}
    >
      <div />
    </ClientGuard>
  );
}
