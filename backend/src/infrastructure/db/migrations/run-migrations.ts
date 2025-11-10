import { db } from '../client';
import * as migration001 from './001_initial_schema';

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    await migration001.up(db);
    
    console.log('All migrations completed successfully');
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await db.close();
    process.exit(1);
  }
}

runMigrations();