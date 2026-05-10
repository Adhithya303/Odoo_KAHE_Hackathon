import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminApi from '../api/admin';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { 
  FaUsers, FaPlane, FaMapMarkerAlt, FaComments, FaCheckCircle, 
  FaTimesCircle, FaChartBar, FaUserShield, FaSearch
} from 'react-icons/fa';
import useAuthStore from '../store/authStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error("Access denied");
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const { data } = await adminApi.getAdminStats();
        setStats(data);
      } else if (activeTab === 'users') {
        const { data } = await adminApi.getAdminUsers({ search: userSearch });
        setUsers(data.users);
      } else if (activeTab === 'trips') {
        const { data } = await adminApi.getAdminTrips();
        setTrips(data.trips);
      }
    } catch (err) {
      toast.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await adminApi.toggleAdminUserActive(userId);
      toast.success("User status updated");
      fetchData(); // Refresh list
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };

  if (loading && !stats && activeTab === 'overview') return <div className="flex h-screen items-center justify-center"><Spinner /></div>;

  return (
    <div className="bg-[#F5F0E8] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#2C2C2A] mb-2 flex items-center gap-3">
            <FaUserShield className="text-[#1D9E75]" /> Admin Control Center
          </h1>
          <p className="text-gray-600">Monitor and manage the Traveloop ecosystem.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl w-fit shadow-sm border border-[#E0D8CC]">
          {['overview', 'users', 'trips', 'destinations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab 
                ? 'bg-[#1D9E75] text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<FaUsers />} label="Total Users" value={stats.total_users} color="text-blue-500" />
              <StatCard icon={<FaPlane />} label="Total Trips" value={stats.total_trips} color="text-[#1D9E75]" />
              <StatCard icon={<FaMapMarkerAlt />} label="Destinations" value={stats.total_destinations} color="text-purple-500" />
              <StatCard icon={<FaComments />} label="Community Posts" value={stats.total_community_posts} color="text-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trip Growth Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E0D8CC]">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FaChartBar className="text-[#1D9E75]" /> Trip Creations (Last 30 Days)
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.trips_over_time}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="count" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E0D8CC]">
                <h3 className="text-xl font-bold mb-6">Trip Status Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Planning', value: stats.status_distribution.planning },
                          { name: 'Ongoing', value: stats.status_distribution.ongoing },
                          { name: 'Completed', value: stats.status_distribution.completed },
                          { name: 'Cancelled', value: stats.status_distribution.cancelled },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#6366f1" />
                        <Cell fill="#10b981" />
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 text-sm">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#6366f1]" /> Planning</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10b981]" /> Ongoing</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]" /> Completed</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]" /> Cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-sm border border-[#E0D8CC] overflow-hidden">
            <div className="p-8 border-b border-[#E0D8CC] flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-xl font-bold">User Management</h3>
              <div className="relative w-full md:w-80">
                <input 
                  type="text" 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                  placeholder="Search users..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#F5F0E8] border-none focus:ring-2 focus:ring-[#1D9E75]"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F5F0E8]/50 text-gray-500 text-sm font-bold uppercase tracking-wider">
                    <th className="px-8 py-4">User</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Trips</th>
                    <th className="px-8 py-4">Joined</th>
                    <th className="px-8 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D8CC]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-8 py-4">
                        <div className="font-bold">{u.first_name} {u.last_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`flex items-center gap-1 font-bold text-sm ${u.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {u.is_active ? <FaCheckCircle /> : <FaTimesCircle />}
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-bold">{u.trip_count}</td>
                      <td className="px-8 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4">
                        <button 
                          onClick={() => handleToggleActive(u.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            u.is_active 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="bg-white rounded-3xl shadow-sm border border-[#E0D8CC] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F5F0E8]/50 text-gray-500 text-sm font-bold uppercase tracking-wider">
                    <th className="px-8 py-4">Trip Name</th>
                    <th className="px-8 py-4">Owner</th>
                    <th className="px-8 py-4">Destinations</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Scope</th>
                    <th className="px-8 py-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D8CC]">
                  {trips.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-8 py-4 font-bold">{t.name}</td>
                      <td className="px-8 py-4">
                        <div className="font-medium">{t.user?.first_name} {t.user?.last_name}</div>
                        <div className="text-xs text-gray-500">{t.user?.email}</div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">
                          {t.destination_count} Stops
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          t.status === 'completed' ? 'bg-green-100 text-green-700' :
                          t.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          t.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 font-medium">{t.trip_scope}</td>
                      <td className="px-8 py-4 text-sm text-gray-500">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'destinations' && stats && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E0D8CC]">
            <h3 className="text-xl font-bold mb-8">Top 10 Destinations by Trip Count</h3>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_destinations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="trip_count" fill="#1D9E75" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E0D8CC] flex items-center gap-6">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl bg-gray-50 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-[#2C2C2A]">{value?.toLocaleString()}</p>
      </div>
    </div>
  );
}
