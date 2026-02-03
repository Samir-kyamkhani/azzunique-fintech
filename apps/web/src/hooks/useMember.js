import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= GET ALL ================= */
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

/* ================= GET BY ID ================= */
export const useMemberById = (id) =>
  useQuery({
    queryKey: ["member", id],
    queryFn: () => apiClient(`/members/${id}`),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

/* ================= CREATE ================= */
export const useCreateMember = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/members", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

/* ================= UPDATE ================= */
export const useUpdateMember = () =>
  useMutation({
    mutationFn: ({ id, payload }) =>
      apiClient(`/members/${id}`, {
        method: "PUT",
        body: payload, // FormData
      }),
  });

/* ================= ASSIGN PERMISSIONS ================= */
export const useAssignMemberPermissions = () =>
  useMutation({
    mutationFn: ({ memberId, payload }) =>
      apiClient(`/members/${memberId}/permissions`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
