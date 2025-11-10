import { DatabaseClient } from '../client';

export async function up(db: DatabaseClient): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS routes (
      id SERIAL PRIMARY KEY,
      route_id VARCHAR(50) UNIQUE NOT NULL,
      vessel_type VARCHAR(100) NOT NULL,
      fuel_type VARCHAR(50) NOT NULL,
      year INTEGER NOT NULL,
      ghg_intensity DECIMAL(10, 4) NOT NULL,
      fuel_consumption DECIMAL(12, 2) NOT NULL,
      distance DECIMAL(12, 2) NOT NULL,
      total_emissions DECIMAL(12, 2) NOT NULL,
      is_baseline BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_routes_year ON routes(year);
    CREATE INDEX IF NOT EXISTS idx_routes_vessel_type ON routes(vessel_type);
    CREATE INDEX IF NOT EXISTS idx_routes_baseline ON routes(is_baseline);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ship_compliance (
      id SERIAL PRIMARY KEY,
      ship_id VARCHAR(50) NOT NULL,
      year INTEGER NOT NULL,
      cb_gco2eq DECIMAL(15, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ship_id, year)
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_ship_compliance_ship_year ON ship_compliance(ship_id, year);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS bank_entries (
      id SERIAL PRIMARY KEY,
      ship_id VARCHAR(50) NOT NULL,
      year INTEGER NOT NULL,
      amount_gco2eq DECIMAL(15, 2) NOT NULL,
      applied_amount DECIMAL(15, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_bank_entries_ship ON bank_entries(ship_id);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS pools (
      id SERIAL PRIMARY KEY,
      year INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS pool_members (
      id SERIAL PRIMARY KEY,
      pool_id INTEGER NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
      ship_id VARCHAR(50) NOT NULL,
      cb_before DECIMAL(15, 2) NOT NULL,
      cb_after DECIMAL(15, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(pool_id);
  `);

  console.log('Migration 001: Initial schema created successfully');
}

export async function down(db: DatabaseClient): Promise<void> {
  await db.query('DROP TABLE IF EXISTS pool_members CASCADE;');
  await db.query('DROP TABLE IF EXISTS pools CASCADE;');
  await db.query('DROP TABLE IF EXISTS bank_entries CASCADE;');
  await db.query('DROP TABLE IF EXISTS ship_compliance CASCADE;');
  await db.query('DROP TABLE IF EXISTS routes CASCADE;');

  console.log('Migration 001: Rolled back successfully');
}