import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrip, getItinerary, generateItinerary } from '../api/trips';
import { getBudget, predictBudget, addBudgetItem } from '../api/budget';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { formatDate, formatCurrency, getDuration } from '../utils/formatters';
import { getDestImage, HOTEL_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [budget, setBudget] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getTrip(id);
        setTrip(data);
        try { const it = await getItinerary(id); setItinerary(it.data.itinerary || []); } catch {}
        try { const bg = await getBudget(id); setBudget(bg.data); } catch {}
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await generateItinerary(id, { interests: ['sightseeing', 'food', 'culture'], hotel_type: 'mid' });
      toast.success('Itinerary generated!');
      const it = await getItinerary(id);
      setItinerary(it.data.itinerary || []);
    } catch { toast.error('Failed to generate itinerary'); }
    setGenerating(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-sand"><Spinner size="lg" /></div>;
  if (!trip) return <div className="min-h-screen flex items-center justify-center bg-sand">Trip not found</div>;

  const tabs = ['overview', 'itinerary', 'budget', 'map'];
  const statusColors = { planning: 'warning', ongoing: 'green', completed: 'primary', cancelled: 'danger' };

  return (
    <div className="min-h-screen bg-sand">
      {/* Hero */}
      <div className="relative h-64">
        <img src={trip.cover_photo_url || getDestImage('default')} alt={trip.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={statusColors[trip.status]}>{trip.status}</Badge>
            <Badge variant="muted">{trip.trip_scope}</Badge>
          </div>
          <h1 className="font-display text-4xl font-bold text-white">{trip.name}</h1>
          <p className="text-white/70 mt-1">{formatDate(trip.start_date)} – {formatDate(trip.end_date)} · {trip.duration_days} days</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-card shadow-card p-1.5 -mt-5 relative z-10 max-w-2xl mb-8">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2.5 rounded-input text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-primary text-white' : 'text-muted hover:text-body hover:bg-sand'}`}>{t}</button>
          ))}
        </div>

        {/* Content */}
        <div className="pb-12">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {trip.description && (
                  <div className="bg-white rounded-card shadow-card p-6">
                    <h2 className="font-display text-xl font-semibold mb-3">About This Trip</h2>
                    <p className="text-body leading-relaxed">{trip.description}</p>
                  </div>
                )}
                {trip.stops?.length > 0 && (
                  <div className="bg-white rounded-card shadow-card p-6">
                    <h2 className="font-display text-xl font-semibold mb-4">Stops</h2>
                    <div className="space-y-3">
                      {trip.stops.map((stop, i) => (
                        <div key={stop.id} className="flex items-center gap-4 p-4 bg-sand rounded-card">
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</div>
                          <div>
                            <h4 className="font-semibold">{stop.destination_name || stop.custom_place || 'Stop'}</h4>
                            {stop.arrival_date && <p className="text-xs text-muted">{formatDate(stop.arrival_date)}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-card shadow-card p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Trip Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted">Duration</span><span className="font-semibold">{trip.duration_days} days</span></div>
                    <div className="flex justify-between"><span className="text-muted">Budget</span><span className="font-mono font-semibold text-primary">{formatCurrency(trip.total_budget)}</span></div>
                    {trip.predicted_budget && <div className="flex justify-between"><span className="text-muted">AI Predicted</span><span className="font-mono font-semibold text-coral">{formatCurrency(trip.predicted_budget)}</span></div>}
                    <div className="flex justify-between"><span className="text-muted">Status</span><Badge variant={statusColors[trip.status]}>{trip.status}</Badge></div>
                  </div>
                </div>
                <Button onClick={handleGenerate} loading={generating} className="w-full py-3">🤖 Generate AI Itinerary</Button>
              </div>
            </div>
          )}

          {tab === 'itinerary' && (
            <div className="space-y-6">
              {itinerary.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-card shadow-card">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="font-display text-2xl font-semibold mb-2">No itinerary yet</h3>
                  <p className="text-muted mb-6">Let AI build your perfect schedule</p>
                  <Button onClick={handleGenerate} loading={generating}>🤖 Generate Itinerary</Button>
                </div>
              ) : (
                itinerary.map((item, i) => (
                  <div key={i} className="bg-white rounded-card shadow-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">
                      📍 {item.stop.section_title || `Stop ${i + 1}`}
                    </h3>
                    <div className="space-y-3">
                      {item.activities.map((act, j) => (
                        <div key={j} className="flex items-start gap-4 p-4 bg-sand rounded-card hover:bg-primary/5 transition-colors">
                          <div className="w-8 h-8 bg-coral/10 text-coral rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{j + 1}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-body">{act.activity_name}</h4>
                            {act.activity_description && <p className="text-sm text-muted mt-1">{act.activity_description}</p>}
                            <div className="flex gap-4 mt-2 text-xs text-muted">
                              {act.duration_hours && <span>⏱ {act.duration_hours}h</span>}
                              {act.estimated_cost > 0 && <span>💰 {formatCurrency(act.estimated_cost)}</span>}
                              {act.notes && <span>📝 {act.notes}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-card shadow-card p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Budget Breakdown</h2>
                  {budget?.by_category && Object.keys(budget.by_category).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(budget.by_category).map(([cat, amt]) => (
                        <div key={cat} className="flex items-center justify-between p-3 bg-sand rounded-card">
                          <span className="font-medium">{cat}</span>
                          <span className="font-mono font-semibold text-primary">{formatCurrency(amt)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-center py-8">No expenses recorded yet</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-card shadow-card p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Summary</h3>
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-primary/5 rounded-card">
                      <p className="text-sm text-muted">Total Budget</p>
                      <p className="font-mono text-2xl font-bold text-primary">{formatCurrency(budget?.total_budget || trip.total_budget)}</p>
                    </div>
                    <div className="text-center p-4 bg-coral/5 rounded-card">
                      <p className="text-sm text-muted">Total Spent</p>
                      <p className="font-mono text-2xl font-bold text-coral">{formatCurrency(budget?.total_spent || 0)}</p>
                    </div>
                    <div className="text-center p-4 bg-success/5 rounded-card">
                      <p className="text-sm text-muted">Remaining</p>
                      <p className="font-mono text-2xl font-bold text-success">{formatCurrency(budget?.remaining || 0)}</p>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/trips/${id}/budget`}
                  className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-card transition-colors text-sm"
                >
                  📊 View Full Budget Details
                </Link>
              </div>
            </div>
          )}

          {tab === 'map' && (
            <div className="bg-white rounded-card shadow-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Trip Map</h2>
              <div className="h-96 bg-sand rounded-card flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">🗺️</div>
                  <p className="text-muted">Interactive map with your trip stops</p>
                  <p className="text-xs text-muted mt-1">Add coordinates to your stops to see them on the map</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
