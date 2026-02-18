"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RefreshCw, Globe } from "lucide-react";

import Button from "@/components/ui/Button";
import QuickStats from "@/components/QuickStats";

import { useCircleMaps, useUpsertCircleMap } from "@/hooks/useRecharge";

import { permissionChecker } from "@/lib/permissionCheker";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { toast } from "@/lib/toast";
import CircleMapsTable from "../tables/CircleMapsTable";
import CircleMapModal from "../modals/CircleMapModal";

export default function CircleMapsClient() {
  const [open, setOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const { data = [], isLoading, refetch } = useCircleMaps();
  const { mutate: upsertMap, isPending } = useUpsertCircleMap();

  const perms = useSelector((s) => s.auth.user?.permissions);
  const can = (perm) => permissionChecker(perms, perm.resource, perm.action);

  const canCreate = can(PERMISSIONS.RECHARGE.ADMIN.CIRCLES.CREATE);
  const canUpdate = can(PERMISSIONS.RECHARGE.ADMIN.CIRCLES.UPDATE);

  const handleSubmit = (payload, setError) => {
    upsertMap(payload, {
      onSuccess: () => {
        toast.success("Circle Mapping Saved");
        setOpen(false);
        setEditingData(null);
      },
      onError: (err) => setError("root", { message: err.message }),
    });
  };

  return (
    <>
      <div className="mb-6 flex justify-end gap-3">
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
            title: "Total Circle Maps",
            value: data.length,
            icon: Globe,
          },
        ]}
      />

      <CircleMapsTable
        data={data}
        onAdd={
          canCreate
            ? () => {
                setEditingData(null);
                setOpen(true);
              }
            : undefined
        }
        onEdit={
          canUpdate
            ? (row) => {
                setEditingData(row);
                setOpen(true);
              }
            : undefined
        }
      />

      <CircleMapModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingData(null);
        }}
        initialData={editingData}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </>
  );
}
