import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/**
 * SEND OTP / INITIATE KYC
 */
export const useSendKycOtp = (type) =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient(`/kyc/${type}/send-otp`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

/**
 * VERIFY KYC
 */
export const useVerifyKyc = (type) =>
  useMutation({
    mutationFn: async (payload) => {
      // 👇 If FormData (Manual case)
      if (payload instanceof FormData) {
        return apiClient(`/kyc/${type}/verify`, {
          method: "POST",
          body: payload,
        });
      }

      // 👇 JSON case (API verification)
      return apiClient(`/kyc/${type}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    },
  });
/**
 * GET KYC STATUS
 */
export const useKycStatus = (type) =>
  useQuery({
    queryKey: ["kyc-status", type],
    queryFn: async () => {
      const res = await apiClient(`/kyc/status`);
      return res.data;
    },
  });
