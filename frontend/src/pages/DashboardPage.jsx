import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import DestinationCard from '../components/destination/DestinationCard';
import { DestinationCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { listDestinations, getTrending, getRecommendations } from '../api/destinations';
import { listTrips, deleteTrip } from '../api/trips';
import { savePreferences } from '../api/auth';
import { formatDate, formatCurrency, getDuration } from '../utils/formatters';
import { getDestImage } from '../utils/constants';

/* ═══════════════════════════════════════════════
   Cycling taglines for the hero banner
   ═══════════════════════════════════════════════ */
const TAGLINES = [
  'Dream it. Plan it. Live it.',
  'Your next adventure awaits.',
  'From Coimbatore to the world.',
];

/* ═══════════════════════════════════════════════
   Travel tips (hard-coded, no API)
   ═══════════════════════════════════════════════ */
const TRAVEL_TIPS = [
  { emoji: '🎒', title: 'Packing Hacks', text: 'Roll your clothes to save space and use packing cubes to stay organized on your trip.', color: 'border-l-green-500' },
  { emoji: '📋', title: 'Visa Information', text: 'Check visa requirements early and apply online for faster processing in many countries.', color: 'border-l-amber-500' },
  { emoji: '📷', title: 'Photography Tips', text: 'Shoot during golden hour for stunning travel photos with the best natural lighting.', color: 'border-l-blue-500' },
  { emoji: '💰', title: 'Budget Hacks', text: 'Book flights on Tuesday mornings and use incognito mode to avoid dynamic pricing.', color: 'border-l-coral' },
  { emoji: '🏥', title: 'Health & Safety', text: 'Always carry travel insurance and keep emergency contacts saved offline.', color: 'border-l-purple-500' },
];

/* ═══════════════════════════════════════════════
   Preference config for onboarding widget
   ═══════════════════════════════════════════════ */
const PREF_ROWS = [
  { key: 'travel_style', label: 'Who are you traveling with?', options: ['Solo 🧳', 'Friends 👫', 'Family 👨‍👩‍👧', 'Couple 💑'] },
  { key: 'trip_scope', label: 'Trip type:', options: ['Domestic 🇮🇳', 'International 🌍'] },
  { key: 'travel_vibe', label: 'Vibe:', options: ['Adventure 🏔️', 'Cultural 🏛️', 'Beach 🏖️', 'Nature 🌿', 'Luxury 💎', 'Staycation 🏠'] },
  { key: 'budget_range', label: 'Budget:', options: ['Budget <₹20k', 'Mid-range ₹20k–₹80k', 'Premium ₹80k+'] },
];

/* ═══════════════════════════════════════════════
   Status → Badge variant mapping
   ═══════════════════════════════════════════════ */
const STATUS_VARIANT = {
  planning: 'warning',
  ongoing: 'green',
  completed: 'primary',
  cancelled: 'danger',
};

/* ═══════════════════════════════════════════════
   Cost index label helper
   ═══════════════════════════════════════════════ */
function costLabel(index) {
  if (!index) return null;
  const map = { Low: 'Budget', Medium: 'Mid', High: 'Premium' };
  return map[index] || index;
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  // ── Data states ──
  const [recommended, setRecommended] = useState([]);
  const [trending, setTrending] = useState([]);
  const [regional, setRegional] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Hero tagline cycling ──
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [taglineFade, setTaglineFade] = useState(true);

  // ── Onboarding widget ──
  const [showPrefWidget, setShowPrefWidget] = useState(false);
  const [prefs, setPrefs] = useState({ travel_style: null, trip_scope: null, travel_vibe: null, budget_range: null });
  const [savingPrefs, setSavingPrefs] = useState(false);

  /* ── Tagline cycling effect ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineFade(false);
      setTimeout(() => {
        setTaglineIdx((prev) => (prev + 1) % TAGLINES.length);
        setTaglineFade(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ── Determine if onboarding widget should show ── */
  useEffect(() => {
    const dismissed = localStorage.getItem('traveloop_pref_dismissed') === 'true';
    const noPrefs = !user?.travel_style;
    setShowPrefWidget(!dismissed && noPrefs);
  }, [user]);

  /* ── Data fetching ── */
  useEffect(() => {
    const load = async () => {
      try {
        const [recRes, destRes, trendRes, tripRes, regionalRes] = await Promise.allSettled([
          getRecommendations(),
          listDestinations({ per_page: 8 }),
          getTrending(4),
          listTrips(),
          listDestinations({ per_page: 12 }),
        ]);

        // Recommended: prefer personalised recs, fallback to general destinations
        if (recRes.status === 'fulfilled' && recRes.value?.data?.destinations?.length) {
          setRecommended(recRes.value.data.destinations);
        } else if (destRes.status === 'fulfilled') {
          setRecommended(destRes.value.data.destinations || []);
        }

        if (trendRes.status === 'fulfilled') setTrending(trendRes.value.data.destinations || []);
        if (tripRes.status === 'fulfilled') setTrips(tripRes.value.data.trips || []);
        if (regionalRes.status === 'fulfilled') setRegional(regionalRes.value.data.destinations || []);
      } catch {
        /* silent — individual sections show empty states */
      }
      setLoading(false);
    };
    load();
  }, []);

  /* ── Preference chip toggle ── */
  const togglePref = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  }, []);

  /* ── Save preferences ── */
  const handleSavePrefs = async () => {
    if (!prefs.travel_style && !prefs.trip_scope && !prefs.travel_vibe && !prefs.budget_range) {
      toast.error('Please select at least one preference');
      return;
    }
    setSavingPrefs(true);
    try {
      const res = await savePreferences(prefs);
      if (res.data?.user) setUser(res.data.user);
      setShowPrefWidget(false);
      toast.success('Preferences saved! Recommendations updated.');
    } catch {
      toast.error('Failed to save preferences. Please try again.');
    }
    setSavingPrefs(false);
  };

  /* ── Dismiss onboarding widget ── */
  const dismissPrefWidget = () => {
    localStorage.setItem('traveloop_pref_dismissed', 'true');
    setShowPrefWidget(false);
  };

  /* ── Delete trip ── */
  const handleDeleteTrip = async (e, tripId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this trip permanently?')) return;
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

  /* ── Hero image ── */
  const heroImg = recommended[0]?.cover_image_url || getDestImage(recommended[0]?.name) || getDestImage('default');

  return (
    <div className="min-h-screen bg-sand">

      {/* ════════════════════════════════════════════
          SECTION 1 — Hero Banner (upgraded)
          ════════════════════════════════════════════ */}
      <section className="relative h-80 sm:h-96 overflow-hidden">
        <img
          src={heroImg}
          alt="Destination hero"
          className="w-full h-full object-cover scale-105 transition-transform duration-[20000ms] hover:scale-110"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Cycling tagline */}
            <p
              className="text-primary-light text-sm sm:text-base font-semibold uppercase tracking-widest mb-3 transition-opacity duration-400"
              style={{ opacity: taglineFade ? 1 : 0 }}
            >
              {TAGLINES[taglineIdx]}
            </p>

            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white mb-3 animate-fade-in">
              Hi {user?.first_name || 'Explorer'}, where to next?
            </h1>
            <p className="text-white/70 text-lg mb-6">Your personalized travel dashboard</p>

            <div className="flex flex-wrap gap-3">
              <Link to="/trips">
                <Button className="text-sm sm:text-base">✈️ Plan a Trip</Button>
              </Link>
              <Link to="/discover">
                <Button variant="ghost" className="text-sm sm:text-base !border-white !text-white hover:!bg-white/20">
                  🔍 Explore Destinations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* ════════════════════════════════════════════
            SECTION 2 — Personalization Onboarding Widget
            ════════════════════════════════════════════ */}
        {showPrefWidget && (
          <section className="animate-fade-in">
            <div className="bg-white rounded-card border border-border shadow-card p-6 sm:p-8 border-l-4 border-l-primary relative">
              {/* Dismiss X */}
              <button
                onClick={dismissPrefWidget}
                className="absolute top-4 right-4 text-muted hover:text-body transition-colors text-xl leading-none"
                aria-label="Dismiss preferences widget"
              >
                ✕
              </button>

              <h3 className="font-display text-xl font-bold text-body mb-1">✨ Tell us your travel style</h3>
              <p className="text-muted text-sm mb-6">Get personalized destination recommendations</p>

              <div className="space-y-5">
                {PREF_ROWS.map((row) => (
                  <div key={row.key}>
                    <p className="text-sm font-semibold text-body mb-2">{row.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {row.options.map((opt) => {
                        const isSelected = prefs[row.key] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => togglePref(row.key, opt)}
                            className={`
                              px-4 py-2 rounded-badge text-sm font-medium transition-all duration-200
                              ${isSelected
                                ? 'bg-primary text-white shadow-glow'
                                : 'bg-sand border border-border text-body hover:border-primary hover:text-primary'
                              }
                            `}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button onClick={handleSavePrefs} loading={savingPrefs} className="text-sm">
                  Save Preferences
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════
            SECTION 3 — Recommended For You (upgraded)
            ════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-body">✨ Recommended For You</h2>
            <Link to="/discover" className="text-primary text-sm font-semibold hover:text-primary-light transition-colors">
              View All →
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth">
            {loading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[260px]">
                    <DestinationCardSkeleton />
                  </div>
                ))
              : recommended.slice(0, 8).map((d) => (
                  <div key={d.id} className="min-w-[260px] snap-start">
                    <DestinationCard destination={d} />
                  </div>
                ))}
            {!loading && recommended.length === 0 && (
              <p className="text-muted text-sm py-8">No recommendations yet. Save your preferences above!</p>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            SECTION 4 — Top Regional Picks (NEW)
            ════════════════════════════════════════════ */}
        <section>
          <h2 className="font-display text-2xl font-bold text-body mb-6">🗺️ Top Regional Picks</h2>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[220px] h-[160px] animate-pulse bg-gray-200 rounded-card" />
                ))
              : regional.map((d) => {
                  const img = d.cover_image_url || getDestImage(d.name);
                  const badge = costLabel(d.cost_index);
                  return (
                    <div
                      key={d.id}
                      className="min-w-[220px] h-[160px] rounded-card overflow-hidden relative group flex-shrink-0 snap-start cursor-pointer"
                      onClick={() => navigate(`/destinations/${d.id}`)}
                    >
                      <img
                        src={img}
                        alt={d.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Cost badge */}
                      {badge && (
                        <span className="absolute top-2 left-2 bg-white/90 text-body text-[10px] font-bold px-2 py-0.5 rounded-badge">
                          {badge}
                        </span>
                      )}

                      {/* Text */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <h3 className="text-white font-display text-lg font-bold leading-tight">{d.name}</h3>
                          <p className="text-white/70 text-xs">{d.country || d.trip_scope}</p>
                        </div>
                        <span className="text-white text-xs font-semibold border border-white/50 rounded-badge px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Explore →
                        </span>
                      </div>
                    </div>
                  );
                })}
            {!loading && regional.length === 0 && (
              <p className="text-muted text-sm py-8">No regional destinations available.</p>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            SECTION — Trending Now (kept)
            ════════════════════════════════════════════ */}
        <section>
          <h2 className="font-display text-2xl font-bold text-body mb-6">🔥 Trending Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading
              ? Array(4).fill(0).map((_, i) => <DestinationCardSkeleton key={i} />)
              : trending.slice(0, 4).map((d) => <DestinationCard key={d.id} destination={d} />)}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            SECTION 5 — Your Trips (upgraded)
            ════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-body">Your Trips</h2>
            <Link to="/trips">
              <Button variant="secondary" className="text-sm px-4 py-2">+ New Trip</Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-card h-32" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-card border border-border p-12 text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="font-display text-xl font-semibold mb-2">No trips yet</h3>
              <p className="text-muted mb-6">Start planning your first adventure!</p>
              <Link to="/trips">
                <Button>Plan a Trip</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {trips.slice(0, 6).map((trip) => {
                  const duration = getDuration(trip.start_date, trip.end_date);
                  return (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="card group p-5 flex gap-4 relative"
                    >
                      {/* Cover photo */}
                      <div className="w-20 h-20 rounded-card overflow-hidden flex-shrink-0">
                        <img
                          src={trip.cover_photo_url || getDestImage('default')}
                          alt={trip.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Trip info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-body truncate group-hover:text-primary transition-colors">
                          {trip.name}
                        </h3>
                        <p className="text-sm text-muted">
                          {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant={STATUS_VARIANT[trip.status] || 'muted'}>{trip.status}</Badge>
                          {duration > 0 && (
                            <span className="text-[11px] font-semibold bg-sand px-2 py-0.5 rounded-badge text-muted">
                              {duration} day{duration !== 1 ? 's' : ''}
                            </span>
                          )}
                          {trip.total_budget && (
                            <span className="text-xs font-mono text-muted">{formatCurrency(trip.total_budget)}</span>
                          )}
                        </div>
                      </div>

                      {/* Quick actions on hover */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/trips/${trip.id}`); }}
                          className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-badge hover:bg-primary/20 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/trips/${trip.id}`); }}
                          className="text-[10px] font-semibold bg-warning/10 text-warning px-2 py-1 rounded-badge hover:bg-warning/20 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDeleteTrip(e, trip.id)}
                          className="text-[10px] font-semibold bg-danger/10 text-danger px-2 py-1 rounded-badge hover:bg-danger/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {trips.length > 6 && (
                <div className="text-center mt-6">
                  <Link to="/trips" className="text-primary font-semibold text-sm hover:text-primary-light transition-colors">
                    View All Trips →
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* ════════════════════════════════════════════
            SECTION 6 — Travel Tips Strip (NEW)
            ════════════════════════════════════════════ */}
        <section>
          <h2 className="font-display text-2xl font-bold text-body mb-6">💡 Travel Tips</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x scroll-smooth">
            {TRAVEL_TIPS.map((tip, i) => (
              <div
                key={i}
                className={`min-w-[240px] bg-white rounded-card shadow-card border border-border border-l-4 ${tip.color} p-4 flex-shrink-0 snap-start`}
              >
                <span className="text-2xl">{tip.emoji}</span>
                <h4 className="font-bold text-sm text-body mt-2">{tip.title}</h4>
                <p className="text-muted text-xs mt-1 line-clamp-2">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
