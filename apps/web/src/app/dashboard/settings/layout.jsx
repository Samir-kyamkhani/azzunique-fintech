"use client";

import TabsNav from "@/components/details/TabsNav";
import { Settings, Server, Globe, Mail } from "lucide-react";

export default function SettingsLayout({ children }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage system configuration and services
        </p>
      </div>

      <TabsNav
        tabs={[
          {
            label: "General",
            value: "general",
            icon: Settings,
          },
          {
            label: "Server",
            value: "server",
            icon: Server,
          },
          {
            label: "Domain",
            value: "domain",
            icon: Globe,
          },
          {
            label: "SMTP",
            value: "smtp",
            icon: Mail,
          },
        ]}
        basePath="/dashboard/settings"
      />

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
