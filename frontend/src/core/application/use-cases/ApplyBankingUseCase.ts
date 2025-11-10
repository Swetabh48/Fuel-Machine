import { BankEntry } from '../../domain/models/types';
import { IBankingRepository } from '../../ports/IBankingRepository';


export class ApplyBankingUseCase {
  constructor(private bankingRepository: IBankingRepository) {}

  async execute(input: {
    shipId: string;
    targetYear: number;
    amount: number;
    sourceYear: number;
  }): Promise<{ cbBefore: number; applied: number; cbAfter: number }> {
    try {
      if (!input.shipId || !input.targetYear || input.amount <= 0) {
        throw new Error('Invalid input parameters');
      }

      const result = await this.bankingRepository.applyBanked(
        input.shipId,
        input.targetYear,
        input.amount,
        input.sourceYear
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to apply banking: ${error}`);
    }
  }
}
