import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import DestinationCard from '../components/destination/DestinationCard';
import { DestinationCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { listDestinations, getTrending } from '../api/destinations';
import { listTrips } from '../api/trips';
import { formatDate, formatCurrency } from '../utils/formatters';
import { getDestImage } from '../utils/constants';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [destRes, trendRes, tripRes] = await Promise.allSettled([
          listDestinations({ per_page: 8 }),
          getTrending(4),
          listTrips(),
        ]);
        if (destRes.status === 'fulfilled') setRecommended(destRes.value.data.destinations || []);
        if (trendRes.status === 'fulfilled') setTrending(trendRes.value.data.destinations || []);
        if (tripRes.status === 'fulfilled') setTrips(tripRes.value.data.trips || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const heroImg = recommended[0]?.cover_image_url || getDestImage(recommended[0]?.name) || getDestImage('default');

  return (
    <div className="min-h-screen bg-sand">
      {/* Hero Banner */}
      <section className="relative h-72 sm:h-80 overflow-hidden">
        <img src={heroImg} alt="Destination" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <p className="text-primary-light text-sm font-semibold uppercase tracking-widest mb-2">Welcome Back</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">
              Hi {user?.first_name || 'Explorer'}, where to next?
            </h1>
            <p className="text-white/70 text-lg">Your personalized travel dashboard</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Recommended */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-body">Recommended For You</h2>
            <Link to="/discover" className="text-primary text-sm font-semibold hover:text-primary-light transition-colors">View All →</Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth">
            {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="min-w-[280px]"><DestinationCardSkeleton /></div>) :
              recommended.slice(0, 8).map(d => (
                <div key={d.id} className="min-w-[280px] snap-start"><DestinationCard destination={d} /></div>
              ))
            }
          </div>
        </section>

        {/* Trending */}
        <section>
          <h2 className="font-display text-2xl font-bold text-body mb-6">🔥 Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? Array(4).fill(0).map((_, i) => <DestinationCardSkeleton key={i} />) :
              trending.slice(0, 4).map(d => <DestinationCard key={d.id} destination={d} />)
            }
          </div>
        </section>

        {/* Your Trips */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-body">Your Trips</h2>
            <Link to="/trips"><Button variant="secondary" className="text-sm px-4 py-2">+ New Trip</Button></Link>
          </div>
          {trips.length === 0 ? (
            <div className="bg-white rounded-card border border-border p-12 text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="font-display text-xl font-semibold mb-2">No trips yet</h3>
              <p className="text-muted mb-6">Start planning your first adventure!</p>
              <Link to="/discover"><Button>Explore Destinations →</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trips.slice(0, 3).map(trip => (
                <Link key={trip.id} to={`/trips/${trip.id}`} className="card group p-5 flex gap-4">
                  <div className="w-20 h-20 rounded-card overflow-hidden flex-shrink-0">
                    <img src={trip.cover_photo_url || getDestImage('default')} alt={trip.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-body truncate group-hover:text-primary transition-colors">{trip.name}</h3>
                    <p className="text-sm text-muted">{formatDate(trip.start_date)} – {formatDate(trip.end_date)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={trip.status === 'planning' ? 'warning' : trip.status === 'ongoing' ? 'green' : 'muted'}>{trip.status}</Badge>
                      {trip.total_budget && <span className="text-xs font-mono text-muted">{formatCurrency(trip.total_budget)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
