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
  offers,
  operatorMaps = [],
  onFieldChange,
}) {
  if (!open) return null;

  const isRetryMode = Boolean(initialData?.id);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
      <div className="bg-card border rounded-lg w-full max-w-xl overflow-hidden">
        {/* HEADER */}
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
            <Zap />
            <h2 className="text-xl font-bold">
              {isRetryMode ? "Retry Recharge" : "New Recharge"}
            </h2>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          <RechargeForm
            initialData={initialData}
            onSubmit={onSubmit}
            isPending={isPending}
            isRetryMode={isRetryMode}
            plans={plans}
            offers={offers}
            operatorMaps={operatorMaps}
            onFieldChange={onFieldChange}
          />
        </div>
      </div>
    </div>
  );
}
