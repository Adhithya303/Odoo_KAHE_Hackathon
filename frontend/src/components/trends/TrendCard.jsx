import React from 'react';
import { ChevronDown, ChevronUp, Plane } from 'lucide-react';
import { SEASON_META } from '../../utils/seasonUtils';
import WhyTrendingPanel from './WhyTrendingPanel';

export default function TrendCard({ destination, index, showExpanded, onToggleExpand }) {
  // Use the primary season for badge
  const season = destination.seasons[0];
  const meta = SEASON_META[season];

  return (
    <div 
      className="card group cursor-pointer relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 opacity-0 animate-fade-in-up flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={onToggleExpand}
    >
      {/* Hero Image */}
      <div className="relative h-56 overflow-hidden flex-shrink-0">
        <img 
          src={destination.heroImage} 
          alt={destination.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          loading="lazy" 
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Trend Badge */}
        <span className="absolute top-3 left-3 bg-[#D85A30] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {destination.trendBadge}
        </span>
        
        {/* Season Tag */}
        <span className="absolute top-3 right-3 bg-white/20 backdrop-blur text-white text-xs px-2 py-1 rounded-full border border-white/30">
          {meta.emoji} {meta.label} pick
        </span>
        
        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white/80 text-xs uppercase tracking-wider mb-1 font-medium">{destination.location}</p>
          <h3 className="text-white font-display text-2xl font-bold">{destination.name}</h3>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
          {destination.trendReason}
        </p>
        
        <div className="flex items-center justify-between mt-auto mb-3">
          <span className="text-xs text-[#0F6E56] font-semibold">{destination.avgBudgetINR} / person</span>
          <span className="text-xs text-gray-500">{destination.travelTime}</span>
        </div>
        
        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-4">
          {destination.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className={`text-xs px-2 py-1 rounded-full font-medium ${idx === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
              {tag}
            </span>
          ))}
        </div>

        {/* International specifics */}
        {destination.type === 'international' && (
          <div className="mb-4 pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
               <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                 destination.visaStatus === 'free' ? 'bg-green-100 text-green-700' : 
                 destination.visaStatus === 'evisa' ? 'bg-yellow-100 text-yellow-700' : 
                 'bg-red-100 text-red-700'
               }`}>
                 {destination.visaStatus === 'free' ? '🟢 Visa-free' : 
                  destination.visaStatus === 'evisa' ? '🟡 e-Visa' : 
                  '🔴 Visa required'}
               </span>
               {destination.flightHours && (
                 <span className="text-xs text-gray-500 flex items-center gap-1">
                   <Plane size={12} /> {destination.flightHours}
                 </span>
               )}
            </div>
            {destination.currencyTip && (
              <p className="text-xs italic text-gray-500">{destination.currencyTip}</p>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span>📈 {destination.searchVolume.toLocaleString()} searches</span>
          <span className="text-green-600 font-medium">+12%</span>
        </div>
        
        {/* Expand trigger */}
        <button 
          className="mt-4 w-full text-sm font-semibold text-[#0F6E56] flex items-center justify-center gap-1 hover:gap-2 transition-all py-2 bg-[#0F6E56]/5 rounded-md hover:bg-[#0F6E56]/10"
        >
          {showExpanded ? 'Hide' : "Why it's trending"} 
          {showExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      
      {/* Expandable Panel */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${showExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showExpanded && <WhyTrendingPanel destination={destination} />}
      </div>
    </div>
  );
}
