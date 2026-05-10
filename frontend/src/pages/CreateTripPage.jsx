import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createTrip } from '../api/trips';
import { listDestinations } from '../api/destinations';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import DestinationCard from '../components/destination/DestinationCard';
import { DestinationCardSkeleton } from '../components/common/Skeleton';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    destination_id: '',
    destination_name: '',
    start_date: '',
    end_date: '',
    description: '',
    cover_photo_url: '',
    trip_scope: 'Domestic',
    visibility: 'Private',
    total_budget: ''
  });

  const [errors, setErrors] = useState({});
  const [destQuery, setDestQuery] = useState('');
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // AI Suggested Destinations
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['destinations', 'suggestions'],
    queryFn: () => listDestinations({ per_page: 6 }),
    select: (res) => res.data.destinations || []
  });

  // Destination Search
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['destinations', 'search', destQuery],
    queryFn: () => listDestinations({ search: destQuery, per_page: 5 }),
    enabled: destQuery.length > 2,
    select: (res) => res.data.destinations || []
  });

  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: (res) => {
      toast.success('Trip created successfully!');
      navigate(`/trips/${res.data.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create trip');
    }
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Trip name is required';
    if (!formData.destination_id) newErrors.destination = 'Please select a destination';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const payload = {
      ...formData,
      total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null
    };
    createMutation.mutate(payload);
  };

  const handleSelectDestination = (dest) => {
    setFormData(prev => ({
      ...prev,
      destination_id: dest.id,
      destination_name: dest.name,
      trip_scope: dest.trip_scope || prev.trip_scope
    }));
    setDestQuery(dest.name);
    setShowDestDropdown(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-sand">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-[60%] p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl font-bold text-body mb-2">Plan Your Next Adventure</h1>
          <p className="text-muted mb-10">Fill in the details below to start your journey.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Trip Name"
              placeholder="e.g. Summer in Santorini"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />

            <div className="relative">
              <Input
                label="Destination / Place"
                placeholder="Search for a city or country..."
                value={destQuery}
                onChange={(e) => {
                  setDestQuery(e.target.value);
                  setShowDestDropdown(true);
                  if (!e.target.value) setFormData(prev => ({ ...prev, destination_id: '', destination_name: '' }));
                }}
                onFocus={() => setShowDestDropdown(true)}
                error={errors.destination}
                autoComplete="off"
              />
              {showDestDropdown && (destQuery.length > 2 || searchLoading) && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-card shadow-card border border-border max-h-60 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 flex justify-center"><Spinner size="sm" /></div>
                  ) : searchResults?.length > 0 ? (
                    searchResults.map(dest => (
                      <button
                        key={dest.id}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-sand transition-colors flex items-center justify-between"
                        onClick={() => handleSelectDestination(dest)}
                      >
                        <div>
                          <p className="font-medium text-body">{dest.name}</p>
                          <p className="text-xs text-muted">{dest.country || dest.trip_scope}</p>
                        </div>
                        <Badge variant={dest.trip_scope === 'International' ? 'coral' : 'green'}>{dest.trip_scope}</Badge>
                      </button>
                    ))
                  ) : destQuery.length > 2 ? (
                    <p className="p-4 text-sm text-muted text-center">No destinations found</p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                error={errors.start_date}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                error={errors.end_date}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-body">Trip Description</label>
              <textarea
                className="input-field min-h-[100px] py-3"
                placeholder="What's the vibe of this trip?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Cover Photo URL"
                placeholder="https://images.unsplash.com/..."
                value={formData.cover_photo_url}
                onChange={(e) => setFormData({ ...formData, cover_photo_url: e.target.value })}
              />
              {formData.cover_photo_url && (
                <div className="h-40 rounded-card overflow-hidden border border-border bg-white p-2">
                  <img 
                    src={formData.cover_photo_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-card"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL'}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-body">Trip Scope</label>
                <div className="flex gap-2">
                  {['Domestic', 'International'].map(scope => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => setFormData({ ...formData, trip_scope: scope })}
                      className={`flex-1 py-2 px-4 rounded-badge text-sm font-medium border transition-all ${
                        formData.trip_scope === scope 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-white text-muted border-border hover:border-primary/30'
                      }`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-body">Visibility</label>
                <div className="flex gap-2">
                  {['Public', 'Private'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFormData({ ...formData, visibility: v })}
                      className={`flex-1 py-2 px-4 rounded-badge text-sm font-medium border transition-all ${
                        formData.visibility === v 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-white text-muted border-border hover:border-primary/30'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-body">Total Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-medium">₹</span>
                <input
                  type="number"
                  className="input-field pl-8"
                  placeholder="0.00"
                  value={formData.total_budget}
                  onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full py-4 text-lg font-bold shadow-lg shadow-primary/20" 
                loading={createMutation.isPending}
              >
                Create Trip
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - AI Suggestions */}
      <div className="w-full lg:w-[40%] bg-white border-l border-border p-6 lg:p-12 overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✨</span>
            <h2 className="font-display text-2xl font-bold text-body">AI Suggested Destinations</h2>
          </div>
          <p className="text-sm text-muted">Based on your preferences and trending spots</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suggestionsLoading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="h-64"><DestinationCardSkeleton /></div>)
          ) : (
            suggestions?.map(dest => (
              <div key={dest.id} className="relative group">
                <div 
                  className="absolute inset-0 z-10 cursor-pointer" 
                  onClick={() => handleSelectDestination(dest)}
                />
                <DestinationCard destination={dest} className="h-full" />
                <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="primary" className="shadow-md">Click to Select</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
