"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { setTenant } from "@/store/tenantSlice";
import { useTenants, useCreateTenant } from "@/hooks/useTenant";

import TenantsTable from "@/components/tables/TenantsTable";
import TenantModal from "@/components/modals/TenantModal";
import QuickStats from "@/components/QuickStats";
import Button from "@/components/ui/Button";

import { Building2, UserX, CheckCircle, Ban, RefreshCw } from "lucide-react";

import { formatDateTime } from "@/lib/utils";

export default function TenantsClient() {
  const dispatch = useDispatch();
  const router = useRouter();

  /* ================= LOCAL UI STATE ================= */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);

  const perPage = 10;

  /* ================= API ================= */
  const { data, isLoading, refetch } = useTenants({
    page,
    limit: perPage,
    search,
    status: statusFilter,
  });

  const { mutate: createTenant, isPending } = useCreateTenant();

  /* ================= NORMALIZE DATA ================= */
  const tenants =
    data?.data?.map((t) => ({
      id: t.id,
      tenantNumber: t.tenantNumber,
      tenantName: t.tenantName,
      tenantLegalName: t.tenantLegalName,
      tenantType: t.tenantType,
      userType: t.userType,
      tenantEmail: t.tenantEmail,
      tenantStatus: t.tenantStatus,
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

  /* ================= ACTIONS ================= */
  const handleCreateTenant = (formData, setError) => {
    createTenant(formData, {
      onSuccess: (res) => {
        dispatch(setTenant(res.data));
        setOpenCreate(false);
        refetch();
      },
      onError: (err) => {
        if (err.type === "FIELD") {
          err.errors.forEach(({ field, message }) => {
            setError(field, { message });
          });
          return;
        }

        setError("root", { message: err.message });
      },
    });
  };

  const handleViewTenant = (tenant) => {
    dispatch(setTenant(tenant));
    router.push(`/dashboard/tenants/${tenant.id}`);
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* HEADER */}
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

      {/* STATS */}
      <QuickStats stats={stats} />

      {/* TABLE */}
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
          setPage(1);
        }}
        onAddTenant={() => setOpenCreate(true)}
        onViewTenant={handleViewTenant}
        loading={isLoading}
      />

      {/* CREATE MODAL */}
      <TenantModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateTenant}
        isPending={isPending}
        initialData={null}
        currentUser={''}
      />
    </>
  );
}
