import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentSeason } from '../utils/seasonUtils';
import { useTrendingDestinations } from '../hooks/useTrending';
import SeasonBanner from '../components/trends/SeasonBanner';
import TrendCard from '../components/trends/TrendCard';
import { TrendingUp, Sun, DollarSign } from 'lucide-react';

export default function TrendsPage() {
  const [activeSeason, setActiveSeason] = useState(getCurrentSeason());
  const { data: allDestinations } = useTrendingDestinations(activeSeason);
  const [expandedId, setExpandedId] = useState(null);
  
  const domestic = allDestinations.filter(d => d.type === 'domestic').slice(0, 4);
  const international = allDestinations.filter(d => d.type === 'international').slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F5ECD7]">
      <SeasonBanner season={activeSeason} onSeasonChange={setActiveSeason} />
      
      {/* Why these destinations strip */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <TrendingUp className="text-[#D85A30] mb-3" size={32} />
              <h3 className="font-semibold text-gray-900 text-lg">Trending searches</h3>
              <p className="text-gray-500 text-sm mt-1">Based on millions of recent traveler queries</p>
            </div>
            <div className="flex flex-col items-center">
              <Sun className="text-[#0F6E56] mb-3" size={32} />
              <h3 className="font-semibold text-gray-900 text-lg">Ideal weather</h3>
              <p className="text-gray-500 text-sm mt-1">Perfect conditions for this time of year</p>
            </div>
            <div className="flex flex-col items-center">
              <DollarSign className="text-blue-500 mb-3" size={32} />
              <h3 className="font-semibold text-gray-900 text-lg">Best value</h3>
              <p className="text-gray-500 text-sm mt-1">Maximize your experience and budget</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Domestic section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[#0F6E56] font-semibold text-sm uppercase tracking-widest mb-1">Trending in India</p>
              <h2 className="font-display text-3xl font-bold text-gray-900">Domestic Picks</h2>
            </div>
            <Link to="/trends/domestic" className="text-[#0F6E56] hover:text-[#0c5c48] font-semibold text-sm transition-colors">View all &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {domestic.map((d, i) => (
              <TrendCard 
                key={d.id} 
                destination={d} 
                index={i} 
                showExpanded={expandedId === d.id}
                onToggleExpand={() => setExpandedId(expandedId === d.id ? null : d.id)}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* International section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[#0F6E56] font-semibold text-sm uppercase tracking-widest mb-1">Global Getaways</p>
              <h2 className="font-display text-3xl font-bold text-gray-900">International Highlights</h2>
            </div>
            <Link to="/trends/international" className="text-[#0F6E56] hover:text-[#0c5c48] font-semibold text-sm transition-colors">View all &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {international.map((d, i) => (
              <TrendCard 
                key={d.id} 
                destination={d} 
                index={i} 
                showExpanded={expandedId === d.id}
                onToggleExpand={() => setExpandedId(expandedId === d.id ? null : d.id)}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Seasonal tip card */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-100 to-yellow-50 rounded-2xl p-8 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="text-5xl">💡</div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">Seasonal Pro Tip</h3>
              <p className="text-amber-800">
                Book your accommodations and flights for trending destinations at least 3 months in advance to avoid peak season surge pricing and secure the best spots!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
