"use client";

import TabsNav from "@/components/details/TabsNav";
import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { IdCard } from "lucide-react";
import { SmartphoneCharging } from "lucide-react";
import { BanknoteArrowDown } from "lucide-react";
import { useSelector } from "react-redux";

export default function UserManagementLayout({ children }) {
  const perms = useSelector((s) => s.auth.user?.permissions);
  const can = (perm) => permissionChecker(perms, perm?.resource, perm?.action);

  const canRecharge = can(PERMISSIONS.TRANSACTIONS.RECHARGE.READ);
  const canfundRequest = can(PERMISSIONS.TRANSACTIONS.FUND_REQUEST.READ);
  const canAadhaar = can(PERMISSIONS.TRANSACTIONS.AADHAAR.READ);
  const canPancard = can(PERMISSIONS.TRANSACTIONS.PANCARD.READ);

  const tabs = [
    canfundRequest && {
      label: "Fund Request",
      value: "fund-request",
      icon: BanknoteArrowDown,
    },
    canRecharge && {
      label: "Recharge",
      value: "recharge",
      icon: SmartphoneCharging,
    },
    canAadhaar && {
      label: "Aadhaar",
      value: "aadhaar",
      icon: IdCard,
    },
    canPancard && {
      label: "Pancard",
      value: "pancard",
      icon: IdCard,
    },
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Transaction Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage all services transactions
        </p>
      </div>

      <TabsNav tabs={tabs} basePath="/dashboard/transactions" />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
