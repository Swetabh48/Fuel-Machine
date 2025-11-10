import { Route } from '../../../core/domain/models/types';
import { IRouteRepository } from '../../../core/ports/IRouteRepository';
import { routeApiClient } from '../api/RouteApiClient';

/**
 * Adapter: Implements IRouteRepository port
 * Provides route data access via REST API
 */
export class RouteRepository implements IRouteRepository {
  async getAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    return routeApiClient.getRoutes(filters);
  }

  async getById(id: string): Promise<Route> {
    const routes = await routeApiClient.getRoutes();
    const route = routes.find(r => r.id === id);
    if (!route) {
      throw new Error(`Route with id ${id} not found`);
    }
    return route;
  }

  async getByRouteId(routeId: string): Promise<Route> {
    const routes = await routeApiClient.getRoutes();
    const route = routes.find(r => r.routeId === routeId);
    if (!route) {
      throw new Error(`Route with routeId ${routeId} not found`);
    }
    return route;
  }

  async setBaseline(routeId: string): Promise<void> {
    return routeApiClient.setBaseline(routeId);
  }

  async getBaseline(): Promise<Route> {
    const routes = await routeApiClient.getRoutes();
    const baseline = routes.find(r => r.isBaseline);
    if (!baseline) {
      throw new Error('No baseline route found');
    }
    return baseline;
  }

  async getComparisonData(): Promise<any> {
    return routeApiClient.getComparisonRoutes();
  }

  async save(route: Route): Promise<Route> {
    // Implement if API supports saving routes
    throw new Error('Not implemented');
  }
}

export const routeRepository = new RouteRepository();
