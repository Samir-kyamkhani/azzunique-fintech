import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const useSetUserCommission = () =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient("/commission/user", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useSetRoleCommission = () =>
  useMutation({
    mutationFn: async (payload) =>
      apiClient("/commission/role", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });

export const useCommissionList = ({
  type,
  page = 1,
  limit = 10,
  search = "",
  isActive,
}) =>
  useQuery({
    queryKey: ["commission-list", type, page, limit, search, isActive],
    queryFn: () =>
      apiClient(
        `/commission?type=${type || "ALL"}&page=${page}&limit=${limit}&search=${search}${
          isActive !== undefined ? `&isActive=${isActive}` : ""
        }`,
      ),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
