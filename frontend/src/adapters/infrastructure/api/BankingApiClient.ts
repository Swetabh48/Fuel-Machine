import { apiClient } from './axiosClient';

export class BankingApiClient {
  async getBankRecords(shipId: string, year?: number): Promise<any> {
    const params = new URLSearchParams({ shipId });
    if (year) params.append('year', year.toString());
    return apiClient.get(`/banking/records?${params.toString()}`);
  }

  async bankSurplus(payload: { shipId: string; year: number; amount: number }): Promise<any> {
    return apiClient.post('/banking/bank', payload);
  }

  async applyBanked(payload: { shipId: string; amount: number }): Promise<any> {
    return apiClient.post('/banking/apply', payload);
  }

  async getTotalAvailable(shipId: string): Promise<any> {
    return apiClient.get(`/banking/available?shipId=${shipId}`);
  }
}

export const bankingApiClient = new BankingApiClient();