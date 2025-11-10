import { db } from '../client';
import * as seed001 from './001_routes';

async function runSeeds() {
  try {
    console.log('Starting database seeding...');
    
    await seed001.seed(db);
    
    console.log('All seeds completed successfully');
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await db.close();
    process.exit(1);
  }
}

runSeeds();