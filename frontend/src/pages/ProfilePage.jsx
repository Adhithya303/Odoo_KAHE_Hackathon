import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import api from '../api/client';
import { getPreferences, savePreferences, updateMe } from '../api/auth';
import toast from 'react-hot-toast';

const TRIP_SCOPE_OPTIONS = ['Both', 'Domestic', 'International'];
const BUDGET_TIER_OPTIONS = ['Budget', 'Mid-range', 'Premium'];
const TRIP_TYPE_OPTIONS = ['Adventure', 'Beach', 'Cultural', 'Nature', 'Relaxation'];
const GROUP_TYPE_OPTIONS = ['Solo', 'Couple', 'Friends', 'Family'];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
  });
  const [preferences, setPreferences] = useState({
    trip_scope: 'Both',
    budget_tier: 'Mid-range',
    trip_types: [],
    group_types: [],
    min_budget: '',
    max_budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState('settings');
  const [savedTrips, setSavedTrips] = useState([]);
  const [fetchingSaved, setFetchingSaved] = useState(false);

  useEffect(() => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      country: user?.country || '',
    });
  }, [user]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data } = await getPreferences();
        if (data?.has_preferences) {
          setPreferences({
            trip_scope: data.trip_scope || 'Both',
            budget_tier: data.budget_tier || 'Mid-range',
            trip_types: data.trip_types || [],
            group_types: data.group_types || [],
            min_budget: data.min_budget ?? '',
            max_budget: data.max_budget ?? '',
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load personalization');
      } finally {
        setPrefsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const fetchSavedTrips = async () => {
    try {
      setFetchingSaved(true);
      const { data } = await api.get('/api/profile/saved-trips');
      setSavedTrips(data.trips);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSaved(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') fetchSavedTrips();
  }, [activeTab]);

  const handleUnsave = async (tripId) => {
    try {
      await api.delete(`/api/profile/saved-trips/${tripId}`);
      toast.success('Trip removed from saved');
      fetchSavedTrips();
    } catch (err) {
      toast.error('Failed to unsave');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateMe(form);
      setUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    setLoading(false);
  };

  const togglePreferenceValue = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefsSaving(true);
    try {
      await savePreferences({
        trip_scope: preferences.trip_scope,
        budget_tier: preferences.budget_tier,
        trip_types: preferences.trip_types,
        group_types: preferences.group_types,
        min_budget: preferences.min_budget === '' ? null : Number(preferences.min_budget),
        max_budget: preferences.max_budget === '' ? null : Number(preferences.max_budget),
      });
      toast.success('Personalization updated!');
    } catch {
      toast.error('Failed to update personalization');
    } finally {
      setPrefsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <div className="bg-[#1D9E75] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold">Account Settings</h1>
          <p className="text-white/70 mt-1">Manage your profile and saved adventures</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-[#E0D8CC] p-6 space-y-2">
              <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-[#1D9E75] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                ⚙️ Settings
              </button>
              <button onClick={() => setActiveTab('saved')} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'saved' ? 'bg-[#1D9E75] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                🔖 Saved Trips
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'settings' ? (
              <div className="space-y-8">
                {/* Avatar */}
                <div className="bg-white rounded-3xl shadow-sm border border-[#E0D8CC] p-8 flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#1D9E75] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-[#2C2C2A]">{user?.first_name} {user?.last_name}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                    <Badge variant="green" className="mt-2 uppercase tracking-widest text-[10px]">{user?.role}</Badge>
                  </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-3xl shadow-sm border border-[#E0D8CC] p-8">
                  <h3 className="font-display text-xl font-bold text-[#2C2C2A] mb-6">Edit Information</h3>
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="First Name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                      <Input label="Last Name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                    </div>
                    <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                      <Input label="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                    </div>
                    <Button type="submit" loading={loading} className="px-12 py-4 rounded-2xl shadow-lg">Save Changes</Button>
                  </form>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-[#E0D8CC] p-8">
                  <h3 className="font-display text-xl font-bold text-[#2C2C2A] mb-2">Personalization</h3>
                  <p className="text-gray-500 mb-6">Update your recommendation settings anytime from here.</p>

                  {prefsLoading ? (
                    <div className="flex justify-center py-10"><Spinner /></div>
                  ) : (
                    <form onSubmit={handleSavePreferences} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-body mb-2">Trip Scope</label>
                          <select
                            className="input-field"
                            value={preferences.trip_scope}
                            onChange={(e) => setPreferences({ ...preferences, trip_scope: e.target.value })}
                          >
                            {TRIP_SCOPE_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-body mb-2">Budget Tier</label>
                          <select
                            className="input-field"
                            value={preferences.budget_tier}
                            onChange={(e) => setPreferences({ ...preferences, budget_tier: e.target.value })}
                          >
                            {BUDGET_TIER_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Minimum Budget"
                          type="number"
                          min="0"
                          value={preferences.min_budget}
                          onChange={(e) => setPreferences({ ...preferences, min_budget: e.target.value })}
                          placeholder="5000"
                        />
                        <Input
                          label="Maximum Budget"
                          type="number"
                          min="0"
                          value={preferences.max_budget}
                          onChange={(e) => setPreferences({ ...preferences, max_budget: e.target.value })}
                          placeholder="50000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-body mb-3">Preferred Trip Types</label>
                        <div className="flex flex-wrap gap-3">
                          {TRIP_TYPE_OPTIONS.map((option) => {
                            const active = preferences.trip_types.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => togglePreferenceValue('trip_types', option)}
                                className={`px-4 py-2 rounded-full border transition-all ${
                                  active
                                    ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                                    : 'bg-[#F5F0E8] text-[#2C2C2A] border-[#E0D8CC] hover:border-[#1D9E75]'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-body mb-3">Who Do You Usually Travel With?</label>
                        <div className="flex flex-wrap gap-3">
                          {GROUP_TYPE_OPTIONS.map((option) => {
                            const active = preferences.group_types.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => togglePreferenceValue('group_types', option)}
                                className={`px-4 py-2 rounded-full border transition-all ${
                                  active
                                    ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                                    : 'bg-[#F5F0E8] text-[#2C2C2A] border-[#E0D8CC] hover:border-[#1D9E75]'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Button type="submit" loading={prefsSaving} className="px-12 py-4 rounded-2xl shadow-lg">
                        Save Personalization
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#2C2C2A]">Your Saved Trips</h3>
                {fetchingSaved ? (
                  <div className="flex justify-center py-20"><Spinner /></div>
                ) : savedTrips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedTrips.map(trip => (
                      <div key={trip.id} className="bg-white rounded-3xl overflow-hidden border border-[#E0D8CC] shadow-sm hover:shadow-xl transition-all group">
                        <div className="h-32 bg-gradient-to-r from-[#1D9E75] to-[#2C2C2A] relative">
                          {trip.cover_photo_url && <img src={trip.cover_photo_url} className="w-full h-full object-cover opacity-60" />}
                          <button onClick={() => handleUnsave(trip.id)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-xl transition-all">
                            🗑️
                          </button>
                        </div>
                        <div className="p-6">
                          <h4 className="font-bold text-[#2C2C2A] text-lg mb-1">{trip.name}</h4>
                          <div className="text-xs text-gray-500 mb-4">{new Date(trip.start_date).toLocaleDateString()} • {trip.destination_count} Stops</div>
                          <Link to={`/share/${trip.id}`} className="block text-center bg-[#F5F0E8] text-[#1D9E75] font-bold py-3 rounded-xl hover:bg-[#1D9E75] hover:text-white transition-all">
                            View Itinerary
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-16 text-center border border-[#E0D8CC]">
                    <div className="text-5xl mb-4">🔖</div>
                    <h4 className="text-xl font-bold text-[#2C2C2A] mb-2">No saved trips yet</h4>
                    <p className="text-gray-500 mb-8">Found an itinerary you like? Save it to access it later.</p>
                    <Link to="/discover" className="text-[#1D9E75] font-bold hover:underline">Explore Community →</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
