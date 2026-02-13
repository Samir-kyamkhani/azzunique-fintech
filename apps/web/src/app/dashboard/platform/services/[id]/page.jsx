"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowLeft, Layers, Settings, Key, Activity } from "lucide-react";

import Button from "@/components/ui/Button";
import InfoCard from "@/components/details/InfoCard";
import InfoItem from "@/components/details/InfoItem";
import CopyableInfoItem from "@/components/details/CopyableInfoItem";
import QuickActionsCard from "@/components/details/QuickActionsCard";
import PageSkeleton from "@/components/details/PageSkeleton";
import UnifiedPlatformServiceModal from "@/components/modals/UnifiedPlatformServiceModal";

import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";

import {
  usePlatformService,
  usePlatformServiceFeatures,
  useUpdatePlatformServiceFeature,
  useUpdatePlatformService,
  useDeletePlatformServiceFeature,
} from "@/hooks/usePlatformService";
import { useSelector } from "react-redux";
import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function PlatformServiceDetailsPage() {
  const router = useRouter();
  const { id } = useParams();

  /* ================= MODAL STATE ================= */

  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(null); // service | feature
  const [editingFeature, setEditingFeature] = useState(null);
  const [editingService, setEditingService] = useState(null);

  /* ================= DATA ================= */

  const { data: serviceRes, isLoading: serviceLoading } =
    usePlatformService(id);

  const { data: features = [], isLoading: featuresLoading } =
    usePlatformServiceFeatures(id);

  const { mutate: updateFeature, isPending: updatingFeature } =
    useUpdatePlatformServiceFeature();

  const { mutate: updateService, isPending: updatingService } =
    useUpdatePlatformService();

  const { mutate: deleteFeature, isPending: deletingFeature } =
    useDeletePlatformServiceFeature();

  const service = serviceRes?.data || serviceRes;

  /* ================= PERMISSIONS ================= */
  const can = (perm) => permissionChecker(perms, perm?.resource, perm?.action);

  const perms = useSelector((s) => s.auth.user?.permissions);

  const canUpdateService = can(PERMISSIONS.PLATFORM.SERVICES.UPDATE);
  const canUpdateFeature = can(PERMISSIONS.PLATFORM.SERVICE_FEATURES.UPDATE);
  const canDeleteFeature = can(PERMISSIONS.PLATFORM.SERVICE_FEATURES.DELETE);

  /* ================= REDIRECT ================= */

  useEffect(() => {
    if (!serviceLoading && !service) {
      router.replace("/dashboard/platform/services");
    }
  }, [serviceLoading, service, router]);

  if (serviceLoading || !service) return <PageSkeleton />;

  /* ================= HELPERS ================= */

  const copy = (value, label) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  /* ================= SUBMIT HANDLERS ================= */

  const handleFeatureSubmit = (payload, setError) => {
    if (!editingFeature?.id) return;

    updateFeature(
      { id: editingFeature.id, payload },
      {
        onSuccess: () => {
          toast.success("Feature Updated");
          setOpenModal(false);
          setEditingFeature(null);
          setModalType(null);
        },
        onError: (err) => {
          setError("root", { message: err.message });
          toast.error(err.message);
        },
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
          setOpenModal(false);
          setEditingService(null);
          setModalType(null);
        },
        onError: (err) => {
          setError("root", { message: err.message });
          toast.error(err.message);
        },
      },
    );
  };

  const handleDeleteFeature = (feature) => {
    deleteFeature(feature.id, {
      onSuccess: () => {
        toast.success("Feature Deleted");
      },
    });
  };

  /* ================= UI ================= */

  return (
    <>
      {/* HEADER */}
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

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* SERVICE INFO */}
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

          {/* FEATURES */}
          <InfoCard icon={Settings} title="Service Features">
            {featuresLoading ? (
              <div>Loading features...</div>
            ) : features.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No features available
              </div>
            ) : (
              <div className="space-y-3">
                {features.map((f) => (
                  <div
                    key={f.id}
                    className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-accent/40 transition"
                  >
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {f.code}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm mr-2">
                        {f.isActive ? "Active" : "Inactive"}
                      </span>

                      {/* EDIT */}
                      {canUpdateFeature && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingFeature(f);
                            setModalType("feature");
                            setOpenModal(true);
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

        {/* RIGHT */}
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
                        setModalType("service");
                        setOpenModal(true);
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

      {/* MODAL */}
      <UnifiedPlatformServiceModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingFeature(null);
          setEditingService(null);
          setModalType(null);
        }}
        forcedType={modalType}
        initialData={modalType === "feature" ? editingFeature : editingService}
        services={[service]}
        onSubmitFeature={handleFeatureSubmit}
        onSubmitService={handleServiceSubmit}
        isPending={updatingFeature || updatingService}
      />
    </>
  );
}
