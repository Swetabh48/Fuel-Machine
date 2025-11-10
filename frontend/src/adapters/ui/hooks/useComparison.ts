import { useState, useEffect } from 'react';
import { ComparisonData, TARGET_GHG_INTENSITY } from '../../../core/domain/models/types';
import { routeApiClient } from '../../infrastructure/api/RouteApiClient';

export const useComparison = () => {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await routeApiClient.getComparisonRoutes();

        const formatted = data.routes.map((item: any) => ({
          routeId: item.routeId,
          baseline: item.baseline.ghgIntensity,
          comparison: item.comparison.ghgIntensity,
          percentDiff: ((item.comparison.ghgIntensity / item.baseline.ghgIntensity - 1) * 100),
          compliant: item.comparison.ghgIntensity <= TARGET_GHG_INTENSITY,
        }));

        setComparisonData(formatted);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch comparison');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, []);

  return { comparisonData, loading, error };
};
