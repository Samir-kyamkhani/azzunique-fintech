import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= GET ROLES ================= */
export const useRoles = () =>
  useQuery({
    queryKey: ["roles"],
    queryFn: () => apiClient("/roles"),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
