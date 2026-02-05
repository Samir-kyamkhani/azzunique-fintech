export function permissionChecker(perms, resource, action) {
  if (!perms) return false;

  //  GLOBAL BYPASS
  if (perms.role?.includes?.("*")) return true;
  if (perms.user?.includes?.("*")) return true;

  const all = [
    ...(Array.isArray(perms.role) ? perms.role : []),
    ...(Array.isArray(perms.user) ? perms.user : []),
  ];

  return all.some((p) => {
    if (typeof p === "string") return false; // ignore "*" already handled
    return (
      p.resource === resource &&
      p.action === action &&
      (p.effect ?? "ALLOW") === "ALLOW"
    );
  });
}
