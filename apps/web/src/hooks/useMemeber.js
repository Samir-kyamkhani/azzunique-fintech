import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= CREATE USER ================= */
export const useCreateMember = () =>
  useMutation({
    mutationFn: async (formData) =>
      apiClient("/members", {
        method: "POST",
        body: JSON.stringify(formData),
      }),
  });

/* ================= UPDATE USER ================= */
export const useMemberUpdate = () =>
  useMutation({
    mutationFn: async ({ id, payload }) =>
      apiClient(`/users/${id}`, {
        method: "PUT",
        body: payload, // FormData (because multer upload)
      }),
  });

/* ================= GET USER BY ID ================= */
export const useMemberById = (userId) =>
  useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient(`/users/${userId}`),
    enabled: !!userId,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

/* ================= LIST USERS ================= */
export const useMembers = ({ page, limit, search, status }) =>
  useQuery({
    queryKey: ["members", page, limit, search, status],
    queryFn: () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (search) params.append("search", search);
      if (status) params.append("status", status);

      return apiClient(`/members?${params.toString()}`);
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

/* ================= GET USER DESCENDANTS ================= */
export const useMemberDescendants = (userId) =>
  useQuery({
    queryKey: ["user-descendants", userId],
    queryFn: () => apiClient(`/users/${userId}/descendants`),
    enabled: !!userId,
    retry: false,
  });

/* ================= ASSIGN PERMISSIONS ================= */
export const useAssignMemberPermissions = () =>
  useMutation({
    mutationFn: async ({ id, permissions }) =>
      apiClient(`/users/${id}/permissions`, {
        method: "POST",
        body: JSON.stringify({ permissions }),
      }),
  });
