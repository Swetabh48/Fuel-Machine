import { BankEntry } from '../../../core/domain/models/types';
import { IBankingRepository } from '../../../core/ports/IBankingRepository';
import { bankingApiClient } from '../api/BankingApiClient';

/**
 * Adapter: Implements IBankingRepository port
 * Provides banking operation data access via REST API
 */
export class BankingRepository implements IBankingRepository {
  async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
    const records = await bankingApiClient.getBankRecords(shipId, year);
    return records;
  }

  async getTotalBanked(shipId: string): Promise<number> {
    // Aggregate all banked amounts for a ship
    throw new Error('Not implemented');
  }

  async bankSurplus(shipId: string, year: number, amount: number): Promise<BankEntry> {
    const response = await bankingApiClient.bankSurplus({ shipId, year, amount });
    return response;
  }

  async applyBanked(
    shipId: string,
    targetYear: number,
    amount: number,
    sourceYear: number
  ): Promise<{
    cbBefore: number;
    applied: number;
    cbAfter: number;
  }> {
    return bankingApiClient.applyBanked({ shipId, year: targetYear, amount });
  }

  async getAvailableBanked(shipId: string): Promise<number> {
    // Implement if API supports checking available banked amount
    throw new Error('Not implemented');
  }

  async reverseBankEntry(bankEntryId: string): Promise<void> {
    // Implement if API supports reversing entries
    throw new Error('Not implemented');
  }
}

export const bankingRepository = new BankingRepository();
