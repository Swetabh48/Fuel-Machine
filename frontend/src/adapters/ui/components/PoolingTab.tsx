import { useState } from 'react';
import { poolingApiClient } from '../../infrastructure/api/PoolingApiClient';
import { complianceApiClient } from '../../infrastructure/api/ComplianceApiClient';
import { PoolMember } from '../../../core/domain/models/types';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function PoolingTab() {
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
  const [newShipId, setNewShipId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addMember = async () => {
    if (!newShipId) return;

    try {
      setLoading(true);
      const adjustedCb = await complianceApiClient.getAdjustedCB(newShipId, year);

      setPoolMembers([
        ...poolMembers,
        {
          shipId: newShipId,
          cbBefore: adjustedCb.cbGco2eq || 0,
          cbAfter: adjustedCb.cbGco2eq || 0,
          cbAdjusted: adjustedCb.adjustedCb || 0,
        },
      ]);
      setNewShipId('');
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = (shipId: string) => {
    setPoolMembers(poolMembers.filter(m => m.shipId !== shipId));
  };

  const handleCreatePool = async () => {
    try {
      setLoading(true);
      setError(null);

      const totalCB = poolMembers.reduce((sum, m) => sum + m.cbBefore, 0);

      if (totalCB < 0) {
        setError('Pool total CB cannot be negative');
        setLoading(false);
        return;
      }

      await poolingApiClient.createPool({
        year,
        members: poolMembers,
      });

      setSuccess('Pool created successfully!');
      setPoolMembers([]);
    } catch (err: any) {
      setError(err.message || 'Failed to create pool');
    } finally {
      setLoading(false);
    }
  };

  const totalCB = poolMembers.reduce((sum, m) => sum + m.cbBefore, 0);
  const isValid = totalCB >= 0 && poolMembers.length > 0;

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} />}
      {success && <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-fuel-green">{success}</div>}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add Pool Members</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Ship ID"
            value={newShipId}
            onChange={e => setNewShipId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
          />
          <button
            onClick={addMember}
            disabled={!newShipId || loading}
            className="btn-primary"
          >
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>

      {poolMembers.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Pool Total CB</p>
                <p className={`text-2xl font-bold ${totalCB >= 0 ? 'text-fuel-green' : 'text-fuel-red'}`}>
                  {totalCB.toFixed(2)}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">Members</p>
                <p className="text-2xl font-bold text-yellow-600">{poolMembers.length}</p>
              </div>
            </div>

            {!isValid && (
              <div className="flex items-center gap-2 text-fuel-red mb-4">
                <AlertCircle className="w-5 h-5" />
                <span>{totalCB < 0 ? 'Pool CB cannot be negative' : 'Add members to create pool'}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Ship ID</th>
                    <th className="px-4 py-2 text-right">CB Before</th>
                    <th className="px-4 py-2 text-right">CB Adjusted</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {poolMembers.map(member => (
                    <tr key={member.shipId} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{member.shipId}</td>
                      <td className="px-4 py-2 text-right">{member.cbBefore.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{member.cbAdjusted.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => removeMember(member.shipId)}
                          className="btn-secondary text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleCreatePool}
              disabled={!isValid || loading}
              className="btn-primary w-full mt-4"
            >
              {loading ? 'Creating Pool...' : 'Create Pool'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
