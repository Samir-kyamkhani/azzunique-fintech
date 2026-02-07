import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= Tenants Service ================= */

export const useTenantServices = (tenantId) =>
  useQuery({
    queryKey: ["tenant-services", tenantId],
    queryFn: () => apiClient(`/platform-tenants/${tenantId}/services`),
    enabled: !!tenantId,
  });

export const useEnableTenantService = (tenantId) =>
  useMutation({
    mutationFn: (payload) =>
      apiClient(`/platform-tenants/${tenantId}/services`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
