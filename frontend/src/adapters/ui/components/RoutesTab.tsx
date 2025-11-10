import { useState } from 'react';
import { useRoutes } from '../hooks/useRoutes';
import RouteTable from './RouteTable';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';

export default function RoutesTab() {
  const [filters, setFilters] = useState({
    vesselType: '',
    fuelType: '',
    year: new Date().getFullYear(),
  });

  const { routes, loading, error, setBaseline } = useRoutes(filters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="grid grid-cols-3 gap-4">
          <select
            name="vesselType"
            value={filters.vesselType}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
          >
            <option value="">All Vessel Types</option>
            <option value="Container">Container</option>
            <option value="BulkCarrier">Bulk Carrier</option>
            <option value="Tanker">Tanker</option>
            <option value="RoRo">RoRo</option>
          </select>

          <select
            name="fuelType"
            value={filters.fuelType}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
          >
            <option value="">All Fuel Types</option>
            <option value="HFO">HFO</option>
            <option value="LNG">LNG</option>
            <option value="MGO">MGO</option>
          </select>

          <input
            type="number"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
          />
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
      {loading ? <LoadingSpinner /> : <RouteTable routes={routes} onSetBaseline={setBaseline} />}
    </div>
  );
}
