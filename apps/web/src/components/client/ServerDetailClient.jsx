"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@/components/ui/Button";
import ServerDetailModal from "@/components/modals/ServerDetailModal";
import DataTableSearchEmpty from "@/components/tables/core/DataTableSearchEmpty";
import PageSkeleton from "../details/PageSkeleton";

import {
  Server,
  Globe,
  Shield,
  Lock,
  Calendar,
  Edit,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import {
  useServerDetail,
  useUpsertServerDetail,
} from "@/hooks/useServerDetail";

import { setServerDetail } from "@/store/serverDetailSlice";
import { formatDateTime, statusColor } from "@/lib/utils";
import { toast } from "@/lib/toast";
import InfoItem from "../details/InfoItem";
import InfoCard from "../details/InfoCard";

/* ================= HELPERS ================= */

const FIELDS = ["recordType", "hostname", "value", "status"];

const buildUpsertPayload = (formData) => {
  const payload = {};
  FIELDS.forEach((key) => {
    if (formData[key]) payload[key] = formData[key];
  });
  return payload;
};

/* ================= COMPONENT ================= */

export default function ServerDetailClient() {
  const dispatch = useDispatch();

  const serverDetail = useSelector(
    (state) => state.serverDetail?.currentServerDetail ?? null,
  );

  const [openModal, setOpenModal] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useServerDetail();

  const { mutate: upsertServerDetail, isPending } = useUpsertServerDetail();

  /* ================= SYNC DATA ================= */

  useEffect(() => {
    if (data?.data) {
      dispatch(setServerDetail(data.data));
    }
  }, [data, dispatch]);

  /* ================= HANDLERS ================= */

  const handleSubmit = (formData, setError) => {
    const payload = buildUpsertPayload(formData);

    upsertServerDetail(payload, {
      onSuccess: (res) => {
        dispatch(setServerDetail(res.data));
        setOpenModal(false);
        toast.success("Server configuration saved");
      },
      onError: (err) =>
        setError("root", {
          message: err.message || "Failed to save configuration",
        }),
    });
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  /* ================= STATES ================= */

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !serverDetail) {
    return (
      <DataTableSearchEmpty
        isEmpty
        emptyTitle="No server configuration found"
        emptyDescription="Create DNS and server records to continue."
        emptyAction={
          <Button icon={Server} onClick={() => setOpenModal(true)}>
            Create Server Configuration
          </Button>
        }
      />
    );
  }

  const statusMeta = statusColor[serverDetail.status];

  /* ================= RENDER ================= */

  return (
    <>
      {/* HEADER */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Server Configuration</h1>
          <p className="text-muted-foreground max-w-2xl">
            Configure DNS and server records to route traffic.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            loading={isFetching}
            onClick={refetch}
          >
            Refresh
          </Button>

          <Button icon={Edit} onClick={() => setOpenModal(true)}>
            Edit Configuration
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* SERVER CONFIG */}
          <InfoCard icon={Server} title="Server Configuration">
            <span
              className={`inline-flex px-3 py-1 text-xs rounded-full ${statusMeta.className}`}
            >
              {statusMeta.label}
            </span>

            <InfoItem
              label="Record Type"
              value={serverDetail.recordType}
              icon={Globe}
            />

            <InfoItem
              label="Hostname"
              value={serverDetail.hostname}
              icon={Server}
              onClick={() => handleCopy(serverDetail.hostname, "Hostname")}
            />

            <InfoItem
              label="Value"
              value={serverDetail.value}
              icon={ExternalLink}
            />
          </InfoCard>

          {/* TECH DETAILS */}
          <InfoCard icon={Shield} title="Technical Details">
            <InfoItem
              label="Tenant ID"
              value={serverDetail.tenantNumber}
              icon={Shield}
            />

            <InfoItem
              label="Configuration ID"
              value={serverDetail.id}
              icon={Lock}
            />
          </InfoCard>
        </div>

        <InfoCard icon={Calendar} title="Timeline">
          <InfoItem
            label="Created"
            value={formatDateTime(serverDetail.createdAt)}
          />
          <InfoItem
            label="Updated"
            value={formatDateTime(serverDetail.updatedAt)}
          />
        </InfoCard>
      </div>

      {/* MODAL */}
      {openModal && (
        <ServerDetailModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSubmit={handleSubmit}
          isEditing
          isPending={isPending}
          initialData={serverDetail}
        />
      )}
    </>
  );
}
