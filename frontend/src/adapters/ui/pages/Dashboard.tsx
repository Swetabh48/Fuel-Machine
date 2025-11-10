import { useState } from 'react';
import RoutesTab from '../components/RoutesTab';
import CompareTab from '../components/CompareTab';
import BankingTab from '../components/BankingTab';
import PoolingTab from '../components/PoolingTab';
import { Ship } from 'lucide-react';

type TabType = 'routes' | 'compare' | 'banking' | 'pooling';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('routes');

  const tabs = [
    { id: 'routes', label: 'Routes', icon: '📊' },
    { id: 'compare', label: 'Compare', icon: '📈' },
    { id: 'banking', label: 'Banking', icon: '🏦' },
    { id: 'pooling', label: 'Pooling', icon: '⛓️' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100">
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-inner">
              <Ship className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              FuelEU Maritime Compliance Dashboard
            </h1>
          </div>
          <p className="text-blue-100 text-sm sm:text-base font-light">
            Manage routes, compliance balance, banking, and pooling efficiently.
          </p>
        </div>
      </header>

      <div className="bg-white/70 backdrop-blur-md border-b border-blue-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex justify-start gap-2 sm:gap-6 py-3 relative">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-blue-700 bg-blue-100 shadow-inner scale-105'
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl">
          {activeTab === 'routes' && <RoutesTab />}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'banking' && <BankingTab />}
          {activeTab === 'pooling' && <PoolingTab />}
        </div>
      </main>
    </div>
  );
}
