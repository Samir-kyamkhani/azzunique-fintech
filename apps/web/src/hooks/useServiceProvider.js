import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= PROVIDERS ================= */

export const useServiceProviders = (serviceId) =>
  useQuery({
    queryKey: ["service-providers", serviceId],
    queryFn: () =>
      apiClient(`/platform-providers/services/${serviceId}`),
    enabled: !!serviceId,
  });

export const useCreateServiceProvider = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/platform-providers", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useUpdateServiceProvider = (id) =>
  useMutation({
    mutationFn: (payload) =>
      apiClient(`/platform-providers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  });

export const useDeleteServiceProvider = () =>
  useMutation({
    mutationFn: (id) =>
      apiClient(`/platform-providers/${id}`, { method: "DELETE" }),
  });

/* ================= PROVIDER FEATURES ================= */

export const useMapServiceProviderFeature = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/platform-providers/features", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useServiceProviderFeatures = (providerId) =>
  useQuery({
    queryKey: ["provider-features", providerId],
    queryFn: () => apiClient(`/platform-providers/${providerId}/features`),
    enabled: !!providerId,
  });

export const useUnmapServiceProviderFeature = () =>
  useMutation({
    mutationFn: (id) =>
      apiClient(`/platform-providers/features/${id}`, {
        method: "DELETE",
      }),
  });
