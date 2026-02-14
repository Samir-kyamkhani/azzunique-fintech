"use client";

import { X, Link } from "lucide-react";
import Button from "../ui/Button";
import MapServiceProviderFeatureForm from "../forms/MapServiceProviderFeatureForm";

export default function MapServiceProviderFeatureModal({
  open,
  onClose,
  providerId,
  features,
  mappedFeatures = [],
  onSubmit,
  onUnmap,
  isPending,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-card border rounded-lg w-full max-w-lg overflow-hidden">
        {/* Header */}
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
            <h2 className="text-xl font-bold">Manage Provider Features</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ================= MAPPED FEATURES ================= */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Mapped Features</h3>

            {mappedFeatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No features mapped yet.
              </p>
            ) : (
              <div className="space-y-2">
                {mappedFeatures.map((mf) => (
                  <div
                    key={mf.id}
                    className="flex justify-between items-center border rounded px-3 py-2"
                  >
                    <span className="text-sm font-medium">
                      {mf.featureName || mf.platformServiceFeatureId}
                    </span>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onUnmap(mf.id)}
                    >
                      Unmap
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t" />

          {/* ================= MAP NEW FEATURE ================= */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Map New Feature</h3>

            <MapServiceProviderFeatureForm
              providerId={providerId}
              features={features}
              mappedFeatures={mappedFeatures}
              onSubmit={onSubmit}
              isPending={isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
