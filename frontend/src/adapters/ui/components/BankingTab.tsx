import { useState } from 'react';
import { useCompliance } from '../hooks/useCompliance';
import { bankingApiClient } from '../../infrastructure/api/BankingApiClient';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function BankingTab() {
  const { cb, loading, error, fetchCB } = useCompliance();
  const [shipId, setShipId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [bankAmount, setBankAmount] = useState(0);
  const [applyAmount, setApplyAmount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFetchCB = async () => {
    await fetchCB(shipId, year);
    setSuccess(null);
  };

  const handleBank = async () => {
    if (!cb || !shipId) {
      setActionError('Please fetch compliance balance first');
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await bankingApiClient.bankSurplus({ shipId, year, amount: bankAmount });
      setSuccess('Successfully banked surplus!');
      setBankAmount(0);
      await handleFetchCB();
    } catch (err: any) {
      setActionError(err.message || 'Failed to bank surplus');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApply = async () => {
    if (!cb || !shipId) {
      setActionError('Please fetch compliance balance first');
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await bankingApiClient.applyBanked({ shipId, year, amount: applyAmount });
      setSuccess('Successfully applied banked surplus!');
      setApplyAmount(0);
      await handleFetchCB();
    } catch (err: any) {
      setActionError(err.message || 'Failed to apply banked surplus');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Fetch Compliance Balance</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ship ID"
              value={shipId}
              onChange={e => setShipId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
            />
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
            />
            <button
              onClick={handleFetchCB}
              className="btn-primary w-full"
              disabled={!shipId || loading}
            >
              {loading ? 'Loading...' : 'Fetch CB'}
            </button>
          </div>
        </div>

        {cb && (
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current CB</p>
                  <p className="text-2xl font-bold text-fuel-blue">{cb.cbGco2eq?.toFixed(2) || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-1">gCO₂eq</p>
                </div>
                {cb.cbGco2eq && cb.cbGco2eq >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-fuel-green" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-fuel-red" />
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Adjusted CB</p>
                <p className="text-2xl font-bold text-fuel-green">{cb.adjustedCb?.toFixed(2) || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">After banking</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <ErrorAlert message={error} />}
      {actionError && <ErrorAlert message={actionError} />}
      {success && <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-fuel-green">{success}</div>}

      {cb && cb.cbGco2eq > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Bank Surplus</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Amount to bank"
              value={bankAmount}
              onChange={e => setBankAmount(parseFloat(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
            />
            <button
              onClick={handleBank}
              disabled={bankAmount <= 0 || actionLoading}
              className="btn-primary"
            >
              {actionLoading ? 'Processing...' : 'Bank Surplus'}
            </button>
          </div>
        </div>
      )}

      {cb && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Apply Banked Surplus</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Amount to apply"
              value={applyAmount}
              onChange={e => setApplyAmount(parseFloat(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
            />
            <button
              onClick={handleApply}
              disabled={applyAmount <= 0 || actionLoading}
              className="btn-primary"
            >
              {actionLoading ? 'Processing...' : 'Apply Banked'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
