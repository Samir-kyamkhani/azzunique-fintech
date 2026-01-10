import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= UPSERT ================= */
export const useUpsertServerDetail = () =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient("/server-detail", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

/* ================= GET (SINGLE) ================= */
export const useServerDetail = () =>
  useQuery({
    queryKey: ["server-detail"],
    queryFn: () => apiClient("/server-detail"),
    staleTime: 5 * 60 * 1000,
  });

export const useServerDetails = () =>
  useQuery({
    queryKey: ["server-detail"],
    queryFn: () => apiClient("/server-detail/list"),
    staleTime: 5 * 60 * 1000,
  });
