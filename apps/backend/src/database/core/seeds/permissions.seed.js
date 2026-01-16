import { db } from '../core-db.js';
import { PermissionsRegistry } from '../../../lib/PermissionsRegistry.js';
import { permissionTable } from '../../../models/core/permission.schema.js';

export async function seedPermissions() {
  const permissions = [];

  for (const resource in PermissionsRegistry) {
    for (const action in PermissionsRegistry[resource]) {
      permissions.push({
        resource,
        action,
      });
    }
  }

  for (const p of permissions) {
    await db
      .insert(permissionTable)
      .values(p)
      .onDuplicateKeyUpdate({
        set: {
          isActive: true,
        },
      });
  }
}
