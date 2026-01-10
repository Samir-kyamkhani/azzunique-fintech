"use client";

import { usePathname, useRouter } from "next/navigation";

export default function TabsNav({ tabs, basePath }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="border-b border-border">
      <nav className="flex gap-6">
        {tabs.map((tab) => {
          const href = `${basePath}/${tab}`;
          const active = pathname === href;

          return (
            <button
              key={tab}
              onClick={() => router.push(href)}
              className={`pb-2 text-sm font-medium border-b-2 cursor-pointer ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
