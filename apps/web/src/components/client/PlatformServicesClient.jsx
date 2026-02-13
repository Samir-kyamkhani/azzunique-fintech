"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { RefreshCw, Layers } from "lucide-react";

import Button from "@/components/ui/Button";
import QuickStats from "@/components/QuickStats";
import PlatformServicesTable from "@/components/tables/PlatformServicesTable";
import UnifiedPlatformServiceModal from "@/components/modals/UnifiedPlatformServiceModal";

import {
  usePlatformServices,
  useCreatePlatformService,
  useUpdatePlatformService,
  useDeletePlatformService,
  useCreatePlatformServiceFeature,
  useAssignPlatformServiceProvider,
  useDisablePlatformServiceProvider,
} from "@/hooks/usePlatformService";

import { setPlatformServices } from "@/store/platformServiceSlice";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import AssignPlatformServiceProviderModal from "../modals/AssignPlatformServiceProviderModal";
import { useServiceProviders } from "@/hooks/useServiceProvider";
import { Ban } from "lucide-react";
import { Link } from "lucide-react";
import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { useSelector } from "react-redux";

export default function PlatformServicesClient() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [openModal, setOpenModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [forcedType, setForcedType] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  /* ================= SERVICES ================= */

  const { data = [], isLoading, error } = usePlatformServices();

  const { mutate: createService, isPending: creating } =
    useCreatePlatformService();

  const { mutate: updateService, isPending: updating } =
    useUpdatePlatformService();

  const { mutate: deleteService } = useDeletePlatformService();

  useEffect(() => {
    dispatch(setPlatformServices(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  /* ================= FEATURES ================= */

  const { mutate: createFeature, isPending: creatingFeature } =
    useCreatePlatformServiceFeature();

  /* ================= PLATFORM SERVICE PROVIDERS ================= */

  const { mutate: assignProvider, isPending: assigningProvider } =
    useAssignPlatformServiceProvider();

  const { mutate: disableProvider, isPending: disablingProvider } =
    useDisablePlatformServiceProvider();

  /* ================= PROVIDERS LIST ================= */

  const { data: providers = [], isLoading: providersLoading } =
    useServiceProviders(selectedServiceId);

  /* ================= PERMISSIONS ================= */

  const perms = useSelector((s) => s.auth.user?.permissions);

  const can = (perm) => permissionChecker(perms, perm?.resource, perm?.action);

  const canCreatePlatformService = can(PERMISSIONS.PLATFORM.SERVICES.CREATE);
  const canEditPlatformService = can(PERMISSIONS.PLATFORM.SERVICES.UPDATE);
  const canViewPlatformService = can(PERMISSIONS.PLATFORM.SERVICES.READ);
  const canDeletePlatformService = can(PERMISSIONS.PLATFORM.SERVICES.DELETE);
  const canCreateFeature = can(PERMISSIONS.PLATFORM.SERVICE_FEATURES.CREATE);
  const canAssignPlatformServiceProvider = can(
    PERMISSIONS.PLATFORM.SERVICES.ASSIGN_PROVIDER,
  );
  const canDisablePlatformServiceProvider = can(
    PERMISSIONS.PLATFORM.SERVICES.DISABLE_PROVIDER,
  );

  /* ================= HANDLERS ================= */

  const handleServiceSubmit = (payload, setError) => {
    const action = editingData ? updateService : createService;

    action(editingData ? { id: editingData.id, payload } : payload, {
      onSuccess: () => {
        toast.success(editingData ? "Service Updated" : "Service Created");
        setOpenModal(false);
        setEditingData(null);
        setForcedType(null);
      },
      onError: (err) => {
        setError("root", { message: err.message });
      },
    });
  };

  const handleFeatureSubmit = (payload, setError) => {
    const action = createFeature;

    action(payload, {
      onSuccess: () => {
        toast.success("Feature Created");
        setOpenModal(false);
        setForcedType(null);
      },
      onError: (err) => {
        setError("root", { message: err.message });
      },
    });
  };

  const handleAssignProvider = (payload, setError) => {
    assignProvider(payload, {
      onSuccess: () => {
        toast.success("Provider Assigned");
        setAssignModalOpen(false);
        setSelectedServiceId(null);
      },
      onError: (err) => {
        setError("root", { message: err.message });
      },
    });
  };

  /* ================= UI ================= */

  const stats = [
    {
      title: "Total Services",
      value: data.length,
      icon: Layers,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button icon={RefreshCw} variant="outline" loading={isLoading}>
          Refresh
        </Button>
      </div>

      <QuickStats stats={stats} />

      <PlatformServicesTable
        data={data}
        loading={isLoading}
        onAdd={
          canCreatePlatformService
            ? () => {
                setEditingData(null);
                setForcedType(null);
                setOpenModal(true);
              }
            : undefined
        }
        onView={(row) => {
          router.push(`/dashboard/platform/services/${row.id}`);
        }}
        onEdit={
          canEditPlatformService
            ? (row) => {
                setEditingData(row);
                setForcedType("service");
                setOpenModal(true);
              }
            : undefined
        }
        onDelete={
          canDeletePlatformService
            ? (row) =>
                deleteService(row.id, {
                  onSuccess: () => toast.success("Service Deleted"),
                })
            : undefined
        }
        extraActions={[
          ...(canAssignPlatformServiceProvider
            ? [
                {
                  label: "Assign Provider",
                  icon: Link,
                  onClick: (row) => {
                    setSelectedServiceId(row.id);
                    setAssignModalOpen(true);
                  },
                },
              ]
            : []),

          ...(canDisablePlatformServiceProvider
            ? [
                {
                  label: "Disable Provider",
                  icon: Ban,
                  onClick: (row) => {
                    disableProvider(
                      { serviceId: row.id },
                      {
                        onSuccess: () => toast.success("Provider Disabled"),
                      },
                    );
                  },
                },
              ]
            : []),
        ]}
      />

      <UnifiedPlatformServiceModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingData(null);
          setForcedType(null);
        }}
        forcedType={forcedType}
        initialData={editingData}
        services={data}
        onSubmitService={handleServiceSubmit}
        onSubmitFeature={handleFeatureSubmit}
        isPending={creating || updating || creatingFeature}
        canCreateService={canCreatePlatformService}
        canCreateFeature={canCreateFeature}
      />

      <AssignPlatformServiceProviderModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        serviceId={selectedServiceId}
        providers={providers}
        onSubmit={handleAssignProvider}
        isPending={assigningProvider}
      />
    </>
  );
}
