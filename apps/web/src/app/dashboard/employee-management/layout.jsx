"use client";

import TabsNav from "@/components/details/TabsNav.jsx";
import { Building2 } from "lucide-react";
import { Users } from "lucide-react";

export default function EmployeeManagementLayout({ children }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Employee Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage employees and departments
        </p>
      </div>

      <TabsNav
        tabs={[
          {
            label: "Employees",
            value: "employees",
            icon: Users,
          },
          {
            label: "Departments",
            value: "departments",
            icon: Building2,
          },
        ]}
        basePath="/dashboard/employee-management"
      />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
