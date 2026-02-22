"use client";

import { useMemo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSendKycOtp, useVerifyKyc, useKycStatus } from "@/hooks/useKyc";
import KycModal from "@/components/modals/KycModal";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { permissionChecker } from "@/lib/permissionCheker";

export default function Page() {
  const kycType = "aadhaar";

  const [step, setStep] = useState("LOADING");
  const [transactionId, setTransactionId] = useState(null);
  const [maskedAadhaar, setMaskedAadhaar] = useState(null);

  const perms = useSelector((s) => s.auth.user?.permissions || []);
  const can = (perm) => permissionChecker(perms, perm?.resource, perm?.action);

  const providerType = useMemo(() => {
    if (can(PERMISSIONS.TRANSACTIONS.AADHAAR.MANUAL_CREATE)) return "MANUAL";
    if (can(PERMISSIONS.TRANSACTIONS.AADHAAR.API_CREATE)) return "API";
    return null;
  }, [perms]);

  const { data: statusData, isLoading: statusLoading } = useKycStatus(kycType);

  // 🔥 Handle statusData properly
  useEffect(() => {
    if (!statusLoading && statusData) {
      const { status, transactionId, maskedAadhaar } = statusData;

      if (status === "OTP_SENT" || status === "INITIATED") {
        setTransactionId(transactionId);
        setMaskedAadhaar(maskedAadhaar);
        setStep("OTP");
      } else if (status === "SUCCESS" || status === "VERIFIED") {
        setStep("SUCCESS");
      } else {
        setStep("AADHAAR");
      }
    }
  }, [statusData, statusLoading]);

  const sendOtp = useSendKycOtp(kycType);
  const verifyOtp = useVerifyKyc(kycType);

  if (!providerType) return <div>No Aadhaar Access</div>;
  if (step === "LOADING") return <div>Checking KYC Status...</div>;

  return (
    <KycModal
      open={true}
      step={step}
      providerType={providerType}
      transactionId={transactionId}
      maskedAadhaar={maskedAadhaar}
      onBack={() => setStep("AADHAAR")}
      onSendOtp={(payload) =>
        sendOtp.mutate(payload, {
          onSuccess: (data) => {
            setTransactionId(data.transactionId);
            setMaskedAadhaar(data.maskedAadhaar);
            setStep("OTP");
          },
        })
      }
      onVerifyOtp={(payload) =>
        verifyOtp.mutate(payload, {
          onSuccess: () => {
            setStep("SUCCESS");
          },
        })
      }
      isPending={sendOtp.isPending || verifyOtp.isPending || statusLoading}
    />
  );
}
