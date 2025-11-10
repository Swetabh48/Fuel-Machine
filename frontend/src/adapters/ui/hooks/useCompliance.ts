import { useState } from 'react';
import { ComplianceBalance } from '../../../core/domain/models/types';
import { complianceRepository } from '../../infrastructure/repositories/ComplianceRepository';
import { IComplianceRepository } from '../../../core/ports/IComplianceRepository';

export const useCompliance = () => {
  const [cb, setCB] = useState<ComplianceBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Using the port interface
  const repository: IComplianceRepository = complianceRepository;

  const fetchCB = async (shipId?: string, year?: number) => {
    if (!shipId || !year) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await repository.getComplianceBalance(shipId, year);
      setCB(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch compliance balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdjustedCB = async (shipId?: string, year?: number) => {
    if (!shipId || !year) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await repository.getAdjustedCB(shipId, year);
      setCB(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch adjusted CB');
    } finally {
      setLoading(false);
    }
  };

  return { cb, loading, error, fetchCB, fetchAdjustedCB };
};
