import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTrip, getItinerary, generateItinerary, updateItinerary, suggestPlaces } from '../api/trips';
import { predictGlobalBudget } from '../api/budget';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { formatCurrency } from '../utils/formatters';

const ACTIVITY_CATEGORIES = [
  { value: 'Sightseeing', label: '🏛️ Sightseeing' },
  { value: 'Transport', label: '🚗 Transport' },
  { value: 'Stay', label: '🏨 Stay' },
  { value: 'Food', label: '🍽️ Food' },
  { value: 'Adventure', label: '🏔️ Adventure' },
  { value: 'Shopping', label: '🛍️ Shopping' },
  { value: 'Other', label: '✨ Other' },
];

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [mlInputs, setMlInputs] = useState({ duration: 0, city: '', travelers: 1, hotel_type: 'Mid' });
  const [predictedBudget, setPredictedBudget] = useState(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [suggestingPlaces, setSuggestingPlaces] = useState(false);

  /* ── Load trip ── */
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => getTrip(id),
    select: (res) => res.data,
  });

  /* ── Load itinerary ── */
  const { data: itineraryData, isLoading: itineraryLoading } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => getItinerary(id),
    select: (res) => res.data.itinerary || [],
  });

  /* ── Populate sections from loaded itinerary data ── */
  useEffect(() => {
    if (itineraryData && itineraryData.length > 0) {
      // The backend now returns the correct flat format:
      // [{id, title, description, start_date, end_date, budget_allocated, activities: [{id, time, name, cost, category}]}]
      setSections(itineraryData.map(s => ({
        id: s.id || Date.now() + Math.random(),
        title: s.title || 'Stop',
        description: s.description || '',
        start_date: s.start_date || '',
        end_date: s.end_date || '',
        budget_allocated: s.budget_allocated || 0,
        activities: (s.activities || []).map(a => ({
          id: a.id || Date.now() + Math.random(),
          time: a.time || '10:00',
          name: a.name || '',
          description: a.description || '',
          cost: a.cost || 0,
          category: a.category || 'Sightseeing',
        })),
      })));
    } else if (trip && (!itineraryData || itineraryData.length === 0)) {
      // No saved itinerary — create default sections from trip stops
      if (trip.stops && trip.stops.length > 0) {
        setSections(trip.stops.map((s, i) => ({
          id: s.id || Date.now() + i,
          title: s.destination_name || s.section_title || s.custom_place || `Stop ${i + 1}`,
          description: s.description || '',
          start_date: s.arrival_date || trip.start_date,
          end_date: s.departure_date || trip.end_date,
          budget_allocated: s.stop_budget || 0,
          activities: [],
        })));
      } else {
        setSections([{
          id: Date.now(),
          title: trip.destination_name || 'Day 1',
          description: '',
          start_date: trip.start_date,
          end_date: trip.end_date,
          budget_allocated: 0,
          activities: [],
        }]);
      }
      setMlInputs(prev => ({
        ...prev,
        duration: trip.duration_days || 0,
        city: trip.destination_name || '',
      }));
    }
  }, [itineraryData, trip]);

  /* ── ML budget prediction ── */
  const predictMutation = useMutation({
    mutationFn: (data) => predictGlobalBudget(data),
    onSuccess: (res) => { setPredictedBudget(res.data.prediction); toast.success('Budget predicted!'); },
    onError: () => toast.error('Budget prediction failed'),
  });

  /* ── AI itinerary generation ── */
  const generateMutation = useMutation({
    mutationFn: (data) => generateItinerary(id, data),
    onSuccess: (res) => {
      // The response from generate_itinerary has {days: [...], saved: bool}
      const days = res.data?.days || [];
      if (days.length > 0) {
        setSections(days.map((day, idx) => ({
          id: Date.now() + idx,
          title: `Day ${day.day} — ${trip?.destination_name || ''}`,
          description: '',
          start_date: day.date || '',
          end_date: day.date || '',
          budget_allocated: (day.activities || []).reduce((s, a) => s + (a.estimated_cost || 0), 0),
          activities: (day.activities || []).map((a, ai) => ({
            id: Date.now() + idx * 100 + ai,
            time: a.time_slot === 'morning' ? '09:00' : a.time_slot === 'afternoon' ? '14:00' : '18:00',
            name: a.name,
            description: a.description || '',
            cost: a.estimated_cost || 0,
            category: 'Sightseeing',
          })),
        })));
        setHasUnsaved(true);
        toast.success('AI Itinerary generated! Review and save.');
      }
    },
    onError: () => toast.error('Generation failed'),
  });

  /* ── Save itinerary ── */
  const saveMutation = useMutation({
    mutationFn: (data) => updateItinerary(id, data),
    onSuccess: () => {
      setHasUnsaved(false);
      toast.success('Itinerary saved!');
      navigate(`/trips/${id}`);
    },
    onError: () => toast.error('Failed to save itinerary'),
  });

  const handleSuggestPlaces = async () => {
    setSuggestingPlaces(true);
    try {
      const { data } = await suggestPlaces(id, {
        destination: mlInputs.city || trip?.destination_name || 'Destination',
        interests: ['Sightseeing', 'Food'],
        budget_tier: mlInputs.hotel_type.toLowerCase(),
        days: mlInputs.duration || 3
      });
      setSuggestedPlaces(data.places || []);
      toast.success('Suggested places loaded!');
    } catch (err) {
      toast.error('Failed to get suggestions');
    }
    setSuggestingPlaces(false);
  };

  /* ── Section CRUD ── */
  const addSection = () => {
    const last = sections[sections.length - 1];
    setSections([...sections, {
      id: Date.now(),
      title: 'New Stop',
      description: '',
      start_date: last?.end_date || trip?.start_date || '',
      end_date: '',
      budget_allocated: 0,
      activities: [],
    }]);
    setHasUnsaved(true);
  };

  const removeSection = (sectionId) => {
    if (sections.length <= 1) { toast.error('Need at least one section'); return; }
    setSections(sections.filter(s => s.id !== sectionId));
    setHasUnsaved(true);
  };

  const updateSection = (sectionId, field, value) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
    setHasUnsaved(true);
  };

  const moveSection = (index, direction) => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    const copy = [...sections];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setSections(copy);
    setHasUnsaved(true);
  };

  /* ── Activity CRUD ── */
  const addActivity = (sectionId) => {
    setSections(sections.map(s => s.id === sectionId ? {
      ...s,
      activities: [...s.activities, { id: Date.now(), time: '10:00', name: '', description: '', cost: 0, category: 'Sightseeing' }],
    } : s));
    setHasUnsaved(true);
  };

  const updateActivity = (sectionId, activityId, field, value) => {
    setSections(sections.map(s => s.id === sectionId ? {
      ...s,
      activities: s.activities.map(a => a.id === activityId ? { ...a, [field]: value } : a),
    } : s));
    setHasUnsaved(true);
  };

  const removeActivity = (sectionId, activityId) => {
    setSections(sections.map(s => s.id === sectionId ? {
      ...s,
      activities: s.activities.filter(a => a.id !== activityId),
    } : s));
    setHasUnsaved(true);
  };

  /* ── Computed ── */
  const totalBudget = sections.reduce((sum, s) => sum + (parseFloat(s.budget_allocated) || 0), 0);
  const totalActivities = sections.reduce((sum, s) => sum + s.activities.length, 0);

  /* ── Handle save ── */
  const handleSave = () => {
    // Validate
    const emptySections = sections.filter(s => !s.title.trim());
    if (emptySections.length > 0) {
      toast.error('All sections need a title');
      return;
    }
    saveMutation.mutate({
      sections: sections.map(s => ({
        title: s.title,
        description: s.description,
        start_date: s.start_date || null,
        end_date: s.end_date || null,
        budget_allocated: parseFloat(s.budget_allocated) || 0,
        activities: s.activities.filter(a => a.name.trim()).map(a => ({
          name: a.name,
          time: a.time || '10:00',
          cost: parseFloat(a.cost) || 0,
          category: a.category || 'Sightseeing',
          description: a.description || '',
        })),
      })),
    });
  };

  if (tripLoading || itineraryLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-sand"><Spinner size="lg" /></div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-sand">

      {/* ── Sidebar ── */}
      <aside className="w-full lg:w-[320px] bg-white border-r border-border overflow-y-auto p-6 space-y-6 shadow-sm flex-shrink-0">
        <div>
          <button onClick={() => navigate(`/trips/${id}`)}
            className="text-primary text-sm font-semibold mb-3 hover:underline flex items-center gap-1">
            ← Back to Trip
          </button>
          <h2 className="font-display text-xl font-bold text-body truncate">{trip?.name}</h2>
          <p className="text-sm text-muted mt-1">{sections.length} sections · {totalActivities} activities</p>
        </div>

        {/* Budget Card */}
        <div className="p-4 bg-primary/5 rounded-card border border-primary/10">
          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Total Allocated</p>
          <p className="text-2xl font-mono font-bold text-primary">{formatCurrency(totalBudget)}</p>
          {trip?.total_budget && (
            <p className="text-xs text-muted mt-1">
              Trip budget: {formatCurrency(trip.total_budget)} ·
              <span className={totalBudget > trip.total_budget ? ' text-danger font-bold' : ' text-green-600'}>
                {' '}{totalBudget <= trip.total_budget ? formatCurrency(trip.total_budget - totalBudget) + ' remaining' : formatCurrency(totalBudget - trip.total_budget) + ' over'}
              </span>
            </p>
          )}
        </div>

        {/* ML Budget Prediction */}
        <div className="p-4 bg-sand rounded-card border border-border space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <h3 className="font-bold text-sm text-body">ML Budget Prediction</h3>
          </div>
          <Input label="City" value={mlInputs.city} onChange={(e) => setMlInputs({ ...mlInputs, city: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Days" type="number" value={mlInputs.duration} onChange={(e) => setMlInputs({ ...mlInputs, duration: e.target.value })} />
            <Input label="Travelers" type="number" value={mlInputs.travelers} onChange={(e) => setMlInputs({ ...mlInputs, travelers: e.target.value })} />
          </div>
          <select className="input-field text-sm" value={mlInputs.hotel_type} onChange={(e) => setMlInputs({ ...mlInputs, hotel_type: e.target.value })}>
            <option value="Budget">Budget Hotel</option>
            <option value="Mid">Mid-Range</option>
            <option value="Premium">Premium / Luxury</option>
          </select>
          <Button variant="secondary" className="w-full text-sm" onClick={() => predictMutation.mutate(mlInputs)} loading={predictMutation.isPending}>
            Predict Budget
          </Button>
          {predictedBudget && (
            <Badge variant="green" className="w-full justify-center py-2 text-sm font-bold">
              Estimated: {formatCurrency(predictedBudget)}
            </Badge>
          )}
        </div>

        {/* AI Generator */}
        <div className="p-4 bg-primary/5 rounded-card border border-primary/20 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h3 className="font-bold text-sm text-body">AI Generator</h3>
          </div>
          <p className="text-xs text-muted">Auto-generate a day-by-day plan with activities and costs.</p>
          <Button className="w-full text-sm"
            onClick={() => generateMutation.mutate({ interests: ['Sightseeing', 'Food', 'Culture'], hotel_type: mlInputs.hotel_type })}
            loading={generateMutation.isPending}>
            ✨ AI Generate Itinerary
          </Button>
        </div>

        {/* AI Place Suggestions */}
        <div className="p-4 bg-primary/5 rounded-card border border-primary/20 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📍</span>
            <h3 className="font-bold text-sm text-body">AI Place Suggestions</h3>
          </div>
          <p className="text-xs text-muted">Get AI-suggested places to visit.</p>
          <Button variant="secondary" className="w-full text-sm"
            onClick={handleSuggestPlaces}
            loading={suggestingPlaces}>
            🔍 Suggest Places
          </Button>
          
          {suggestedPlaces.length > 0 && (
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
              {suggestedPlaces.map((place, idx) => (
                <div key={idx} className="p-2 bg-white rounded border border-border text-xs">
                  <p className="font-bold">{place.name}</p>
                  <p className="text-muted line-clamp-1">{place.description}</p>
                  <button 
                    type="button"
                    onClick={() => {
                      if (sections.length > 0) {
                        const targetSection = sections[0];
                        updateSection(targetSection.id, 'activities', [
                          ...targetSection.activities,
                          { id: Date.now(), time: '10:00', name: place.name, description: place.description, cost: place.estimated_cost_inr || 0, category: 'Sightseeing' }
                        ]);
                        toast.success(`Added ${place.name} to ${targetSection.title}`);
                      } else {
                        toast.error('Add a section first');
                      }
                    }}
                    className="text-primary hover:underline mt-1 font-semibold">
                    + Add to Plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <Button className="w-full py-3 text-base font-bold shadow-lg shadow-primary/20" onClick={handleSave} loading={saveMutation.isPending}>
          💾 Save Itinerary
        </Button>
        {hasUnsaved && <p className="text-xs text-warning text-center font-semibold">You have unsaved changes</p>}
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-body">Itinerary Canvas</h1>
            <p className="text-sm text-muted">{sections.length} Section{sections.length !== 1 ? 's' : ''}</p>
          </div>

          {sections.map((section, idx) => (
            <div key={section.id} className="bg-white rounded-card shadow-sm border-l-4 border-l-primary p-6 relative">
              {/* Section Controls */}
              <div className="absolute top-4 right-4 flex gap-1">
                <button onClick={() => moveSection(idx, 'up')} className="p-1 hover:bg-sand rounded disabled:opacity-30 text-sm" disabled={idx === 0}>🔼</button>
                <button onClick={() => moveSection(idx, 'down')} className="p-1 hover:bg-sand rounded disabled:opacity-30 text-sm" disabled={idx === sections.length - 1}>🔽</button>
              </div>

              <div className="space-y-5">
                {/* Title + Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Section Title" value={section.title} onChange={(e) => updateSection(section.id, 'title', e.target.value)} />
                  <Input label="From" type="date" value={section.start_date} onChange={(e) => updateSection(section.id, 'start_date', e.target.value)} />
                  <Input label="To" type="date" value={section.end_date} onChange={(e) => updateSection(section.id, 'end_date', e.target.value)} />
                </div>

                {/* Description + Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-body">Notes</label>
                    <textarea className="input-field min-h-[70px] text-sm" value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)} placeholder="Notes for this section..." />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-body">Allocated Budget</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
                      <input type="number" className="input-field pl-8" value={section.budget_allocated}
                        onChange={(e) => updateSection(section.id, 'budget_allocated', e.target.value)} />
                    </div>
                    {section.activities.length > 0 && (
                      <p className="text-xs text-muted mt-1">
                        Activities total: {formatCurrency(section.activities.reduce((s, a) => s + (parseFloat(a.cost) || 0), 0))}
                      </p>
                    )}
                  </div>
                </div>

                {/* Activities */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-sm font-bold text-body uppercase tracking-wider">Activities</h4>

                  {section.activities.map(activity => (
                    <div key={activity.id} className="flex flex-wrap items-end gap-3 bg-sand/50 p-3 rounded-input">
                      <div className="w-20">
                        <label className="text-[10px] uppercase font-bold text-muted block">Time</label>
                        <input type="time" className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-sm py-1"
                          value={activity.time} onChange={(e) => updateActivity(section.id, activity.id, 'time', e.target.value)} />
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <label className="text-[10px] uppercase font-bold text-muted block">Activity</label>
                        <input type="text" placeholder="e.g. Visit Eiffel Tower"
                          className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-sm py-1 font-medium"
                          value={activity.name} onChange={(e) => updateActivity(section.id, activity.id, 'name', e.target.value)} />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-muted block">Cost (₹)</label>
                        <input type="number" className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-sm py-1"
                          value={activity.cost} onChange={(e) => updateActivity(section.id, activity.id, 'cost', e.target.value)} />
                      </div>
                      <div className="w-32">
                        <label className="text-[10px] uppercase font-bold text-muted block">Category</label>
                        <select className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-sm py-1"
                          value={activity.category} onChange={(e) => updateActivity(section.id, activity.id, 'category', e.target.value)}>
                          {ACTIVITY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <button onClick={() => removeActivity(section.id, activity.id)}
                        className="text-muted hover:text-danger transition-colors p-1 text-sm">🗑️</button>
                    </div>
                  ))}

                  <button onClick={() => addActivity(section.id)}
                    className="text-primary text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity mt-2">
                    + Add Activity
                  </button>
                </div>

                {/* Remove section */}
                <div className="pt-3 flex justify-end">
                  <button onClick={() => removeSection(section.id)}
                    className="text-xs font-bold text-danger/70 hover:text-danger flex items-center gap-1">
                    Remove Section
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Section */}
          <button onClick={addSection}
            className="w-full py-6 border-2 border-dashed border-border rounded-card text-muted hover:border-primary hover:text-primary transition-all flex flex-col items-center justify-center gap-2 font-bold">
            <span className="text-2xl">+</span>
            Add Another Section
          </button>
        </div>
      </main>
    </div>
  );
}
