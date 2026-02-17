"use client";

import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  return (
    <ClientGuard
      anyOf={[
        PERMISSIONS.TRANSACTIONS.FUND_REQUEST.READ,
        PERMISSIONS.TRANSACTIONS.AADHAAR.READ,
        PERMISSIONS.TRANSACTIONS.PANCARD.READ,
        PERMISSIONS.TRANSACTIONS.RECHARGE.READ,
      ]}
      redirectMap={[
        {
          path: "/dashboard/transactions/fund-request",
          perm: PERMISSIONS.TRANSACTIONS.FUND_REQUEST.READ,
        },
        {
          path: "/dashboard/transactions/aadhaar",
          perm: PERMISSIONS.TRANSACTIONS.AADHAAR.READ,
        },
        {
          path: "/dashboard/transactions/pancard",
          perm: PERMISSIONS.TRANSACTIONS.PANCARD.READ,
        },
        {
          path: "/dashboard/transactions/recharge",
          perm: PERMISSIONS.TRANSACTIONS.RECHARGE.READ,
        },
      ]}
    >
      <div />
    </ClientGuard>
  );
}
