import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { listDestinations, searchDestinations } from '../api/destinations';
import { getWeather, getCurrency } from '../api/external';
import { listTrips, updateTrip } from '../api/trips';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Search, X, Heart, MapPin, Star, Plus, Globe, ChevronDown } from 'lucide-react';

const CATEGORY_FILTERS = ['All', 'Adventure', 'Food', 'Cultural', 'Nature', 'Nightlife'];
const COST_FILTERS = ['All', 'Budget', 'Mid-range', 'Premium'];
const CATEGORY_ICONS = { Transport: '🚗', Stay: '🏨', Food: '🍽️', Activities: '🏛️', Other: '💼' };

const CostBadge = ({ cost }) => {
  const colors = { Budget: 'bg-green-100 text-green-700', 'Mid-range': 'bg-amber-100 text-amber-700', Premium: 'bg-purple-100 text-purple-700' };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[cost] || 'bg-gray-100 text-gray-600'}`}>{cost || 'Mid-range'}</span>;
};

function DestinationCard({ dest, onSelect, isSelected, onSave, saved, onAddToTrip }) {
  return (
    <div
      onClick={() => onSelect(dest)}
      className={`bg-white rounded-card shadow-card cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 overflow-hidden group ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={`https://loremflickr.com/600/400/${encodeURIComponent(dest.name)},travel/all`}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={e => { e.stopPropagation(); onSave(dest.id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${saved ? 'bg-coral text-white' : 'bg-white/30 text-white hover:bg-coral'}`}
        >
          <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-lg font-bold text-white leading-tight">{dest.name}</h3>
          <p className="text-white/80 text-xs">{dest.country} {dest.flag_emoji || '🌍'}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <CostBadge cost={dest.cost_index} />
          {dest.rating && (
            <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <Star size={11} fill="currentColor" /> {dest.rating}
            </span>
          )}
        </div>
        {dest.best_time_to_visit && (
          <p className="text-xs text-muted mb-2">🗓 Best: {dest.best_time_to_visit}</p>
        )}
        <button
          onClick={e => { e.stopPropagation(); onAddToTrip(dest); }}
          className="w-full mt-1 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-input hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1"
        >
          <Plus size={12} /> Add to Trip
        </button>
      </div>
    </div>
  );
}

function CityInfoPanel({ dest, onPlanTrip }) {
  const [weather, setWeather] = useState(null);
  const [currency, setCurrency] = useState(null);

  useEffect(() => {
    if (!dest) return;
    setWeather(null);
    setCurrency(null);

    getWeather(dest.name)
      .then(r => setWeather(r.data))
      .catch(() => setWeather({ temperature: '--', condition: 'N/A', humidity: '--' }));

    if (dest.currency_code && dest.currency_code !== 'USD') {
      getCurrency('USD', dest.currency_code)
        .then(r => setCurrency(r.data))
        .catch(() => setCurrency(null));
    }
  }, [dest?.id]);

  if (!dest) {
    return (
      <div className="bg-white rounded-card shadow-card flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
        <Globe size={64} className="text-border mb-4" />
        <h3 className="font-display text-xl font-semibold text-body mb-2">Select a city</h3>
        <p className="text-muted text-sm">Click on any destination card to see detailed information here.</p>
      </div>
    );
  }

  const activities = dest.activities || ['Sightseeing', 'Local cuisine', 'Cultural tours', 'Photography spots', 'Shopping'];

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className="relative h-48">
        <img
          src={`https://loremflickr.com/800/400/${encodeURIComponent(dest.name)},landmark/all`}
          alt={dest.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="font-display text-2xl font-bold text-white">{dest.name}</h2>
          <p className="text-white/80 text-sm">{dest.country} {dest.flag_emoji || '🌍'}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <CostBadge cost={dest.cost_index} />
          {dest.best_time_to_visit && (
            <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
              🗓 {dest.best_time_to_visit}
            </span>
          )}
        </div>

        {/* Currency */}
        {currency && (
          <div className="bg-sand rounded-card p-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Currency</p>
            <p className="text-sm font-semibold text-body">1 USD = {currency.rate} {dest.currency_code}</p>
          </div>
        )}

        {/* Weather */}
        {weather && (
          <div className="bg-sand rounded-card p-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Weather Snapshot</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">🌡 {weather.temperature}°C</span>
              <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">☁️ {weather.condition}</span>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">💧 {weather.humidity}%</span>
            </div>
          </div>
        )}

        {/* Activities */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Popular Activities</p>
          <ul className="space-y-1.5">
            {activities.slice(0, 5).map((act, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-body">
                <span className="text-primary">✦</span> {typeof act === 'string' ? act : act.name}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => onPlanTrip(dest)}
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-card transition-colors flex items-center justify-center gap-2"
        >
          ✈️ Plan a Trip Here
        </button>
      </div>
    </div>
  );
}

function AddToTripModal({ dest, onClose }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [selectedTripId, setSelectedTripId] = useState('');
  const { data: tripsRes, isLoading } = useQuery({ queryKey: ['trips'], queryFn: () => listTrips(), enabled: !!isAuthenticated });
  const trips = tripsRes?.data?.trips || tripsRes?.data || [];

  const mutation = useMutation({
    mutationFn: () => updateTrip(selectedTripId, { add_stop: dest.name }),
    onSuccess: () => { toast.success(`Added ${dest.name} to trip!`); onClose(); },
    onError: () => toast.error('Failed to add destination'),
  });

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="bg-white rounded-card shadow-elevated max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
          <h3 className="font-display text-xl font-bold mb-2">Sign in required</h3>
          <p className="text-muted text-sm mb-4">Create an account to save destinations to your trips.</p>
          <div className="flex gap-2">
            <button onClick={() => navigate('/signup')} className="flex-1 bg-primary text-white py-2 rounded-input font-semibold text-sm hover:bg-primary-dark transition-colors">Sign Up Free</button>
            <button onClick={() => navigate('/login')} className="flex-1 border border-border py-2 rounded-input font-semibold text-sm hover:bg-sand transition-colors">Log In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-card shadow-elevated max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">Add {dest.name} to a Trip</h3>
          <button onClick={onClose} className="text-muted hover:text-body"><X size={20} /></button>
        </div>

        {isLoading ? (
          <p className="text-muted text-center py-4">Loading your trips...</p>
        ) : trips.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-3">You have no trips yet.</p>
            <button onClick={() => { onClose(); navigate('/trips'); }} className="text-primary font-semibold text-sm">Create your first trip →</button>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {trips.map(trip => (
                <label key={trip.id} className={`flex items-center gap-3 p-3 rounded-card cursor-pointer border transition-colors ${selectedTripId === trip.id.toString() ? 'border-primary bg-primary/5' : 'border-border hover:bg-sand'}`}>
                  <input type="radio" name="trip" value={trip.id} checked={selectedTripId === trip.id.toString()} onChange={e => setSelectedTripId(e.target.value)} className="text-primary" />
                  <div>
                    <p className="font-semibold text-sm">{trip.name}</p>
                    <p className="text-xs text-muted">{trip.destination}</p>
                  </div>
                </label>
              ))}
            </div>
            <button
              disabled={!selectedTripId || mutation.isPending}
              onClick={() => mutation.mutate()}
              className="w-full bg-primary text-white py-2.5 rounded-input font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Adding...' : 'Add to Trip'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ExploreSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [autocomplete, setAutocomplete] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [costFilter, setCostFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [allResults, setAllResults] = useState([]);
  const [saved, setSaved] = useState({});
  const [addToTripDest, setAddToTripDest] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Initial load
  const { data: initialData, isLoading } = useQuery({
    queryKey: ['destinations-explore', page],
    queryFn: () => listDestinations({ per_page: 12, page }),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (initialData?.data) {
      const items = initialData.data.destinations || initialData.data || [];
      if (page === 1) setAllResults(items);
      else setAllResults(prev => [...prev, ...items]);
      setLoadingMore(false);
    }
  }, [initialData, page]);

  // Autocomplete search
  useEffect(() => {
    if (query.length < 2) { setAutocomplete([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await searchDestinations(query);
        setAutocomplete(res.data?.destinations || res.data || []);
        setShowDropdown(true);
      } catch { setAutocomplete([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !searchRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (dest) => {
    setSelectedDest(dest);
    setQuery(dest.name);
    setShowDropdown(false);
  };

  const handleClear = () => { setQuery(''); setAutocomplete([]); setShowDropdown(false); };

  const handleSave = (id) => setSaved(prev => ({ ...prev, [id]: !prev[id] }));

  const handleLoadMore = () => { setLoadingMore(true); setPage(p => p + 1); };

  const handlePlanTrip = (dest) => navigate(`/trips?newTrip=1&destination=${encodeURIComponent(dest.name)}`);

  // Client-side filtering
  const filtered = allResults.filter(d => {
    const catMatch = categoryFilter === 'All' || (d.category === categoryFilter) || (d.tags || []).includes(categoryFilter);
    const costMatch = costFilter === 'All' || d.cost_index === costFilter;
    return catMatch && costMatch;
  });

  return (
    <div className="min-h-screen bg-sand">
      {/* Search Header */}
      <div className="bg-primary py-10 px-4">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <h1 className="font-display text-4xl font-bold text-white mb-2">Explore Destinations</h1>
          <p className="text-white/70 text-lg">Search cities, discover activities, and plan your perfect journey</p>
        </div>
        <div className="max-w-3xl mx-auto relative" ref={searchRef}>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => autocomplete.length > 0 && setShowDropdown(true)}
              placeholder="Search destinations, cities, or countries..."
              className="w-full pl-12 pr-12 py-4 rounded-card border-0 shadow-elevated text-body text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {query && (
              <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors">
                <X size={20} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && autocomplete.length > 0 && (
            <div ref={dropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-white rounded-card shadow-elevated border border-border z-50 max-h-64 overflow-y-auto animate-fade-in">
              {autocomplete.map(dest => (
                <button
                  key={dest.id}
                  onClick={() => handleSelect(dest)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sand transition-colors text-left border-b border-border last:border-0"
                >
                  <span className="text-xl">{dest.flag_emoji || '🌍'}</span>
                  <div>
                    <p className="font-semibold text-body text-sm">{dest.name}</p>
                    <p className="text-xs text-muted">{dest.country}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Results Panel */}
          <div className="lg:col-span-3">
            {/* Filter Chips */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">Type:</span>
                {CATEGORY_FILTERS.map(f => (
                  <button key={f} onClick={() => setCategoryFilter(f)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${categoryFilter === f ? 'bg-primary text-white border-primary' : 'bg-white text-body border-border hover:border-primary/40 hover:bg-primary/5'}`}
                  >{f}</button>
                ))}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap">Cost:</span>
                {COST_FILTERS.map(f => (
                  <button key={f} onClick={() => setCostFilter(f)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${costFilter === f ? 'bg-coral text-white border-coral' : 'bg-white text-body border-border hover:border-coral/40 hover:bg-coral/5'}`}
                  >{f}</button>
                ))}
              </div>
            </div>

            {isLoading && page === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-white rounded-card animate-shimmer" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-card shadow-card">
                <p className="text-5xl mb-3">🔍</p>
                <p className="font-display text-xl font-semibold text-body">No destinations found</p>
                <p className="text-muted text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted mb-4">{filtered.length} destinations found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map(dest => (
                    <DestinationCard
                      key={dest.id}
                      dest={dest}
                      onSelect={setSelectedDest}
                      isSelected={selectedDest?.id === dest.id}
                      onSave={handleSave}
                      saved={!!saved[dest.id]}
                      onAddToTrip={setAddToTripDest}
                    />
                  ))}
                </div>

                {/* Load More */}
                {(initialData?.data?.has_more || initialData?.data?.total > allResults.length) && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="w-full mt-6 py-3 border border-primary text-primary font-semibold rounded-card hover:bg-primary hover:text-white transition-all text-sm"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Destinations'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* RIGHT: City Info + Map */}
          <div className="lg:col-span-2 space-y-4">
            <CityInfoPanel dest={selectedDest} onPlanTrip={handlePlanTrip} />

            {/* Map Panel */}
            <div className="bg-white rounded-card shadow-card overflow-hidden">
              <div className="p-3 border-b border-border flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <h3 className="font-semibold text-sm text-body">
                  {selectedDest ? `${selectedDest.name} on Map` : 'Map View'}
                </h3>
              </div>
              {selectedDest?.latitude && selectedDest?.longitude ? (
                <iframe
                  title="destination-map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedDest.longitude - 0.5},${selectedDest.latitude - 0.5},${selectedDest.longitude + 0.5},${selectedDest.latitude + 0.5}&layer=mapnik&marker=${selectedDest.latitude},${selectedDest.longitude}`}
                  className="w-full h-64 border-0"
                  loading="lazy"
                />
              ) : (
                <iframe
                  title="world-map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-180,-85,180,85&layer=mapnik"
                  className="w-full h-64 border-0"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Trip Modal */}
      {addToTripDest && <AddToTripModal dest={addToTripDest} onClose={() => setAddToTripDest(null)} />}
    </div>
  );
}
