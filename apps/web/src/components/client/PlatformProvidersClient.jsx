"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RefreshCw, Server } from "lucide-react";

import Button from "@/components/ui/Button";
import QuickStats from "@/components/QuickStats";
import PlatformProvidersTable from "@/components/tables/PlatformProvidersTable";

import {
  useProviders,
  useCreateProvider,
  useUpdateProvider,
  useDeleteProvider,
  useMapProviderFeature,
  useUnmapProviderFeature,
} from "@/hooks/useAdminServices";

import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { toast } from "@/lib/toast";

import PlatformServiceProviderModal from "@/components/modals/PlatformServiceProviderModal";

export default function PlatformProvidersClient() {
  const [openModal, setOpenModal] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // ✅ Correct Hooks
  const { data: data = [], isLoading } = useProviders();

  const { mutate: createProvider, isPending: creating } = useCreateProvider();

  const { mutate: updateProvider, isPending: updating } = useUpdateProvider();

  const { mutate: deleteProvider } = useDeleteProvider();

  const { mutate: mapFeature } = useMapProviderFeature();
  const { mutate: unmapFeature } = useUnmapProviderFeature();

  const perms = useSelector((s) => s.auth.user?.permissions);
  const can = (perm) => permissionChecker(perms, perm.resource, perm.action);

  const canCreate = can(PERMISSIONS.PLATFORM.SERVICE_PROVIDERS.CREATE);
  const canEdit = can(PERMISSIONS.PLATFORM.SERVICE_PROVIDERS.UPDATE);
  const canDelete = can(PERMISSIONS.PLATFORM.SERVICE_PROVIDERS.DELETE);

  const handleSubmit = (payload, setError) => {
    const action = editingData ? updateProvider : createProvider;

    action(editingData ? { providerId: editingData.id, payload } : payload, {
      onSuccess: () => {
        toast.success(editingData ? "Provider Updated" : "Provider Created");
        setOpenModal(false);
        setEditingData(null);
      },
      onError: (err) => setError("root", { message: err.message }),
    });
  };

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
      />

      <PlatformServiceProviderModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingData(null);
        }}
        initialData={editingData}
        onSubmit={handleSubmit}
        isPending={creating || updating}
      />
    </>
  );
}
