"use client";

import { X, Server } from "lucide-react";
import Button from "../ui/Button";
import ServiceProviderForm from "../forms/ServiceProviderForm";

export default function UnifiedServiceProviderModal({
  open,
  onClose,
  initialData,
  services,
  onSubmit,
  isPending,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
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
            <Server />
            <h2 className="text-xl font-bold">
              {initialData ? "Update Provider" : "Create Provider"}
            </h2>
          </div>
        </div>

        <div className="p-6">
          <ServiceProviderForm
            initialData={initialData}
            services={services}
            onSubmit={onSubmit}
            isPending={isPending}
          />
        </div>
      </div>
    </div>
  );
}
