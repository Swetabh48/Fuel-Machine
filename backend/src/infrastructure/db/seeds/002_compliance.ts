import { DatabaseClient } from '../client';

export async function seed(db: DatabaseClient): Promise<void> {
  // Target intensity for 2024-2025
  const TARGET_INTENSITY_2024 = 91.5;
  const TARGET_INTENSITY_2025 = 89.3368;
  const ENERGY_PER_TON_MJ = 41000;

  const complianceData = [
    // 2024 Data
    {
      shipId: 'R001',
      year: 2024,
      routeData: {
        ghgIntensity: 91.0,
        fuelConsumption: 5000,
      },
    },
    {
      shipId: 'R002',
      year: 2024,
      routeData: {
        ghgIntensity: 88.0,
        fuelConsumption: 4800,
      },
    },
    {
      shipId: 'R003',
      year: 2024,
      routeData: {
        ghgIntensity: 93.5,
        fuelConsumption: 5100,
      },
    },
    // 2025 Data
    {
      shipId: 'R001',
      year: 2025,
      routeData: {
        ghgIntensity: 90.5,
        fuelConsumption: 4950,
      },
    },
    {
      shipId: 'R002',
      year: 2025,
      routeData: {
        ghgIntensity: 87.5,
        fuelConsumption: 4750,
      },
    },
    {
      shipId: 'R003',
      year: 2025,
      routeData: {
        ghgIntensity: 92.0,
        fuelConsumption: 5050,
      },
    },
    {
      shipId: 'R004',
      year: 2025,
      routeData: {
        ghgIntensity: 89.2,
        fuelConsumption: 4900,
      },
    },
    {
      shipId: 'R005',
      year: 2025,
      routeData: {
        ghgIntensity: 88.8,
        fuelConsumption: 4850,
      },
    },
  ];

  for (const data of complianceData) {
    const targetIntensity = data.year === 2024 ? TARGET_INTENSITY_2024 : TARGET_INTENSITY_2025;
    const energyInScope = data.routeData.fuelConsumption * ENERGY_PER_TON_MJ;
    const cbMJ = (targetIntensity - data.routeData.ghgIntensity) * energyInScope;
    const cbGco2eq = cbMJ / 1_000_000; // Convert to tCO2eq

    await db.query(
      `
      INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
      VALUES ($1, $2, $3)
      ON CONFLICT (ship_id, year) DO UPDATE
      SET cb_gco2eq = EXCLUDED.cb_gco2eq
    `,
      [data.shipId, data.year, cbGco2eq]
    );
  }

  console.log('Seed 002: Compliance data seeded successfully');
}