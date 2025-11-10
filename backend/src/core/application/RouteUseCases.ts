import { IRouteRepository } from '../ports/IRouteRepository';
import { RouteEntity, RouteComparison } from '../domain/Route';

export class RouteUseCases {
  constructor(private routeRepository: IRouteRepository) {}

  async getAllRoutes(): Promise<RouteEntity[]> {
    return this.routeRepository.findAll();
  }

  async getRoutesByFilters(filters: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<RouteEntity[]> {
    return this.routeRepository.findByFilters(filters);
  }

  async setBaseline(routeId: string): Promise<void> {
    const route = await this.routeRepository.findByRouteId(routeId);
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }
    await this.routeRepository.setBaseline(route.id);
  }

  async getComparison(): Promise<RouteComparison[]> {
    const baseline = await this.routeRepository.findBaseline();
    if (!baseline) {
      throw new Error('No baseline route set');
    }
    const allRoutes = await this.routeRepository.findAll();
    const targetIntensity =
      Number(process.env.TARGET_INTENSITY_2025) || 89.3368;

    return allRoutes.map((route) => {
      const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
      const compliant = route.ghgIntensity <= targetIntensity;

      return {
        routeId: route.routeId,
        vesselType: route.vesselType,
        fuelType: route.fuelType,
        year: route.year,
        baselineGhgIntensity: baseline.ghgIntensity,
        comparisonGhgIntensity: route.ghgIntensity,
        percentDiff: Number(percentDiff.toFixed(2)),
        compliant,
        target: targetIntensity,
      };
    });
  }
}
