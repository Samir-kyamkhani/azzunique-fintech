import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= PLATFORM SERVICES ================= */

export const usePlatformServices = () =>
  useQuery({
    queryKey: ["platform-services"],
    queryFn: async () => {
      const res = await apiClient("/platform-services");
      return res.data;
    },
  });

export const usePlatformService = (id) =>
  useQuery({
    queryKey: ["platform-service", id],
    queryFn: async () => {
      const res = await apiClient(`/platform-services/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useCreatePlatformService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient("/platform-services", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-services"] }),
  });
};

export const useUpdatePlatformService = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient(`/platform-services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-services"] }),
  });
};

export const useDeletePlatformService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      apiClient(`/platform-services/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-services"] }),
  });
};

/* ================= PLATFORM SERVICE FEATURES ================= */

export const usePlatformServiceFeatures = (serviceId) =>
  useQuery({
    queryKey: ["platform-service/features", serviceId],
    queryFn: async () => {
      const res = await apiClient(`/platform-services/${serviceId}/features`);
      return res.data;
    },
    enabled: !!serviceId,
  });

export const useCreatePlatformServiceFeature = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/platform-services/features", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useUpdatePlatformServiceFeature = (id) =>
  useMutation({
    mutationFn: (payload) =>
      apiClient(`/platform-services/features/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  });

export const useDeletePlatformServiceFeature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      apiClient(`/platform-services/features/${id}`, {
        method: "DELETE",
      }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-service-features"] });
    },
  });
};

/* ================= PLATFORM SERVICE PROVIDERS ================= */

export const useAssignPlatformServiceProvider = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/platform-services/providers", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useDisablePlatformServiceProvider = () =>
  useMutation({
    mutationFn: ({ serviceId }) =>
      apiClient(`/platform-services/${serviceId}/providers`, {
        method: "DELETE",
      }),
  });
