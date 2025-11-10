import { Pool, PoolMember } from '../../../core/domain/models/types';
import { IPoolingRepository } from '../../../core/ports/IPoolingRepository';
import { poolingApiClient } from '../api/PoolingApiClient';

/**
 * Adapter: Implements IPoolingRepository port
 * Provides pooling operation data access via REST API
 */
export class PoolingRepository implements IPoolingRepository {
  async createPool(year: number, members: PoolMember[]): Promise<Pool> {
    return poolingApiClient.createPool({ year, members });
  }

  async getPoolById(poolId: string): Promise<Pool> {
    throw new Error('Not implemented');
  }

  async getPoolsByYear(year: number): Promise<Pool[]> {
    throw new Error('Not implemented');
  }

  async getPoolsByShip(shipId: string): Promise<Pool[]> {
    throw new Error('Not implemented');
  }

  async updatePoolAllocations(poolId: string, members: PoolMember[]): Promise<Pool> {
    throw new Error('Not implemented');
  }

  async validatePool(members: PoolMember[]): Promise<{ valid: boolean; errors: string[] }> {
    const totalCB = members.reduce((sum, m) => sum + m.cbBefore, 0);
    const errors: string[] = [];

    if (totalCB < 0) {
      errors.push('Pool total CB cannot be negative');
    }

    // Validate deficit and surplus constraints
    for (const member of members) {
      if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
        errors.push(`Deficit ship ${member.shipId} cannot exit in worse position`);
      }
      if (member.cbBefore > 0 && member.cbAfter < 0) {
        errors.push(`Surplus ship ${member.shipId} cannot exit negative`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async getPoolStats(poolId: string): Promise<{
    totalCBBefore: number;
    totalCBAfter: number;
    deficitMembers: PoolMember[];
    surplusMembers: PoolMember[];
  }> {
    throw new Error('Not implemented');
  }
}

export const poolingRepository = new PoolingRepository();
