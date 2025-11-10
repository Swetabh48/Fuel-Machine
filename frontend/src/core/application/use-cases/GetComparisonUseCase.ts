import { ComparisonData } from '../../domain/models/types';
import { IRouteRepository } from '../../ports/IRouteRepository';

export class GetComparisonUseCase {
  constructor(private routeRepository: IRouteRepository) {}

  async execute(): Promise<{ routes: ComparisonData[] }> {
    try {
      const data = await this.routeRepository.getComparisonData();
      const TARGET_INTENSITY = 89.3368;

      const formattedRoutes: ComparisonData[] = data.routes.map(
        (item: any) => ({
          routeId: item.routeId,
          baseline: item.baseline.ghgIntensity,
          comparison: item.comparison.ghgIntensity,
          percentDiff:
            (item.comparison.ghgIntensity / item.baseline.ghgIntensity - 1) *
            100,
          compliant: item.comparison.ghgIntensity <= TARGET_INTENSITY,
        })
      );

      return { routes: formattedRoutes };
    } catch (error) {
      throw new Error(`Failed to get comparison: ${error}`);
    }
  }
}
