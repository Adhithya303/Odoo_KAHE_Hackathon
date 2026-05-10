import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-hot-toast';
import { FaSearch, FaFilter, FaPlus, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

export default function ActivitySearchPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tripTypes, setTripTypes] = useState([]);
  const [trips, setTrips] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    q: '',
    trip_type_id: '',
    max_cost: 10000,
    max_duration_hours: 24
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [tripStops, setTripStops] = useState([]);

  useEffect(() => {
    fetchMetadata();
    fetchActivities();
    if (isAuthenticated) fetchUserTrips();
  }, []);

  const fetchMetadata = async () => {
    try {
      const { data } = await api.get('/api/destinations/metadata/trip-types');
      setTripTypes(data.trip_types);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserTrips = async () => {
    try {
      const { data } = await api.get('/api/trips');
      setTrips(data.trips);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.trip_type_id) params.append('trip_type_id', filters.trip_type_id);
      params.append('max_cost', filters.max_cost);
      params.append('max_duration_hours', filters.max_duration_hours);
      
      const { data } = await api.get(`/api/activities?${params.toString()}`);
      setActivities(data.activities);
    } catch (err) {
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchActivities();
  };

  const openAddModal = (activity) => {
    if (!isAuthenticated) {
      toast.error("Please login to add activities to trips");
      navigate('/login');
      return;
    }
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (selectedTripId) {
      const trip = trips.find(t => t.id === parseInt(selectedTripId));
      if (trip) {
        // Fetch full trip for stops
        api.get(`/api/trips/${selectedTripId}`).then(({data}) => {
          setTripStops(data.stops || []);
        });
      }
    }
  }, [selectedTripId]);

  const handleAddActivity = async () => {
    if (!selectedTripId || !selectedStopId) {
      toast.error("Please select a trip and a stop");
      return;
    }

    try {
      await api.post(`/api/trips/${selectedTripId}/stops/${selectedStopId}/activities?activity_id=${selectedActivity.id}`);
      toast.success("Activity added to trip!");
      setIsModalOpen(false);
      setSelectedActivity(null);
      setSelectedTripId('');
      setSelectedStopId('');
    } catch (err) {
      toast.error("Failed to add activity");
    }
  };

  return (
    <div className="bg-[#F5F0E8] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-[#2C2C2A] mb-2">Explore Activities</h1>
            <p className="text-gray-600">Find the best things to do for your next adventure.</p>
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-1 md:w-80">
              <input 
                type="text" 
                name="q"
                value={filters.q}
                onChange={handleFilterChange}
                placeholder="Search activities..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-[#E0D8CC] focus:outline-none focus:ring-2 focus:ring-[#1D9E75] shadow-sm"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button onClick={applyFilters} className="bg-[#1D9E75] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#167e5d] transition-all shadow-lg">
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E0D8CC]">
              <div className="flex items-center gap-2 mb-6">
                <FaFilter className="text-[#1D9E75]" />
                <h3 className="font-bold text-lg">Filters</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Trip Type</label>
                  <select 
                    name="trip_type_id"
                    value={filters.trip_type_id}
                    onChange={handleFilterChange}
                    className="w-full p-3 rounded-xl bg-[#F5F0E8] border-none focus:ring-2 focus:ring-[#1D9E75]"
                  >
                    <option value="">All Types</option>
                    {tripTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Cost (₹{filters.max_cost})</label>
                  <input 
                    type="range" 
                    name="max_cost"
                    min="0"
                    max="10000"
                    step="500"
                    value={filters.max_cost}
                    onChange={handleFilterChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>₹0</span>
                    <span>₹10,000+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Max Duration ({filters.max_duration_hours} hrs)</label>
                  <input 
                    type="range" 
                    name="max_duration_hours"
                    min="0"
                    max="24"
                    step="1"
                    value={filters.max_duration_hours}
                    onChange={handleFilterChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1D9E75]"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0h</span>
                    <span>24h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activities Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activities.map(activity => (
                  <div key={activity.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E0D8CC] group hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 bg-gray-200">
                      {activity.image_url ? (
                        <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-teal-50 to-teal-100">
                          🏛️
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#1D9E75] shadow-sm">
                          {activity.trip_type_name || 'General'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-sm font-bold text-[#1D9E75] mb-1">{activity.destination_name}</h4>
                      <h3 className="text-xl font-bold text-[#2C2C2A] mb-2 line-clamp-1">{activity.name}</h3>
                      <p className="text-gray-500 text-sm mb-6 line-clamp-2">{activity.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[#E0D8CC]">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FaMoneyBillWave className="text-green-500" />
                            <span>₹{activity.estimated_cost}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FaClock className="text-orange-400" />
                            <span>{activity.duration_hours}h</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => openAddModal(activity)}
                          className="bg-[#1D9E75] text-white p-3 rounded-xl hover:bg-[#167e5d] transition-all shadow-lg transform group-hover:scale-110"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border border-[#E0D8CC]">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No activities found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-[#2C2C2A] mb-2">Add to Trip</h2>
            <p className="text-gray-500 text-sm mb-8">Select which trip and stop you want to add "{selectedActivity?.name}" to.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Trip</label>
                <select 
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[#F5F0E8] border-none focus:ring-2 focus:ring-[#1D9E75]"
                >
                  <option value="">Choose a trip...</option>
                  {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {selectedTripId && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Stop / Destination</label>
                  <select 
                    value={selectedStopId}
                    onChange={(e) => setSelectedStopId(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#F5F0E8] border-none focus:ring-2 focus:ring-[#1D9E75]"
                  >
                    <option value="">Choose a stop...</option>
                    {tripStops.map(s => <option key={s.id} value={s.id}>{s.destination_name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddActivity}
                  disabled={!selectedStopId}
                  className="flex-1 bg-[#1D9E75] disabled:opacity-50 text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#167e5d] transition-all shadow-lg"
                >
                  Confirm Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
