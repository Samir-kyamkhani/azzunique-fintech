import { seedPermissions } from './permissions.seed.js';
import { seedRoles } from './role.seed.js';
import { seedTenants } from './tenants.seed.js';
import { seedUsers } from './user.seed.js';

async function run() {
  console.log('🌱 Seeding started...\n');

  try {
    console.log('➡️ Seeding tenants...');
    const tenantId = await seedTenants();
    console.log(`✅ Tenants seeded successfully`);

    console.log('➡️ Seeding roles...');
    await seedRoles(tenantId);
    console.log('✅ Roles seeded successfully\n');

    console.log('➡️ Seeding users...');
    await seedUsers(tenantId);
    console.log('✅ Users seeded successfully\n');

    console.log('➡️ Seeding permissions...');
    await seedPermissions();
    console.log('✅ Permissions seeded successfully\n');

    console.log('🎉 All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed');
    console.error(error);
    process.exit(1);
  }
}

run();
