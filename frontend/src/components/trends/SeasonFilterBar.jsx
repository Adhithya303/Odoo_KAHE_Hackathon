import React from 'react';
import { SEASON_META } from '../../utils/seasonUtils';

export default function SeasonFilterBar({ activeSeason, onChange, sortBy, onSortChange }) {
  const seasons = Object.keys(SEASON_META);

  return (
    <div className="sticky top-0 z-10 bg-[#F5ECD7] border-b border-gray-200 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Row 1/Left: Season pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {seasons.map(s => (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                activeSeason === s 
                  ? 'bg-[#0F6E56] text-white shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {SEASON_META[s].emoji} {SEASON_META[s].label}
            </button>
          ))}
        </div>

        {/* Row 2/Right: Sort/Filter */}
        <div className="flex w-full sm:w-auto justify-start sm:justify-end">
          <select 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
            className="text-sm bg-white border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F6E56] focus:border-[#0F6E56] cursor-pointer shadow-sm"
          >
            <option value="popularity">🔥 Sort by Popularity</option>
            <option value="budget-low">💸 Budget: Low to High</option>
            <option value="budget-high">💎 Budget: High to Low</option>
          </select>
        </div>

      </div>
    </div>
  );
}
