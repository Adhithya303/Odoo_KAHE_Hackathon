import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import DestinationCard from '../components/destination/DestinationCard';
import { DestinationCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { listDestinations, filterDestinations, getRecommendations } from '../api/destinations';
import { getPreferences } from '../api/auth';
import { listTrips } from '../api/trips';
import { formatDate, formatCurrency } from '../utils/formatters';
import { getDestImage, FALLBACK_IMAGE_URL } from '../utils/constants';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [recommended, setRecommended] = useState([]);
  const [activityBased, setActivityBased] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let targetVibes = ['Adventure', 'Beach'];
        try {
          if (user) {
            const prefRes = await getPreferences();
            if (prefRes.data?.has_preferences && prefRes.data?.trip_types?.length > 0) {
              const userVibes = prefRes.data.trip_types;
              const shuffled = [...userVibes].sort(() => 0.5 - Math.random());
              targetVibes = shuffled.slice(0, 2);
              if (targetVibes.length === 1) {
                targetVibes.push(targetVibes[0] !== 'Beach' ? 'Beach' : 'Adventure');
              }
            }
          }
        } catch (err) {
          console.error('Failed to load preferences', err);
        }

        const promises = [
          getRecommendations(),
          listTrips(),
          listDestinations({ per_page: 8 }),
          ...targetVibes.map(vibe => filterDestinations({ vibes: vibe, per_page: 4 }))
        ];

        const results = await Promise.allSettled(promises);
        const recRes = results[0];
        const tripRes = results[1];
        const destRes = results[2];
        const activityResults = results.slice(3);
        
        if (recRes.status === 'fulfilled' && recRes.value.data?.destinations?.length) {
          setRecommended(recRes.value.data.destinations || []);
        } else if (destRes.status === 'fulfilled') {
          setRecommended(destRes.value.data.destinations || []);
        }
        
        const newActivityBased = [];
        activityResults.forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value.data?.destinations?.length) {
            newActivityBased.push({
              vibe: targetVibes[index],
              destinations: res.value.data.destinations
            });
          }
        });
        setActivityBased(newActivityBased);
        
        if (tripRes.status === 'fulfilled') setTrips(tripRes.value.data.trips || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user]);

  const heroImg = recommended[0]?.cover_image_url || getDestImage(recommended[0]?.name) || getDestImage('default');

  return (
    <div className="min-h-screen bg-sand">
      {/* Hero Banner */}
      <section className="relative h-72 sm:h-80 overflow-hidden">
        <img src={heroImg} alt="Destination" onError={(e) => { e.target.src = FALLBACK_IMAGE_URL; }} className="w-full h-full object-cover" />
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
            <div>
              <h2 className="font-display text-2xl font-bold text-body">Recommended For You</h2>
              <p className="text-sm text-muted mt-1">ML-powered picks based on your profile</p>
            </div>
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

        {/* Activity Based Sections */}
        {activityBased.map((item, index) => (
          <section key={index}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-body">Because you love {item.vibe}</h2>
                <p className="text-sm text-muted mt-1">Curated based on your interests</p>
              </div>
              <Link to={`/discover?vibes=${item.vibe}`} className="text-primary text-sm font-semibold hover:text-primary-light transition-colors">View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {item.destinations.slice(0, 4).map(d => <DestinationCard key={d.id} destination={d} />)}
            </div>
          </section>
        ))}
        {loading && activityBased.length === 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-body">Curated based on your interests</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array(4).fill(0).map((_, i) => <DestinationCardSkeleton key={i} />)}
            </div>
          </section>
        )}

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
                    <img src={trip.cover_photo_url || getDestImage('default')} alt={trip.name} onError={(e) => { e.target.src = FALLBACK_IMAGE_URL; }} className="w-full h-full object-cover" />
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
