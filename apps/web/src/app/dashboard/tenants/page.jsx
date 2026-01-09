"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { setTenant } from "@/store/tenantSlice";
import { useTenants, useCreateTenant } from "@/hooks/useTenant";

import TenantsTable from "@/components/tables/TenantsTable";
import TenantModal from "@/components/modals/TenantModal";
import QuickStats from "@/components/QuickStats";

import { Building2, UserX, CheckCircle, Ban } from "lucide-react";

import { formatDateTime } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TenantsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  /* ================= UI STATE ================= */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const perPage = 10;

  /* ================= API (SERVER SIDE) ================= */
  const { data, isLoading, refetch } = useTenants({
    page,
    limit: perPage,
    search,
    status: statusFilter,
  });

  const { mutate: createTenant, isPending } = useCreateTenant();

  const tenants =
    data?.data?.map((t) => ({
      ...t,
      createdAt: formatDateTime(t.createdAt),
      updatedAt: formatDateTime(t.updatedAt),
    })) || [];

  const meta = data?.meta || {};

  /* ================= STATS ================= */
  const stats = [
    {
      title: "Total Tenants",
      value: meta.total ?? 0,
      icon: Building2,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Tenants",
      value: tenants.filter((t) => t.tenantStatus === "ACTIVE").length,
      icon: CheckCircle,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Suspended Tenants",
      value: tenants.filter((t) => t.tenantStatus === "SUSPENDED").length,
      icon: Ban,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Inactive Tenants",
      value: tenants.filter((t) => t.tenantStatus === "INACTIVE").length,
      icon: UserX,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  /* ================= CREATE ================= */
  const handleCreateTenant = (formData) => {
    createTenant(formData, {
      onSuccess: (res) => {
        dispatch(setTenant(res.data));
        setOpenCreate(false);
        refetch();
      },
      onError: (err) => {
        // ✅ apiClient se attached errors
        if (Array.isArray(err.errors) && err.errors.length > 0) {
          setFormErrors(err.errors); // 🔥 pass to form
        } else {
          setFormError(err.message || "Failed to create tenant");
        }
      },
    });
  };

  const handleViewTenant = (tenant) => {
    router.push(`/dashboard/tenants/${tenant.id}`);
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tenant Management
          </h1>
          <p className="text-muted-foreground">
            Centralized control for onboarding, plans, and tenant activity
          </p>
        </div>
        <Button
          onClick={refetch}
          disabled={isLoading}
          variant="outline"
          icon={RefreshCw}
          loading={isLoading}
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* ================= STATS ================= */}
      <QuickStats stats={stats} />

      {/* ================= TABLE ================= */}
      <TenantsTable
        tenants={tenants}
        total={meta.total ?? 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1); // 🔥 reset page
        }}
        onAddTenant={() => setOpenCreate(true)}
        loading={isLoading}
        onViewTenant={handleViewTenant}
      />

      {/* ================= MODAL ================= */}
      <TenantModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateTenant}
        isPending={isPending}
        error={formError}
        formErrors={formErrors}
        initialData={null}
      />
    </>
  );
}
