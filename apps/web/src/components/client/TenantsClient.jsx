"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import { setTenant } from "@/store/tenantSlice";
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
} from "@/hooks/useTenant";

import TenantsTable from "@/components/tables/TenantsTable";
import TenantModal from "@/components/modals/TenantModal";
import QuickStats from "@/components/QuickStats";
import Button from "@/components/ui/Button";

import { Building2, UserX, CheckCircle, Ban, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useMe } from "@/hooks/useAuth";

/* ================= SCHEMA ALIGNED ================= */

const CREATE_FIELDS = [
  "tenantName",
  "tenantLegalName",
  "tenantType",
  "userType",
  "tenantStatus",
  "actionReason",
  "tenantEmail",
  "tenantWhatsapp",
  "tenantMobileNumber",
];

const UPDATE_FIELDS = [...CREATE_FIELDS];

const buildCreatePayload = (formData) => {
  const payload = {};
  CREATE_FIELDS.forEach((key) => {
    const value = formData[key];
    if (value !== undefined && value !== "") {
      payload[key] = value;
    }
  });
  return payload;
};

const buildUpdatePayload = (formData, initialData) => {
  const payload = {};
  UPDATE_FIELDS.forEach((key) => {
    const newValue = formData[key];
    const oldValue = initialData?.[key];
    if (newValue === undefined || newValue === "") return;
    if (newValue === oldValue) return;
    payload[key] = newValue;
  });
  return payload;
};

export default function TenantsClient() {
  const dispatch = useDispatch();
  const router = useRouter();

  /* ================= UI STATE ================= */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const isEditing = Boolean(editingTenant);
  const perPage = 10;

  /* ================= API ================= */
  const { data, isLoading, refetch } = useTenants({
    page,
    limit: perPage,
    search,
    status: statusFilter,
  });

  const { mutate: createTenant, isPending: isCreating } = useCreateTenant();
  const { mutate: updateTenant, isPending: isUpdating } = useUpdateTenant();

  /* ================= NORMALIZE ================= */
  const tenants =
    data?.data?.map((t) => ({
      ...t,
      createdAt: formatDateTime(t.createdAt),
      updatedAt: formatDateTime(t.updatedAt),
    })) || [];

  const meta = data?.meta || {};

  const { data: meRes, isLoading: meLoading } = useMe();

  if (meLoading) return null;

  useEffect(() => {
    if (meRes?.data) {
      dispatch(loginSuccess(meRes.data));
    }
  }, [meRes, dispatch]);

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

  const handleAddTenant = () => {
    setEditingTenant(null);
    setOpenModal(true);
  };

  const handleEditTenant = (tenant) => {
    if (!tenant?.id) return;
    setEditingTenant(tenant);
    setOpenModal(true);
  };

  const handleSubmitTenant = (formData, setError) => {
    const onError = (err) => {
      if (err?.type === "FIELD") {
        err.errors.forEach(({ field, message }) =>
          setError(field, { message }),
        );
        return;
      }
      setError("root", { message: err.message });
    };

    /* ================= CREATE ================= */
    if (!editingTenant) {
      const payload = buildCreatePayload(formData);

      createTenant(payload, {
        onSuccess: () => {
          setOpenModal(false);
          refetch();
        },
        onError,
      });
      return;
    }

    /* ================= UPDATE ================= */
    const payload = buildUpdatePayload(formData, editingTenant);

    if (Object.keys(payload).length === 0) {
      setError("root", { message: "No changes detected" });
      return;
    }

    updateTenant(
      { id: editingTenant.id, payload },
      {
        onSuccess: () => {
          setOpenModal(false);
          setEditingTenant(null);
          refetch();
        },
        onError,
      },
    );
  };

  const handleViewTenant = (tenant) => {
    dispatch(setTenant(tenant));
    router.push(`/dashboard/tenants/${tenant.id}`);
  };

  /* ================= RENDER ================= */
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tenant Management</h1>
          <p className="text-muted-foreground">
            Centralized control for onboarding, plans, and tenant activity
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
        onAddTenant={handleAddTenant}
        onViewTenant={handleViewTenant}
        onEditTenant={handleEditTenant}
        loading={isLoading}
      />

      {openModal && (
        <TenantModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingTenant(null);
          }}
          onSubmit={handleSubmitTenant}
          isEditing={isEditing}
          isPending={isEditing ? isUpdating : isCreating}
          initialData={editingTenant}
        />
      )}
    </>
  );
}
