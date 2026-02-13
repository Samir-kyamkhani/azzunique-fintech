"use client";

import { useServiceProviderFeatures } from "@/hooks/useServiceProvider";
import { useMapServiceProviderFeature } from "@/hooks/useServiceProvider";
import { useUnmapServiceProviderFeature } from "@/hooks/useServiceProvider";
import { usePlatformServiceFeatures } from "@/hooks/usePlatformService";

import ServiceProviderFeatureForm from "@/components/forms/ServiceProviderFeatureForm";
import Button from "@/components/ui/Button";
import { toast } from "@/lib/toast";
import { Trash2, Layers } from "lucide-react";

export default function PlatformProviderDetailsClient({ providerId }) {
  const { data: mappedFeatures = [] } = useServiceProviderFeatures(providerId);

  const { data: allFeatures = [] } = usePlatformServiceFeatures(); // 🔥 you must already have this hook

  const { mutate: mapFeature, isPending: mapping } =
    useMapServiceProviderFeature();

  const { mutate: unmapFeature } = useUnmapServiceProviderFeature();

  const handleMap = (payload) => {
    mapFeature(payload, {
      onSuccess: () => toast.success("Feature mapped"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleUnmap = (id) => {
    unmapFeature(
      { providerId, id },
      {
        onSuccess: () => toast.success("Feature unmapped"),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <Layers />
        <h1 className="text-xl font-semibold">Provider Feature Management</h1>
      </div>

      {/* MAP FEATURE FORM */}
      <div className="border rounded-lg p-4 bg-card">
        <h2 className="font-medium mb-4">Map Feature</h2>

        <ServiceProviderFeatureForm
          providerId={providerId}
          features={allFeatures}
          onSubmit={handleMap}
          isPending={mapping}
        />
      </div>

      {/* MAPPED FEATURES TABLE */}
      <div className="border rounded-lg p-4 bg-card">
        <h2 className="font-medium mb-4">
          Mapped Features ({mappedFeatures.length})
        </h2>

        <div className="space-y-2">
          {mappedFeatures.map((feature) => (
            <div
              key={feature.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <div className="font-medium">{feature.name}</div>
                <div className="text-sm text-muted-foreground">
                  {feature.code}
                </div>
              </div>

              <Button
                size="icon"
                variant="destructive"
                onClick={() => handleUnmap(feature.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}

          {mappedFeatures.length === 0 && (
            <div className="text-muted-foreground text-sm">
              No features mapped yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
