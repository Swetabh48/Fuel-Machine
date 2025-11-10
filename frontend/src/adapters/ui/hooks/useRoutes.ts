import { useState, useEffect } from 'react';
import { Route } from '../../../core/domain/models/types';
import { routeRepository } from '../../infrastructure/repositories/RouteRepository';
import { IRouteRepository } from '../../../core/ports/IRouteRepository';

export const useRoutes = (filters?: { vesselType?: string; fuelType?: string; year?: number }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Using the port interface, not direct API client
  const repository: IRouteRepository = routeRepository;

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await repository.getAll(filters);
        setRoutes(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [filters?.vesselType, filters?.fuelType, filters?.year]);

  const setBaseline = async (routeId: string) => {
    try {
      await repository.setBaseline(routeId);
      const data = await repository.getAll(filters);
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to set baseline');
    }
  };

  return { routes, loading, error, setBaseline };
};
