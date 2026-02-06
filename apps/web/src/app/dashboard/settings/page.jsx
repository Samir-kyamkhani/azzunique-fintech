"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { permissionChecker } from "@/lib/permissionCheker";

export default function Page() {
  const router = useRouter();
  const perms = useSelector((s) => s.auth.user?.permissions);

  useEffect(() => {
    if (!perms) return;

    const routes = [
      { path: "general", perm: PERMISSIONS.WEBSITE.READ },
      { path: "server", perm: PERMISSIONS.SERVER.READ },
      { path: "domain", perm: PERMISSIONS.DOMAIN.READ },
      { path: "smtp", perm: PERMISSIONS.SMTP.READ },
    ];

    const allowed = routes.find((r) =>
      permissionChecker(perms, r.perm.resource, r.perm.action),
    );

    router.replace(
      allowed ? `/dashboard/settings/${allowed.path}` : "/dashboard",
    );
  }, [perms, router]);

  return null;
}
