import { useMutation, useQuery } from "@tanstack/react-query";
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
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    retry: false, // 🔥 important
    onError: () => {
      store.dispatch(logout()); // 🔥 sync redux
    },
  });

export const useLogout = () =>
  useMutation({
    mutationFn: async () =>
      apiClient("/auth/logout", {
        method: "POST",
        credentials: "include",
      }),
  });
