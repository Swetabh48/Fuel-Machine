import { IComplianceRepository } from '../../../core/ports/IComplianceRepository';
import {
  ShipCompliance,
  ComplianceEntity,
} from '../../../core/domain/Compliance';
import { DatabaseClient } from '../../../infrastructure/db/client';

export class ComplianceRepository implements IComplianceRepository {
  constructor(private db: DatabaseClient) {}

  async findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<ComplianceEntity | null> {
    const result = await this.db.query<any>(
      'SELECT * FROM ship_compliance WHERE ship_id = $1 AND year = $2',
      [shipId, year]
    );
    return result.rows[0]
      ? ComplianceEntity.fromPersistence(this.mapRow(result.rows[0]))
      : null;
  }

  async create(
    compliance: Omit<ShipCompliance, 'id' | 'createdAt'>
  ): Promise<ComplianceEntity> {
    const result = await this.db.query<any>(
      `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [compliance.shipId, compliance.year, compliance.cbGco2eq]
    );
    return ComplianceEntity.fromPersistence(this.mapRow(result.rows[0]));
  }

  async update(
    id: number,
    compliance: Partial<ShipCompliance>
  ): Promise<ComplianceEntity | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (compliance.cbGco2eq !== undefined) {
      fields.push(`cb_gco2eq = $${paramIndex}`);
      values.push(compliance.cbGco2eq);
      paramIndex++;
    }

    if (fields.length === 0) {
      const existing = await this.db.query<any>(
        'SELECT * FROM ship_compliance WHERE id = $1',
        [id]
      );
      return existing.rows[0]
        ? ComplianceEntity.fromPersistence(this.mapRow(existing.rows[0]))
        : null;
    }

    values.push(id);
    const result = await this.db.query<any>(
      `UPDATE ship_compliance SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0]
      ? ComplianceEntity.fromPersistence(this.mapRow(result.rows[0]))
      : null;
  }

  async findAll(): Promise<ComplianceEntity[]> {
    const result = await this.db.query<any>(
      'SELECT * FROM ship_compliance ORDER BY year, ship_id'
    );
    return result.rows.map((row) =>
      ComplianceEntity.fromPersistence(this.mapRow(row))
    );
  }

  private mapRow(row: any): ShipCompliance {
    return {
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      cbGco2eq: Number(row.cb_gco2eq),
      createdAt: new Date(row.created_at),
    };
  }
}