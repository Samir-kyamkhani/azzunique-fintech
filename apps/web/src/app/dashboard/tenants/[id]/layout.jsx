"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Users, Key } from "lucide-react";

import { useTenantById } from "@/hooks/useTenant";
import Button from "@/components/ui/Button";
import ProfileHeader from "@/components/Details/ProfileHeader";
import TabsNav from "@/components/Details/TabsNav";
import PageSkeleton from "@/components/Details/PageSkeleton";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { clearTenant, setTenant } from "@/store/tenantSlice";

export default function TenantLayout({ children }) {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { data, isLoading } = useTenantById(id);
  const tenant = data?.data;

  useEffect(() => {
    dispatch(setTenant(tenant));

    return () => {
      dispatch(clearTenant());
    };
  }, [tenant, dispatch]);

  if (!id || isLoading || !tenant) {
    return <PageSkeleton />;
  }

  if (!id || isLoading || !tenant) {
    return <PageSkeleton />;
  }

  return (
    <div className="bg-background space-y-6">
      <Button
        variant="ghost"
        icon={ArrowLeft}
        onClick={() => router.push("/dashboard/tenants")}
      >
        Back to Tenants
      </Button>

      <ProfileHeader
        icon={Building2}
        title={tenant.tenantName}
        subtitle={tenant.tenantLegalName}
        meta={[
          { icon: Key, value: tenant.tenantNumber },
          { icon: Users, value: tenant.userType },
        ]}
      />

      <TabsNav
        tabs={["overview", "domain", "activity", "settings"]}
        basePath={`/dashboard/tenants/${id}`}
      />

      {children}
    </div>
  );
}
