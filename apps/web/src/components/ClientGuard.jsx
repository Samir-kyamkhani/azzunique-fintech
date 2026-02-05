"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { canServer } from "@/lib/serverPermission";

export default function ClientGuard({ anyOf, children }) {
  const perms = useSelector((s) => s.auth.user?.permissions);
  const router = useRouter();

  const allowed = anyOf.some((p) => canServer(perms, p.resource, p.action));

  useEffect(() => {
    if (perms && !allowed) {
      router.replace("/dashboard");
    }
  }, [allowed, perms, router]);

  if (!perms) return null; // loading state

  return allowed ? children : null;
}
