"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Server } from "lucide-react";

import Button from "@/components/ui/Button";
import QuickStats from "@/components/QuickStats";
import PlatformProvidersTable from "@/components/tables/PlatformProvidersTable";
import UnifiedServiceProviderModal from "@/components/modals/UnifiedServiceProviderModal";

import {
  useCreateServiceProvider,
  useUpdateServiceProvider,
  useDeleteServiceProvider,
  useAllServiceProviders,
  useMapServiceProviderFeature,
  useUnmapServiceProviderFeature,
  useServiceProviderFeatures,
} from "@/hooks/useServiceProvider";

import { setServiceProviders } from "@/store/serviceProviderSlice";
import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { toast } from "@/lib/toast";
import {
  usePlatformServiceFeatures,
  usePlatformServices,
} from "@/hooks/usePlatformService";
import { Link } from "lucide-react";
import MapServiceProviderFeatureModal from "../modals/MapServiceProviderFeatureModal";

export default function PlatformProvidersClient() {
  const dispatch = useDispatch();

  const [openModal, setOpenModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const { data = [], isLoading, error } = useAllServiceProviders(); // 🔥 global list version

  const { mutate: createProvider, isPending: creating } =
    useCreateServiceProvider();

  const { mutate: updateProvider, isPending: updating } =
    useUpdateServiceProvider();

  const { mutate: deleteProvider } = useDeleteServiceProvider();

  const { data: services = [] } = usePlatformServices();

  const { mutate: mapFeature } = useMapServiceProviderFeature();
  const { mutate: unmapFeature } = useUnmapServiceProviderFeature();

  const { data: mappedFeatures = [] } =
    useServiceProviderFeatures(selectedProviderId);

  useEffect(() => {
    dispatch(setServiceProviders(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const perms = useSelector((s) => s.auth.user?.permissions);
  const can = (perm) => permissionChecker(perms, perm.resource, perm.action);

  const canCreate = can(PERMISSIONS.PLATFORM.PROVIDERS.CREATE);
  const canEdit = can(PERMISSIONS.PLATFORM.PROVIDERS.UPDATE);
  const canDelete = can(PERMISSIONS.PLATFORM.PROVIDERS.DELETE);

  const handleSubmit = (payload, setError) => {
    const action = editingData ? updateProvider : createProvider;

    action(editingData ? { id: editingData.id, payload } : payload, {
      onSuccess: () => {
        toast.success(editingData ? "Provider Updated" : "Provider Created");
        setOpenModal(false);
        setEditingData(null);
      },
      onError: (err) => setError("root", { message: err.message }),
    });
  };

  const handleMapFeature = (payload, setError) => {
    mapFeature(
      {
        providerId: payload.serviceProviderId,
        payload: {
          platformServiceFeatureId: payload.platformServiceFeatureId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Feature Mapped");
          setMapModalOpen(false);
          setSelectedProviderId(null);
        },
        onError: (err) => setError("root", { message: err.message }),
      },
    );
  };

  const selectedProvider = data.find((p) => p.id === selectedProviderId);
  const selectedServiceId = selectedProvider?.platformServiceId;
  const { data: features = [] } = usePlatformServiceFeatures(
    mapModalOpen ? selectedServiceId : null,
  );

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button icon={RefreshCw} variant="outline" loading={isLoading}>
          Refresh
        </Button>
      </div>

      <QuickStats
        stats={[
          {
            title: "Total Providers",
            value: data.length,
            icon: Server,
            iconColor: "text-primary",
            bgColor: "bg-primary/10",
          },
        ]}
      />

      <PlatformProvidersTable
        data={data}
        onAdd={
          canCreate
            ? () => {
                setEditingData(null);
                setOpenModal(true);
              }
            : undefined
        }
        onEdit={
          canEdit
            ? (row) => {
                setEditingData(row);
                setOpenModal(true);
              }
            : undefined
        }
        onDelete={
          canDelete
            ? (row) =>
                deleteProvider(row.id, {
                  onSuccess: () => toast.success("Provider Deleted"),
                })
            : undefined
        }
        extraActions={[
          {
            label: "Map Feature",
            icon: Link,
            onClick: (row) => {
              setSelectedProviderId(row.id);
              setMapModalOpen(true);
            },
          },
        ]}
      />

      <UnifiedServiceProviderModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingData(null);
        }}
        initialData={editingData}
        services={services} // 🔥 pass services for select options
        onSubmit={handleSubmit}
        isPending={creating || updating}
      />

      <MapServiceProviderFeatureModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        providerId={selectedProviderId}
        features={features}
        mappedFeatures={mappedFeatures}
        onSubmit={handleMapFeature}
        onUnmap={(id) => {
          unmapFeature(
            { providerId: selectedProviderId, id },
            {
              onSuccess: () => toast.success("Feature Unmapped"),
              onError: (err) => toast.error(err.message),
            },
          );
        }}
        isPending={false}
      />
    </>
  );
}
