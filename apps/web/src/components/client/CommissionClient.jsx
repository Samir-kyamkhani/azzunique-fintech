"use client";

import { useState } from "react";
import { RefreshCw, Percent, Users, ShieldCheck } from "lucide-react";

import { useCommissionList } from "@/hooks/useCommission";
import CommissionTable from "@/components/tables/CommissionTable";
import QuickStats from "@/components/QuickStats";
import Button from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";

/* ================= CLIENT ================= */

export default function CommissionClient() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);
  const perPage = 10;

  const { data, isLoading, refetch } = useCommissionList({
    type: typeFilter,
    page,
    limit: perPage,
    search: debouncedSearch,
  });

  /* ================= NORMALIZE ================= */

  const commissions = data?.data || [];
  const meta = data?.meta || {};

  /* ================= STATS ================= */

  const stats = [
    {
      title: "Total Rules",
      value: meta.total ?? 0,
      icon: Percent,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "User Rules",
      value: commissions.filter((c) => c.type === "USER").length,
      icon: Users,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Role Rules",
      value: commissions.filter((c) => c.type === "ROLE").length,
      icon: ShieldCheck,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  /* ================= RENDER ================= */

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Commission Management</h1>
          <p className="text-muted-foreground">
            Control commission rules across users and roles
          </p>
        </div>

        <Button
          onClick={refetch}
          loading={isLoading}
          variant="outline"
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <QuickStats stats={stats} />

      <CommissionTable
        commissions={commissions}
        total={meta.total ?? 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearch={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={(v) => {
          setTypeFilter(v);
          setPage(1);
        }}
        loading={isLoading}
      />
    </>
  );
}
