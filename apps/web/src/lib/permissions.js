export const buildPermissionMap = (permissions) => {
  const map = new Map();

  permissions?.role?.forEach((p) =>
    map.set(`${p.resource}.${p.action}`, p.effect === "ALLOW"),
  );

  permissions?.user?.forEach((p) =>
    map.set(`${p.resource}.${p.action}`, p.effect === "ALLOW"),
  );

  return map;
};
