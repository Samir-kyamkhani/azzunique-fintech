"use client";

import { X, Zap } from "lucide-react";
import Button from "../ui/Button";
import RechargeForm from "../forms/RechargeForm";

export default function RechargeModal({
  open,
  onClose,
  onSubmit,
  isPending,
  initialData,
  plans,
  planOperatorMaps = [],
  rechargeOperatorMaps = [],
  circleMaps = [],
  onFieldChange,
  fetchPlans,
  plansLoading,
}) {
  if (!open) return null;

  const isRetryMode = Boolean(initialData?.id);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-card border rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* HEADER (Fixed) */}
        <div className="bg-gradient-theme px-6 py-6 relative shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X />
          </Button>

          <div className="flex gap-3 text-primary-foreground">
            <Zap />
            <h2 className="text-xl font-bold">
              {isRetryMode ? "Retry Recharge" : "New Recharge"}
            </h2>
          </div>
        </div>

        {/* BODY (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1">
          <RechargeForm
            initialData={initialData}
            onSubmit={onSubmit}
            isPending={isPending}
            isRetryMode={isRetryMode}
            plans={plans}
            planOperatorMaps={planOperatorMaps}
            rechargeOperatorMaps={rechargeOperatorMaps}
            circleMaps={circleMaps}
            onFieldChange={onFieldChange}
            fetchPlans={fetchPlans} 
            plansLoading={plansLoading}
          />
        </div>
      </div>
    </div>
  );
}
