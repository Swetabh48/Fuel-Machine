import { ComplianceBalance } from '../../../core/domain/models/types';
import { apiClient } from './axiosClient';

export class ComplianceApiClient {
  async getComplianceBalance(shipId?: string, year?: number): Promise<ComplianceBalance> {
    const params = new URLSearchParams();
    if (shipId) params.append('shipId', shipId);
    if (year) params.append('year', year.toString());

    return apiClient.get(`/compliance/cb?${params.toString()}`);
  }

  async getAdjustedCB(shipId?: string, year?: number): Promise<ComplianceBalance> {
    const params = new URLSearchParams();
    if (shipId) params.append('shipId', shipId);
    if (year) params.append('year', year.toString());

    return apiClient.get(`/compliance/adjusted-cb?${params.toString()}`);
  }
}

export const complianceApiClient = new ComplianceApiClient();
