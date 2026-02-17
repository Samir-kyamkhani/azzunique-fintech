"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import QuickStats from "@/components/QuickStats";
import PlatformServicesTable from "@/components/tables/PlatformServicesTable";
import PlatformServiceModal from "@/components/modals/PlatformServiceModal";

import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from "@/hooks/useAdminServices";

import { setPlatformServices } from "@/store/platformServiceSlice";
import { toast } from "@/lib/toast";
import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function PlatformServicesClient() {
  const dispatch = useDispatch();
  const router = useRouter();
  const perms = useSelector((s) => s.auth.user?.permissions);

  const [openModal, setOpenModal] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const { data: services = [], isLoading, error, refetch } = useServices();

  const { mutate: createService, isPending: creating } = useCreateService();
  const { mutate: updateService, isPending: updating } = useUpdateService();
  const { mutate: deleteService } = useDeleteService();

  useEffect(() => {
    dispatch(setPlatformServices(services));
  }, [services, dispatch]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const can = (perm) => permissionChecker(perms, perm?.resource, perm?.action);

  const canCreate = can(PERMISSIONS.PLATFORM.SERVICES.CREATE);
  const canEdit = can(PERMISSIONS.PLATFORM.SERVICES.UPDATE);
  const canDelete = can(PERMISSIONS.PLATFORM.SERVICES.DELETE);

  const handleSubmit = (payload, setError) => {
    const action = editingData ? updateService : createService;

    action(editingData ? { id: editingData.id, payload } : payload, {
      onSuccess: () => {
        toast.success(editingData ? "Service Updated" : "Service Created");
        setOpenModal(false);
        setEditingData(null);
      },
      onError: (err) => setError("root", { message: err.message }),
    });
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button
          icon={RefreshCw}
          variant="outline"
          loading={isLoading}
          onClick={refetch}
        >
          Refresh
        </Button>
      </div>

      <QuickStats
        stats={[
          {
            title: "Total Services",
            value: services.length,
            icon: Layers,
          },
        ]}
      />

      <PlatformServicesTable
        data={services}
        loading={isLoading}
        onAdd={
          canCreate
            ? () => {
                setEditingData(null);
                setOpenModal(true);
              }
            : undefined
        }
        onView={(row) => router.push(`/dashboard/platform/services/${row.id}`)}
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
                deleteService(row.id, {
                  onSuccess: () => toast.success("Service Deleted"),
                })
            : undefined
        }
      />

      <PlatformServiceModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingData(null);
        }}
        initialData={editingData}
        onSubmitService={handleSubmit}
        isPending={creating || updating}
      />
    </>
  );
}
