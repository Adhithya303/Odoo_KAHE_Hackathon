import { useState } from 'react';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import { updateMe } from '../api/auth';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', city: user?.city || '', country: user?.country || '' });
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('settings');
  const [savedTrips, setSavedTrips] = useState([]);
  const [fetchingSaved, setFetchingSaved] = useState(false);

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
                    <Input label="Email" value={user?.email || ''} disabled />
                    <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                      <Input label="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                    </div>
                    <Button type="submit" loading={loading} className="px-12 py-4 rounded-2xl shadow-lg">Save Changes</Button>
                  </form>
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
