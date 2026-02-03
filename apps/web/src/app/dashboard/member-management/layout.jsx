"use client";

import TabsNav from "@/components/details/TabsNav";
import { Building2 } from "lucide-react";
import { Users } from "lucide-react";

export default function EmployeeManagementLayout({ children }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Member Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage members and roles
        </p>
      </div>

      <TabsNav
        tabs={[
          {
            label: "Members",
            value: "members",
            icon: Users,
          },
          {
            label: "Roles ",
            value: "roles",
            icon: Building2,
          },
        ]}
        basePath="/dashboard/member-management"
      />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
