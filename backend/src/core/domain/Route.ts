export interface Route {
  id: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export interface RouteComparison {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  baselineGhgIntensity: number;
  comparisonGhgIntensity: number;
  percentDiff: number;
  compliant: boolean;
  target: number;
}

export class RouteEntity {
  constructor(
    public readonly id: number,
    public readonly routeId: string,
    public readonly vesselType: string,
    public readonly fuelType: string,
    public readonly year: number,
    public readonly ghgIntensity: number,
    public readonly fuelConsumption: number,
    public readonly distance: number,
    public readonly totalEmissions: number,
    public isBaseline: boolean
  ) {}

  setAsBaseline(): void {
    this.isBaseline = true;
  }

  calculateEnergyInScope(): number {
    const ENERGY_PER_TON_MJ = Number(process.env.ENERGY_PER_TON_MJ) || 41000;
    return this.fuelConsumption * ENERGY_PER_TON_MJ;
  }

  calculateComplianceBalance(targetIntensity: number): number {
    const energyInScope = this.calculateEnergyInScope();
    const cbMJ = (targetIntensity - this.ghgIntensity) * energyInScope;
    return cbMJ / 1_000_000; // Convert to tCO2eq
  }

  static fromPersistence(data: Route): RouteEntity {
    return new RouteEntity(
      data.id,
      data.routeId,
      data.vesselType,
      data.fuelType,
      data.year,
      data.ghgIntensity,
      data.fuelConsumption,
      data.distance,
      data.totalEmissions,
      data.isBaseline
    );
  }

  toPersistence(): Route {
    return {
      id: this.id,
      routeId: this.routeId,
      vesselType: this.vesselType,
      fuelType: this.fuelType,
      year: this.year,
      ghgIntensity: this.ghgIntensity,
      fuelConsumption: this.fuelConsumption,
      distance: this.distance,
      totalEmissions: this.totalEmissions,
      isBaseline: this.isBaseline,
    };
  }
}