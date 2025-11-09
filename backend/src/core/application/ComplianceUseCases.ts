import { IComplianceRepository } from '../ports/IComplianceRepository';
import { IRouteRepository } from '../ports/IRouteRepository';
import { IBankingRepository } from '../ports/IBankingRepository';
import { ComplianceEntity } from '../domain/Compliance';

export class ComplianceUseCases {
  constructor(
    private complianceRepository: IComplianceRepository,
    private routeRepository: IRouteRepository,
    private bankingRepository: IBankingRepository
  ) {}

  async computeComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceEntity> {
    // Check if already computed
    const existing = await this.complianceRepository.findByShipAndYear(
      shipId,
      year
    );
    if (existing) {
      return existing;
    }

    // Find route for this ship/year
    const routes = await this.routeRepository.findByFilters({ year });
    const route = routes.find((r) => r.routeId === shipId);

    if (!route) {
      throw new Error(`No route found for ship ${shipId} in year ${year}`);
    }

    const targetIntensity =
      Number(process.env.TARGET_INTENSITY_2025) || 89.3368;
    const cbGco2eq = route.calculateComplianceBalance(targetIntensity);

    // Store the computed CB
    return this.complianceRepository.create({
      shipId,
      year,
      cbGco2eq: Number(cbGco2eq.toFixed(2)),
    });
  }

  async getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceEntity> {
    let compliance = await this.complianceRepository.findByShipAndYear(
      shipId,
      year
    );

    if (!compliance) {
      compliance = await this.computeComplianceBalance(shipId, year);
    }

    return compliance;
  }

  async getAdjustedComplianceBalance(
    shipId: string,
    year: number
  ): Promise<{ cbBefore: number; applied: number; cbAfter: number }> {
    const compliance = await this.getComplianceBalance(shipId, year);
    const cbBefore = compliance.cbGco2eq;

    // Get total applied from banking
    const bankEntries = await this.bankingRepository.findAvailableByShip(
      shipId
    );
    const applied = bankEntries.reduce((sum, e) => sum + e.appliedAmount, 0);

    const cbAfter = cbBefore + applied;

    return {
      cbBefore: Number(cbBefore.toFixed(2)),
      applied: Number(applied.toFixed(2)),
      cbAfter: Number(cbAfter.toFixed(2)),
    };
  }

  async getAllCompliance(): Promise<ComplianceEntity[]> {
    return this.complianceRepository.findAll();
  }
}