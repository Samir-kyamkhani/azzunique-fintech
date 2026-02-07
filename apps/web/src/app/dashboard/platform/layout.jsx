"use client";

import TabsNav from "@/components/details/TabsNav";
import { Building2 } from "lucide-react";
import { Users } from "lucide-react";

export default function PlatformLayout({ children }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Platform Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage services, providers and tenants assignement
        </p>
      </div>

      <TabsNav
        tabs={[
          {
            label: "Services",
            value: "services",
            icon: Users,
          },
          {
            label: "Providers",
            value: "providers",
            icon: Building2,
          },
          {
            label: "Tenants",
            value: "tenants",
            icon: Building2,
          },
        ]}
        basePath="/dashboard/platform"
      />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
