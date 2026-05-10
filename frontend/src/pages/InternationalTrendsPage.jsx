import React, { useState } from 'react';
import { Globe, Star, Plane, MapPin, ArrowRight, Sparkles, Check, Info, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';

const InternationalTrendsPage = () => {
  const [selectedDest, setSelectedDest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const destinations = [
    {
      name: 'Bali',
      description: 'A tropical paradise in Indonesia known for its forested volcanic mountains, iconic rice paddies, and beaches.',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
      rating: 4.9,
      price: '$899',
      tags: ['Tropical', 'Temples', 'Yoga']
    },
    {
      name: 'Dubai',
      description: 'The city of the future, famous for luxury shopping, ultramodern architecture, and a lively nightlife scene.',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea466f88797?auto=format&fit=crop&q=80&w=1000',
      rating: 4.8,
      price: '$1,299',
      tags: ['Luxury', 'Modern', 'Desert']
    },
    {
      name: 'Switzerland',
      description: 'A mountainous Central European country, home to numerous lakes, villages and the high peaks of the Alps.',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=1000',
      rating: 4.9,
      price: '$2,499',
      tags: ['Alps', 'Nature', 'Scenic']
    },
    {
      name: 'Paris',
      description: "France's capital, a major European city and a global center for art, fashion, gastronomy and culture.",
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000',
      rating: 4.7,
      price: '$1,599',
      tags: ['Art', 'History', 'Romance']
    },
    {
      name: 'Maldives',
      description: 'A tropical nation in the Indian Ocean composed of 26 ring-shaped atolls, which are made up of more than 1,000 coral islands.',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1000',
      rating: 5.0,
      price: '$3,199',
      tags: ['Overwater', 'Luxury', 'Relax']
    },
    {
      name: 'Thailand',
      description: 'Known for tropical beaches, opulent royal palaces, ancient ruins and ornate temples displaying figures of Buddha.',
      image: 'https://images.unsplash.com/photo-1528181304800-2f140819ad1c?auto=format&fit=crop&q=80&w=1000',
      rating: 4.8,
      price: '$749',
      tags: ['Islands', 'Culture', 'Food']
    }
  ];

  const packages = {
    'Bali': [
      { name: 'Island Spirit', price: '$899', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Beachfront Hotel', 'Daily Yoga Session', 'Uluwatu Temple Tour', 'Airport Transfers'] },
      { name: 'Tropical Deluxe', price: '$1,499', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Private Pool Villa', 'All Meals Included', 'Mount Batur Trekking', 'Balinese Massage'] },
      { name: 'Ultimate Serenity', price: '$2,499', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Luxury Cliffside Resort', 'Private Chef', 'Helicopter Island Tour', 'VIP Concierge'] }
    ],
    'Dubai': [
      { name: 'Desert Basic', price: '$1,299', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Modern City Hotel', 'Desert Safari Dinner', 'Burj Khalifa Tickets', 'Metro Pass'] },
      { name: 'Skyline Premium', price: '$2,199', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Downtown 5-Star Hotel', 'Private Yacht Cruise', 'Ski Dubai Passes', 'Luxury Car Rental'] },
      { name: 'Royal Emirates', price: '$4,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Burj Al Arab Stay', 'Private Skydivng', 'Gold Souk VIP Tour', 'Chauffeur Driven Rolls Royce'] }
    ],
    'Switzerland': [
      { name: 'Alpine Basic', price: '$2,499', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Village Guesthouse', 'Swiss Rail Pass', 'Mount Titlis Entry', 'Lake Lucerne Boat'] },
      { name: 'Glacier Premium', price: '$3,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Interlaken 5-Star Resort', 'Jungfraujoch Tour', 'Private Chocolate Workshop', 'First Class Rail'] },
      { name: 'Summit Luxury', price: '$7,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['St. Moritz Palace Stay', 'Private Ski Instructor', 'Helicopter Glacier Tour', 'Michelin Star Dining'] }
    ],
    'Paris': [
      { name: 'Bistro Basic', price: '$1,599', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Charming Boutique Hotel', 'Eiffel Tower Entry', 'Louvre Museum Tour', 'Seine River Cruise'] },
      { name: 'Luxe Parisian', price: '$2,899', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['5-Star Opera District Stay', 'Private Fashion Tour', 'Champagne at Lido', 'Versailles VIP Access'] },
      { name: 'Royal Riviera', price: '$5,499', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['The Ritz Paris Stay', 'Private Vineyard Trip', 'Personal Shopper', 'Private Art Historian Guide'] }
    ],
    'Maldives': [
      { name: 'Atoll Basic', price: '$3,199', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Beachfront Bungalow', 'Speedboat Transfer', 'Sunset Fishing Trip', 'Snorkeling Gear'] },
      { name: 'Overwater Premium', price: '$5,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Overwater Villa', 'All Inclusive Meals', 'Seaplane Transfer', 'Private Manta Ray Dive'] },
      { name: 'Oceanic Royalty', price: '$12,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Underwater Bedroom Suite', 'Private Island Access', 'Personal Butler 24/7', 'Private Spa & Cinema'] }
    ],
    'Thailand': [
      { name: 'Island Hopper', price: '$749', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Krabi Beach Hotel', 'Phi Phi Island Tour', 'Thai Cooking Class', 'Tuk Tuk City Tour'] },
      { name: 'Siam Premium', price: '$1,399', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Bangkok Riverside Hotel', 'Private Boat Canal Tour', 'Full Board Thai Dining', 'Spa Sanctuary Day'] },
      { name: 'Lanna Luxury', price: '$2,599', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Chiang Mai Jungle Resort', 'Private Elephant Sanctuary', 'Hot Air Balloon Ride', 'Luxury Villa with Pool'] }
    ]
  };

  const openExploreModal = (dest) => {
    setSelectedDest(dest);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Global Header */}
      <div className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute top-0 left-1/4 w-full h-full bg-gradient-to-br from-purple-600/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-8 backdrop-blur-md">
            <Globe className="w-4 h-4 text-purple-400" />
            Global Perspectives 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
            International <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Trends</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From the bustling streets of Paris to the serene atolls of the Maldives, explore where the world is traveling this season.
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {destinations.map((dest, i) => (
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

        {/* Package Details Modal */}
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
                {(packages[selectedDest.name] || []).map((pkg, idx) => (
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

        {/* Global Stats Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Visa Support', value: '180+', sub: 'Countries covered by our AI assistant', icon: <Sparkles className="w-6 h-6 text-yellow-500" /> },
            { label: 'Live Translation', value: '50+', sub: 'Languages supported in our travel guides', icon: <Globe className="w-6 h-6 text-blue-500" /> },
            { label: 'Secure Booking', value: '100%', sub: 'Verified international travel partners', icon: <ShieldCheck className="w-6 h-6 text-green-500" /> }
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
};

// Simple icon for stats
const ShieldCheck = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default InternationalTrendsPage;

