"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RefreshCw, Layers } from "lucide-react";

import Button from "@/components/ui/Button";
import QuickStats from "@/components/QuickStats";
import TenantServicesTable from "@/components/tables/TenantServicesTable";
import TenantServiceModal from "@/components/modals/TenantServiceModal";

import {
  useAllTenantServices,
  useEnableTenantService,
  useDisableTenantService,
} from "@/hooks/useTenantServices";

import { toast } from "@/lib/toast";
import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { useServices } from "@/hooks/useAdminServices";
import { useTenants } from "@/hooks/useTenant";
import { Power } from "lucide-react";
import { PowerOff } from "lucide-react";

export default function TenantServicesClient() {
  const perms = useSelector((s) => s.auth.user?.permissions);
  const can = (perm) => permissionChecker(perms, perm.resource, perm.action);
  const [openModal, setOpenModal] = useState(false);

  const {
    data: services = [],
    isLoading,
    error,
    refetch,
  } = useAllTenantServices();

  const { mutate: enableService, isPending } = useEnableTenantService();

  const { mutate: disableService } = useDisableTenantService();

  const { data: servicesList = [] } = useServices();

  const { data: tenantsData } = useTenants({
    page: 1,
    limit: 100,
    status: "all",
  });

  const tenantsList = tenantsData?.data || tenantsData || [];

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  const canCreate = can(PERMISSIONS.PLATFORM.SERVICE_TENANTS.CREATE);
  const canUpdate = can(PERMISSIONS.PLATFORM.SERVICE_TENANTS.UPDATE);
  const canDelete = can(PERMISSIONS.PLATFORM.SERVICE_TENANTS.DELETE);

  const handleEnable = (payload, setError) => {
    enableService(payload, {
      onSuccess: () => {
        toast.success("Service Enabled");
        setOpenModal(false);
      },
      onError: (err) => setError("root", { message: err.message }),
    });
  };

  const handleDisable = (row) => {
    disableService(
      {
        tenantId: row.tenantId,
        platformServiceId: row.platformServiceId,
      },
      {
        onSuccess: () => toast.success("Service Disabled"),
      },
    );
  };

  const extraActions = [
    ...(canUpdate
      ? [
          {
            label: "Enable",
            icon: Power,
            onClick: (row) => {
              handleEnable(
                {
                  tenantId: row.tenantId,
                  platformServiceId: row.platformServiceId,
                },
                () => {},
              );
            },
            show: (row) => !row.isEnabled,
          },
        ]
      : []),

    ...(canDelete
      ? [
          {
            label: "Disable",
            icon: PowerOff,
            onClick: (row) => {
              handleDisable(row);
            },
            show: (row) => row.isEnabled,
          },
        ]
      : []),
  ];

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
            title: "Enabled Services",
            value: services.filter((s) => s.isEnabled).length,
            icon: Layers,
          },
        ]}
      />

      <TenantServicesTable
        data={services}
        loading={isLoading}
        onAdd={
          canCreate
            ? () => {
                setOpenModal(true);
              }
            : undefined
        }
        extraActions={extraActions}
      />

      <TenantServiceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleEnable}
        isPending={isPending}
        existingServices={services}
        servicesList={servicesList}
        tenantsList={tenantsList}
      />
    </>
  );
}
