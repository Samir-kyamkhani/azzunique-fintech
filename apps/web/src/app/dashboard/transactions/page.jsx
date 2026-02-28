"use client";

import ClientGuard from "@/components/ClientGuard";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  return (
    <ClientGuard
      anyOf={[
        PERMISSIONS.SERVICES_PAGES.FUND_REQUEST.READ,
        PERMISSIONS.SERVICES_PAGES.AADHAAR.READ,
        PERMISSIONS.SERVICES_PAGES.PANCARD.READ,
        PERMISSIONS.SERVICES_PAGES.PANCARD.READ,
      ]}
      redirectMap={[
        {
          path: "/dashboard/transactions/fund-request",
          perm: PERMISSIONS.SERVICES_PAGES.FUND_REQUEST.READ,
        },
        {
          path: "/dashboard/transactions/aadhaar",
          perm: PERMISSIONS.SERVICES_PAGES.AADHAAR.READ,
        },
        {
          path: "/dashboard/transactions/pancard",
          perm: PERMISSIONS.SERVICES_PAGES.PANCARD.READ,
        },
        {
          path: "/dashboard/transactions/recharge",
          perm: PERMISSIONS.SERVICES_PAGES.PANCARD.READ,
        },
      ]}
    >
      <div />
    </ClientGuard>
  );
}
