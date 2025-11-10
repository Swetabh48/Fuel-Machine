import { IBankingRepository } from '../../../core/ports/IBankingRepository';
import { BankEntry, BankingEntity } from '../../../core/domain/Banking';
import { DatabaseClient } from '../../../infrastructure/db/client';

export class BankingRepository implements IBankingRepository {
  constructor(private db: DatabaseClient) {}

  async findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<BankingEntity | null> {
    const result = await this.db.query<any>(
      'SELECT * FROM bank_entries WHERE ship_id = $1 AND year = $2',
      [shipId, year]
    );
    return result.rows[0]
      ? BankingEntity.fromPersistence(this.mapRow(result.rows[0]))
      : null;
  }

  async findAvailableByShip(shipId: string): Promise<BankingEntity[]> {
    const result = await this.db.query<any>(
      `SELECT * FROM bank_entries 
       WHERE ship_id = $1 AND amount_gco2eq > applied_amount
       ORDER BY created_at ASC`,
      [shipId]
    );
    return result.rows.map((row) =>
      BankingEntity.fromPersistence(this.mapRow(row))
    );
  }

  async create(
    entry: Omit<BankEntry, 'id' | 'createdAt'>
  ): Promise<BankingEntity> {
    const result = await this.db.query<any>(
      `INSERT INTO bank_entries (ship_id, year, amount_gco2eq, applied_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [entry.shipId, entry.year, entry.amountGco2eq, entry.appliedAmount]
    );
    return BankingEntity.fromPersistence(this.mapRow(result.rows[0]));
  }

  async update(
    id: number,
    entry: Partial<BankEntry>
  ): Promise<BankingEntity | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (entry.appliedAmount !== undefined) {
      fields.push(`applied_amount = $${paramIndex}`);
      values.push(entry.appliedAmount);
      paramIndex++;
    }

    if (entry.amountGco2eq !== undefined) {
      fields.push(`amount_gco2eq = $${paramIndex}`);
      values.push(entry.amountGco2eq);
      paramIndex++;
    }

    if (fields.length === 0) {
      const existing = await this.db.query<any>(
        'SELECT * FROM bank_entries WHERE id = $1',
        [id]
      );
      return existing.rows[0]
        ? BankingEntity.fromPersistence(this.mapRow(existing.rows[0]))
        : null;
    }

    values.push(id);
    const result = await this.db.query<any>(
      `UPDATE bank_entries SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0]
      ? BankingEntity.fromPersistence(this.mapRow(result.rows[0]))
      : null;
  }

  async getTotalAvailable(shipId: string): Promise<number> {
    const result = await this.db.query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_gco2eq - applied_amount), 0) as total
       FROM bank_entries
       WHERE ship_id = $1`,
      [shipId]
    );
    return Number(result.rows[0].total);
  }

  private mapRow(row: any): BankEntry {
    return {
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      amountGco2eq: Number(row.amount_gco2eq),
      appliedAmount: Number(row.applied_amount),
      createdAt: new Date(row.created_at),
    };
  }
}