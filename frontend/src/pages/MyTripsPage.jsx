import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listTrips, deleteTrip, duplicateTrip } from '../api/trips';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { DestinationCardSkeleton } from '../components/common/Skeleton';
import { formatDate, formatCurrency, getDuration } from '../utils/formatters';
import { getDestImage, TRIP_STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadTrips();
  }, [filter]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const { data } = await listTrips(filter ? { status: filter } : {});
      setTrips(data.trips || []);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return;
    try { await deleteTrip(id); setTrips(t => t.filter(x => x.id !== id)); toast.success('Trip deleted'); } catch { toast.error('Failed to delete'); }
  };

  const handleDuplicate = async (id) => {
    try { const { data } = await duplicateTrip(id); setTrips(t => [data, ...t]); toast.success('Trip duplicated'); } catch { toast.error('Failed to duplicate'); }
  };

  const statusVariant = (s) => ({ planning: 'warning', ongoing: 'green', completed: 'primary', cancelled: 'danger' }[s] || 'muted');

  return (
    <div className="min-h-screen bg-sand">
      <div className="bg-primary text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold">My Trips</h1>
            <p className="text-white/70 mt-1">Manage all your travel plans</p>
          </div>
          <Link to="/discover"><Button className="px-6">+ New Trip</Button></Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['', ...TRIP_STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-badge text-sm font-medium whitespace-nowrap transition-all ${
                filter === s ? 'bg-primary text-white' : 'bg-white text-muted border border-border hover:border-primary/30'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <DestinationCardSkeleton key={i} />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="font-display text-2xl font-semibold mb-2">No trips found</h3>
            <p className="text-muted mb-6">Start planning your next adventure!</p>
            <Link to="/discover"><Button>Explore Destinations →</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div key={trip.id} className="card overflow-hidden">
                <div className="relative h-40">
                  <img src={trip.cover_photo_url || getDestImage('default')} alt={trip.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3"><Badge variant={statusVariant(trip.status)}>{trip.status}</Badge></div>
                </div>
                <div className="p-5 space-y-3">
                  <Link to={`/trips/${trip.id}`}><h3 className="font-display text-lg font-semibold text-body hover:text-primary transition-colors">{trip.name}</h3></Link>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span>📅 {formatDate(trip.start_date)}</span>
                    <span>🕐 {trip.duration_days} days</span>
                  </div>
                  {trip.total_budget && <p className="font-mono text-sm text-primary font-semibold">{formatCurrency(trip.total_budget)}</p>}
                  <div className="flex gap-2 pt-2">
                    <Link to={`/trips/${trip.id}`} className="flex-1"><Button variant="secondary" className="w-full text-xs py-2">View</Button></Link>
                    <button onClick={() => handleDuplicate(trip.id)} className="px-3 py-2 bg-sand rounded-input text-xs hover:bg-primary/10 transition-colors" title="Duplicate">📋</button>
                    <button onClick={() => handleDelete(trip.id)} className="px-3 py-2 bg-red-50 rounded-input text-xs hover:bg-red-100 transition-colors text-danger" title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
