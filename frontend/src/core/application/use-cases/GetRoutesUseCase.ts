import { Route } from '../../domain/models/types';
import { IRouteRepository } from '../../ports/IRouteRepository';

export class GetRoutesUseCase {
  constructor(private routeRepository: IRouteRepository) {}

  async execute(input?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<{ routes: Route[]; total: number }> {
    try {
      const routes = await this.routeRepository.getAll(input);
      return {
        routes,
        total: routes.length
      };
    } catch (error) {
      throw new Error(`Failed to get routes: ${error}`);
    }
  }
}
