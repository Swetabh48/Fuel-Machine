export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number;
  adjustedCb?: number;
}

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt: string;
}

export interface Pool {
  id: string;
  year: number;
  members: PoolMember[];
  createdAt: string;
}

export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
  cbAdjusted: number;
}

export interface ComparisonData {
  routeId: string;
  baseline: number;
  comparison: number;
  percentDiff: number;
  compliant: boolean;
}

export const TARGET_GHG_INTENSITY = 89.3368;
export const MJ_PER_TONNE = 41000;
