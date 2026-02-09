"use client";

import { useState } from "react";
import { X, Layers, Settings } from "lucide-react";
import Button from "../ui/Button";

import PlatformServiceForm from "../forms/PlatformServiceForm";
import PlatformServiceFeatureForm from "../forms/PlatformServiceFeaturesForm";

export default function UnifiedPlatformServiceModal({
  open,
  onClose,
  onSubmitService,
  onSubmitFeature,
  initialData,
  services = [],
  isPending,
  forcedType,
}) {
  // ⭐ USER SELECTED TYPE
  const [selectedType, setSelectedType] = useState(null);

  // ⭐ FINAL TYPE (DERIVED)
  const type = forcedType ?? selectedType;

  if (!open) return null;

  const renderTitle = () => {
    if (!type) return "Select Type";

    if (type === "service") {
      return initialData ? "Update Service" : "Create Service";
    }

    return initialData ? "Update Feature" : "Create Feature";
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-card border rounded-lg w-full max-w-xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-theme px-6 py-6 relative">
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4"
            onClick={() => {
              setSelectedType(null); // reset
              onClose();
            }}
          >
            <X />
          </Button>

          <div className="flex gap-3 text-primary-foreground">
            <Layers />
            <h2 className="text-xl font-bold">{renderTitle()}</h2>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          {/* TYPE SELECT */}
          {!type && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-20 text-lg"
                onClick={() => setSelectedType("service")}
              >
                <Layers className="mr-2" />
                Service
              </Button>

              <Button
                variant="outline"
                className="h-20 text-lg"
                onClick={() => setSelectedType("feature")}
              >
                <Settings className="mr-2" />
                Feature
              </Button>
            </div>
          )}

          {/* FORMS */}

          {type === "service" && (
            <PlatformServiceForm
              initialData={initialData}
              onSubmit={onSubmitService}
              isPending={isPending}
            />
          )}

          {type === "feature" && (
            <PlatformServiceFeatureForm
              initialData={initialData}
              services={services}
              onSubmit={onSubmitFeature}
              isPending={isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
