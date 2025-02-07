import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Load environment variables from multiple possible locations
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
  config({ path: '.env' });
}

const runMigrate = async () => {
  console.log('Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PWD:', process.cwd());
  
  if (!process.env.POSTGRES_URL) {
    console.error('Environment variables loaded:', Object.keys(process.env).join(', '));
    throw new Error('POSTGRES_URL is not defined');
  }

  console.log('Attempting to connect to database...');
  
  try {
    const connection = postgres(process.env.POSTGRES_URL, { 
      max: 1,
      connect_timeout: 30,
      idle_timeout: 30,
      ssl: process.env.NODE_ENV === 'production'
    });

    // Test the connection
    await connection`SELECT 1`;
    console.log('✅ Database connection successful');

    const db = drizzle(connection);

    console.log('⏳ Running migrations...');
    console.log('Migrations folder:', './lib/db/migrations');

    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();

    console.log('✅ Migrations completed in', end - start, 'ms');
    await connection.end();
    return true;
  } catch (error: any) {
    console.error('❌ Database error:');
    console.error('Error name:', error?.name || 'Unknown error');
    console.error('Error message:', error?.message || 'No error message');
    console.error('Error stack:', error?.stack || 'No stack trace');
    throw error;
  }
};

runMigrate()
  .then((success) => {
    if (success) {
      console.log('Migration completed successfully');
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('❌ Migration failed');
    console.error(err);
    process.exit(1);
  });
