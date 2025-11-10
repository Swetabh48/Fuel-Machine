import { apiClient } from './axiosClient';

export class ComplianceApiClient {
  async getComplianceBalance(shipId: string, year: number): Promise<any> {
    return apiClient.get(`/compliance/cb?shipId=${shipId}&year=${year}`);
  }

  async getAdjustedCB(shipId: string, year: number): Promise<any> {
    return apiClient.get(`/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
  }

  async getAllCompliance(): Promise<any> {
    return apiClient.get('/compliance/all');
  }
}

export const complianceApiClient = new ComplianceApiClient();