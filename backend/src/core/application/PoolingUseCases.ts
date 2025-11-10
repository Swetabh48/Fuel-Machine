import { IPoolingRepository } from '../ports/IPoolingRepository';
import { PoolEntity } from '../domain/Pooling';

interface PoolMemberInput {
  shipId: string;
  cbBefore: number;
}

export class PoolingUseCases {
  constructor(private poolingRepository: IPoolingRepository) {}

  async createPool(year: number, members: PoolMemberInput[]): Promise<PoolEntity> {
    const totalCb = members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCb < 0) {
      throw new Error(`Pool total CB is negative: ${totalCb}. Cannot create pool.`);
    }

    const allocations = this.calculatePoolAllocations(members);

    const errors: string[] = [];
    for (const alloc of allocations) {
      if (alloc.cbBefore < 0 && alloc.cbAfter < alloc.cbBefore) {
        errors.push(`Ship ${alloc.shipId} deficit worsened: ${alloc.cbBefore} -> ${alloc.cbAfter}`);
      }
      if (alloc.cbBefore > 0 && alloc.cbAfter < 0) {
        errors.push(`Ship ${alloc.shipId} surplus became negative: ${alloc.cbBefore} -> ${alloc.cbAfter}`);
      }
    }
    if (errors.length > 0) {
      throw new Error(`Pool validation failed: ${errors.join('; ')}`);
    }

    const pool = await this.poolingRepository.createPool({ year });
    const memberRecords = allocations.map((a) => ({
      poolId: pool.id,
      shipId: a.shipId,
      cbBefore: a.cbBefore,
      cbAfter: a.cbAfter,
    }));

    await this.poolingRepository.addPoolMembers(memberRecords);
    const completePool = await this.poolingRepository.findPoolById(pool.id);
    if (!completePool) {
      throw new Error('Failed to create pool');
    }
    return completePool;
  }

  private calculatePoolAllocations(
    members: PoolMemberInput[]
  ): Array<{ shipId: string; cbBefore: number; cbAfter: number }> {
    const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);
    const result = sorted.map((m) => ({
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbBefore,
    }));
    for (let i = 0; i < result.length; i++) {
      if (result[i].cbAfter <= 0) continue;
      for (let j = result.length - 1; j > i; j--) {
        if (result[j].cbAfter >= 0) continue;
        const surplus = result[i].cbAfter;
        const deficit = Math.abs(result[j].cbAfter);
        const transfer = Math.min(surplus, deficit);
        result[i].cbAfter -= transfer;
        result[j].cbAfter += transfer;
        if (result[i].cbAfter === 0) break;
      }
    }
    return result;
  }

  async getPoolsByYear(year: number): Promise<PoolEntity[]> {
    return this.poolingRepository.findPoolsByYear(year);
  }

  async getPoolById(id: number): Promise<PoolEntity | null> {
    return this.poolingRepository.findPoolById(id);
  }
}
