import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* GET MEMBERS */
export const useGetMembers = ({ page, limit, search, status }) =>
  useQuery({
    queryKey: ["members", page, limit, search, status],
    queryFn: () =>
      apiClient(
        `/members?page=${page}&limit=${limit}${
          search ? `&search=${search}` : ""
        }${status && status !== "all" ? `&status=${status.toUpperCase()}` : ""}`
      ),
    keepPreviousData: true, // 🔥 important for pagination UX
  });

/* GET MEMBER BY ID */
export const useGetMemberById = (id) =>
  useQuery({
    queryKey: ["member", id],
    queryFn: () => apiClient(`/members/${id}`),
    enabled: !!id,
  });

/* CREATE MEMBER */
export const useCreateMember = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/members", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

/* UPDATE MEMBER */
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

/* GET DESCENDANTS */
export const useGetMemberDescendants = (id) =>
  useQuery({
    queryKey: ["member-descendants", id],
    queryFn: () => apiClient(`/members/${id}/descendants`),
    enabled: !!id,
  });
