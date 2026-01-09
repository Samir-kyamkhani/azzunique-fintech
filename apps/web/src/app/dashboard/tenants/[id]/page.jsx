"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Shield,
  Calendar,
} from "lucide-react";

import { useTenantById } from "@/hooks/useTenant";
import Button from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";

export default function TenantViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, error } = useTenantById(id);
  const tenant = data?.data;

  if (isLoading) return <TenantSkeleton />;

  if (error || !tenant) {
    return (
      <div className="p-6 text-destructive font-medium">Tenant not found</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold leading-tight">
              {tenant.tenantName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Tenant ID: {tenant.tenantNumber}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => router.push("/dashboard/tenants")}
        >
          Back
        </Button>
      </div>

      {/* ================= INFO GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT – MAIN DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <InfoCard
            title="Tenant Information"
            items={[
              { label: "Legal Name", value: tenant.tenantLegalName },
              { label: "Tenant Type", value: tenant.tenantType },
              { label: "User Type", value: tenant.userType },
              {
                label: "Status",
                value: tenant.tenantStatus,
              },
            ]}
          />

          <InfoCard
            title="Contact Details"
            items={[
              {
                label: "Email",
                value: tenant.tenantEmail,
                icon: Mail,
              },
              {
                label: "Mobile",
                value: tenant.tenantMobileNumber,
                icon: Phone,
              },
              {
                label: "WhatsApp",
                value: tenant.tenantWhatsapp,
                icon: Phone,
              },
            ]}
          />
        </div>

        {/* RIGHT – META */}
        <div className="space-y-6">
          <InfoCard
            title="System Metadata"
            items={[
              {
                label: "Created At",
                value: formatDateTime(tenant.createdAt),
                icon: Calendar,
              },
              {
                label: "Updated At",
                value: formatDateTime(tenant.updatedAt),
                icon: Calendar,
              },
              {
                label: "Access Level",
                value: tenant.userType,
                icon: Shield,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, items }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-border">
      <h3 className="font-semibold mb-4 text-sm">{title}</h3>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </span>

            {item.badge ? (
              <span className="px-2 py-0.5 rounded-md text-xs bg-success/10 text-success">
                {item.value}
              </span>
            ) : (
              <span className="font-medium">{item.value || "-"}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
function TenantSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between">
        <div className="h-8 w-60 bg-muted rounded" />
        <div className="h-9 w-24 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-52 bg-muted rounded-xl" />
        <div className="h-52 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
