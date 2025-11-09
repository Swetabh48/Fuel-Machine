import { BankEntry, BankingEntity } from '../domain/Banking';

export interface IBankingRepository {
  findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<BankingEntity | null>;
  findAvailableByShip(shipId: string): Promise<BankingEntity[]>;
  create(
    entry: Omit<BankEntry, 'id' | 'createdAt'>
  ): Promise<BankingEntity>;
  update(
    id: number,
    entry: Partial<BankEntry>
  ): Promise<BankingEntity | null>;
  getTotalAvailable(shipId: string): Promise<number>;
}