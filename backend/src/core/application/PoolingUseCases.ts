import { IPoolingRepository } from '../ports/IPoolingRepository';
import { PoolEntity } from '../domain/Pooling';

interface PoolMemberInput {
  shipId: string;
  cbBefore: number;
}

export class PoolingUseCases {
  constructor(
    private poolingRepository: IPoolingRepository,
  ) {}

  async createPool(
    year: number,
    members: PoolMemberInput[]
  ): Promise<PoolEntity> {
    // Validate total CB >= 0
    const totalCb = members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCb < 0) {
      throw new Error(
        `Pool total CB is negative: ${totalCb}. Cannot create pool.`
      );
    }

    // Calculate allocations using greedy algorithm
    const allocations = this.calculatePoolAllocations(members);

    // Validate member constraints
    const errors: string[] = [];
    for (const alloc of allocations) {
      // Deficit ship cannot exit worse
      if (alloc.cbBefore < 0 && alloc.cbAfter < alloc.cbBefore) {
        errors.push(
          `Ship ${alloc.shipId} deficit worsened: ${alloc.cbBefore} -> ${alloc.cbAfter}`
        );
      }

      // Surplus ship cannot exit negative
      if (alloc.cbBefore > 0 && alloc.cbAfter < 0) {
        errors.push(
          `Ship ${alloc.shipId} surplus became negative: ${alloc.cbBefore} -> ${alloc.cbAfter}`
        );
      }
    }

    if (errors.length > 0) {
      throw new Error(`Pool validation failed: ${errors.join('; ')}`);
    }

    // Create pool
    const pool = await this.poolingRepository.createPool({ year });

    // Add members
    const memberRecords = allocations.map((a) => ({
      poolId: pool.id,
      shipId: a.shipId,
      cbBefore: a.cbBefore,
      cbAfter: a.cbAfter,
    }));

    await this.poolingRepository.addPoolMembers(memberRecords);

    // Fetch complete pool with members
    const completePool = await this.poolingRepository.findPoolById(pool.id);
    if (!completePool) {
      throw new Error('Failed to create pool');
    }

    return completePool;
  }

  private calculatePoolAllocations(
    members: PoolMemberInput[]
  ): Array<{ shipId: string; cbBefore: number; cbAfter: number }> {
    // Sort by CB descending (surplus first)
    const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);

    const result = sorted.map((m) => ({
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbBefore,
    }));

    // Greedy allocation: transfer surplus to deficits
    for (let i = 0; i < result.length; i++) {
      if (result[i].cbAfter <= 0) continue; // No surplus left

      for (let j = result.length - 1; j > i; j--) {
        if (result[j].cbAfter >= 0) continue; // No deficit

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