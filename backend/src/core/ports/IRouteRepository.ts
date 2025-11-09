import { Route, RouteEntity } from '../domain/Route';

export interface IRouteRepository {
  findAll(): Promise<RouteEntity[]>;
  findById(id: number): Promise<RouteEntity | null>;
  findByRouteId(routeId: string): Promise<RouteEntity | null>;
  findBaseline(): Promise<RouteEntity | null>;
  create(route: Omit<Route, 'id'>): Promise<RouteEntity>;
  update(id: number, route: Partial<Route>): Promise<RouteEntity | null>;
  setBaseline(id: number): Promise<void>;
  findByFilters(filters: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<RouteEntity[]>;
}