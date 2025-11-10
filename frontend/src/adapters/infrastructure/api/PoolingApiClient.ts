import { apiClient } from './axiosClient';

export class PoolingApiClient {
  async createPool(payload: { year: number; members: any[] }): Promise<any> {
    return apiClient.post('/pools', payload);
  }

  async getAdjustedCBForPool(shipId: string, year: number): Promise<any> {
    return apiClient.get(`/compliance/adjusted-cb?shipId=${shipId}&year=${year}`);
  }
}

export const poolingApiClient = new PoolingApiClient();
