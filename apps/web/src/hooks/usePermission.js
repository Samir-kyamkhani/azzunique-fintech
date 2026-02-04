import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useSelector } from "react-redux";
import { can, hasFullAccess } from "@/lib/permissions";

export const usePermissions = () =>
  useQuery({
    queryKey: ["permissions"],
    queryFn: () => apiClient("/permissions"),
    retry: false,
  });

export const usePermissionChecker = () => {
  const perms = useSelector((s) => s.auth.user?.permissions);

  return {
    can: (res, act) => can(perms, res, act),
    isAdmin: hasFullAccess(perms),
  };
};
