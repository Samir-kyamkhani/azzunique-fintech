"use client";

import { useMemo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import FundRequestModal from "@/components/modals/FundRequestModal";

const MIN_BALANCE = 100;

export default function DashboardLayout({ children }) {
  const userData = useSelector((s) => s.auth.user);
  const router = useRouter();
  const pathname = usePathname();

  const [isFundOpen, setIsFundOpen] = useState(true);

  const complianceState = useMemo(() => {
    if (!userData) return "LOADING";

    const isKycVerified = userData?.user?.isKycVerified;
    const walletBalance = userData?.wallet?.balance ?? 0;

    if (isKycVerified) return "OK";
    if (walletBalance < MIN_BALANCE) return "FUND";
    return "KYC";
  }, [userData]);

  // ✅ CLIENT SIDE REDIRECT
  useEffect(() => {
    if (complianceState === "KYC" && pathname !== "/dashboard/kyc") {
      router.replace("/dashboard/kyc");
    }
  }, [complianceState, pathname, router]);

  if (complianceState === "LOADING") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (complianceState === "FUND") {
    return (
      <FundRequestModal
        open={isFundOpen}
        onClose={() => setIsFundOpen(false)}
      />
    );
  }

  // ✅ Allow KYC page normally
  if (pathname === "/dashboard/kyc") {
    return children;
  }

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
