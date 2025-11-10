import { Pool, PoolMember } from '../domain/models/types';
export interface IPoolingRepository {

  createPool(year: number, members: PoolMember[]): Promise<Pool>;
  getPoolById(poolId: string): Promise<Pool>;
  getPoolsByYear(year: number): Promise<Pool[]>;

  getPoolsByShip(shipId: string): Promise<Pool[]>;
  updatePoolAllocations(poolId: string, members: PoolMember[]): Promise<Pool>;
  validatePool(members: PoolMember[]): Promise<{ valid: boolean; errors: string[] }>;
  getPoolStats(poolId: string): Promise<{
    totalCBBefore: number;
    totalCBAfter: number;
    deficitMembers: PoolMember[];
    surplusMembers: PoolMember[];
  }>;
}
