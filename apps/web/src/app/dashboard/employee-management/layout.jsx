"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import TabsNav from "@/components/details/TabsNav";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { permissionChecker } from "@/lib/permissionCheker";
import { Building2, Users } from "lucide-react";

export default function EmployeeManagementLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const perms = useSelector((s) => s.auth.user?.permissions);

  const can = (perm) => permissionChecker(perms, perm.resource, perm.action);

  const allTabs = [
    {
      label: "Employees",
      value: "employees",
      icon: Users,
      permission: PERMISSIONS.EMPLOYEE.READ,
    },
    {
      label: "Departments",
      value: "departments",
      icon: Building2,
      permission: PERMISSIONS.DEPARTMENT.READ,
    },
  ];

  const visibleTabs = allTabs.filter((t) => !t.permission || can(t.permission));

  // 🚨 Block direct URL access if tab not allowed
  useEffect(() => {
    if (!visibleTabs.length) {
      router.replace("/dashboard");
      return;
    }

    const currentTab = pathname.split("/").pop();
    const allowed = visibleTabs.some((t) => t.value === currentTab);

    if (!allowed) {
      router.replace(`/dashboard/employee-management/${visibleTabs[0].value}`);
    }
  }, [pathname, visibleTabs, router]);

  if (!visibleTabs.length) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Employee Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage employees and departments
        </p>
      </div>

      <TabsNav tabs={visibleTabs} basePath="/dashboard/employee-management" />

      <div>{children}</div>
    </div>
  );
}
