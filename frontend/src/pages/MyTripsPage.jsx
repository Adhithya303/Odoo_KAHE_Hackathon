import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listTrips, deleteTrip, duplicateTrip } from '../api/trips';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { DestinationCardSkeleton } from '../components/common/Skeleton';
import { formatDate, formatCurrency } from '../utils/formatters';
import { getDestImage } from '../utils/constants';

export default function MyTripsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [groupBy, setGroupBy] = useState('none');
  const [activeTab, setActiveTab] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => listTrips(),
    select: (res) => res.data.trips || []
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip deleted');
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast.success('Trip duplicated');
    }
  });

  const filteredTrips = useMemo(() => {
    if (!data) return [];
    
    let trips = data.filter(trip => 
      trip.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const today = new Date();

    if (activeTab === 'Ongoing') {
      trips = trips.filter(t => t.status === 'ongoing');
    } else if (activeTab === 'Upcoming') {
      trips = trips.filter(t => t.status === 'planning' && new Date(t.start_date) > today);
    } else if (activeTab === 'Completed') {
      trips = trips.filter(t => t.status === 'completed');
    }

    trips.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      if (sortBy === 'budget_high') return (b.total_budget || 0) - (a.total_budget || 0);
      return 0;
    });

    return trips;
  }, [data, searchTerm, sortBy, activeTab]);

  const stats = useMemo(() => {
    if (!data) return { All: 0, Ongoing: 0, Upcoming: 0, Completed: 0 };
    const today = new Date();
    return {
      All: data.length,
      Ongoing: data.filter(t => t.status === 'ongoing').length,
      Upcoming: data.filter(t => t.status === 'planning' && new Date(t.start_date) > today).length,
      Completed: data.filter(t => t.status === 'completed').length,
    };
  }, [data]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      deleteMutation.mutate(id);
    }
  };

  const statusVariant = (s) => ({
    planning: 'warning',
    ongoing: 'green',
    completed: 'primary',
    cancelled: 'danger'
  }[s] || 'muted');

  const getProgress = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const now = new Date();
    if (now < s) return 0;
    if (now > e) return 100;
    const total = e - s;
    const elapsed = now - s;
    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-sand pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl font-bold text-body">My Trips</h1>
              <Badge variant="primary" className="text-lg px-3">{stats.All}</Badge>
            </div>
            <Link to="/trips/create">
              <Button className="w-full md:w-auto px-8 py-3 shadow-lg shadow-primary/20">+ Plan a New Trip</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-card border border-border shadow-sm flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
            <input
              type="text"
              placeholder="Search by trip name..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select 
              className="input-field w-auto min-w-[140px]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A → Z</option>
              <option value="budget_high">Budget: High to Low</option>
            </select>
            <select 
              className="input-field w-auto min-w-[140px]"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="none">Group By: None</option>
              <option value="status">Group By: Status</option>
              <option value="month">Group By: Month</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-border">
          {['Ongoing', 'Upcoming', 'Completed', 'All'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted hover:text-body'
              }`}
            >
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-primary text-white' : 'bg-sand text-muted'
              }`}>
                {stats[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Trip Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => <DestinationCardSkeleton key={i} />)}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-white rounded-card border border-border py-20 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'Ongoing' ? '🚀' : activeTab === 'Upcoming' ? '📅' : activeTab === 'Completed' ? '🏆' : '✈️'}
            </div>
            <h3 className="font-display text-2xl font-bold text-body mb-2">
              No {activeTab.toLowerCase()} trips found
            </h3>
            <p className="text-muted mb-8 max-w-md mx-auto">
              {searchTerm 
                ? "We couldn't find any trips matching your search." 
                : `You don't have any ${activeTab.toLowerCase()} trips at the moment.`}
            </p>
            <Link to="/trips/create">
              <Button>Start Planning →</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrips.map(trip => (
              <div key={trip.id} className="card group bg-white hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                {/* Image & Badge Overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={trip.cover_photo_url || getDestImage(trip.destination_name || 'default')} 
                    alt={trip.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge variant={statusVariant(trip.status)} className="shadow-md uppercase tracking-wider text-[10px]">
                      {trip.status}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <Link to={`/trips/${trip.id}`}>
                      <h3 className="font-display text-xl font-bold text-body group-hover:text-primary transition-colors mb-1 line-clamp-1">
                        {trip.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted flex items-center gap-1">
                      📍 {trip.destination_name || 'Multiple Destinations'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Dates</span>
                      <span className="font-medium">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Duration</span>
                      <span className="font-medium">{trip.duration_days} Days</span>
                    </div>
                  </div>

                  {trip.total_budget && (
                    <div className="mb-4">
                      <span className="text-[10px] uppercase tracking-widest text-primary/60 font-bold block mb-1">Budget</span>
                      <span className="text-lg font-mono font-bold text-primary">{formatCurrency(trip.total_budget)}</span>
                    </div>
                  )}

                  {trip.status === 'ongoing' && (
                    <div className="mb-6 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-primary">
                        <span>Trip Progress</span>
                        <span>{getProgress(trip.start_date, trip.end_date)}%</span>
                      </div>
                      <div className="w-full h-2 bg-sand rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${getProgress(trip.start_date, trip.end_date)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-6 border-t border-border flex items-center gap-2">
                    <Link to={`/trips/${trip.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full py-2 text-sm">View Details</Button>
                    </Link>
                    <button 
                      onClick={() => duplicateMutation.mutate(trip.id)}
                      className="p-2.5 rounded-input bg-sand hover:bg-primary/10 text-muted hover:text-primary transition-all"
                      title="Duplicate Trip"
                    >
                      📋
                    </button>
                    <Link 
                      to={`/trips/${trip.id}/build`}
                      className="p-2.5 rounded-input bg-sand hover:bg-primary/10 text-muted hover:text-primary transition-all"
                      title="Edit Itinerary"
                    >
                      ✏️
                    </Link>
                    <button 
                      onClick={() => handleDelete(trip.id)}
                      className="p-2.5 rounded-input bg-red-50 hover:bg-red-100 text-danger transition-all"
                      title="Delete Trip"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB - Mobile Only */}
      <Link to="/trips/create" className="fixed bottom-6 right-6 md:hidden z-50">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center text-2xl font-bold">
          +
        </button>
      </Link>
    </div>
  );
}
