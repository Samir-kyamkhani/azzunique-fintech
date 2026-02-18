"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Layers, Settings, Key, Activity } from "lucide-react";

import Button from "@/components/ui/Button";
import InfoCard from "@/components/details/InfoCard";
import InfoItem from "@/components/details/InfoItem";
import CopyableInfoItem from "@/components/details/CopyableInfoItem";
import QuickActionsCard from "@/components/details/QuickActionsCard";
import PageSkeleton from "@/components/details/PageSkeleton";

import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";

import { useSelector } from "react-redux";
import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";

import {
  useDeleteFeature,
  useCreateFeature,
  useService,
  useServiceFeatures,
  useUpdateFeature,
  useUpdateService,
  useServiceProviders,
  useAssignProviderToService,
  useUnassignProviderFromService,
  useUpdateProviderConfig,
  useProviders,
  useMapProviderFeature,
  useUnmapProviderFeature,
} from "@/hooks/useAdminServices";

import PlatformServiceFeatureModal from "@/components/modals/PlatformServiceFeatureModal";
import PlatformServiceModal from "@/components/modals/PlatformServiceModal";
import AssignPlatformServiceProviderModal from "@/components/modals/AssignPlatformServiceProviderModal";
import MapServiceProviderFeatureModal from "@/components/modals/MapServiceProviderFeatureModal";

