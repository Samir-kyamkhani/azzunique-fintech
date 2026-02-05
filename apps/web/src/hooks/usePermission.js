import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { buildPermissionMap } from "@/lib/permissions";

export const usePermissions = () =>
  useQuery({
    queryKey: ["permissions"],
    queryFn: () => apiClient("/permissions"),
    retry: false,
  });

export const usePermissionChecker = () => {
  const user = useSelector((s) => s.auth.user);

  const permMap = useMemo(
    () => buildPermissionMap(user?.permissions),
    [user?.permissions],
  );

  console.log(user);

  const can = (resource, action) => {
    if (!user) return false;
    if (
      user.permissions?.role.includes("*") ||
      user.permissions?.user.includes("*")
    )
      return true;
    return permMap.get(`${resource}.${action}`) === true;
  };

  return { can };
};
