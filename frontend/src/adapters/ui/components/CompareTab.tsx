import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';
import { CheckCircle2, XCircle } from 'lucide-react';
import { routeApiClient } from '../../infrastructure/api/RouteApiClient';

interface ComparisonItem {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  baselineGhgIntensity: number;
  comparisonGhgIntensity: number;
  percentDiff: number;
  compliant: boolean;
  target: number;
}

export default function CompareTab() {
  const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await routeApiClient.getComparisonRoutes();
        setComparisonData(data);
      } catch (err: any) {
        console.error('Comparison fetch error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!comparisonData || comparisonData.length === 0) {
    return <div className="text-center py-8 text-gray-500">No comparison data available</div>;
  }

  // Transform data for charts
  const chartData = comparisonData.map(item => ({
    routeId: item.routeId,
    baseline: item.baselineGhgIntensity,
    comparison: item.comparisonGhgIntensity,
    percentDiff: item.percentDiff,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">GHG Intensity Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="routeId" />
              <YAxis label={{ value: 'GHG Intensity (gCO₂e/MJ)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="baseline" fill="#3b82f6" name="Baseline" />
              <Bar dataKey="comparison" fill="#10b981" name="Comparison" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">% Difference from Baseline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="routeId" />
              <YAxis label={{ value: '% Difference', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="percentDiff" stroke="#ef4444" name="% Difference" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Route</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Vessel Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Fuel Type</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Baseline</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Comparison</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">% Diff</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Target</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Compliant</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {comparisonData.map(item => (
              <tr key={item.routeId} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{item.routeId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.vesselType}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.fuelType}</td>
                <td className="px-6 py-4 text-sm text-right">{item.baselineGhgIntensity.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-right">{item.comparisonGhgIntensity.toFixed(2)}</td>
                <td className={`px-6 py-4 text-sm text-right font-medium ${
                  item.percentDiff > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {item.percentDiff > 0 ? '+' : ''}{item.percentDiff.toFixed(2)}%
                </td>
                <td className="px-6 py-4 text-sm text-right">{item.target.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  {item.compliant ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}