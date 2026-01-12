import { randomUUID } from 'node:crypto';
import { db } from '../core-db.js';
import { usersTable } from '../../../models/core/user.schema.js';
import { encrypt, generateNumber } from '../../../lib/lib.js';
import { eq } from 'drizzle-orm';
import { roleTable } from '../../../models/core/role.schema.js';

export async function seedUsers(tenantId) {
  const email = 'azzunique.com@gmail.com';

  // Check if user exists
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingUser.length > 0) {
    console.log(`User ${email} already exists, skipping seed.`);
    return existingUser[0].id;
  }

  // Fetch default role
  const defaultRole = await db
    .select()
    .from(roleTable)
    .where(eq(roleTable.roleCode, 'AZZUNIQUE')) // ya jo bhi default role ho
    .limit(1);

  if (defaultRole.length === 0) {
    throw new Error('Default role "AZZUNIQUE" not found. Please seed roles first.');
  }

  const roleId = defaultRole[0].id;

  const userId = randomUUID();

  await db.insert(usersTable).values({
    id: userId,
    userNumber: generateNumber('USR'),
    firstName: 'Azzunique',
    lastName: 'User',
    email,
    emailVerifiedAt: new Date(),
    mobileNumber: '9999999999',
    profilePicture: null,
    passwordHash: encrypt('admin@123'),
    transactionPinHash: null,
    userStatus: 'ACTIVE',
    isKycVerified: true,
    roleId, // <- ab guaranteed hai
    refreshTokenHash: null,
    passwordResetTokenHash: null,
    passwordResetTokenExpiry: null,
    actionReason: null,
    actionedAt: null,
    deletedAt: null,
    parentId: null,
    createdByEmployeeId: null,
    tenantId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`User ${email} created successfully.`);
  return userId;
}
