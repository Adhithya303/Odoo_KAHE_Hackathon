import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDestination } from '../api/destinations';
import { getWeather } from '../api/external';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatCurrency } from '../utils/formatters';
import { getDestImage } from '../utils/constants';

export default function DestinationDetailPage() {
  const { id } = useParams();
  const [dest, setDest] = useState(null);
  const [weather, setWeather] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getDestination(id);
        setDest(data);
        try { const w = await getWeather(data.name); setWeather(w.data); } catch {}
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-sand"><Spinner size="lg" /></div>;
  if (!dest) return <div className="min-h-screen flex items-center justify-center bg-sand"><p>Destination not found</p></div>;

  const image = dest.cover_image_url || getDestImage(dest.name);
  const tabs = ['overview', 'activities', 'packages', 'budget', 'tips'];

  return (
    <div className="min-h-screen bg-sand">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img src={image} alt={dest.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={dest.trip_scope === 'International' ? 'coral' : 'green'}>{dest.trip_scope}</Badge>
            {dest.trip_types?.map(t => <Badge key={t} variant="primary">{t}</Badge>)}
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-2">{dest.name}</h1>
          {dest.country && <p className="text-white/70 text-lg">{dest.country}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-card shadow-card p-1.5 -mt-6 relative z-10 max-w-2xl">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2.5 rounded-input text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-body hover:bg-sand'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {tab === 'overview' && (
              <>
                <div className="bg-white rounded-card shadow-card p-8">
                  <h2 className="font-display text-2xl font-semibold mb-4">About {dest.name}</h2>
                  <p className="text-body leading-relaxed">{dest.description || `${dest.name} is a stunning destination perfect for travelers seeking ${dest.trip_types?.join(', ') || 'adventure'}. Known for its unique charm and unforgettable experiences, this destination offers something for everyone.`}</p>
                </div>
                {dest.vibe_tags && (
                  <div className="bg-white rounded-card shadow-card p-8">
                    <h3 className="font-display text-xl font-semibold mb-4">Vibes & Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {dest.vibe_tags.split(',').map(v => <Badge key={v} variant="muted">{v.trim()}</Badge>)}
                    </div>
                  </div>
                )}
                {dest.travel_months?.length > 0 && (
                  <div className="bg-white rounded-card shadow-card p-8">
                    <h3 className="font-display text-xl font-semibold mb-4">Best Time to Visit</h3>
                    <div className="flex flex-wrap gap-2">
                      {dest.travel_months.map(m => <Badge key={m} variant="green">{m}</Badge>)}
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'activities' && (
              <div className="bg-white rounded-card shadow-card p-8">
                <h2 className="font-display text-2xl font-semibold mb-6">Things to Do in {dest.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Temple Visit', 'Local Market Tour', 'Sunset Viewpoint', 'Traditional Cuisine', 'Nature Trail', 'Cultural Show'].map((act, i) => (
                    <div key={i} className="p-4 border border-border rounded-card hover:border-primary/30 hover:shadow-sm transition-all">
                      <div className="text-2xl mb-2">{['🏛️','🛍️','🌅','🍛','🌿','🎭'][i]}</div>
                      <h4 className="font-semibold text-body">{act}</h4>
                      <p className="text-sm text-muted mt-1">Popular activity in {dest.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'packages' && (
              <div className="space-y-6">
                <div className="bg-white rounded-card shadow-card p-8 text-center">
                  <h2 className="font-display text-2xl font-semibold mb-2">Curated Packages for {dest.name}</h2>
                  <p className="text-muted text-sm max-w-lg mx-auto">Choose from our pre-designed itineraries or customize them further to match your style.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: 'Essential', price: dest.avg_min_budget || 4999, icon: '🌟', color: 'blue', features: ['Standard Accommodation', 'Daily Breakfast', 'Key Landmarks Tour', 'Public Transport Guide'] },
                    { name: 'Comfort', price: ((dest.avg_min_budget + dest.avg_max_budget) / 2) || 9999, icon: '💎', color: 'purple', features: ['4-Star Stay', 'Half Board Meals', 'Private Sightseeing', 'Airport Transfers'] },
                    { name: 'Premium', price: dest.avg_max_budget || 14999, icon: '👑', color: 'amber', features: ['Luxury Resort Stay', 'All Inclusive Meals', 'Exclusive Experiences', 'Private SUV & Guide'] }
                  ].map((pkg, i) => (
                    <div key={i} className="bg-white rounded-card shadow-card p-6 flex flex-col border-2 border-transparent hover:border-primary/20 transition-all">
                      <div className="text-3xl mb-4">{pkg.icon}</div>
                      <h3 className="font-bold text-xl text-body mb-2">{pkg.name}</h3>
                      <div className="text-2xl font-black text-primary mb-6">{formatCurrency(pkg.price)}<span className="text-xs text-muted font-normal">/person</span></div>
                      <ul className="space-y-3 mb-8 flex-1">
                        {pkg.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Link to="/trips">
                        <Button variant={i === 1 ? 'primary' : 'ghost'} className="w-full text-sm">Choose {pkg.name}</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'budget' && (
              <div className="bg-white rounded-card shadow-card p-8">
                <h2 className="font-display text-2xl font-semibold mb-6">Budget Estimate</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-sand rounded-card text-center">
                    <p className="text-sm text-muted">Min Budget</p>
                    <p className="font-mono text-2xl font-bold text-primary">{formatCurrency(dest.avg_min_budget)}</p>
                  </div>
                  <div className="p-4 bg-sand rounded-card text-center">
                    <p className="text-sm text-muted">Max Budget</p>
                    <p className="font-mono text-2xl font-bold text-coral">{formatCurrency(dest.avg_max_budget)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted">* Budget estimates are per person and based on historical data</p>
              </div>
            )}

            {tab === 'tips' && (
              <div className="space-y-4">
                {[{ icon: '🧳', title: 'Packing Tips', text: 'Pack light layers and comfortable walking shoes. Don\'t forget sunscreen and a reusable water bottle.' },
                  { icon: '📷', title: 'Photography Tips', text: 'Golden hour is the best time for photos. Visit popular spots early morning to avoid crowds.' },
                  { icon: '💡', title: 'Local Tips', text: 'Learn a few basic phrases in the local language. Always carry some cash for small vendors.' }
                ].map((tip, i) => (
                  <div key={i} className="bg-white rounded-card shadow-card p-6 flex gap-4">
                    <div className="text-3xl">{tip.icon}</div>
                    <div><h3 className="font-semibold text-body mb-1">{tip.title}</h3><p className="text-sm text-muted">{tip.text}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather */}
            <div className="bg-white rounded-card shadow-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">🌤️ Weather</h3>
              {weather?.current ? (
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{weather.current.temp}°C</p>
                  <p className="text-muted text-sm mt-1">{weather.current.description}</p>
                  <p className="text-xs text-muted mt-1">Humidity: {weather.current.humidity}%</p>
                </div>
              ) : (
                <p className="text-sm text-muted text-center">Weather data unavailable</p>
              )}
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-card shadow-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Quick Facts</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted">Cost Level</span><Badge variant={dest.cost_index === 'Low' ? 'green' : dest.cost_index === 'High' ? 'coral' : 'warning'}>{dest.cost_index}</Badge></div>
                <div className="flex justify-between"><span className="text-muted">Scope</span><span className="font-medium">{dest.trip_scope}</span></div>
                {dest.group_types?.length > 0 && <div className="flex justify-between"><span className="text-muted">Best For</span><span className="font-medium">{dest.group_types.join(', ')}</span></div>}
              </div>
            </div>

            {/* CTA */}
            <Link to={`/trips`} className="block">
              <Button className="w-full text-base py-4">Plan This Trip →</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
