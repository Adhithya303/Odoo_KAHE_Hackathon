import React, { useState } from 'react';
import { getCurrentSeason } from '../utils/seasonUtils';
import { useTrendingDestinations } from '../hooks/useTrending';
import SeasonBanner from '../components/trends/SeasonBanner';
import SeasonFilterBar from '../components/trends/SeasonFilterBar';
import TrendCard from '../components/trends/TrendCard';

export default function InternationalTrendsPage() {
  const [activeSeason, setActiveSeason] = useState(getCurrentSeason());
  const [sortBy, setSortBy] = useState('popularity');
  const [expandedId, setExpandedId] = useState(null);
  const [visaFilter, setVisaFilter] = useState('all');
  
  const { data } = useTrendingDestinations(activeSeason, 'international');
  
  let filtered = data;
  if (visaFilter !== 'all') {
    filtered = data.filter(d => d.visaStatus === visaFilter);
  }
  
  const sorted = [...filtered].sort((a, b) => {
    const budgetA = parseInt(a.avgBudgetINR.replace(/[^0-9]/g, '').slice(0, -3)) || 0;
    const budgetB = parseInt(b.avgBudgetINR.replace(/[^0-9]/g, '').slice(0, -3)) || 0;
    
    if (sortBy === 'budget-low') return budgetA - budgetB;
    if (sortBy === 'budget-high') return budgetB - budgetA;
    return b.searchVolume - a.searchVolume;
  });

  return (
    <div className="min-h-screen bg-[#F5ECD7]">
      <SeasonBanner season={activeSeason} compact onSeasonChange={setActiveSeason} />
      <SeasonFilterBar activeSeason={activeSeason} onChange={setActiveSeason} sortBy={sortBy} onSortChange={setSortBy} />
      
      {/* Visa filter bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setVisaFilter('all')} 
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${visaFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Visa Types
          </button>
          <button 
            onClick={() => setVisaFilter('free')} 
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${visaFilter === 'free' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            🟢 Visa-free
          </button>
          <button 
            onClick={() => setVisaFilter('evisa')} 
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${visaFilter === 'evisa' ? 'bg-yellow-600 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
          >
            🟡 e-Visa
          </button>
          <button 
            onClick={() => setVisaFilter('required')} 
            className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${visaFilter === 'required' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
          >
            🔴 Visa required
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {sorted.map((d, i) => (
            <TrendCard
              key={d.id}
              destination={d}
              index={i}
              showExpanded={expandedId === d.id}
              onToggleExpand={() => setExpandedId(expandedId === d.id ? null : d.id)}
            />
          ))}
        </div>
        
        {sorted.length === 0 && (
          <div className="text-center py-24 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 mt-8">
            <p className="text-5xl mb-4">🗺️</p>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">No destinations match filters</h2>
            <p>Try changing the season or visa type.</p>
          </div>
        )}
      </div>
    </div>
  );
}
