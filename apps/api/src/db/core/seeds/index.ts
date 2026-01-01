import { CoreDbService } from '../drizzle';
import { seedTenants } from './tenants.seed';
// import { seedUsers } from './users.seed';

async function run() {
  const db = new CoreDbService();

  console.log('🌱 Seeding started...\n');

  try {
    console.log('➡️ Seeding tenants...');
    await seedTenants(db);
    console.log(`✅ Tenants seeded successfully`);

    // console.log('➡️ Seeding users...');
    // await seedUsers(db);
    // console.log('✅ Users seeded successfully\n');

    console.log('🎉 All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed');
    console.error(error);
    process.exit(1);
  }
}

run();
