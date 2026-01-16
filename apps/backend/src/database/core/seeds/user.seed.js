import { randomUUID } from 'node:crypto';
import { db } from '../core-db.js';
import { usersTable } from '../../../models/core/user.schema.js';
import { walletTable } from '../../../models/core/wallet.schema.js';
import { encrypt, generateNumber } from '../../../lib/lib.js';
import { eq, and } from 'drizzle-orm';
import { roleTable } from '../../../models/core/role.schema.js';

export async function seedUsers(tenantId) {
  const email = 'azzunique.com@gmail.com';

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.email, email), eq(usersTable.tenantId, tenantId)))
    .limit(1);

  if (existingUser) {
    console.log(`⚠️ User ${email} already exists`);
    return existingUser.id;
  }

  const [role] = await db
    .select()
    .from(roleTable)
    .where(
      and(
        eq(roleTable.roleCode, 'AZZUNIQUE'),
        eq(roleTable.tenantId, tenantId),
      ),
    )
    .limit(1);

  if (!role) {
    throw new Error('AZZUNIQUE role not found. Seed roles first.');
  }

  const userId = randomUUID();

  await db.insert(usersTable).values({
    id: userId,
    userNumber: generateNumber('USR'),
    firstName: 'Azzunique',
    lastName: 'Admin',
    email,
    emailVerifiedAt: new Date(),
    mobileNumber: '9999999999',
    passwordHash: encrypt('admin@123'),
    transactionPinHash: null,

    userStatus: 'ACTIVE',
    isKycVerified: true,

    roleId: role.id,
    tenantId,

    ownerUserId: null, // 🔥 tenant owner
    createdByUserId: null,
    createdByEmployeeId: null,

    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 🔐 CREATE DEFAULT WALLETS FOR AZZUNIQUE
  const wallets = ['MAIN', 'COMMISSION', 'SETTLEMENT', 'SECURITY'];

  for (const walletType of wallets) {
    await db.insert(walletTable).values({
      id: randomUUID(),
      tenantId,
      ownerType: 'USER',
      ownerId: userId,
      walletType,
      balance: 0,
      blockedAmount: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log('✅ AZZUNIQUE user + wallets seeded');
  return userId;
}
