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

export const useLogout = () =>
  useMutation({
    mutationFn: async () =>
      apiClient("/auth/logout", {
        method: "POST",
        credentials: "include",
      }),
  });
