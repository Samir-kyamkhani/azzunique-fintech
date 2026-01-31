import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const useGetMembers = ({ page, limit, search, status }) =>
  useQuery({
    queryKey: ["members", page, limit, search, status],
    queryFn: () =>
      apiClient(
        `/members?page=${page}&limit=${limit}${
          search ? `&search=${search}` : ""
        }${status && status !== "all" ? `&status=${status}` : ""}`,
      ),
    keepPreviousData: true,
  });

export const useGetMemberById = (id) =>
  useQuery({
    queryKey: ["member", id],
    queryFn: () => apiClient(`/members/${id}`),
    enabled: !!id,
  });

export const useCreateMember = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/members", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useUpdateMember = () =>
  useMutation({
    mutationFn: ({ id, data }) => {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      return apiClient(`/members/${id}`, {
        method: "PUT",
        body: formData,
      });
    },
  });

export const useGetMemberDescendants = (id, query = {}) =>
  useQuery({
    queryKey: ["member-descendants", id, query],
    queryFn: () =>
      apiClient(
        `/members/${id}/descendants?page=${query.page ?? 1}&limit=${
          query.limit ?? 20
        }`,
      ),
    enabled: !!id,
  });

export const useAssignMemberPermissions = () =>
  useMutation({
    mutationFn: ({ id, permissions }) =>
      apiClient(`/members/${id}/permissions`, {
        method: "POST",
        body: JSON.stringify({ permissions }),
      }),
  });
