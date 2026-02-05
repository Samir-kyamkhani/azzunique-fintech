"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { PERMISSIONS } from "@/lib/permissionKeys";
import { canServer } from "@/lib/permissionCheker";
import TenantsClient from "@/components/client/TenantsClient";

export default function Page() {
  const router = useRouter();
  const perms = useSelector((s) => s.auth.user?.permissions);

  useEffect(() => {
    if (!perms) return;

    const allowed = canServer(
      perms,
      PERMISSIONS.TENANT.READ.resource,
      PERMISSIONS.TENANT.READ.action,
    );

    if (!allowed) router.replace("/dashboard");
  }, [perms, router]);

  if (!perms) return null;

  return <TenantsClient />;
}
