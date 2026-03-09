"use client";

import TabsNav from "@/components/details/TabsNav";
import { Building2, Users } from "lucide-react";
import { useSelector } from "react-redux";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { permissionChecker } from "@/lib/permissionCheker";

export default function PlatformLayout({ children }) {
  const perms = useSelector((s) => s.auth.user?.permissions);

  const tabs = [
    {
      label: "Services",
      value: "services",
      icon: Users,
      perm: PERMISSIONS.PLATFORM_SERVICES.READ,
    },
    {
      label: "Providers",
      value: "providers",
      icon: Building2,
      perm: PERMISSIONS.PLATFORM_SERVICE_PROVIDERS.READ,
    },
    {
      label: "Tenants",
      value: "tenants",
      icon: Building2,
      perm: PERMISSIONS.PLATFORM_SERVICE_TENANTS.READ,
    },
  ];

  const filteredTabs = tabs.filter((tab) =>
    permissionChecker(perms, tab.perm.resource, tab.perm.action),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Platform Control Center</h1>

        <p className="text-sm text-muted-foreground">
          Manage services, providers, and tenant assignments.
        </p>
      </div>

      <TabsNav tabs={filteredTabs} basePath="/dashboard/platform" />

      <div>{children}</div>
    </div>
  );
}
