import { Route } from '../../../core/domain/models/types';
import { apiClient } from './axiosClient';

export class RouteApiClient {
  async getRoutes(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    const params = new URLSearchParams();
    if (filters?.vesselType) params.append('vesselType', filters.vesselType);
    if (filters?.fuelType) params.append('fuelType', filters.fuelType);
    if (filters?.year) params.append('year', filters.year.toString());

    return apiClient.get<Route[]>(`/routes?${params.toString()}`);
  }

  async getComparisonRoutes(): Promise<any> {
    return apiClient.get('/routes/comparison');
  }

  async setBaseline(routeId: string): Promise<void> {
    return apiClient.post(`/routes/${routeId}/baseline`, {});
  }
}

export const routeApiClient = new RouteApiClient();
