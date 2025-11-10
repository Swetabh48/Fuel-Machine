import { BankEntry } from '../../../core/domain/models/types';
import { IBankingRepository } from '../../../core/ports/IBankingRepository';
import { bankingApiClient } from '../api/BankingApiClient';

/**
 * Adapter: Implements IBankingRepository port
 * Provides banking operation data access via REST API
 */
export class BankingRepository implements IBankingRepository {
  async getBankRecords(shipId: string, year?: number): Promise<BankEntry[]> {
    const records = await bankingApiClient.getBankRecords(shipId, year);
    return records;
  }

  async getTotalBanked(shipId: string): Promise<number> {
    const response = await bankingApiClient.getTotalAvailable(shipId);
    return response.totalAvailable || 0;
  }

  async bankSurplus(
    shipId: string,
    year: number,
    amount: number
  ): Promise<BankEntry> {
    const response = await bankingApiClient.bankSurplus({
      shipId,
      year,
      amount,
    });
    return response.entry || response;
  }

  async applyBanked(
    shipId: string,
    targetYear: number,
    amount: number,
    sourceYear?: number
  ): Promise<{
    cbBefore: number;
    applied: number;
    cbAfter: number;
  }> {
    // CRITICAL FIX: Only pass shipId and amount - NO year
    return bankingApiClient.applyBanked({ shipId, amount });
  }

  async getAvailableBanked(shipId: string): Promise<number> {
    const response = await bankingApiClient.getTotalAvailable(shipId);
    return response.totalAvailable || 0;
  }

  async reverseBankEntry(bankEntryId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}

export const bankingRepository = new BankingRepository();
