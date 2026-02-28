import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= FETCH PLANS ================= */

export const useRechargePlans = (operatorCode, circleCode) =>
  useQuery({
    queryKey: ["recharge-plans", operatorCode, circleCode],
    enabled: false, // 🔥 Disable auto run
    retry: false, // Optional: provider error pe retry na kare
    queryFn: async () => {
      try {
        const res = await apiClient(
          `/recharge/plans?operatorCode=${operatorCode}&circleCode=${circleCode}`,
        );

        return res.data.plans;
      } catch (err) {
        // 🔥 Backend error propagate karo
        throw new Error(err.response?.data?.message || "Failed to fetch plans");
      }
    },
  });

/* ================= RECHARGE OPERATORS ================= */

export const useRechargeOperators = (feature) =>
  useQuery({
    queryKey: ["recharge-operators", feature],
    enabled: Boolean(feature),
    queryFn: async () => {
      const res = await apiClient(`/recharge/operators/${feature}`);
      return res.data;
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
