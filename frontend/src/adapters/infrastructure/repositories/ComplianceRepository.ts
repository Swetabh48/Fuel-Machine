import { ComplianceBalance } from '../../../core/domain/models/types';
import { IComplianceRepository } from '../../../core/ports/IComplianceRepository';
import { complianceApiClient } from '../api/ComplianceApiClient';

/**
 * Adapter: Implements IComplianceRepository port
 * Provides compliance balance data access via REST API
 */
export class ComplianceRepository implements IComplianceRepository {
  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    return complianceApiClient.getComplianceBalance(shipId, year);
  }

  async getAdjustedCB(shipId: string, year: number): Promise<ComplianceBalance> {
    return complianceApiClient.getAdjustedCB(shipId, year);
  }

  async calculateCB(shipId: string, year: number): Promise<number> {
    const cb = await this.getComplianceBalance(shipId, year);
    return cb.cbGco2eq;
  }

  async saveComplianceBalance(balance: ComplianceBalance): Promise<ComplianceBalance> {
    // Implement if API supports saving compliance data
    return balance;
  }

  async getHistoryByShip(shipId: string): Promise<ComplianceBalance[]> {
    // Implement if API supports fetching history
    throw new Error('Not implemented');
  }

  async getHistoryByYear(year: number): Promise<ComplianceBalance[]> {
    // Implement if API supports fetching yearly data
    throw new Error('Not implemented');
  }
}

export const complianceRepository = new ComplianceRepository();
