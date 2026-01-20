"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@/components/ui/Button.jsx";
import InfoCard from "@/components/details/InfoCard.jsx";
import InfoItem from "@/components/details/InfoItem.jsx";
import DataTableSearchEmpty from "@/components/tables/core/DataTableSearchEmpty.jsx";
import PageSkeleton from "@/components/details/PageSkeleton.jsx";
import TenantWebsiteModal from "@/components/modals/TenantWebsiteModal.jsx";

import { Palette, Edit, Mail, Phone, Type, Quote } from "lucide-react";

import {
  useTenantWebsite,
  useUpsertTenantWebsite,
} from "@/hooks/useTenantWebsite";

import {
  setTenantWebsite,
  clearTenantWebsite,
} from "@/store/tenantWebsiteSlice";

import { toast } from "@/lib/toast";

export default function TenantWebsiteClient() {
  const dispatch = useDispatch();
  const website = useSelector((state) => state.tenantWebsite.currentWebsite);

  const [openModal, setOpenModal] = useState(false);

  const { data, isLoading, refetch } = useTenantWebsite();
  const { mutate, isPending } = useUpsertTenantWebsite();

  useEffect(() => {
    if (data?.data) dispatch(setTenantWebsite(data.data));
    else dispatch(clearTenantWebsite());
  }, [data, dispatch]);

  const handleSubmit = (payload, setError) => {
    mutate(payload, {
      onSuccess: (res) => {
        dispatch(setTenantWebsite(res.data));
        setOpenModal(false);
        toast.success("Branding updated");
        refetch();
      },
      onError: (err) =>
        setError("root", {
          message: err.message || "Failed to update branding",
        }),
    });
  };

  if (isLoading && !website) return <PageSkeleton />;

  return (
    <>
      {/* HEADER */}
      <div className="mb-8 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Branding Settings</h1>
          <p className="text-muted-foreground">
            Control tenant branding and support information
          </p>
        </div>

        <Button icon={Edit} onClick={() => setOpenModal(true)}>
          {website ? "Edit Branding" : "Setup Branding"}
        </Button>
      </div>

      {/* CONTENT */}
      {website ? (
        <InfoCard icon={Palette} title="Brand Information">
          <div className="space-y-2">
            <InfoItem
              label="Brand Name"
              value={website.brandName}
              icon={Type}
            />

            <InfoItem
              label="Tag Line"
              value={website.tagLine || "—"}
              icon={Quote}
            />

            <InfoItem
              label="Support Email"
              value={website.supportEmail || "—"}
              icon={Mail}
              onClick={
                website.supportEmail
                  ? () =>
                      window.open(`mailto:${website.supportEmail}`, "_blank")
                  : undefined
              }
            />

            <InfoItem
              label="Support Phone"
              value={website.supportPhone || "—"}
              icon={Phone}
              onClick={
                website.supportPhone
                  ? () => window.open(`tel:${website.supportPhone}`, "_blank")
                  : undefined
              }
            />
          </div>
        </InfoCard>
      ) : (
        <DataTableSearchEmpty
          isEmpty
          emptyTitle="Branding not configured"
          emptyDescription="Set up brand identity for your tenant"
          emptyAction={
            <Button icon={Palette} onClick={() => setOpenModal(true)}>
              Setup Branding
            </Button>
          }
        />
      )}

      {/* MODAL */}
      {openModal && (
        <TenantWebsiteModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSubmit={handleSubmit}
          isPending={isPending}
          initialData={website}
        />
      )}
    </>
  );
}
