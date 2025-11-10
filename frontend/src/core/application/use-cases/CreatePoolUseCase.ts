import { Pool, PoolMember } from '../../domain/models/types'; 
import { IPoolingRepository } from '../../ports/IPoolingRepository';

export class CreatePoolUseCase {
  constructor(private poolingRepository: IPoolingRepository) {}

  async execute(input: {
    year: number;
    members: PoolMember[];
  }): Promise<Pool> {
    try {
      // Validate pool
      const validation = await this.poolingRepository.validatePool(
        input.members
      );

      if (!validation.valid) {
        throw new Error(
          `Pool validation failed: ${validation.errors.join(', ')}`
        );
      }

      const pool = await this.poolingRepository.createPool(
        input.year,
        input.members
      );

      return pool;
    } catch (error) {
      throw new Error(`Failed to create pool: ${error}`);
    }
  }
}
