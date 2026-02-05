"use client";

import { usePermissionChecker } from "@/hooks/usePermission";

export default function Guard({
  permission,
  anyOf,
  children,
  fallback = null,
}) {
  const { can } = usePermissionChecker();

  // single permission
  if (permission) {
    const allowed = can(permission.resource, permission.action);
    if (!allowed) return fallback;
  }

  // group permissions (OR logic)
  if (anyOf) {
    const allowed = anyOf.some((p) => can(p.resource, p.action));
    if (!allowed) return fallback;
  }

  return children;
}
