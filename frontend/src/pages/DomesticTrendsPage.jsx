import React, { useState } from 'react';
import { getCurrentSeason } from '../utils/seasonUtils';
import { useTrendingDestinations } from '../hooks/useTrending';
import SeasonBanner from '../components/trends/SeasonBanner';
import SeasonFilterBar from '../components/trends/SeasonFilterBar';
import TrendCard from '../components/trends/TrendCard';

export default function DomesticTrendsPage() {
  const [activeSeason, setActiveSeason] = useState(getCurrentSeason());
  const [sortBy, setSortBy] = useState('popularity');
  const [expandedId, setExpandedId] = useState(null);
  const { data } = useTrendingDestinations(activeSeason, 'domestic');
  
  const sorted = [...data].sort((a, b) => {
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
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">No destinations yet</h2>
            <p>We're curating picks for this season. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
