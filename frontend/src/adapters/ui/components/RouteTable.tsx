import { Route } from '../../../core/domain/models/types';
import { CheckCircle2, Circle } from 'lucide-react';

interface RouteTableProps {
  routes: Route[];
  onSetBaseline: (routeId: string) => void;
}

export default function RouteTable({ routes, onSetBaseline }: RouteTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Route ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vessel Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fuel Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Year</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">GHG Intensity</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Fuel Consumption</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Distance</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Emissions</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Baseline</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {routes.map(route => (
            <tr key={route.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm text-gray-900">{route.routeId}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{route.vesselType}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{route.fuelType}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{route.year}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">{route.ghgIntensity.toFixed(2)}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">{route.fuelConsumption}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">{route.distance}</td>
              <td className="px-6 py-4 text-sm text-right text-gray-600">{route.totalEmissions.toFixed(2)}</td>
              <td className="px-6 py-4 text-center">
                {route.isBaseline ? (
                  <CheckCircle2 className="w-5 h-5 text-fuel-green mx-auto" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 mx-auto" />
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onSetBaseline(route.routeId)}
                  disabled={route.isBaseline}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Set Baseline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
