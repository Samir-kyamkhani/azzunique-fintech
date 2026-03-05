import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export const useSetCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      return apiClient("/commission", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    onSuccess: () => {
      // refresh commission list after create/update
      queryClient.invalidateQueries({
        queryKey: ["commission-list"],
      });
    },
  });
};

export const useCommissionList = (params = {}) => {
  const { page = 1, limit = 10, scope, isActive } = params;

  const searchParams = new URLSearchParams();

  searchParams.append("page", page);
  searchParams.append("limit", limit);

  if (scope) {
    searchParams.append("scope", scope);
  }

  if (isActive !== undefined) {
    searchParams.append("isActive", String(isActive));
  }

  return useQuery({
    queryKey: ["commission-list", page, limit, scope, isActive],

    queryFn: async () => {
      return apiClient(`/commission?${searchParams.toString()}`);
    },

    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
  });
};
