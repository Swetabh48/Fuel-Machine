import { useState } from 'react';
import { complianceApiClient } from '../../infrastructure/api/ComplianceApiClient';
import { bankingApiClient } from '../../infrastructure/api/BankingApiClient';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorAlert from './common/ErrorAlert';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface CBData {
  shipId: string;
  year: number;
  cbGco2eq: number;
  cbBefore: number;
  applied: number;
  cbAfter: number;
}

export default function BankingTab() {
  const [shipId, setShipId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [cbData, setCbData] = useState<CBData | null>(null);
  const [bankAmount, setBankAmount] = useState(0);
  const [applyAmount, setApplyAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFetchCB = async () => {
    if (!shipId || !year) {
      setError('Please enter both Ship ID and Year');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Fetch compliance balance
      const cbResponse = await complianceApiClient.getComplianceBalance(shipId, year);
      
      // Fetch adjusted CB (after banking)
      let adjustedCb = { cbBefore: 0, applied: 0, cbAfter: 0 };
      try {
        adjustedCb = await complianceApiClient.getAdjustedCB(shipId, year);
      } catch (err) {
        // If endpoint doesn't exist, calculate from current CB
        const currentCb = cbResponse?.cbGco2eq || 0;
        adjustedCb = { 
          cbBefore: currentCb, 
          applied: 0, 
          cbAfter: currentCb 
        };
      }

      // Map response to CBData
      setCbData({
        shipId: cbResponse?.shipId || shipId,
        year: cbResponse?.year || year,
        cbGco2eq: cbResponse?.cbGco2eq || cbResponse?.cb || 0,
        cbBefore: adjustedCb?.cbBefore ?? cbResponse?.cbGco2eq ?? 0,
        applied: adjustedCb?.applied ?? 0,
        cbAfter: adjustedCb?.cbAfter ?? cbResponse?.cbGco2eq ?? 0,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to fetch compliance balance'
      );
      setCbData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBank = async () => {
    if (!cbData || !shipId) {
      setActionError('Please fetch compliance balance first');
      return;
    }

    if (bankAmount <= 0) {
      setActionError('Amount must be greater than 0');
      return;
    }

    const availableToBank = cbData.cbGco2eq || 0;
    if (bankAmount > availableToBank) {
      setActionError(
        `Amount exceeds available CB (${availableToBank.toFixed(2)})`
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      setSuccess(null);

      await bankingApiClient.bankSurplus({
        shipId,
        year,
        amount: bankAmount,
      });

      setSuccess(`Successfully banked ${bankAmount.toFixed(2)} gCO₂eq!`);
      setBankAmount(0);

      // Refresh CB data
      await handleFetchCB();
    } catch (err: any) {
      setActionError(
        err.response?.data?.error || err.message || 'Failed to bank surplus'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApply = async () => {
    if (!cbData || !shipId) {
      setActionError('Please fetch compliance balance first');
      return;
    }

    if (applyAmount <= 0) {
      setActionError('Amount must be greater than 0');
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      setSuccess(null);

      const result = await bankingApiClient.applyBanked({
        shipId,
        amount: applyAmount,
      });

      setSuccess(
        `Successfully applied ${result.applied?.toFixed(2) || applyAmount.toFixed(2)} gCO₂eq from banked surplus!`
      );
      setApplyAmount(0);

      // Refresh CB data
      await handleFetchCB();
    } catch (err: any) {
      setActionError(
        err.response?.data?.error ||
          err.message ||
          'Failed to apply banked surplus'
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fetch Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-fuel-blue" />
            Fetch Compliance Balance
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ship ID (e.g., R001)"
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
            />
            <input
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
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

        {/* CB Display */}
        {cbData && (
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current CB</p>
                  <p className="text-2xl font-bold text-fuel-blue">
                    {cbData.cbGco2eq?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">gCO₂eq</p>
                </div>
                {cbData.cbGco2eq >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-fuel-green" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-fuel-red" />
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Applied</p>
                <p className="text-2xl font-bold text-purple-600">
                  {cbData.applied?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">From bank</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Adjusted CB</p>
                <p
                  className={`text-2xl font-bold ${
                    cbData.cbAfter >= 0 ? 'text-fuel-green' : 'text-fuel-red'
                  }`}
                >
                  {cbData.cbAfter?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">After banking</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && <ErrorAlert message={error} />}
      {actionError && <ErrorAlert message={actionError} />}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-fuel-green font-medium">
          {success}
        </div>
      )}

      {/* Bank Surplus Section */}
      {cbData && cbData.cbGco2eq > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Bank Surplus</h3>
          <p className="text-sm text-gray-600 mb-4">
            Available to bank:{' '}
            <span className="font-bold text-fuel-green">
              {cbData.cbGco2eq.toFixed(2)} gCO₂eq
            </span>
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Amount to bank"
              value={bankAmount || ''}
              onChange={(e) => setBankAmount(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
              min="0"
              max={cbData.cbGco2eq}
              step="0.01"
            />
            <button
              onClick={handleBank}
              disabled={
                bankAmount <= 0 || actionLoading || bankAmount > cbData.cbGco2eq
              }
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Processing...' : 'Bank Surplus'}
            </button>
          </div>
        </div>
      )}

      {/* Apply Banked Section */}
      {cbData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Apply Banked Surplus</h3>
          <p className="text-sm text-gray-600 mb-4">
            Apply previously banked surplus to improve your compliance balance
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Amount to apply"
              value={applyAmount || ''}
              onChange={(e) => setApplyAmount(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuel-blue"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleApply}
              disabled={applyAmount <= 0 || actionLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Processing...' : 'Apply Banked'}
            </button>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner />}
    </div>
  );
}
