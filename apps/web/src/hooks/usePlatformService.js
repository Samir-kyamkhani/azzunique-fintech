import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= PLATFORM SERVICES ================= */

export const usePlatformServices = () =>
  useQuery({
    queryKey: ["platform-services"],
    queryFn: () => apiClient("/platform/services"),
  });

export const usePlatformService = (id) =>
  useQuery({
    queryKey: ["platform-service", id],
    queryFn: () => apiClient(`/platform/services/${id}`),
    enabled: !!id,
  });

export const useCreatePlatformService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient("/platform/services", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries(["platform-services"]),
  });
};

export const useUpdatePlatformService = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiClient(`/platform/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries(["platform-services"]),
  });
};

export const useDeletePlatformService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      apiClient(`/platform/services/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries(["platform-services"]),
  });
};

/* ================= PLATFORM SERVICE FEATURES ================= */

export const usePlatformServiceFeatures = (serviceId) =>
  useQuery({
    queryKey: ["platform-service-features", serviceId],
    queryFn: () => apiClient(`/platform/services/${serviceId}/features`),
    enabled: !!serviceId,
  });

export const useCreatePlatformServiceFeature = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/platform/services/features", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useUpdatePlatformServiceFeature = (id) =>
  useMutation({
    mutationFn: (payload) =>
      apiClient(`/platform/services/features/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  });

export const useDeletePlatformServiceFeature = () =>
  useMutation({
    mutationFn: (id) =>
      apiClient(`/platform/services/features/${id}`, {
        method: "DELETE",
      }),
  });

/* ================= PLATFORM SERVICE PROVIDERS ================= */

export const useAssignPlatformServiceProvider = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/platform/services/providers", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useDisablePlatformServiceProvider = () =>
  useMutation({
    mutationFn: ({ serviceId }) =>
      apiClient(`/platform/services/${serviceId}/providers`, {
        method: "DELETE",
      }),
  });


