import { db } from '../core-db.js';
import { PermissionsRegistry } from '../../../lib/PermissionsRegistry.js';
import { permissionTable } from '../../../models/core/permission.schema.js';

function extractPermissions(obj) {
  let permissions = [];

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'string') {
      const parts = value.split('.');
      const action = parts.pop(); // last segment
      const resource = parts.join('.'); // everything before action

      permissions.push({
        resource,
        action,
      });
    } else if (typeof value === 'object' && value !== null) {
      permissions = permissions.concat(extractPermissions(value));
    }
  }

  return permissions;
}

export async function seedPermissions() {
  const permissions = extractPermissions(PermissionsRegistry);

  await db
    .insert(permissionTable)
    .values(
      permissions.map((p) => ({
        resource: p.resource,
        action: p.action,
        isActive: true,
      })),
    )
    .onDuplicateKeyUpdate({
      set: {
        isActive: true,
      },
    });

  console.log(`Seeded ${permissions.length} permissions`);
}
