"use client";

import { useCreateFundRequest } from "@/hooks/useFundRequest";
import FundRequestForm from "../forms/FundRequestForm";

export default function FundRequestModal({ open, onClose }) {
  const { mutate, isPending } = useCreateFundRequest();

  if (!open) return null;

  const handleSubmit = (data, setError) => {
    mutate(data, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        setError("root", {
          message:
            error?.response?.data?.message || "Failed to create fund request",
        });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-9999 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border bg-card shadow-xl">
        <div className="relative bg-gradient-theme px-6 py-6 rounded-t-xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-primary-foreground"
          >
            ✕
          </button>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-primary-foreground">
              Minimum ₹100 Required
            </h2>

            <p className="text-sm text-primary-foreground/80">
              To start the KYC process, a minimum balance of ₹100 is required.
            </p>
          </div>
        </div>

        <div className="p-6">
          <FundRequestForm onSubmit={handleSubmit} isPending={isPending} />
        </div>
      </div>
    </div>
  );
}
