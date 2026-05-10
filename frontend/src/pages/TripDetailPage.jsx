import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrip, getItinerary, generateItinerary, updateTrip } from '../api/trips';
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
  const [showShareModal, setShowShareModal] = useState(false);

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
    setShowShareModal(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const handleMakePublic = async () => {
    try {
      await updateTrip(id, { visibility: 'public' });
      setTrip({ ...trip, visibility: 'public' });
      toast.success('Trip is now public!');
    } catch (err) {
      toast.error('Failed to update visibility');
    }
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {itinerary.map((stop, idx) => (
                    <div key={idx} className="flex flex-col gap-4">
                      <div className="bg-[#1D9E75] text-white p-4 rounded-2xl shadow-sm text-center">
                        <div className="text-xs font-bold opacity-80 uppercase tracking-widest">Day {idx + 1}</div>
                        <div className="font-bold text-lg">{stop.title}</div>
                        <div className="text-[10px] opacity-70">{formatDate(stop.start_date)}</div>
                      </div>
                      <div className="flex-1 space-y-3">
                        {stop.activities?.map((act, aIdx) => {
                          const catColors = {
                            transport: 'bg-blue-100 text-blue-700 border-blue-200',
                            stay: 'bg-purple-100 text-purple-700 border-purple-200',
                            food: 'bg-orange-100 text-orange-700 border-orange-200',
                            activities: 'bg-teal-100 text-teal-700 border-teal-200'
                          };
                          const colorClass = catColors[act.category?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
                          
                          return (
                            <div key={aIdx} className={`p-3 rounded-xl border text-xs font-bold shadow-sm transition-transform hover:scale-105 cursor-default ${colorClass}`}>
                              <div className="mb-1">🕒 {act.time || '10:00'}</div>
                              <div>{act.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  {itinerary.map((stop, sIdx) => (
                    <div key={sIdx} className="bg-white rounded-3xl overflow-hidden border border-[#E0D8CC] shadow-sm">
                      <div className="bg-[#F5F0E8] p-6 border-b border-[#E0D8CC] flex justify-between items-center">
                        <div>
                          <div className="text-[#1D9E75] text-xs font-bold uppercase tracking-widest mb-1">Day {sIdx + 1} • {formatDate(stop.start_date)}</div>
                          <h3 className="text-2xl font-bold text-[#2C2C2A]">{stop.title}</h3>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-500 shadow-sm">
                          {stop.activities?.length || 0} Activities
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {stop.activities?.length > 0 ? stop.activities.map((act, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-[#E0D8CC]">
                              <div className="w-20 text-center">
                                <div className="text-lg font-bold text-[#2C2C2A]">{act.time || '10:00'}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Start Time</div>
                              </div>
                              <div className="w-12 h-12 bg-[#F5F0E8] rounded-xl flex items-center justify-center text-xl">
                                {getCategoryIcon(act.category)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-[#2C2C2A] text-lg">{act.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-1">{act.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="bg-teal-50 text-[#1D9E75] px-3 py-1 rounded-lg text-sm font-bold border border-teal-100">
                                  {formatCurrency(act.cost)}
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-10 text-gray-400 italic">No activities planned for this day.</div>
                          )}
                        </div>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-card max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-bold text-body">Share Trip</h3>
              <button onClick={() => setShowShareModal(false)} className="text-muted hover:text-body text-xl">✕</button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-muted mb-2">Current Visibility:</p>
              <div className="flex items-center gap-2">
                <Badge variant={trip.visibility === 'public' ? 'green' : 'warning'} className="capitalize">
                  {trip.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                </Badge>
                <p className="text-xs text-muted">
                  {trip.visibility === 'public' 
                    ? 'Anyone with the link can view this trip.' 
                    : 'Only you can view this trip unless you make it public.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Option 1: Copy Share Link */}
              <div className="p-4 bg-sand/50 rounded-card border border-border">
                <h4 className="font-bold text-body mb-1 text-sm">Sharable Link</h4>
                <p className="text-xs text-muted mb-3">Copy the link to the shared itinerary page.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}/share/${id}`} 
                    className="flex-1 text-xs bg-white border border-border rounded-input px-3 py-2 outline-none"
                  />
                  <Button 
                    onClick={() => copyToClipboard(`${window.location.origin}/share/${id}`)} 
                    variant="secondary" 
                    className="text-xs py-2"
                  >
                    📋 Copy
                  </Button>
                </div>
              </div>

              {/* Option 2: Make Public (if private) */}
              {trip.visibility !== 'public' && (
                <div className="p-4 bg-primary/5 rounded-card border border-primary/10">
                  <h4 className="font-bold text-primary mb-1 text-sm">Make Public</h4>
                  <p className="text-xs text-muted mb-3">Make this trip public so anyone with the link can access it.</p>
                  <Button 
                    onClick={handleMakePublic} 
                    className="w-full text-xs py-2"
                  >
                    🌐 Make Trip Public
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowShareModal(false)} variant="ghost" className="text-sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
