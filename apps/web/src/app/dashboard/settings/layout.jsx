"use client";

import { usePathname } from "next/navigation";
import TabsNav from "@/components/Details/TabsNav";
import { Settings } from "lucide-react";
import { Server } from "lucide-react";
import { Globe } from "lucide-react";
import { Mail } from "lucide-react";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="bg-background space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Centralized control for onboarding, server detail, and tenant activity
          etc.
        </p>
      </div>

      {/* TABS NAV (REUSED) */}
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

      {/* TAB CONTENT */}
      <div>{children}</div>
    </div>
  );
}
