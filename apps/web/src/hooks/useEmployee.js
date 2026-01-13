import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/* ================= GET ALL ================= */
export const useEmployees = ({ page, limit, search, status }) =>
  useQuery({
    queryKey: ["employees", page= 1, limit, search, status],
    queryFn: () =>
      apiClient(
        `/employees?page=${page}&limit=${limit}&search=${search}&status=${status}`
      ),
    keepPreviousData: true,
  });

/* ================= GET BY ID ================= */
export const useEmployeeById = (id) =>
  useQuery({
    queryKey: ["employee", id],
    queryFn: () => apiClient(`/employees/${id}`),
    enabled: !!id,
  });

/* ================= CREATE ================= */
export const useCreateEmployee = () =>
  useMutation({
    mutationFn: (payload) =>
      apiClient("/employees", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

/* ================= UPDATE ================= */
export const useUpdateEmployee = () =>
  useMutation({
    mutationFn: ({ id, payload }) =>
      apiClient(`/employees/${id}`, {
        method: "PUT",
        body: payload instanceof FormData ? payload : JSON.stringify(payload),
      }),
  });

/* ================= DELETE ================= */
export const useDeleteEmployee = () =>
  useMutation({
    mutationFn: (id) =>
      apiClient(`/employees/${id}`, {
        method: "DELETE",
      }),
  });
