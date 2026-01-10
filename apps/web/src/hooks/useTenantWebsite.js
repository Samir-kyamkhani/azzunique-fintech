import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const useTenantWebsite = () =>
  useQuery({
    queryKey: ["website"],
    queryFn: () => apiClient("/website"),
    staleTime: 5 * 60 * 1000,
  });

export const useUpsertTenantWebsite = () =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient("/website", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
