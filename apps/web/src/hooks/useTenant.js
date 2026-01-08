import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= CREATE ================= */
export const useCreateTenant = () =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient("/tenants", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

/* ================= UPDATE ================= */
export const useUpdateTenant = (tenantId) =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient(`/tenants/${tenantId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  });

/* ================= DELETE ================= */
export const useDeleteTenant = () =>
  useMutation({
    mutationFn: async (tenantId) =>
      apiClient(`/tenants/${tenantId}`, {
        method: "DELETE",
      }),
  });

/* ================= GET BY ID ================= */
export const useTenantById = (tenantId) =>
  useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => apiClient(`/tenants/${tenantId}`),
    enabled: !!tenantId,
  });

/* ================= LIST ================= */
export const useTenants = () =>
  useQuery({
    queryKey: ["tenants"],
    queryFn: () => apiClient("/tenants"),
  });
