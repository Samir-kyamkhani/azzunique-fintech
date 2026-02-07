"use client";

import TabsNav from "@/components/details/TabsNav";
import { Building2 } from "lucide-react";
import { Users } from "lucide-react";
import { useSelector } from "react-redux";

export default function EmployeeManagementLayout({ children }) {
  const permissions = useSelector((s) => s.auth.user?.permissions);
  // console.log(permissions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Employees Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage Employees and departments
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
            label: "Departments ",
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
