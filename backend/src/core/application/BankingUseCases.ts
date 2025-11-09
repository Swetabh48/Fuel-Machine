import { IBankingRepository } from '../ports/IBankingRepository';
import { IComplianceRepository } from '../ports/IComplianceRepository';
import { BankingEntity } from '../domain/Banking';

export class BankingUseCases {
  constructor(
    private bankingRepository: IBankingRepository,
    private complianceRepository: IComplianceRepository
  ) {}

  async bankSurplus(
    shipId: string,
    year: number,
    amount: number
  ): Promise<BankingEntity> {
    // Verify positive CB exists
    const compliance = await this.complianceRepository.findByShipAndYear(
      shipId,
      year
    );

    if (!compliance) {
      throw new Error(`No compliance record for ship ${shipId} year ${year}`);
    }

    if (compliance.cbGco2eq <= 0) {
      throw new Error(
        `Cannot bank negative or zero CB. Current CB: ${compliance.cbGco2eq}`
      );
    }

    if (amount > compliance.cbGco2eq) {
      throw new Error(
        `Amount ${amount} exceeds available CB ${compliance.cbGco2eq}`
      );
    }

    // Create bank entry
    return this.bankingRepository.create({
      shipId,
      year,
      amountGco2eq: amount,
      appliedAmount: 0,
    });
  }

  async applyBanked(
    shipId: string,
    amount: number
  ): Promise<{ cbBefore: number; applied: number; cbAfter: number }> {
    const totalAvailable =
      await this.bankingRepository.getTotalAvailable(shipId);

    if (amount > totalAvailable) {
      throw new Error(
        `Amount ${amount} exceeds available banked ${totalAvailable}`
      );
    }

    // Get bank entries and apply FIFO
    const entries = await this.bankingRepository.findAvailableByShip(shipId);
    let remaining = amount;

    for (const entry of entries) {
      if (remaining <= 0) break;

      const available = entry.getAvailableAmount();
      const toApply = Math.min(available, remaining);

      entry.applyAmount(toApply);
      await this.bankingRepository.update(entry.id, {
        appliedAmount: entry.appliedAmount,
      });

      remaining -= toApply;
    }

    // Get latest compliance to calculate adjusted balance
    const latestCompliance = await this.complianceRepository.findAll();
    const shipCompliance = latestCompliance.find((c) => c.shipId === shipId);

    const cbBefore = shipCompliance?.cbGco2eq || 0;
    const cbAfter = cbBefore + amount;

    return {
      cbBefore: Number(cbBefore.toFixed(2)),
      applied: Number(amount.toFixed(2)),
      cbAfter: Number(cbAfter.toFixed(2)),
    };
  }

  async getBankingRecords(shipId: string, year?: number): Promise<BankingEntity[]> {
    if (year) {
      const record = await this.bankingRepository.findByShipAndYear(
        shipId,
        year
      );
      return record ? [record] : [];
    }
    return this.bankingRepository.findAvailableByShip(shipId);
  }

  async getTotalAvailable(shipId: string): Promise<number> {
    return this.bankingRepository.getTotalAvailable(shipId);
  }
}