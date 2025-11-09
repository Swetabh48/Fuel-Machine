export interface ShipCompliance {
  id: number;
  shipId: string;
  year: number;
  cbGco2eq: number;
  createdAt: Date;
}

export class ComplianceEntity {
  constructor(
    public readonly id: number,
    public readonly shipId: string,
    public readonly year: number,
    public readonly cbGco2eq: number,
    public readonly createdAt: Date
  ) {}

  isSurplus(): boolean {
    return this.cbGco2eq > 0;
  }

  isDeficit(): boolean {
    return this.cbGco2eq < 0;
  }

  getAbsoluteBalance(): number {
    return Math.abs(this.cbGco2eq);
  }

  static fromPersistence(data: ShipCompliance): ComplianceEntity {
    return new ComplianceEntity(
      data.id,
      data.shipId,
      data.year,
      data.cbGco2eq,
      data.createdAt
    );
  }

  toPersistence(): ShipCompliance {
    return {
      id: this.id,
      shipId: this.shipId,
      year: this.year,
      cbGco2eq: this.cbGco2eq,
      createdAt: this.createdAt,
    };
  }
}