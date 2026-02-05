"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissionChecker } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/permissionKeys";

export default function Page() {
  const router = useRouter();
  const { can } = usePermissionChecker();

  useEffect(() => {
    if (
      can(PERMISSIONS.WEBSITE.READ.resource, PERMISSIONS.WEBSITE.READ.action) ||
      can(
        PERMISSIONS.SOCIAL_MEDIA.READ.resource,
        PERMISSIONS.SOCIAL_MEDIA.READ.action,
      )
    ) {
      router.replace("/dashboard/settings/general");
      return;
    }

    if (can(PERMISSIONS.SERVER.READ.resource, PERMISSIONS.SERVER.READ.action)) {
      router.replace("/dashboard/settings/server");
      return;
    }

    if (can(PERMISSIONS.DOMAIN.READ.resource, PERMISSIONS.DOMAIN.READ.action)) {
      router.replace("/dashboard/settings/domain");
      return;
    }

    if (can(PERMISSIONS.SMTP.READ.resource, PERMISSIONS.SMTP.READ.action)) {
      router.replace("/dashboard/settings/smtp");
      return;
    }

    router.replace("/dashboard");
  }, [can, router]);

  return null;
}