export default function PlatformServiceDetailsClient({ id }) {
  const router = useRouter();

  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  // Service
  const { data: serviceRes, isLoading: serviceLoading } = useService(id);

  // Features
  const { data: features = [], isLoading: featuresLoading } =
    useServiceFeatures(id);

  const { mutate: createFeature, isPending: creatingFeature } =
    useCreateFeature();

  const { mutate: updateFeature, isPending: updatingFeature } =
    useUpdateFeature();

  const { mutate: updateService, isPending: updatingService } =
    useUpdateService();

  const { mutate: deleteFeature } = useDeleteFeature();

  // Providers
  const { data: providers = [], isLoading: providersLoading } =
    useServiceProviders(id);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  const { data: allProviders = [] } = useProviders();

  const { mutate: assignProvider, isPending: assigningProvider } =
    useAssignProviderToService();

  const { mutate: unassignProvider } = useUnassignProviderFromService();

  const { mutate: updateProviderConfig, isPending: updatingProviderConfig } =
    useUpdateProviderConfig();

  //  PROVIDER FEATURE

  const { mutate: mapFeature, isPending: mappingFeature } =
    useMapProviderFeature();

  const { mutate: unmapFeature } = useUnmapProviderFeature();

  const service = serviceRes?.data || serviceRes;

  const perms = useSelector((s) => s.auth.user?.permissions);

  const can = (perm) => permissionChecker(perms, perm?.resource, perm?.action);

  const canUpdateService = can(PERMISSIONS.PLATFORM.SERVICES.UPDATE);
  const canUpdateFeature = can(PERMISSIONS.PLATFORM.SERVICE_FEATURES.UPDATE);
  const canDeleteFeature = can(PERMISSIONS.PLATFORM.SERVICE_FEATURES.DELETE);
  const canCreateFeature = can(PERMISSIONS.PLATFORM.SERVICE_FEATURES.CREATE);
  const canManageProviders = can(PERMISSIONS.PLATFORM.SERVICE_PROVIDERS.CREATE);

  useEffect(() => {
    if (!serviceLoading && !service) {
      router.replace("/dashboard/platform/services");
    }
  }, [serviceLoading, service, router]);

  if (serviceLoading || !service) return <PageSkeleton />;

  const copy = (value, label) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const handleFeatureSubmit = (payload, setError) => {
    if (editingFeature?.id) {
      return updateFeature(
        {
          serviceId: id,
          featureId: editingFeature.id,
          payload,
        },
        {
          onSuccess: () => {
            toast.success("Feature Updated");
            setFeatureModalOpen(false);
            setEditingFeature(null);
          },
          onError: (err) => setError("root", { message: err.message }),
        },
      );
    }

    return createFeature(
      {
        serviceId: id,
        payload,
      },
      {
        onSuccess: () => {
          toast.success("Feature Created");
          setFeatureModalOpen(false);
        },
        onError: (err) => setError("root", { message: err.message }),
      },
    );
  };

  const handleDeleteFeature = (feature) => {
    deleteFeature(
      {
        serviceId: id,
        featureId: feature.id,
      },
      {
        onSuccess: () => toast.success("Feature Deleted"),
      },
    );
  };

  const handleServiceSubmit = (payload, setError) => {
    if (!editingService?.id) return;

    updateService(
      { id: editingService.id, payload },
      {
        onSuccess: () => {
          toast.success("Service Updated");
          setServiceModalOpen(false);
          setEditingService(null);
        },
        onError: (err) => setError("root", { message: err.message }),
      },
    );
  };

  const handleProviderSubmit = (payload, setError) => {
    if (editingProvider?.id) {
      return updateProviderConfig(
        {
          serviceId: id,
          providerId: editingProvider.id,
          config: payload.config || {},
        },
        {
          onSuccess: () => {
            toast.success("Provider Config Updated");
            setProviderModalOpen(false);
            setEditingProvider(null);
          },
          onError: (err) => setError("root", { message: err.message }),
        },
      );
    }

    return assignProvider(
      {
        serviceId: id,
        providerId: payload.providerId,
        config: payload.config || {},
      },
      {
        onSuccess: () => {
          toast.success("Provider Assigned");
          setProviderModalOpen(false);
        },
        onError: (err) => setError("root", { message: err.message }),
      },
    );
  };

  const handleUnassignProvider = (provider) => {
    unassignProvider(
      {
        serviceId: id,
        providerId: provider.id,
      },
      {
        onSuccess: () => toast.success("Provider Unassigned"),
      },
    );
  };

  const handleMapFeature = (payload, setError) => {
    mapFeature(
      {
        serviceId: id,
        providerId: payload.serviceProviderId,
        payload: {
          platformServiceFeatureId: payload.platformServiceFeatureId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Feature Mapped");
        },
        onError: (err) => {
          if (typeof setError === "function") {
            setError("root", { message: err.message });
          } else {
            toast.error(err.message);
          }
        },
      },
    );
  };

  const handleUnmapFeature = (featureId) => {
    if (!selectedProviderId) return;

    unmapFeature(
      {
        serviceId: id,
        providerId: selectedProviderId,
        featureId,
      },
      {
        onSuccess: () => toast.success("Feature Unmapped"),
      },
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-xl border flex items-center justify-center bg-primary/10">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{service.name}</h1>
            <p className="text-sm text-muted-foreground">{service.code}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InfoCard icon={Layers} title="Service Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Service Name" value={service.name} />
              <InfoItem label="Service Code" value={service.code} />
              <InfoItem
                label="Status"
                value={service.isActive ? "Active" : "Inactive"}
                icon={Activity}
              />
            </div>
          </InfoCard>

          <InfoCard icon={Settings} title="Service Features">
            {canCreateFeature && (
              <div className="mb-4 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingFeature(null);
                    setFeatureModalOpen(true);
                  }}
                >
                  Add Feature
                </Button>
              </div>
            )}

            {featuresLoading ? (
              <div>Loading...</div>
            ) : features.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No features available
              </div>
            ) : (
              <div className="space-y-3">
                {features.map((f) => (
                  <div
                    key={f.id}
                    className="flex justify-between items-center border rounded-lg px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs">{f.code}</div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <span className="text-sm">
                        {f.isActive ? "Active" : "Inactive"}
                      </span>

                      {canUpdateFeature && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingFeature(f);
                            setFeatureModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}

                      {canDeleteFeature && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteFeature(f)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>

          <InfoCard icon={Settings} title="Service Providers">
            {canManageProviders && (
              <div className="mb-4 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingProvider(null);
                    setProviderModalOpen(true);
                  }}
                >
                  Assign Provider
                </Button>
              </div>
            )}

            {providersLoading ? (
              <div>Loading...</div>
            ) : providers.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No providers assigned
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border rounded-lg px-4 py-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{p.providerName}</div>

                      <div className="text-xs text-muted-foreground">
                        Code: {p.code}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Handler: {p.handler}
                      </div>

                      {p.config && (
                        <div className="text-xs text-muted-foreground mt-1 break-all whitespace-pre-wrap">
                          Config: {JSON.stringify(p.config, null, 2)}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedProviderId(p.id);
                          setMapModalOpen(true);
                        }}
                      >
                        Manage Features
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingProvider(p);
                          setProviderModalOpen(true);
                        }}
                      >
                        Edit Config
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnassignProvider(p)}
                      >
                        Unassign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>

          {/* SYSTEM INFO */}
          <InfoCard icon={Key} title="System Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CopyableInfoItem
                label="Service ID"
                value={service.id}
                icon={Key}
                onCopy={() => copy(service.id, "Service ID")}
              />

              <InfoItem
                label="Created At"
                value={formatDateTime(service.createdAt)}
              />

              <InfoItem
                label="Updated At"
                value={formatDateTime(service.updatedAt)}
              />
            </div>
          </InfoCard>
        </div>

        <div className="space-y-6">
          <QuickActionsCard
            title="Quick Actions"
            actions={[
              ...(canUpdateService
                ? [
                    {
                      label: "Edit Service",
                      icon: Settings,
                      onClick: () => {
                        setEditingService(service);
                        setServiceModalOpen(true);
                      },
                    },
                  ]
                : []),
              {
                label: "Copy Service ID",
                icon: Key,
                onClick: () => copy(service.id, "Service ID"),
              },
            ]}
          />
        </div>
      </div>

      <PlatformServiceFeatureModal
        open={featureModalOpen}
        onClose={() => {
          setFeatureModalOpen(false);
          setEditingFeature(null);
        }}
        initialData={editingFeature}
        serviceId={id}
        onSubmit={handleFeatureSubmit}
        isPending={updatingFeature || creatingFeature}
      />

      <PlatformServiceModal
        open={serviceModalOpen}
        onClose={() => {
          setServiceModalOpen(false);
          setEditingService(null);
        }}
        initialData={editingService}
        onSubmitService={handleServiceSubmit}
        isPending={updatingService}
      />

      <AssignPlatformServiceProviderModal
        open={providerModalOpen}
        onClose={() => {
          setProviderModalOpen(false);
          setEditingProvider(null);
        }}
        initialData={editingProvider}
        allProviders={allProviders}
        onSubmit={handleProviderSubmit}
        isPending={assigningProvider || updatingProviderConfig}
      />

      {mapModalOpen && selectedProvider && (
        <MapServiceProviderFeatureModal
          open={mapModalOpen}
          onClose={() => {
            setMapModalOpen(false);
            setSelectedProviderId(null);
          }}
          providerId={selectedProviderId}
          features={features} // service features
          mappedFeatures={selectedProvider.features || []}
          onSubmit={handleMapFeature}
          onUnmap={handleUnmapFeature}
          isPending={mappingFeature}
        />
      )}
    </>
  );
}
