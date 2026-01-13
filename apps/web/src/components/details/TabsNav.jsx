"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function TabsNav({ tabs, basePath }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="border-b border-border">
      <nav className="flex gap-6">
        {tabs.map((tab) => {
          const href = `${basePath}/${tab.value}`;
          const active = pathname === href;
          const Icon = tab.icon;

          return (
            <button
              key={tab.value}
              onClick={() => router.push(href)}
              className={cn(
                "pb-2 text-sm font-medium border-b-2 flex items-center gap-2 transition cursor-pointer",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Icon optional */}
              {Icon && <Icon size={16} />}

              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
