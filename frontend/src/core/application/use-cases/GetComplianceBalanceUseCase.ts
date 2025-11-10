import { ComplianceBalance } from '../../domain/models/types'; 
import { IComplianceRepository } from '../../ports/IComplianceRepository';

export class GetComplianceBalanceUseCase {
  constructor(private complianceRepository: IComplianceRepository) {}

  async execute(input: {
    shipId: string;
    year: number;
  }): Promise<ComplianceBalance> {
    try {
      if (!input.shipId || !input.year) {
        throw new Error('shipId and year are required');
      }

      const cb = await this.complianceRepository.getComplianceBalance(
        input.shipId,
        input.year
      );

      return cb;
    } catch (error) {
      throw new Error(`Failed to get compliance balance: ${error}`);
    }
  }
}
