"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import TabsNav from "@/components/details/TabsNav";
import { Building2, Users } from "lucide-react";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { canServer } from "@/lib/serverPermission";

export default function UserManagementLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const perms = useSelector((s) => s.auth.user?.permissions);

  const can = (perm) => canServer(perms, perm.resource, perm.action);

  const allTabs = [
    {
      label: "Users",
      value: "users",
      icon: Users,
      permission: PERMISSIONS.USER.READ,
    },
    {
      label: "Roles",
      value: "roles",
      icon: Building2,
      permission: PERMISSIONS.ROLE.READ,
    },
  ];

  const visibleTabs = allTabs.filter((t) => !t.permission || can(t.permission));

  // 🚨 Block direct URL access
  useEffect(() => {
    if (!visibleTabs.length) {
      router.replace("/dashboard");
      return;
    }

    const currentTab = pathname.split("/").pop();
    const allowed = visibleTabs.some((t) => t.value === currentTab);

    if (!allowed) {
      router.replace(`/dashboard/user-management/${visibleTabs[0].value}`);
    }
  }, [pathname, visibleTabs, router]);

  if (!visibleTabs.length) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage users and roles</p>
      </div>

      <TabsNav tabs={visibleTabs} basePath="/dashboard/user-management" />

      <div>{children}</div>
    </div>
  );
}
