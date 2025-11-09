export interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  appliedAmount: number;
  createdAt: Date;
}

export class BankingEntity {
  constructor(
    public readonly id: number,
    public readonly shipId: string,
    public readonly year: number,
    public amountGco2eq: number,
    public appliedAmount: number,
    public readonly createdAt: Date
  ) {}

  getAvailableAmount(): number {
    return this.amountGco2eq - this.appliedAmount;
  }

  canApply(amount: number): boolean {
    return amount > 0 && amount <= this.getAvailableAmount();
  }

  applyAmount(amount: number): void {
    if (!this.canApply(amount)) {
      throw new Error(
        `Cannot apply ${amount}. Available: ${this.getAvailableAmount()}`
      );
    }
    this.appliedAmount += amount;
  }

  static fromPersistence(data: BankEntry): BankingEntity {
    return new BankingEntity(
      data.id,
      data.shipId,
      data.year,
      data.amountGco2eq,
      data.appliedAmount,
      data.createdAt
    );
  }

  toPersistence(): BankEntry {
    return {
      id: this.id,
      shipId: this.shipId,
      year: this.year,
      amountGco2eq: this.amountGco2eq,
      appliedAmount: this.appliedAmount,
      createdAt: this.createdAt,
    };
  }
}