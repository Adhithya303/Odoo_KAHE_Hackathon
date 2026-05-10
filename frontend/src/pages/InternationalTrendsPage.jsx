import React, { useState } from 'react';
import { Globe, Star, Plane, ArrowRight, Sparkles, Check, Info, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';
import { getCurrentSeason } from '../utils/seasonUtils';
import { useTrendingDestinations } from '../hooks/useTrending';
import SeasonBanner from '../components/trends/SeasonBanner';
import SeasonFilterBar from '../components/trends/SeasonFilterBar';
import TrendCard from '../components/trends/TrendCard';

const DESTINATIONS = [
  {
    name: 'Bali',
    description: 'A tropical paradise in Indonesia known for its forested volcanic mountains, iconic rice paddies, and beaches.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    price: '$899',
    tags: ['Tropical', 'Temples', 'Yoga'],
  },
  {
    name: 'Dubai',
    description: 'The city of the future, famous for luxury shopping, ultramodern architecture, and a lively nightlife scene.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea466f88797?auto=format&fit=crop&q=80&w=1000',
    rating: 4.8,
    price: '$1,299',
    tags: ['Luxury', 'Modern', 'Desert'],
  },
  {
    name: 'Switzerland',
    description: 'A mountainous Central European country, home to numerous lakes, villages and the high peaks of the Alps.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    price: '$2,499',
    tags: ['Alps', 'Nature', 'Scenic'],
  },
  {
    name: 'Paris',
    description: "France's capital, a major European city and a global center for art, fashion, gastronomy and culture.",
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000',
    rating: 4.7,
    price: '$1,599',
    tags: ['Art', 'History', 'Romance'],
  },
  {
    name: 'Maldives',
    description: 'A tropical nation in the Indian Ocean composed of 26 ring-shaped atolls, which are made up of more than 1,000 coral islands.',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    price: '$3,199',
    tags: ['Overwater', 'Luxury', 'Relax'],
  },
  {
    name: 'Thailand',
    description: 'Known for tropical beaches, opulent royal palaces, ancient ruins and ornate temples displaying figures of Buddha.',
    image: 'https://images.unsplash.com/photo-1528181304800-2f140819ad1c?auto=format&fit=crop&q=80&w=1000',
    rating: 4.8,
    price: '$749',
    tags: ['Islands', 'Culture', 'Food'],
  },
];

const PACKAGES = {
  Bali: [
    { name: 'Island Spirit', price: '$899', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Beachfront Hotel', 'Daily Yoga Session', 'Uluwatu Temple Tour', 'Airport Transfers'] },
    { name: 'Tropical Deluxe', price: '$1,499', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Private Pool Villa', 'All Meals Included', 'Mount Batur Trekking', 'Balinese Massage'] },
    { name: 'Ultimate Serenity', price: '$2,499', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Luxury Cliffside Resort', 'Private Chef', 'Helicopter Island Tour', 'VIP Concierge'] },
  ],
  Dubai: [
    { name: 'Desert Basic', price: '$1,299', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Modern City Hotel', 'Desert Safari Dinner', 'Burj Khalifa Tickets', 'Metro Pass'] },
    { name: 'Skyline Premium', price: '$2,199', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Downtown 5-Star Hotel', 'Private Yacht Cruise', 'Ski Dubai Passes', 'Luxury Car Rental'] },
    { name: 'Royal Emirates', price: '$4,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Burj Al Arab Stay', 'Private Skydivng', 'Gold Souk VIP Tour', 'Chauffeur Driven Rolls Royce'] },
  ],
  Switzerland: [
    { name: 'Alpine Basic', price: '$2,499', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Village Guesthouse', 'Swiss Rail Pass', 'Mount Titlis Entry', 'Lake Lucerne Boat'] },
    { name: 'Glacier Premium', price: '$3,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Interlaken 5-Star Resort', 'Jungfraujoch Tour', 'Private Chocolate Workshop', 'First Class Rail'] },
    { name: 'Summit Luxury', price: '$7,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['St. Moritz Palace Stay', 'Private Ski Instructor', 'Helicopter Glacier Tour', 'Michelin Star Dining'] },
  ],
  Paris: [
    { name: 'Bistro Basic', price: '$1,599', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Charming Boutique Hotel', 'Eiffel Tower Entry', 'Louvre Museum Tour', 'Seine River Cruise'] },
    { name: 'Luxe Parisian', price: '$2,899', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['5-Star Opera District Stay', 'Private Fashion Tour', 'Champagne at Lido', 'Versailles VIP Access'] },
    { name: 'Royal Riviera', price: '$5,499', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['The Ritz Paris Stay', 'Private Vineyard Trip', 'Personal Shopper', 'Private Art Historian Guide'] },
  ],
  Maldives: [
    { name: 'Atoll Basic', price: '$3,199', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Beachfront Bungalow', 'Speedboat Transfer', 'Sunset Fishing Trip', 'Snorkeling Gear'] },
    { name: 'Overwater Premium', price: '$5,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Overwater Villa', 'All Inclusive Meals', 'Seaplane Transfer', 'Private Manta Ray Dive'] },
    { name: 'Oceanic Royalty', price: '$12,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Underwater Bedroom Suite', 'Private Island Access', 'Personal Butler 24/7', 'Private Spa & Cinema'] },
  ],
  Thailand: [
    { name: 'Island Hopper', price: '$749', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Krabi Beach Hotel', 'Phi Phi Island Tour', 'Thai Cooking Class', 'Tuk Tuk City Tour'] },
    { name: 'Siam Premium', price: '$1,399', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Bangkok Riverside Hotel', 'Private Boat Canal Tour', 'Full Board Thai Dining', 'Spa Sanctuary Day'] },
    { name: 'Lanna Luxury', price: '$2,599', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Chiang Mai Jungle Resort', 'Private Elephant Sanctuary', 'Hot Air Balloon Ride', 'Luxury Villa with Pool'] },
  ],
};

const ShieldCheck = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default function InternationalTrendsPage() {
  const [activeSeason, setActiveSeason] = useState(getCurrentSeason());
  const [sortBy, setSortBy] = useState('popularity');
  const [expandedId, setExpandedId] = useState(null);
  const [visaFilter, setVisaFilter] = useState('all');
  const [selectedDest, setSelectedDest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openExploreModal = (dest) => {
    setSelectedDest(dest);
    setIsModalOpen(true);
  };

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

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {DESTINATIONS.map((dest, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 flex flex-col border border-slate-100"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60"></div>
                <div className="absolute top-6 left-6">
                  <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-bold flex items-center gap-2">
                    <Plane className="w-3 h-3" />
                    Top Rated
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-3xl font-bold text-white mb-2">{dest.name}</h3>
                  <div className="flex gap-2">
                    {dest.tags.map((tag, j) => (
                      <span key={j} className="text-[10px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-widest border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  {dest.description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-slate-900">{dest.rating}</span>
                    <span className="text-slate-400 text-xs">(Global Rank)</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Avg. Package</span>
                    <span className="text-2xl font-black text-slate-900">{dest.price}</span>
                  </div>
                </div>
                <button
                  onClick={() => openExploreModal(dest)}
                  className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-purple-600 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  Explore {dest.name}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedDest ? `${selectedDest.name} International Packages` : 'Package Details'}
          size="lg"
        >
          {selectedDest && (
            <div className="space-y-6">
              <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                <img src={selectedDest.image} alt={selectedDest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h4 className="text-2xl font-bold text-white">{selectedDest.name}</h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(PACKAGES[selectedDest.name] || []).map((pkg, idx) => (
                  <div key={idx} className="border border-slate-100 rounded-3xl p-5 hover:border-purple-200 hover:shadow-md transition-all flex flex-col bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      {pkg.icon}
                      <span className="font-bold text-slate-900 text-sm">{pkg.name}</span>
                    </div>
                    <div className="text-xl font-black text-slate-900 mb-4">{pkg.price}</div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {pkg.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors">
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-purple-50 rounded-2xl p-4 flex gap-3 items-start border border-purple-100">
                <Info className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <p className="text-xs text-purple-700 leading-relaxed">
                  International package prices are estimates and may vary based on flight availability and exchange rates. All plans include 24/7 global support and visa assistance.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
                <Link
                  to="/discover"
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                >
                  Plan This Trip
                </Link>
              </div>
            </div>
          )}
        </Modal>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Visa Support', value: '180+', sub: 'Countries covered by our AI assistant', icon: <Sparkles className="w-6 h-6 text-yellow-500" /> },
            { label: 'Live Translation', value: '50+', sub: 'Languages supported in our travel guides', icon: <Globe className="w-6 h-6 text-blue-500" /> },
            { label: 'Secure Booking', value: '100%', sub: 'Verified international travel partners', icon: <ShieldCheck className="w-6 h-6 text-green-500" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-purple-200 transition-colors">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-50 transition-colors">
                {stat.icon}
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-slate-800 mb-2">{stat.label}</div>
              <p className="text-gray-400 text-xs">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
