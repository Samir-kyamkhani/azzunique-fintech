import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const useLogin = () =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient("/auth/me"),
    staleTime: 5 * 60 * 1000,
  });

export const useLogout = () =>
  useMutation({
    mutationFn: async () =>
      apiClient("/auth/logout", {
        method: "POST",
        credentials: "include",
      }),
  });
