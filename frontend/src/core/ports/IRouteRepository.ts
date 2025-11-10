import { Route } from '../domain/models/types';

export interface IRouteRepository {

  getAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]>;
  getById(id: string): Promise<Route>;
  getByRouteId(routeId: string): Promise<Route>;
  setBaseline(routeId: string): Promise<void>;
  getBaseline(): Promise<Route>;

  getComparisonData(): Promise<{
    routes: Array<{
      routeId: string;
      baseline: Route;
      comparison: Route;
    }>;
  }>;
  save(route: Route): Promise<Route>;
}
