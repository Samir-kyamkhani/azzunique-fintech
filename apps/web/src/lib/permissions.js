export const hasFullAccess = (perms) => {
  if (!perms) return false;
  return perms === "*" || perms?.role?.includes("*");
};

export const can = (perms, resource, action) => {
  if (!perms) return false;
  if (hasFullAccess(perms)) return true;

  const key = `${resource}.${action}`;

  const roleAllowed = perms.role?.some(
    (p) => `${p.resource}.${p.action}` === key,
  );

  const userOverride = perms.user?.find(
    (p) => `${p.resource}.${p.action}` === key,
  );

  if (userOverride) return userOverride.effect === "ALLOW";

  return roleAllowed;
};
