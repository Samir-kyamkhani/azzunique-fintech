"use client";

import DashboardNavbar from "@/components/DashboardNavbar.jsx";
import Sidebar from "@/components/Sidebar.jsx";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card z-40">
        <Sidebar />
      </aside>

      <div className="ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30">
          <DashboardNavbar />
        </header>

        <main className="flex-1 bg-gradient-secondry p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
