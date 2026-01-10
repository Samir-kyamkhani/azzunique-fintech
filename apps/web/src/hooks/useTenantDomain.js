import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= GET (SINGLE) ================= */
export const useTenantDomain = () =>
  useQuery({
    queryKey: ["tenant-domain"],
    queryFn: () => apiClient("/tenant-domain"),
    staleTime: 5 * 60 * 1000,
  });

/* ================= UPSERT ================= */
export const useUpsertTenantDomain = () =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient("/tenant-domain", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useTenantDomainByTenantId = (tenantId) =>
  useQuery({
    queryKey: ["tenant-domain", tenantId],
    queryFn: () => apiClient(`/tenant-domain/${tenantId}`, { method: "GET" }),
    enabled: !!tenantId,
  });

/* ================= DELETE ================= */
export const useDeleteTenantDomain = () =>
  useMutation({
    mutationFn: async (id) =>
      apiClient(`/tenant-domain/${id}`, {
        method: "DELETE",
      }),
  });
