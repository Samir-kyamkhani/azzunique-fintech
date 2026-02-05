"use client";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { canServer } from "@/lib/permissionCheker";

export default function ClientGuard({ anyOf, redirectMap, children }) {
  const perms = useSelector((s) => s.auth.user?.permissions);
  const router = useRouter();
  const pathname = usePathname();

  const allowed = anyOf.some((p) => canServer(perms, p.resource, p.action));

  useEffect(() => {
    if (!perms) return;

    // ❌ page not allowed
    if (!allowed) {
      router.replace("/dashboard");
      return;
    }

    // 🔁 handle default child redirect
    if (redirectMap) {
      const current = pathname.split("/").pop();
      const found = redirectMap.find((r) =>
        canServer(perms, r.perm.resource, r.perm.action),
      );

      if (found && current !== found.path) {
        router.replace(found.path);
      }
    }
  }, [allowed, perms, pathname, redirectMap, router]);

  if (!perms) return null;
  return allowed ? children : null;
}
