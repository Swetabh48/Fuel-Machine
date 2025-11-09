export interface Pool {
  id: number;
  year: number;
  createdAt: Date;
}

export interface PoolMember {
  id: number;
  poolId: number;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export class PoolEntity {
  constructor(
    public readonly id: number,
    public readonly year: number,
    public readonly createdAt: Date,
    public members: PoolMemberEntity[]
  ) {}

  getTotalCbBefore(): number {
    return this.members.reduce((sum, m) => sum + m.cbBefore, 0);
  }

  getTotalCbAfter(): number {
    return this.members.reduce((sum, m) => sum + m.cbAfter, 0);
  }

  isValid(): boolean {
    return this.getTotalCbBefore() >= 0;
  }

  validateMemberConstraints(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const member of this.members) {
      // Deficit ship cannot exit worse
      if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
        errors.push(
          `Ship ${member.shipId} deficit worsened: ${member.cbBefore} -> ${member.cbAfter}`
        );
      }

      // Surplus ship cannot exit negative
      if (member.cbBefore > 0 && member.cbAfter < 0) {
        errors.push(
          `Ship ${member.shipId} surplus became negative: ${member.cbBefore} -> ${member.cbAfter}`
        );
      }
    }

    return { valid: errors.length === 0, errors };
  }

  static fromPersistence(pool: Pool, members: PoolMember[]): PoolEntity {
    const memberEntities = members.map((m) =>
      PoolMemberEntity.fromPersistence(m)
    );
    return new PoolEntity(pool.id, pool.year, pool.createdAt, memberEntities);
  }
}

export class PoolMemberEntity {
  constructor(
    public readonly id: number,
    public readonly poolId: number,
    public readonly shipId: string,
    public readonly cbBefore: number,
    public cbAfter: number
  ) {}

  isSurplus(): boolean {
    return this.cbBefore > 0;
  }

  isDeficit(): boolean {
    return this.cbBefore < 0;
  }

  getAvailableSurplus(): number {
    return this.isSurplus() ? this.cbBefore : 0;
  }

  getDeficitAmount(): number {
    return this.isDeficit() ? Math.abs(this.cbBefore) : 0;
  }

  static fromPersistence(data: PoolMember): PoolMemberEntity {
    return new PoolMemberEntity(
      data.id,
      data.poolId,
      data.shipId,
      data.cbBefore,
      data.cbAfter
    );
  }

  toPersistence(): PoolMember {
    return {
      id: this.id,
      poolId: this.poolId,
      shipId: this.shipId,
      cbBefore: this.cbBefore,
      cbAfter: this.cbAfter,
    };
  }
}