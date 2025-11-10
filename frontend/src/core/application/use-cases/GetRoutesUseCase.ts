import { Route } from '../../domain/models/types';

export interface GetRoutesUseCaseInput {
  vesselType?: string;
  fuelType?: string;
  year?: number;
}

export interface GetRoutesUseCaseOutput {
  routes: Route[];
  total: number;
}

export class GetRoutesUseCase {
  constructor(private routeRepository: any) {}

  async execute(input: GetRoutesUseCaseInput): Promise<GetRoutesUseCaseOutput> {
    const routes = await this.routeRepository.getRoutes(input);
    return {
      routes,
      total: routes.length,
    };
  }
}
