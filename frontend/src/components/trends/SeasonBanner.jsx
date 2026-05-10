import React from 'react';
import { SEASON_META } from '../../utils/seasonUtils';

export default function SeasonBanner({ season, compact = false, onSeasonChange }) {
  const meta = SEASON_META[season];
  const seasons = Object.keys(SEASON_META);

  return (
    <div className={`relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${meta.gradient}`}>
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{ backgroundImage: `url('${meta.bgPattern}')`, backgroundSize: '40px 40px' }}
      />
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center ${compact ? 'py-12' : 'py-20'}`}>
        <span className="inline-block bg-white/60 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 shadow-sm border border-white/50">
          Currently: {meta.label} &middot; {meta.months}
        </span>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-gray-900 mb-4 transition-colors duration-500">
          {meta.emoji} {meta.label} Escapes
        </h1>
        {!compact && (
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mb-8 font-medium">
            {meta.tagline}
          </p>
        )}
        
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {seasons.map(s => (
            <button
              key={s}
              onClick={() => onSeasonChange(s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                season === s 
                  ? 'bg-slate-800 text-white shadow-md scale-105' 
                  : 'bg-white/50 text-gray-700 hover:bg-white/80 border border-gray-200'
              }`}
              aria-pressed={season === s}
            >
              {SEASON_META[s].emoji} {SEASON_META[s].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 opacity-80 flex items-center gap-1">
          <span>🕐</span> Auto-detected from your device date
        </p>
      </div>
    </div>
  );
}
