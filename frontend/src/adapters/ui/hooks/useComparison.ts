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

        // Check if data and data.routes exist
        if (!data || !data.routes || !Array.isArray(data.routes)) {
          console.warn('No comparison routes available');
          setComparisonData([]);
          return;
        }

        const formatted = data.routes.map((item: any) => ({
          routeId: item.routeId,
          baseline: item.baseline?.ghgIntensity || 0,
          comparison: item.comparison?.ghgIntensity || 0,
          percentDiff: item.baseline?.ghgIntensity 
            ? ((item.comparison?.ghgIntensity || 0) / item.baseline.ghgIntensity - 1) * 100
            : 0,
          compliant: (item.comparison?.ghgIntensity || 0) <= TARGET_GHG_INTENSITY,
        }));

        setComparisonData(formatted);
      } catch (err: any) {
        console.error('Comparison fetch error:', err);
        setError(err.message || 'Failed to fetch comparison');
        setComparisonData([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, []);

  return { comparisonData, loading, error };
};