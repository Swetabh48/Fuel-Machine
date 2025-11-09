import { ShipCompliance, ComplianceEntity } from '../domain/Compliance';

export interface IComplianceRepository {
  findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<ComplianceEntity | null>;
  create(
    compliance: Omit<ShipCompliance, 'id' | 'createdAt'>
  ): Promise<ComplianceEntity>;
  update(
    id: number,
    compliance: Partial<ShipCompliance>
  ): Promise<ComplianceEntity | null>;
  findAll(): Promise<ComplianceEntity[]>;
}