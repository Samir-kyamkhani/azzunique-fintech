import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= PROVIDERS ================= */

// ✅ List Providers by Platform Service
export const useServiceProviders = (serviceId) =>
  useQuery({
    queryKey: ["service-providers", serviceId],
    queryFn: async () => {
      const res = await apiClient(
        `/platform-providers/by-service/${serviceId}`,
      );
      return res.data;
    },
    enabled: !!serviceId,
  });

// ✅ Create Provider
export const useCreateServiceProvider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient("/platform-providers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-providers"] });
    },
  });
};

// ✅ Update Provider
export const useUpdateServiceProvider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await apiClient(`/platform-providers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-providers"] });
    },
  });
};

// ✅ Delete Provider
export const useDeleteServiceProvider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await apiClient(`/platform-providers/${id}`, {
        method: "DELETE",
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-providers"] });
    },
  });
};

/* ================= PROVIDERS FEATURES ================= */

// ✅ Map Feature To Provider
export const useMapServiceProviderFeature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerId, payload }) => {
      const res = await apiClient(
        `/platform-providers/${providerId}/features`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      return res.data;
    },

    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["provider-features", variables.providerId],
      });
    },
  });
};

// ✅ List Provider Features
export const useServiceProviderFeatures = (providerId) =>
  useQuery({
    queryKey: ["provider-features", providerId],
    queryFn: async () => {
      const res = await apiClient(`/platform-providers/${providerId}/features`);
      return res.data;
    },
    enabled: !!providerId,
  });

// ✅ Unmap Feature
export const useUnmapServiceProviderFeature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ providerId, id }) => {
      const res = await apiClient(
        `/platform-providers/${providerId}/features/${id}`,
        {
          method: "DELETE",
        },
      );
      return res.data;
    },

    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["provider-features", variables.providerId],
      });
    },
  });
};
