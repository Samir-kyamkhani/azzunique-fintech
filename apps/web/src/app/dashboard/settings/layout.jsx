"use client";

import { usePathname } from "next/navigation";
import TabsNav from "@/components/details/TabsNav";
import { Settings, Server, Globe, Mail } from "lucide-react";
import { usePermissionChecker } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();
  const { can } = usePermissionChecker();

  const tabs = [
    (can(PERMISSIONS.WEBSITE.READ.resource, PERMISSIONS.WEBSITE.READ.action) ||
      can(
        PERMISSIONS.SOCIAL_MEDIA.READ.resource,
        PERMISSIONS.SOCIAL_MEDIA.READ.action,
      )) && {
      label: "General",
      value: "general",
      icon: Settings,
    },

    can(PERMISSIONS.SERVER.READ.resource, PERMISSIONS.SERVER.READ.action) && {
      label: "Server",
      value: "server",
      icon: Server,
    },

    can(PERMISSIONS.DOMAIN.READ.resource, PERMISSIONS.DOMAIN.READ.action) && {
      label: "Domain",
      value: "domain",
      icon: Globe,
    },

    can(PERMISSIONS.SMTP.READ.resource, PERMISSIONS.SMTP.READ.action) && {
      label: "SMTP",
      value: "smtp",
      icon: Mail,
    },
  ].filter(Boolean);

  return (
    <div className="bg-background space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Centralized control for onboarding, server detail, and tenant activity
        </p>
      </div>

      {tabs.length > 0 && (
        <TabsNav tabs={tabs} basePath="/dashboard/settings" />
      )}

      <div>{children}</div>
    </div>
  );
}
