import { useComparison } from '../hooks/useComparison';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function CompareTab() {
  const { comparisonData, loading, error } = useComparison();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">GHG Intensity Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
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
          <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="routeId" />
              <YAxis label={{ value: '% Difference', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="percentDiff" stroke="#ef4444" name="% Difference" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Route</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Baseline</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Comparison</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">% Diff</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Compliant</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {comparisonData.map(item => (
              <tr key={item.routeId} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{item.routeId}</td>
                <td className="px-6 py-4 text-sm text-right">{item.baseline.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-right">{item.comparison.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-right">{item.percentDiff.toFixed(2)}%</td>
                <td className="px-6 py-4 text-center">
                  {item.compliant ? (
                    <CheckCircle2 className="w-5 h-5 text-fuel-green mx-auto" />
                  ) : (
                    <XCircle className="w-5 h-5 text-fuel-red mx-auto" />
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
