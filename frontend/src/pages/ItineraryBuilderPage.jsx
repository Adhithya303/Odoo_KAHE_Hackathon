import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTrip, getItinerary, generateItinerary, updateItinerary } from '../api/trips';
import { predictGlobalBudget } from '../api/budget';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { formatCurrency } from '../utils/formatters';

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [mlInputs, setMlInputs] = useState({
    duration: 0,
    city: '',
    travelers: 1,
    hotel_type: 'Mid'
  });
  const [predictedBudget, setPredictedBudget] = useState(null);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => getTrip(id),
    select: (res) => res.data
  });

  const { data: itineraryData, isLoading: itineraryLoading } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => getItinerary(id),
    select: (res) => res.data.itinerary || []
  });

  useEffect(() => {
    if (itineraryData && itineraryData.length > 0) {
      setSections(itineraryData);
    } else if (trip) {
      // Default initial section
      setSections([{
        id: Date.now(),
        title: trip.destination_name || 'Stop 1',
        description: '',
        start_date: trip.start_date,
        end_date: trip.end_date,
        budget_allocated: 0,
        activities: []
      }]);
      setMlInputs(prev => ({ 
        ...prev, 
        duration: trip.duration_days || 0,
        city: trip.destination_name || ''
      }));
    }
  }, [itineraryData, trip]);

  const predictMutation = useMutation({
    mutationFn: (data) => predictGlobalBudget(data),
    onSuccess: (res) => {
      setPredictedBudget(res.data.prediction);
      toast.success('Budget predicted!');
    }
  });

  const generateMutation = useMutation({
    mutationFn: (data) => generateItinerary(id, data),
    onSuccess: (res) => {
      setSections(res.data.itinerary);
      toast.success('AI Itinerary Generated!');
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data) => updateItinerary(id, data),
    onSuccess: () => {
      toast.success('Itinerary saved!');
      navigate(`/trips/${id}`);
    }
  });

  const addSection = () => {
    const lastSection = sections[sections.length - 1];
    setSections([...sections, {
      id: Date.now(),
      title: 'New Stop',
      description: '',
      start_date: lastSection?.end_date || '',
      end_date: '',
      budget_allocated: 0,
      activities: []
    }]);
  };

  const removeSection = (sectionId) => {
    if (window.confirm('Remove this section and all activities?')) {
      setSections(sections.filter(s => s.id !== sectionId));
    }
  };

  const updateSection = (sectionId, field, value) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
  };

  const addActivity = (sectionId) => {
    setSections(sections.map(s => s.id === sectionId ? {
      ...s,
      activities: [...s.activities, {
        id: Date.now(),
        time: '10:00',
        name: '',
        cost: 0,
        category: 'Sightseeing'
      }]
    } : s));
  };

  const updateActivity = (sectionId, activityId, field, value) => {
    setSections(sections.map(s => s.id === sectionId ? {
      ...s,
      activities: s.activities.map(a => a.id === activityId ? { ...a, [field]: value } : a)
    } : s));
  };

  const removeActivity = (sectionId, activityId) => {
    setSections(sections.map(s => s.id === sectionId ? {
      ...s,
      activities: s.activities.filter(a => a.id !== activityId)
    } : s));
  };

  const moveSection = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;
    
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  const totalBudget = sections.reduce((sum, s) => sum + (parseFloat(s.budget_allocated) || 0), 0);

  if (tripLoading || itineraryLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-sand">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-sand">
      {/* Sidebar */}
      <aside className="w-full lg:w-[30%] bg-white border-r border-border overflow-y-auto p-6 space-y-8 shadow-sm">
        <div>
          <button 
            onClick={() => navigate(`/trips/${id}`)}
            className="text-primary text-sm font-semibold mb-4 hover:underline flex items-center gap-1"
          >
            ← Back to Trip
          </button>
          <h2 className="font-display text-2xl font-bold text-body">{trip?.name}</h2>
          <div className="mt-4 p-4 bg-primary/5 rounded-card border border-primary/10">
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Total Allocated Budget</p>
            <p className="text-3xl font-mono font-bold text-primary">{formatCurrency(totalBudget)}</p>
          </div>
        </div>

        {/* ML Budget Prediction Widget */}
        <div className="p-5 bg-sand rounded-card border border-border space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <h3 className="font-bold text-body">ML Budget Prediction</h3>
          </div>
          
          <div className="space-y-3">
            <Input 
              label="City/Destination" 
              value={mlInputs.city} 
              onChange={(e) => setMlInputs({ ...mlInputs, city: e.target.value })} 
            />
            <div className="grid grid-cols-2 gap-3">
              <Input 
                label="Days" 
                type="number" 
                value={mlInputs.duration} 
                onChange={(e) => setMlInputs({ ...mlInputs, duration: e.target.value })} 
              />
              <Input 
                label="Travelers" 
                type="number" 
                value={mlInputs.travelers} 
                onChange={(e) => setMlInputs({ ...mlInputs, travelers: e.target.value })} 
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-body">Hotel Type</label>
              <select 
                className="input-field"
                value={mlInputs.hotel_type}
                onChange={(e) => setMlInputs({ ...mlInputs, hotel_type: e.target.value })}
              >
                <option value="Budget">Budget</option>
                <option value="Mid">Mid-Range</option>
                <option value="Premium">Premium / Luxury</option>
              </select>
            </div>
            
            <Button 
              variant="secondary" 
              className="w-full text-sm" 
              onClick={() => predictMutation.mutate(mlInputs)}
              loading={predictMutation.isPending}
            >
              Predict Budget
            </Button>

            {predictedBudget && (
              <div className="pt-2">
                <Badge variant="green" className="w-full justify-center py-2 text-sm font-bold">
                  Estimated: {formatCurrency(predictedBudget)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* AI Generator */}
        <div className="p-5 bg-primary/5 rounded-card border border-primary/20 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✨</span>
            <h3 className="font-bold text-body">AI Generator</h3>
          </div>
          <p className="text-xs text-muted">Generate a full day-by-day itinerary based on your preferences.</p>
          <Button 
            className="w-full" 
            onClick={() => generateMutation.mutate({ interests: ['Sightseeing', 'Food', 'Culture'], hotel_type: mlInputs.hotel_type })}
            loading={generateMutation.isPending}
          >
            AI Generate Itinerary
          </Button>
        </div>

        <Button 
          className="w-full py-4 text-lg font-bold shadow-lg shadow-primary/20"
          onClick={() => saveMutation.mutate(sections)}
          loading={saveMutation.isPending}
        >
          Save Itinerary
        </Button>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-3xl font-bold text-body">Itinerary Canvas</h1>
            <p className="text-sm text-muted">{sections.length} Sections Defined</p>
          </div>

          {sections.map((section, idx) => (
            <div key={section.id} className="card bg-white p-6 shadow-sm border-l-4 border-l-primary relative">
              {/* Section Controls */}
              <div className="absolute top-4 right-4 flex gap-1">
                <button 
                  onClick={() => moveSection(idx, 'up')}
                  className="p-1 hover:bg-sand rounded disabled:opacity-30"
                  disabled={idx === 0}
                >
                  🔼
                </button>
                <button 
                  onClick={() => moveSection(idx, 'down')}
                  className="p-1 hover:bg-sand rounded disabled:opacity-30"
                  disabled={idx === sections.length - 1}
                >
                  🔽
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Section Title" 
                    value={section.title} 
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    className="font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      label="From" 
                      type="date" 
                      value={section.start_date} 
                      onChange={(e) => updateSection(section.id, 'start_date', e.target.value)} 
                    />
                    <Input 
                      label="To" 
                      type="date" 
                      value={section.end_date} 
                      onChange={(e) => updateSection(section.id, 'end_date', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-body">Notes / Description</label>
                    <textarea 
                      className="input-field min-h-[80px]"
                      value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-body">Allocated Budget</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
                      <input 
                        type="number"
                        className="input-field pl-8"
                        value={section.budget_allocated}
                        onChange={(e) => updateSection(section.id, 'budget_allocated', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-sm font-bold text-body uppercase tracking-wider">Activities</h4>
                  {section.activities.map(activity => (
                    <div key={activity.id} className="flex flex-wrap items-end gap-3 bg-sand/50 p-3 rounded-input">
                      <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-muted block">Time</label>
                        <input 
                          type="time" 
                          className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-sm py-1"
                          value={activity.time}
                          onChange={(e) => updateActivity(section.id, activity.id, 'time', e.target.value)}
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] uppercase font-bold text-muted block">Activity Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Visit Eiffel Tower"
                          className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-sm py-1 font-medium"
                          value={activity.name}
                          onChange={(e) => updateActivity(section.id, activity.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-28">
                        <label className="text-[10px] uppercase font-bold text-muted block">Cost (₹)</label>
                        <input 
                          type="number" 
                          className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-sm py-1"
                          value={activity.cost}
                          onChange={(e) => updateActivity(section.id, activity.id, 'cost', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-[10px] uppercase font-bold text-muted block">Category</label>
                        <select 
                          className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-sm py-1"
                          value={activity.category}
                          onChange={(e) => updateActivity(section.id, activity.id, 'category', e.target.value)}
                        >
                          <option value="Sightseeing">🏛️ Sightseeing</option>
                          <option value="Transport">🚗 Transport</option>
                          <option value="Stay">🏨 Stay</option>
                          <option value="Food">🍽️ Food</option>
                          <option value="Other">✨ Other</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => removeActivity(section.id, activity.id)}
                        className="text-muted hover:text-danger transition-colors p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => addActivity(section.id)}
                    className="text-primary text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity mt-2"
                  >
                    + Add Activity
                  </button>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => removeSection(section.id)}
                    className="text-xs font-bold text-danger/70 hover:text-danger flex items-center gap-1"
                  >
                    Remove Section
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={addSection}
            className="w-full py-6 border-2 border-dashed border-border rounded-card text-muted hover:border-primary hover:text-primary transition-all flex flex-col items-center justify-center gap-2 font-bold"
          >
            <span className="text-2xl">+</span>
            Add Another Section
          </button>
        </div>
      </main>
    </div>
  );
}
