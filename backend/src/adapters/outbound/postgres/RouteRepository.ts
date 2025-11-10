import { IRouteRepository } from '../../../core/ports/IRouteRepository';
import { Route, RouteEntity } from '../../../core/domain/Route';
import { DatabaseClient } from '../../../infrastructure/db/client';

export class RouteRepository implements IRouteRepository {
  constructor(private db: DatabaseClient) {}

  async findAll(): Promise<RouteEntity[]> {
    const result = await this.db.query<Route>(
      'SELECT * FROM routes ORDER BY year, id'
    );
    return result.rows.map((row) => RouteEntity.fromPersistence(this.mapRow(row)));
  }

  async findById(id: number): Promise<RouteEntity | null> {
    const result = await this.db.query<Route>(
      'SELECT * FROM routes WHERE id = $1',
      [id]
    );
    return result.rows[0]
      ? RouteEntity.fromPersistence(this.mapRow(result.rows[0]))
      : null;
  }

  async findByRouteId(routeId: string): Promise<RouteEntity | null> {
    const result = await this.db.query<Route>(
      'SELECT * FROM routes WHERE route_id = $1',
      [routeId]
    );
    return result.rows[0]
      ? RouteEntity.fromPersistence(this.mapRow(result.rows[0]))
      : null;
  }

  async findBaseline(): Promise<RouteEntity | null> {
    const result = await this.db.query<Route>(
      'SELECT * FROM routes WHERE is_baseline = true LIMIT 1'
    );
    return result.rows[0]
      ? RouteEntity.fromPersistence(this.mapRow(result.rows[0]))
      : null;
  }

  async create(route: Omit<Route, 'id'>): Promise<RouteEntity> {
    const result = await this.db.query<Route>(
      `INSERT INTO routes (
        route_id, vessel_type, fuel_type, year,
        ghg_intensity, fuel_consumption, distance,
        total_emissions, is_baseline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        route.routeId,
        route.vesselType,
        route.fuelType,
        route.year,
        route.ghgIntensity,
        route.fuelConsumption,
        route.distance,
        route.totalEmissions,
        route.isBaseline,
      ]
    );
    return RouteEntity.fromPersistence(this.mapRow(result.rows[0]));
  }

  async update(
    id: number,
    route: Partial<Route>
  ): Promise<RouteEntity | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(route).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        fields.push(`${this.toSnakeCase(key)} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await this.db.query<Route>(
      `UPDATE routes SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0]
      ? RouteEntity.fromPersistence(this.mapRow(result.rows[0]))
      : null;
  }

  async setBaseline(id: number): Promise<void> {
    await this.db.transaction(async (client) => {
      await client.query('UPDATE routes SET is_baseline = false');
      await client.query('UPDATE routes SET is_baseline = true WHERE id = $1', [
        id,
      ]);
    });
  }

  async findByFilters(filters: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<RouteEntity[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.vesselType) {
      conditions.push(`vessel_type = $${paramIndex}`);
      values.push(filters.vesselType);
      paramIndex++;
    }

    if (filters.fuelType) {
      conditions.push(`fuel_type = $${paramIndex}`);
      values.push(filters.fuelType);
      paramIndex++;
    }

    if (filters.year) {
      conditions.push(`year = $${paramIndex}`);
      values.push(filters.year);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await this.db.query<Route>(
      `SELECT * FROM routes ${whereClause} ORDER BY year, id`,
      values
    );

    return result.rows.map((row) => RouteEntity.fromPersistence(this.mapRow(row)));
  }

  private mapRow(row: any): Route {
    return {
      id: row.id,
      routeId: row.route_id,
      vesselType: row.vessel_type,
      fuelType: row.fuel_type,
      year: row.year,
      ghgIntensity: Number(row.ghg_intensity),
      fuelConsumption: Number(row.fuel_consumption),
      distance: Number(row.distance),
      totalEmissions: Number(row.total_emissions),
      isBaseline: row.is_baseline,
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}