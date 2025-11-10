import { BankEntry } from '../domain/models/types';

export interface IBankingRepository {
  getBankRecords(shipId: string, year: number): Promise<BankEntry[]>;
  getTotalBanked(shipId: string): Promise<number>;
  bankSurplus(shipId: string, year: number, amount: number): Promise<BankEntry>;
  applyBanked(
    shipId: string,
    targetYear: number,
    amount: number,
    sourceYear: number
  ): Promise<{
    cbBefore: number;
    applied: number;
    cbAfter: number;
  }>;
  getAvailableBanked(shipId: string): Promise<number>;
  reverseBankEntry(bankEntryId: string): Promise<void>;
}
