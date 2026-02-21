import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

//  SERVICES

export const useServices = () =>
  useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await apiClient("/admin/services");
      return res.data;
    },
  });

export const useService = (id) =>
  useQuery({
    queryKey: ["service", id],
    queryFn: async () => {
      const res = await apiClient(`/admin/services/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateService = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiClient("/admin/services", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

export const useUpdateService = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      apiClient(`/admin/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["service", vars.id] });
    },
  });
};

export const useDeleteService = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      apiClient(`/admin/services/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

//  FEATURES

export const useServiceFeatures = (serviceId) =>
  useQuery({
    queryKey: ["service-features", serviceId],
    queryFn: async () => {
      const res = await apiClient(`/admin/services/${serviceId}/features`);
      return res.data;
    },
    enabled: !!serviceId,
  });

export const useCreateFeature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, payload }) =>
      apiClient(`/admin/services/${serviceId}/features`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["service-features", vars.serviceId],
      });
    },
  });
};

export const useUpdateFeature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, featureId, payload }) =>
      apiClient(`/admin/services/${serviceId}/features/${featureId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["service-features", vars.serviceId],
      });
    },
  });
};

export const useDeleteFeature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, featureId }) =>
      apiClient(`/admin/services/${serviceId}/features/${featureId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["service-features", vars.serviceId],
      });
    },
  });
};

//  GLOBAL PROVIDERS

export const useProviders = () =>
  useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await apiClient("/admin/services/providers");
      return res.data;
    },
  });

export const useCreateProvider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiClient("/admin/services/providers", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
};

export const useUpdateProvider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, payload }) =>
      apiClient(`/admin/services/providers/${providerId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
};

export const useDeleteProvider = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (providerId) =>
      apiClient(`/admin/services/providers/${providerId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
    },
  });
};

//  SERVICE ↔ PROVIDER (MAPPING)

export const useServiceProviders = (serviceId) =>
  useQuery({
    queryKey: ["service-providers", serviceId],
    queryFn: async () => {
      const res = await apiClient(`/admin/services/${serviceId}/providers`);
      return res.data;
    },
    enabled: !!serviceId,
  });

export const useAssignProviderToService = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, providerId, config }) =>
      apiClient(`/admin/services/${serviceId}/providers`, {
        method: "POST",
        body: JSON.stringify({ providerId, config }),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["service-providers", vars.serviceId],
      });
    },
  });
};

export const useUnassignProviderFromService = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, providerId }) =>
      apiClient(`/admin/services/${serviceId}/providers/${providerId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["service-providers", vars.serviceId],
      });
    },
  });
};

export const useUpdateProviderConfig = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, providerId, config }) =>
      apiClient(`/admin/services/${serviceId}/providers/${providerId}/config`, {
        method: "PATCH",
        body: JSON.stringify({ config }),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["service-providers", vars.serviceId],
      });
    },
  });
};

//  PROVIDER FEATURE

export const useMapProviderFeature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, payload }) =>
      apiClient(`/admin/services/providers/${providerId}/features`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["service-providers", vars.serviceId],
      });
    },
  });
};

export const useUnmapProviderFeature = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, providerId, featureId }) =>
      apiClient(
        `/admin/services/${serviceId}/providers/${providerId}/features/${featureId}`,
        { method: "DELETE" },
      ),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ["service-providers", vars.serviceId],
      });
    },
  });
};
