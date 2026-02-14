"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

import { ArrowLeft, Layers, Key, Activity, Settings } from "lucide-react";

import Button from "@/components/ui/Button";
import InfoCard from "@/components/details/InfoCard";
import CopyableInfoItem from "@/components/details/CopyableInfoItem";
import QuickActionsCard from "@/components/details/QuickActionsCard";
import PageSkeleton from "@/components/details/PageSkeleton";

import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";

import { useServiceProviders } from "@/hooks/useServiceProvider";
import { useDisablePlatformServiceProvider } from "@/hooks/usePlatformService";

export default function PlatformProviderByServicePage() {
  const router = useRouter();
  const { id } = useParams(); // serviceId

  const { data = [], isLoading } = useServiceProviders(id);

  const { mutate: disableProvider, isPending } =
    useDisablePlatformServiceProvider();

  useEffect(() => {
    if (!isLoading && data.length === 0) {
      router.replace("/dashboard/platform/services");
    }
  }, [isLoading, data, router]);

  if (isLoading) return <PageSkeleton />;

  const copy = (value, label) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl border flex items-center justify-center bg-primary/10">
            <Layers className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">Service Providers</h1>
            <p className="text-sm text-muted-foreground">
              Total: {data.length}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => router.push("/dashboard/platform/services")}
        >
          Back to Services
        </Button>
      </div>

      {/* PROVIDERS LIST */}
      <div className="space-y-6">
        {data.map((provider) => (
          <div
            key={provider.id}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              <InfoCard icon={Layers} title={provider.providerName}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CopyableInfoItem
                    label="Provider ID"
                    value={provider.id}
                    icon={Key}
                    onCopy={() => copy(provider.id, "Provider ID")}
                  />

                  <CopyableInfoItem
                    label="Service ID"
                    value={provider.platformServiceId}
                    icon={Key}
                    onCopy={() =>
                      copy(provider.platformServiceId, "Service ID")
                    }
                  />

                  <div>
                    <div className="text-xs text-muted-foreground">Code</div>
                    <div>{provider.code}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Handler</div>
                    <div className="break-all">{provider.handler}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {provider.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">
                      Created At
                    </div>
                    <div>{formatDateTime(provider.createdAt)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">
                      Updated At
                    </div>
                    <div>{formatDateTime(provider.updatedAt)}</div>
                  </div>
                </div>
              </InfoCard>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              <QuickActionsCard
                title="Quick Actions"
                actions={[
                  {
                    label: provider.isActive
                      ? "Disable Provider"
                      : "Enable Provider",
                    icon: Settings,
                    loading: isPending,
                    onClick: () =>
                      disableProvider(
                        {
                          serviceId: id,
                          providerId: provider.id,
                        },
                        {
                          onSuccess: () => toast.success("Provider Updated"),
                        },
                      ),
                  },
                  {
                    label: "Copy Provider ID",
                    icon: Key,
                    onClick: () => copy(provider.id, "Provider ID"),
                  },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
