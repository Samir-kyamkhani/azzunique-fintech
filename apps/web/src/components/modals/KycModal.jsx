"use client";

import { X } from "lucide-react";
import AadhaarVerifyOtpForm from "../forms/AadhaarVerifyOtpForm";
import ManualKycForm from "../forms/ManualKycForm";
import AadhaarOtpForm from "../forms/AadhaarOtpForm";

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
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
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

          {step === "SUCCESS" && (
            <div className="text-center py-6">
              <h3 className="text-green-600 font-semibold text-lg">
                ✅ KYC Submitted Successfully
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Your KYC is under review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
