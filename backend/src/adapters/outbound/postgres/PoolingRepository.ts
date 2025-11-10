import { IPoolingRepository } from '../../../core/ports/IPoolingRepository';
import { Pool, PoolMember, PoolEntity } from '../../../core/domain/Pooling';
import { DatabaseClient } from '../../../infrastructure/db/client';

export class PoolingRepository implements IPoolingRepository {
  constructor(private db: DatabaseClient) {}

  async createPool(pool: Omit<Pool, 'id' | 'createdAt'>): Promise<PoolEntity> {
    const result = await this.db.query<any>(
      'INSERT INTO pools (year) VALUES ($1) RETURNING *',
      [pool.year]
    );
    const poolData = this.mapPoolRow(result.rows[0]);
    return PoolEntity.fromPersistence(poolData, []);
  }

  async addPoolMembers(members: Omit<PoolMember, 'id'>[]): Promise<void> {
    for (const member of members) {
      await this.db.query(
        `INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after)
         VALUES ($1, $2, $3, $4)`,
        [member.poolId, member.shipId, member.cbBefore, member.cbAfter]
      );
    }
  }

  async findPoolById(id: number): Promise<PoolEntity | null> {
    const poolResult = await this.db.query<any>(
      'SELECT * FROM pools WHERE id = $1',
      [id]
    );

    if (!poolResult.rows[0]) return null;

    const members = await this.findMembersByPoolId(id);
    const pool = this.mapPoolRow(poolResult.rows[0]);
    return PoolEntity.fromPersistence(pool, members);
  }

  async findPoolsByYear(year: number): Promise<PoolEntity[]> {
    const poolsResult = await this.db.query<any>(
      'SELECT * FROM pools WHERE year = $1 ORDER BY created_at DESC',
      [year]
    );

    const pools: PoolEntity[] = [];
    for (const row of poolsResult.rows) {
      const members = await this.findMembersByPoolId(row.id);
      const pool = this.mapPoolRow(row);
      pools.push(PoolEntity.fromPersistence(pool, members));
    }

    return pools;
  }

  async findMembersByPoolId(poolId: number): Promise<PoolMember[]> {
    const result = await this.db.query<any>(
      'SELECT * FROM pool_members WHERE pool_id = $1',
      [poolId]
    );
    return result.rows.map((row) => this.mapMemberRow(row));
  }

  private mapPoolRow(row: any): Pool {
    return {
      id: row.id,
      year: row.year,
      createdAt: new Date(row.created_at),
    };
  }

  private mapMemberRow(row: any): PoolMember {
    return {
      id: row.id,
      poolId: row.pool_id,
      shipId: row.ship_id,
      cbBefore: Number(row.cb_before),
      cbAfter: Number(row.cb_after),
    };
  }
}