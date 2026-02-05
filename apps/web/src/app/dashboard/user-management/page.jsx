"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { canServer } from "@/lib/serverPermission";

export default function Page() {
  const router = useRouter();
  const perms = useSelector((s) => s.auth.user?.permissions);

  useEffect(() => {
    if (!perms) return;

    const routes = [
      { path: "users", perm: PERMISSIONS.USER.READ },
      { path: "roles", perm: PERMISSIONS.ROLE.READ },
    ];

    const allowed = routes.find((r) =>
      canServer(perms, r.perm.resource, r.perm.action),
    );

    router.replace(
      allowed ? `/dashboard/user-management/${allowed.path}` : "/dashboard",
    );
  }, [perms, router]);

  return null;
}
