import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= FETCH PLANS ================= */

export const useRechargePlans = (operatorCode, circleCode) =>
  useQuery({
    queryKey: ["recharge-plans", operatorCode, circleCode],
    enabled: Boolean(operatorCode && circleCode),
    queryFn: async () => {
      const res = await apiClient(
        `/recharge/plans?operatorCode=${operatorCode}&circleCode=${circleCode}`,
      );
      return res.data.plans;
    },
  });

/* ================= FETCH OFFERS ================= */

export const useRechargeOffers = (operatorCode, mobileNumber) =>
  useQuery({
    queryKey: ["recharge-offers", operatorCode, mobileNumber],
    enabled: Boolean(operatorCode && mobileNumber),
    queryFn: async () => {
      const res = await apiClient(
        `/recharge/offers?operatorCode=${operatorCode}&mobileNumber=${mobileNumber}`,
      );
      return res.data.offers;
    },
  });

/* ================= INITIATE RECHARGE ================= */

export const useInitiateRecharge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient("/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recharge-history"],
      });
    },
  });
};

/* ================= RETRY RECHARGE ================= */

export const useRetryRecharge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const res = await apiClient(`/recharge/${transactionId}/retry`, {
        method: "POST",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recharge-history"],
      });
    },
  });
};

/* ================= HISTORY ================= */

export const useRechargeHistory = () =>
  useQuery({
    queryKey: ["recharge-history"],
    queryFn: async () => {
      const res = await apiClient("/recharge/history");
      return res.data;
    },
  });

/* ================= OPERATOR MAP ================= */

/* ===== LIST OPERATOR MAPS ===== */

export const useOperatorMaps = () =>
  useQuery({
    queryKey: ["operator-maps"],
    queryFn: async () => {
      const res = await apiClient("/admin/recharge/operator-map");
      return res.data;
    },
  });

/* ===== UPSERT OPERATOR MAP ===== */

export const useUpsertOperatorMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient("/admin/recharge/operator-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["operator-maps"],
      });
    },
  });
};

/* ================= CIRCLE MAP ================= */

/* ===== LIST CIRCLE MAPS ===== */

export const useCircleMaps = () =>
  useQuery({
    queryKey: ["circle-maps"],
    queryFn: async () => {
      const res = await apiClient("/admin/recharge/circle-map");
      return res.data;
    },
  });

/* ===== UPSERT CIRCLE MAP ===== */

export const useUpsertCircleMap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient("/admin/recharge/circle-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["circle-maps"],
      });
    },
  });
};
