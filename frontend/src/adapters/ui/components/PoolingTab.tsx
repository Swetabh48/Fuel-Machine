import { useState } from 'react';
import { poolingApiClient } from '../../infrastructure/api/PoolingApiClient';
import { complianceApiClient } from '../../infrastructure/api/ComplianceApiClient';
import { PoolMember } from '../../../core/domain/models/types';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function PoolingTab() {
  const [poolMembers, setPoolMembers] = useState<PoolMember[]>([]);
  const [newShipId, setNewShipId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const addMember = async () => {
    if (!newShipId) {
      setError('Please enter a Ship ID');
      return;
    }

    // Check for duplicates
    if (poolMembers.some(m => m.shipId === newShipId)) {
      setError('This ship is already in the pool');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDebugInfo(`Fetching CB for ${newShipId} in year ${year}...`);
      
      // Try to get adjusted CB first
      let cbValue = 0;
      let adjustedValue = 0;
      
      try {
        const adjustedCb = await complianceApiClient.getAdjustedCB(newShipId, year);
        cbValue = adjustedCb.cbBefore || adjustedCb.cb || 0;
        adjustedValue = adjustedCb.cbAfter || adjustedCb.adjustedCb || cbValue;
        setDebugInfo(`Adjusted CB Response: ${JSON.stringify(adjustedCb, null, 2)}`);
      } catch (adjustedErr) {
        // Fallback to regular CB
        try {
          const cbResponse = await complianceApiClient.getComplianceBalance(newShipId, year);
          cbValue = cbResponse.cb || 0;
          adjustedValue = cbValue;
          setDebugInfo(`CB Response: ${JSON.stringify(cbResponse, null, 2)}`);
        } catch (cbErr: any) {
          throw new Error(`No compliance data found for ${newShipId} in year ${year}`);
        }
      }

      const newMember: PoolMember = {
        shipId: newShipId,
        cbBefore: cbValue,
        cbAfter: cbValue, // Initialize with same value
        cbAdjusted: adjustedValue,
      };

      setPoolMembers([...poolMembers, newMember]);
      setNewShipId('');
      setSuccess(`Added ${newShipId} to pool with CB: ${cbValue.toFixed(2)}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to add member';
      setError(`Error: ${errorMsg}`);
      if (err.response?.data) {
        setDebugInfo(`Error details: ${JSON.stringify(err.response.data, null, 2)}`);
      }
      console.error('Add member error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = (shipId: string) => {
    setPoolMembers(poolMembers.filter(m => m.shipId !== shipId));
    setSuccess(`Removed ${shipId} from pool`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const updateMemberCbAfter = (shipId: string, newCbAfter: number) => {
    setPoolMembers(
      poolMembers.map(m =>
        m.shipId === shipId ? { ...m, cbAfter: newCbAfter } : m
      )
    );
  };

  const handleCreatePool = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (poolMembers.length === 0) {
        setError('Add at least one member to create a pool');
        setLoading(false);
        return;
      }

      const totalCB = poolMembers.reduce((sum, m) => sum + m.cbBefore, 0);

      if (totalCB < 0) {
        setError('Pool total CB cannot be negative. Total CB before pooling must be >= 0');
        setLoading(false);
        return;
      }

      // Validate individual members
      for (const member of poolMembers) {
        if (member.cbBefore < 0 && member.cbAfter < member.cbBefore) {
          setError(`Deficit ship ${member.shipId} cannot exit in worse position`);
          setLoading(false);
          return;
        }
        if (member.cbBefore > 0 && member.cbAfter < 0) {
          setError(`Surplus ship ${member.shipId} cannot exit with a deficit`);
          setLoading(false);
          return;
        }
      }

      const payload = {
        year,
        members: poolMembers,
      };

      setDebugInfo(`Creating pool with payload: ${JSON.stringify(payload, null, 2)}`);

      const response = await poolingApiClient.createPool(payload);
      
      setDebugInfo(`Pool created: ${JSON.stringify(response, null, 2)}`);
      setSuccess('Pool created successfully!');
      setPoolMembers([]);
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create pool';
      setError(`Error creating pool: ${errorMsg}`);
      if (err.response?.data) {
        setDebugInfo(`Error details: ${JSON.stringify(err.response.data, null, 2)}`);
      }
      console.error('Create pool error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const totalCBBefore = poolMembers.reduce((sum, m) => sum + m.cbBefore, 0);
  const totalCBAfter = poolMembers.reduce((sum, m) => sum + m.cbAfter, 0);
  const isValid = totalCBBefore >= 0 && poolMembers.length > 0;

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="font-bold">Debug Info</span>
            </div>
            <button
              onClick={() => setDebugInfo(null)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
          <pre>{debugInfo}</pre>
        </div>
      )}

      {error && <ErrorAlert message={error} />}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-fuel-green flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add Pool Members</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                placeholder="Year"
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Ship ID (e.g., R001)"
              value={newShipId}
              onChange={e => setNewShipId(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addMember()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
            />
            <button
              onClick={addMember}
              disabled={!newShipId || loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>

      {poolMembers.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Pool Total CB (Before)</p>
                <p className={`text-2xl font-bold ${totalCBBefore >= 0 ? 'text-fuel-green' : 'text-fuel-red'}`}>
                  {totalCBBefore.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">gCO₂eq</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Pool Total CB (After)</p>
                <p className={`text-2xl font-bold ${totalCBAfter >= 0 ? 'text-fuel-green' : 'text-fuel-red'}`}>
                  {totalCBAfter.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">gCO₂eq</p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">Members</p>
                <p className="text-2xl font-bold text-yellow-600">{poolMembers.length}</p>
              </div>
            </div>

            {!isValid && (
              <div className="flex items-center gap-2 text-fuel-red mb-4 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span>
                  {totalCBBefore < 0 
                    ? 'Pool total CB before pooling cannot be negative' 
                    : 'Add members to create pool'}
                </span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Ship ID</th>
                    <th className="px-4 py-2 text-right">CB Before</th>
                    <th className="px-4 py-2 text-right">CB After (Edit)</th>
                    <th className="px-4 py-2 text-right">CB Adjusted</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {poolMembers.map(member => (
                    <tr key={member.shipId} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{member.shipId}</td>
                      <td className={`px-4 py-2 text-right ${member.cbBefore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {member.cbBefore.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          value={member.cbAfter}
                          onChange={e => updateMemberCbAfter(member.shipId, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border rounded text-right"
                          step="0.01"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">{member.cbAdjusted.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        {member.cbBefore >= 0 ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Surplus</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Deficit</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => removeMember(member.shipId)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
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
              className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Pool...' : 'Create Pool'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}