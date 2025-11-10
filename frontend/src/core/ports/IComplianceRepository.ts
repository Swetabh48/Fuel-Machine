import { ComplianceBalance } from '../domain/models/types';

export interface IComplianceRepository {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;

  getAdjustedCB(shipId: string, year: number): Promise<ComplianceBalance>;

  calculateCB(shipId: string, year: number): Promise<number>;
  saveComplianceBalance(balance: ComplianceBalance): Promise<ComplianceBalance>;

  getHistoryByShip(shipId: string): Promise<ComplianceBalance[]>;

  getHistoryByYear(year: number): Promise<ComplianceBalance[]>;
}
