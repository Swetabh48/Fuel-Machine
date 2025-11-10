import { apiClient } from './axiosClient';

export class ComplianceApiClient {
  async getComplianceBalance(shipId: string, year: number): Promise<any> {
    return apiClient.get(`/compliance/balance?shipId=${shipId}&year=${year}`);
  }

  async getAdjustedCB(shipId: string, year: number): Promise<any> {
    // This endpoint should return: { cbBefore, applied, cbAfter }
    return apiClient.get(`/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
  }

  async getAllCompliance(): Promise<any> {
    return apiClient.get('/compliance');
  }

  async getBalance(): Promise<any> {
    return apiClient.get('/compliance/balance');
  }
}

export const complianceApiClient = new ComplianceApiClient();
