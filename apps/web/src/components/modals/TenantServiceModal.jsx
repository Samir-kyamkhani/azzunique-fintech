"use client";

import { X, Layers } from "lucide-react";
import Button from "../ui/Button";
import TenantServiceForm from "../forms/TenantServiceForm";

export default function TenantServiceModal({
  open,
  onClose,
  onSubmit,
  isPending,
  servicesList = [],
  tenantsList = [],
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-card border rounded-lg w-full max-w-md">
        <div className="bg-gradient-theme px-6 py-6 relative">
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X />
          </Button>

          <div className="flex gap-3 text-primary-foreground">
            <Layers />
            <h2 className="text-xl font-bold">Enable Service</h2>
          </div>
        </div>

        <div className="p-6">
          <TenantServiceForm
            onSubmit={onSubmit}
            isPending={isPending}
            servicesList={servicesList}
            tenantsList={tenantsList}
          />
        </div>
      </div>
    </div>
  );
}
