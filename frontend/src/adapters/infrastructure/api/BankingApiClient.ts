import { apiClient } from './axiosClient';

export class BankingApiClient {
  async getBankRecords(shipId: string, year: number): Promise<any> {
    return apiClient.get(`/banking/records?shipId=${shipId}&year=${year}`);
  }

  async bankSurplus(payload: { shipId: string; year: number; amount: number }): Promise<any> {
    return apiClient.post('/banking/bank', payload);
  }

  async applyBanked(payload: { shipId: string; year: number; amount: number }): Promise<any> {
    return apiClient.post('/banking/apply', payload);
  }
}

export const bankingApiClient = new BankingApiClient();
