import { usePermissionChecker } from "@/hooks/usePermission";

export default function Guard({ resource, action, children }) {
  const { can } = usePermissionChecker();
  if (!can(resource, action)) return null;
  return children;
}
