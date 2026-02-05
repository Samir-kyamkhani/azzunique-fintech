"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import TabsNav from "@/components/details/TabsNav";
import { Settings, Server, Globe, Mail } from "lucide-react";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { canServer } from "@/lib/serverPermission";
import { useEffect } from "react";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const perms = useSelector((s) => s.auth.user?.permissions);

  const can = (perm) => canServer(perms, perm.resource, perm.action);

  const allTabs = [
    {
      label: "General",
      value: "general",
      icon: Settings,
      permission: PERMISSIONS.WEBSITE.READ,
    },
    {
      label: "Server",
      value: "server",
      icon: Server,
      permission: PERMISSIONS.SERVER.READ,
    },
    {
      label: "Domain",
      value: "domain",
      icon: Globe,
      permission: PERMISSIONS.DOMAIN.READ,
    },
    {
      label: "SMTP",
      value: "smtp",
      icon: Mail,
      permission: PERMISSIONS.SMTP.READ,
    },
  ];

  const visibleTabs = allTabs.filter((t) => !t.permission || can(t.permission));

  // If current tab not allowed → redirect to first allowed
  useEffect(() => {
    if (!visibleTabs.length) {
      router.replace("/dashboard");
      return;
    }

    const currentTab = pathname.split("/").pop();
    const allowed = visibleTabs.some((t) => t.value === currentTab);

    if (!allowed) {
      router.replace(`/dashboard/settings/${visibleTabs[0].value}`);
    }
  }, [pathname, visibleTabs, router]);

  if (!visibleTabs.length) return null;

  return (
    <div className="bg-background space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Centralized control for onboarding, server detail, and tenant activity
        </p>
      </div>

      <TabsNav tabs={visibleTabs} basePath="/dashboard/settings" />

      <div>{children}</div>
    </div>
  );
}
