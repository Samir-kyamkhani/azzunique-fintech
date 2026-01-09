"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Users,
  Key,
  Mail,
  Phone,
  Ban,
  CheckCircle,
  Settings,
} from "lucide-react";

import { useTenantById, useUpdateTenantStatus } from "@/hooks";

import Button from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";

/* reusable view components */
import ProfileHeader from "@/components/Details/ProfileHeader";
import TabsNav from "@/components/Details/TabsNav";
import InfoCard from "@/components/Details/InfoCard";
import InfoItem from "@/components/Details/InfoItem";
import CopyableInfoItem from "@/components/Details/CopyableInfoItem";
import QuickActionsCard from "@/components/Details/QuickActionsCard";
import PageSkeleton from "@/components/Details/PageSkeleton";

export default function TenantViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  /* ================= API ================= */
  const { data, isLoading, error, refetch } = useTenantById(id);

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateTenantStatus();

  const tenant = data?.data;

  /* ================= LOADING / ERROR ================= */
  if (isLoading) return <PageSkeleton />;

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-card border rounded-xl p-8 text-center">
          <Ban className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-2">Tenant not found</h2>
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => router.push("/dashboard/tenants")}
          >
            Back to Tenants
          </Button>
        </div>
      </div>
    );
  }

  /* ================= HELPERS ================= */
  const copy = (value, label) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const handleToggleStatus = () => {
    const nextStatus =
      tenant.tenantStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    updateStatus(
      {
        id: tenant.id,
        payload: {
          tenantStatus: nextStatus,
          actionReason:
            nextStatus === "SUSPENDED"
              ? "Suspended by admin"
              : "Activated by admin",
        },
      },
      {
        onSuccess: () => {
          toast.success(`Tenant ${nextStatus.toLowerCase()} successfully`);
          refetch();
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to update tenant");
        },
      }
    );
  };

  const tabs = ["overview", "activity", "settings"];

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-background px-8 py-6 space-y-6">
      {/* BACK */}
      <Button
        variant="ghost"
        icon={ArrowLeft}
        onClick={() => router.push("/dashboard/tenants")}
      >
        Back to Tenants
      </Button>

      {/* HEADER */}
      <ProfileHeader
        icon={Building2}
        title={tenant.tenantName}
        subtitle={tenant.tenantLegalName}
        meta={[
          { icon: Key, value: tenant.tenantNumber },
          { icon: Users, value: tenant.userType },
        ]}
        onEdit={() => router.push(`/dashboard/tenants/${tenant.id}/edit`)}
      />

      {/* TABS */}
      <TabsNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ================= OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <InfoCard icon={Building2} title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Tenant Name"
                  value={tenant.tenantName}
                  icon={Users}
                />
                <InfoItem
                  label="Legal Name"
                  value={tenant.tenantLegalName}
                  icon={Users}
                />
                <InfoItem
                  label="Tenant Type"
                  value={tenant.tenantType}
                  icon={Users}
                />
                <InfoItem
                  label="User Type"
                  value={tenant.userType}
                  icon={Users}
                />
              </div>
            </InfoCard>

            <InfoCard icon={Mail} title="Contact Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  label="Email"
                  value={tenant.tenantEmail}
                  icon={Mail}
                  onClick={() => window.open(`mailto:${tenant.tenantEmail}`)}
                />
                <InfoItem
                  label="Mobile"
                  value={tenant.tenantMobileNumber}
                  icon={Phone}
                  onClick={() =>
                    window.open(`tel:${tenant.tenantMobileNumber}`)
                  }
                />
                <InfoItem
                  label="WhatsApp"
                  value={tenant.tenantWhatsapp}
                  icon={Phone}
                />
              </div>
            </InfoCard>

            <InfoCard icon={Settings} title="System Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CopyableInfoItem
                  label="Tenant ID"
                  value={tenant.id}
                  icon={Key}
                  onCopy={() => copy(tenant.id, "Tenant ID")}
                />
                <CopyableInfoItem
                  label="Tenant Number"
                  value={tenant.tenantNumber}
                  icon={Key}
                  onCopy={() => copy(tenant.tenantNumber, "Tenant Number")}
                />
                <InfoItem
                  label="Created At"
                  value={formatDateTime(tenant.createdAt)}
                  icon={Settings}
                />
                <InfoItem
                  label="Updated At"
                  value={formatDateTime(tenant.updatedAt)}
                  icon={Settings}
                />
              </div>
            </InfoCard>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <QuickActionsCard
              title="Quick Actions"
              actions={[
                {
                  label: "Send Email",
                  icon: Mail,
                  onClick: () => window.open(`mailto:${tenant.tenantEmail}`),
                },
                {
                  label:
                    tenant.tenantStatus === "ACTIVE"
                      ? "Suspend Tenant"
                      : "Activate Tenant",
                  icon: tenant.tenantStatus === "ACTIVE" ? Ban : CheckCircle,
                  onClick: handleToggleStatus,
                  loading: isUpdating,
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* ================= ACTIVITY ================= */}
      {activeTab === "activity" && (
        <div className="bg-card border rounded-xl p-6">
          <p className="text-muted-foreground">
            Activity logs will appear here.
          </p>
        </div>
      )}

      {/* ================= SETTINGS ================= */}
      {activeTab === "settings" && (
        <div className="bg-card border rounded-xl p-6">
          <p className="text-muted-foreground">
            Tenant-specific settings go here.
          </p>
        </div>
      )}
    </div>
  );
}
