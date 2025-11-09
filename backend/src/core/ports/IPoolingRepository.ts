import { Pool, PoolMember, PoolEntity } from '../domain/Pooling';

export interface IPoolingRepository {
  createPool(pool: Omit<Pool, 'id' | 'createdAt'>): Promise<PoolEntity>;
  addPoolMembers(members: Omit<PoolMember, 'id'>[]): Promise<void>;
  findPoolById(id: number): Promise<PoolEntity | null>;
  findPoolsByYear(year: number): Promise<PoolEntity[]>;
  findMembersByPoolId(poolId: number): Promise<PoolMember[]>;
}