"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import FundRequestModal from "@/components/modals/FundRequestModal";

const MIN_BALANCE = 100;

export default function DashboardLayout({ children }) {
  const userData = useSelector((s) => s.auth.user);
  const [isFundOpen, setIsFundOpen] = useState(true);

  const complianceState = useMemo(() => {
    if (!userData) return "LOADING";

    const isKycVerified = userData?.user?.isKycVerified;
    const walletBalance = userData?.wallet?.balance ?? 0;

    if (isKycVerified) return "OK";
    if (walletBalance < MIN_BALANCE) return "FUND";
    return "KYC";
  }, [userData]);

  if (complianceState === "LOADING") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // 🔥 FULL LOCK MODE (Best UX)
  if (complianceState === "FUND") {
    return (
      <FundRequestModal
        open={isFundOpen}
        onClose={() => setIsFundOpen(false)}
      />
    );
  }

  if (complianceState === "KYC") {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        <div className="bg-white p-8 rounded-xl w-[400px] shadow-lg border">
          <h2 className="text-lg font-semibold mb-3">Complete Your KYC</h2>
          <p className="text-sm text-gray-600">
            Wallet balance sufficient hai. Ab KYC complete karein.
          </p>
        </div>
      </div>
    );
  }

  // ✅ NORMAL DASHBOARD
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
