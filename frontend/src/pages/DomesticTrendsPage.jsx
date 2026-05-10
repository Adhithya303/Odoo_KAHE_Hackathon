import React, { useState } from 'react';
import { MapPin, Star, Clock, Users, ArrowRight, ShieldCheck, Check, Info, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';

const DomesticTrendsPage = () => {
  const [selectedDest, setSelectedDest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const destinations = [
    {
      name: 'Goa',
      description: 'The beach paradise of India, famous for its vibrant nightlife and Portuguese architecture.',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000',
      rating: 4.8,
      reviews: '2.5k',
      price: '₹5,999',
      tags: ['Beaches', 'Nightlife', 'Party']
    },
    {
      name: 'Manali',
      description: 'Nestled in the mountains of Himachal Pradesh, a perfect escape for adventure seekers.',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1000',
      rating: 4.9,
      reviews: '1.8k',
      price: '₹7,499',
      tags: ['Snow', 'Adventure', 'Hiking']
    },
    {
      name: 'Kerala',
      description: "God's Own Country, known for its serene backwaters, houseboats, and lush greenery.",
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1000',
      rating: 4.7,
      reviews: '3.2k',
      price: '₹8,999',
      tags: ['Backwaters', 'Nature', 'Relax']
    },
    {
      name: 'Ooty',
      description: 'The Queen of Hill Stations, offering picturesque tea gardens and colonial charm.',
      image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&q=80&w=1000',
      rating: 4.6,
      reviews: '1.5k',
      price: '₹4,999',
      tags: ['Hill Station', 'Tea', 'Peace']
    },
    {
      name: 'Kashmir',
      description: 'Paradise on Earth, featuring the stunning Dal Lake and majestic Himalayan peaks.',
      image: 'https://images.unsplash.com/photo-1566833917740-98305c74288b?auto=format&fit=crop&q=80&w=1000',
      rating: 4.9,
      reviews: '2.1k',
      price: '₹12,999',
      tags: ['Paradise', 'Snow', 'Lakes']
    },
    {
      name: 'Andaman',
      description: 'Pristine beaches and crystal-clear waters, a top choice for scuba diving enthusiasts.',
      image: 'https://images.unsplash.com/photo-1589135410978-71816a324482?auto=format&fit=crop&q=80&w=1000',
      rating: 4.8,
      reviews: '1.9k',
      price: '₹15,499',
      tags: ['Island', 'Scuba', 'Tropical']
    }
  ];

  const packages = {
    'Goa': [
      { name: 'Budget Bliss', price: '₹5,999', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['3 Star Hotel Stay', 'Daily Breakfast', 'North Goa Sightseeing', 'Airport Pick-up'] },
      { name: 'Standard Serenity', price: '₹9,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['4 Star Resort', 'All Meals Included', 'Scuba Diving Session', 'South Goa Private Tour'] },
      { name: 'Royal Retreat', price: '₹15,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['5 Star Luxury Villa', 'Private Yacht Cruise', 'Spa & Wellness Package', 'Personal Tour Guide'] }
    ],
    'Manali': [
      { name: 'Alpine Basic', price: '₹7,499', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Cozy Guesthouse', 'Breakfast & Dinner', 'Solang Valley Visit', 'Mall Road Tour'] },
      { name: 'Adventure Peak', price: '₹12,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Premium Hill Resort', 'All Meals', 'Paragliding Experience', 'Rohtang Pass Trip'] },
      { name: 'Himalayan Luxury', price: '₹19,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Luxury Spa Resort', 'Helicopter Ride', 'Private Riverside Dining', 'Luxury SUV for Travel'] }
    ],
    'Kerala': [
      { name: 'Backwater Basic', price: '₹8,999', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Deluxe Houseboat', 'Traditional Breakfast', 'Alleppey Tour', 'Cochin Sightseeing'] },
      { name: 'Greenery Gold', price: '₹14,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Premium Tea Garden Resort', 'Full Board Meals', 'Ayurvedic Massage', 'Munnar Safari'] },
      { name: 'God\'s Own Luxury', price: '₹22,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Uber Luxury Resort', 'Private Houseboat Cruise', 'Kathakali Performance', 'Elephant Safari'] }
    ],
    'Ooty': [
      { name: 'Mist Basic', price: '₹4,999', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Standard Hotel', 'Daily Breakfast', 'Botanical Garden Visit', 'Ooty Lake Boating'] },
      { name: 'Tea Estate Premium', price: '₹8,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Tea Estate Bungalow', 'All Meals', 'Toy Train Ride (First Class)', 'Pykara Lake Trip'] },
      { name: 'Blue Mountain Luxury', price: '₹13,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Heritage Luxury Resort', 'Private Bonfire Dinner', 'Full Day SUV Tour', 'Gourmet Tea Tasting'] }
    ],
    'Kashmir': [
      { name: 'Valley Basic', price: '₹12,999', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Deluxe Shikara Stay', 'Wazwan Dinner', 'Gulmarg Day Trip', 'Pahalgam Visit'] },
      { name: 'Paradise Premium', price: '₹19,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['5 Star Hotel in Srinagar', 'Gondola Ride Level 2', 'All Inclusive Meals', 'Private Tour Guide'] },
      { name: 'Royal Kashmiri', price: '₹29,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Luxury Houseboat Suite', 'Private Heli-Skiing', 'Kashmiri Saffron Farm Tour', 'Luxury SUV for all days'] }
    ],
    'Andaman': [
      { name: 'Island Basic', price: '₹15,499', icon: <Zap className="w-5 h-5 text-blue-500" />, features: ['Havelock Island Stay', 'Snorkeling Session', 'Radhanagar Beach Visit', 'Ferry Transfers'] },
      { name: 'Oceanic Premium', price: '₹24,999', icon: <Star className="w-5 h-5 text-purple-500" />, features: ['Premium Beach Resort', 'Scuba Diving (PADI)', 'Private Candlelight Dinner', 'Luxury Cruise Transfer'] },
      { name: 'Coral Luxury', price: '₹39,999', icon: <Crown className="w-5 h-5 text-amber-500" />, features: ['Uber Luxury Island Villa', 'Private Speedboat', 'Deep Sea Fishing', 'Photography Package'] }
    ]
  };

  const openExploreModal = (dest) => {
    setSelectedDest(dest);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Dynamic Header */}
      <div className="bg-slate-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Domestic <span className="text-blue-400">Trends</span></h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the most trending destinations across the country. Curated by our AI based on travel demand and cultural excitement.
          </p>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest, i) => (
            <div 
              key={i} 
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-slate-900 flex items-center gap-1 shadow-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {dest.rating}
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {dest.tags.map((tag, j) => (
                    <span key={j} className="bg-black/40 backdrop-blur-sm text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{dest.name}</h3>
                  <div className="text-sm font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Best in Spring
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {dest.description}
                </p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Starting from</div>
                      <div className="text-lg font-bold text-slate-900">{dest.price}</div>
                    </div>
                    <button 
                      onClick={() => openExploreModal(dest)}
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-blue-600 transition-all flex items-center gap-2 group/btn"
                    >
                      Explore
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Package Details Modal */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={selectedDest ? `${selectedDest.name} Packages` : 'Package Details'}
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
                  <div key={idx} className="border border-slate-100 rounded-3xl p-5 hover:border-blue-200 hover:shadow-md transition-all flex flex-col bg-slate-50/50">
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
                    <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-colors">
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 flex gap-3 items-start border border-blue-100">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Prices shown are per person and include taxes. All packages can be customized further using our AI planner to match your exact dates and preferences.
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Start Customizing
                </Link>
              </div>
            </div>
          )}
        </Modal>

        {/* Call to Action */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <ShieldCheck className="w-16 h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Can't decide where to go?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Our AI travel planner can create a personalized itinerary for any of these trending destinations based on your budget and interests.
            </p>
            <Link to="/discover" className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
              Start AI Planning
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomesticTrendsPage;

