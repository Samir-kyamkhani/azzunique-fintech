"use client";

import { X, Link } from "lucide-react";
import Button from "../ui/Button";
import AssignPlatformServiceProviderForm from "../forms/AssignPlatformServiceProviderForm";

export default function AssignPlatformServiceProviderModal({
  open,
  onClose,
  serviceId,
  providers,
  onSubmit,
  isPending,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-card border rounded-lg w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-theme px-6 py-6 relative text-primary-foreground">
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X />
          </Button>

          <div className="flex gap-2 items-center">
            <Link />
            <h2 className="text-xl font-bold">Assign Provider</h2>
          </div>
        </div>

        <div className="p-6">
          <AssignPlatformServiceProviderForm
            serviceId={serviceId}
            providers={providers}
            onSubmit={onSubmit}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
}
