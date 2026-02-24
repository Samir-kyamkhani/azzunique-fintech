"use client";

import { X } from "lucide-react";
import AadhaarVerifyOtpForm from "../forms/AadhaarVerifyOtpForm";
import ManualKycForm from "../forms/ManualKycForm";
import AadhaarOtpForm from "../forms/AadhaarOtpForm";
import KycStatusResult from "../KycStatusResult";

export default function KycModal({
  open,
  onClose,
  step,
  providerType,
  transactionId,
  maskedAadhaar,
  onBack,
  onSendOtp,
  onVerifyOtp,
  isPending,
  error,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-[9999] p-4">
      <div className=" rounded-xl w-full max-w-md shadow-xl border overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Complete Your KYC</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === "AADHAAR" && (
            <AadhaarOtpForm
              isPending={isPending}
              providerType={providerType}
              onSubmit={onSendOtp}
            />
          )}

          {step === "OTP" && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <button
                  onClick={onBack}
                  className="text-sm text-blue-600 underline"
                >
                  ← Edit Aadhaar
                </button>

                {maskedAadhaar && (
                  <span className="text-xs text-gray-500">{maskedAadhaar}</span>
                )}
              </div>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              {providerType === "API" ? (
                <AadhaarVerifyOtpForm
                  transactionId={transactionId}
                  isPending={isPending}
                  onSubmit={(data) =>
                    onVerifyOtp({
                      transactionId,
                      otp: data.otp,
                    })
                  }
                />
              ) : (
                <ManualKycForm
                  transactionId={transactionId}
                  providerType={providerType}
                  isPending={isPending}
                  onSubmit={(formData) => onVerifyOtp(formData)}
                />
              )}
            </>
          )}

          {["VERIFIED", "UNDER_REVIEW", "REJECTED"].includes(step) && (
            <KycStatusResult status={step} />
          )}
        </div>
      </div>
    </div>
  );
}
