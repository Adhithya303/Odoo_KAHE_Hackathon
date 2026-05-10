import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrip, getItinerary, generateItinerary } from '../api/trips';
import { getBudget } from '../api/budget';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatDate, formatCurrency } from '../utils/formatters';
import { getDestImage } from '../utils/constants';
import toast from 'react-hot-toast';

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [budget, setBudget] = useState(null);
  const [tab, setTab] = useState('overview');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
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

  const handleShare = () => {
    const url = `${window.location.origin}/trips/${id}/view`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleExportPDF = () => {
    toast('PDF export coming soon!', { icon: '📄' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-sand"><Spinner size="lg" /></div>;
  if (!trip) return <div className="min-h-screen flex items-center justify-center bg-sand">Trip not found</div>;

  const tabs = ['overview', 'itinerary', 'budget', 'map'];
  const statusColors = { planning: 'warning', ongoing: 'green', completed: 'primary', cancelled: 'danger' };

  const getCategoryIcon = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'transport': return '🚗';
      case 'stay': return '🏨';
      case 'food': return '🍽️';
      case 'sightseeing': return '🏛️';
      default: return '✨';
    }
  };

  return (
    <div className="min-h-screen bg-sand pb-20">
      {/* Header / Hero */}
      <div className="relative h-80 overflow-hidden">
        <img src={trip.cover_photo_url || getDestImage(trip.destination_name || 'default')} alt={trip.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={statusColors[trip.status]} className="uppercase tracking-widest text-[10px] font-bold">{trip.status}</Badge>
                <Badge variant="muted" className="uppercase tracking-widest text-[10px] font-bold">{trip.trip_scope}</Badge>
              </div>
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">{trip.name}</h1>
                <p className="text-white/80 text-lg flex items-center gap-2">
                  <span>📅 {formatDate(trip.start_date)} – {formatDate(trip.end_date)}</span>
                  <span className="opacity-50">|</span>
                  <span>📍 {trip.destination_name || 'Multiple Stops'}</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleShare} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
                Share Trip
              </Button>
              <Button onClick={handleExportPDF} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
                Export PDF
              </Button>
              <Link to={`/trips/${id}/build`}>
                <Button className="shadow-xl shadow-primary/30">Edit Itinerary</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white rounded-card shadow-card p-1.5 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 min-w-[100px] px-6 py-3 rounded-input text-sm font-bold capitalize transition-all ${
                tab === t ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-body hover:bg-sand'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {trip.description && (
                  <div className="bg-white rounded-card shadow-sm p-8 border border-border">
                    <h2 className="font-display text-2xl font-bold text-body mb-4">About This Trip</h2>
                    <p className="text-body text-lg leading-relaxed whitespace-pre-wrap">{trip.description}</p>
                  </div>
                )}
                
                <div className="bg-white rounded-card shadow-sm p-8 border border-border">
                  <h2 className="font-display text-2xl font-bold text-body mb-6">Planned Stops</h2>
                  <div className="space-y-6">
                    {itinerary.length > 0 ? itinerary.map((section, i) => (
                      <div key={i} className="flex gap-6 relative">
                        {i < itinerary.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-sand" />}
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-display text-xl font-bold flex-shrink-0 z-10 border-4 border-white shadow-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="bg-sand/30 p-5 rounded-card border border-border/50">
                            <h4 className="font-bold text-lg text-body">{section.title}</h4>
                            <p className="text-sm text-muted mb-2">{formatDate(section.start_date)} - {formatDate(section.end_date)}</p>
                            {section.description && <p className="text-sm text-body">{section.description}</p>}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 border-2 border-dashed border-border rounded-card">
                        <p className="text-muted">No stops defined yet. Use the builder to add sections.</p>
                        <Link to={`/trips/${id}/build`} className="text-primary font-bold mt-2 inline-block">Go to Builder →</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white rounded-card shadow-sm p-8 border border-border">
                  <h3 className="font-display text-xl font-bold text-body mb-6">Trip Summary</h3>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-muted font-medium">Duration</span>
                      <span className="font-bold text-body">{trip.duration_days} Days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted font-medium">Budget</span>
                      <span className="font-mono font-bold text-primary text-lg">{formatCurrency(trip.total_budget)}</span>
                    </div>
                    {trip.predicted_budget && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted font-medium">AI Predicted</span>
                        <Badge variant="green" className="font-mono font-bold">{formatCurrency(trip.predicted_budget)}</Badge>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted font-medium">Status</span>
                      <Badge variant={statusColors[trip.status]} className="uppercase tracking-widest text-[10px]">{trip.status}</Badge>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <Link to={`/trips/${id}/build`} className="w-full">
                        <Button variant="secondary" className="w-full">Modify Plan</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'itinerary' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl font-bold text-body">Daily Itinerary</h2>
                <div className="flex bg-white rounded-badge border border-border p-1">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-1.5 rounded-badge text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-body'}`}
                  >
                    List View
                  </button>
                  <button 
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-1.5 rounded-badge text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-body'}`}
                  >
                    Calendar
                  </button>
                </div>
              </div>

              {itinerary.length === 0 ? (
                <div className="bg-white rounded-card border-2 border-dashed border-border py-20 text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="font-display text-2xl font-bold text-body mb-2">Build Your Itinerary</h3>
                  <p className="text-muted mb-8 max-w-sm mx-auto">Start planning your days, activities, and budget to get the most out of your trip.</p>
                  <Link to={`/trips/${id}/build`}>
                    <Button className="px-10">Go to Builder</Button>
                  </Link>
                </div>
              ) : viewMode === 'calendar' ? (
                <div className="bg-white rounded-card shadow-sm p-12 text-center border border-border">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="font-display text-xl font-bold text-body">Simple Calendar View</h3>
                  <p className="text-muted mt-2">Highlights dates from {formatDate(trip.start_date)} to {formatDate(trip.end_date)}</p>
                  <div className="mt-8 grid grid-cols-7 gap-2 max-w-md mx-auto">
                    {Array(31).fill(0).map((_, i) => (
                      <div key={i} className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold ${i+1 >= 15 && i+1 <= 22 ? 'bg-primary text-white shadow-sm' : 'bg-sand text-muted'}`}>
                        {i + 1}
                        {(i+1 === 16 || i+1 === 20) && <div className="absolute translate-y-3 w-1 h-1 bg-coral rounded-full" />}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  {itinerary.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-border" />
                        <h3 className="font-display text-xl font-bold text-body bg-sand px-4">
                          {section.title} <span className="text-muted font-normal text-sm ml-2">({formatDate(section.start_date)})</span>
                        </h3>
                        <div className="h-px flex-1 bg-border" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {section.activities?.length > 0 ? section.activities.map((act, aIdx) => (
                          <div key={aIdx} className="card bg-white p-5 hover:shadow-md transition-shadow flex gap-4 border border-border/50">
                            <div className="w-12 h-12 rounded-card bg-sand flex items-center justify-center text-2xl flex-shrink-0">
                              {getCategoryIcon(act.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h4 className="font-bold text-body truncate">{act.name}</h4>
                                <span className="text-sm font-mono font-bold text-primary">{formatCurrency(act.cost)}</span>
                              </div>
                              <p className="text-xs text-muted font-medium uppercase tracking-wider flex items-center gap-2">
                                <span>🕒 {act.time}</span>
                                <span className="opacity-50">•</span>
                                <span>{act.category}</span>
                              </p>
                              {act.description && <p className="text-sm text-body mt-2 line-clamp-2">{act.description}</p>}
                            </div>
                          </div>
                        )) : (
                          <div className="col-span-2 py-8 text-center bg-white/50 rounded-card border border-dashed border-border">
                            <p className="text-sm text-muted italic">No activities planned for this stop.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-card shadow-sm p-8 border border-border">
                  <h2 className="font-display text-2xl font-bold text-body mb-6">Budget Distribution</h2>
                  {itinerary.length > 0 ? (
                    <div className="space-y-4">
                      {itinerary.map((section, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-body">{section.title}</span>
                            <span className="text-primary">{formatCurrency(section.budget_allocated)}</span>
                          </div>
                          <div className="w-full h-3 bg-sand rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${Math.min(100, (section.budget_allocated / (trip.total_budget || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-center py-12">Allocate budget in the itinerary builder to see the breakdown.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-card shadow-sm p-8 border border-border h-fit">
                <h3 className="font-display text-xl font-bold text-body mb-6">Financial Overview</h3>
                <div className="space-y-4">
                  <div className="p-5 bg-primary/5 rounded-card border border-primary/10 text-center">
                    <p className="text-xs uppercase font-bold text-primary mb-1">Total Estimated</p>
                    <p className="text-3xl font-mono font-bold text-primary">{formatCurrency(itinerary.reduce((sum, s) => sum + (parseFloat(s.budget_allocated) || 0), 0))}</p>
                  </div>
                  <div className="p-5 bg-sand rounded-card border border-border text-center">
                    <p className="text-xs uppercase font-bold text-muted mb-1">Original Budget</p>
                    <p className="text-2xl font-mono font-bold text-body">{formatCurrency(trip.total_budget)}</p>
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
            <div className="bg-white rounded-card shadow-sm border border-border overflow-hidden">
              <div className="p-8 border-b border-border">
                <h2 className="font-display text-2xl font-bold text-body">Journey Map</h2>
              </div>
              <div className="h-[500px] bg-sand flex items-center justify-center relative">
                <div className="text-center z-10">
                  <div className="text-7xl mb-4">🗺️</div>
                  <h3 className="font-display text-2xl font-bold text-body">Interactive Map</h3>
                  <p className="text-muted mt-2 max-w-sm mx-auto">Visualizing your route through {itinerary.length} stops.</p>
                </div>
                {/* Visual connectors to look like a map */}
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
                  <path d="M 100 100 Q 300 150 500 100 T 900 200" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10 10" className="text-primary" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
