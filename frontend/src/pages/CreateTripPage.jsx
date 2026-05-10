import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createTrip } from '../api/trips';
import { listDestinations } from '../api/destinations';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { formatCurrency } from '../utils/formatters';
import { getDestImage, FALLBACK_IMAGE_URL } from '../utils/constants';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: '', start_date: '', end_date: '',
    trip_scope: 'Domestic', total_budget: '',
  });
  const [stops, setStops] = useState([]);
  const [destQuery, setDestQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const searchRef = useRef(null);

  /* ── Duration ── */
  const days = form.start_date && form.end_date
    ? Math.max(0, Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1) : 0;

  /* ── Pre-fill from destination page ── */
  const preId = searchParams.get('destination_id');
  const preName = searchParams.get('destination_name');
  useEffect(() => {
    if (preId && preName && stops.length === 0) {
      setStops([{ _key: Date.now(), destination_id: parseInt(preId), custom_place: null,
        section_title: preName, cover_image: getDestImage(preName), stop_budget: '' }]);
      setForm(f => ({ ...f, name: `Trip to ${preName}` }));
    }
  }, [preId, preName]);

  /* ── Search ── */
  const { data: results, isLoading: searching } = useQuery({
    queryKey: ['dest-search', destQuery],
    queryFn: () => listDestinations({ search: destQuery, per_page: 5 }),
    enabled: destQuery.length > 2,
    select: r => r.data.destinations || [],
  });

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── Mutation ── */
  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: r => { toast.success('Trip created!'); navigate(`/trips/${r.data?.id || ''}`); },
    onError: e => toast.error(e.response?.data?.detail || 'Failed to create trip'),
  });

  /* ── Handlers ── */
  const addStop = (dest) => {
    if (stops.some(s => s.destination_id === dest.id)) { toast.error('Already added'); return; }
    setStops(p => [...p, { _key: Date.now(), destination_id: dest.id, custom_place: null,
      section_title: dest.name, cover_image: dest.cover_image_url || getDestImage(dest.name), stop_budget: '' }]);
    setDestQuery(''); setShowDropdown(false); setErrors(e => ({ ...e, stops: undefined }));
  };

  const addCustom = () => {
    if (!destQuery.trim()) return;
    setStops(p => [...p, { _key: Date.now(), destination_id: null, custom_place: destQuery.trim(),
      section_title: destQuery.trim(), cover_image: getDestImage('default'), stop_budget: '' }]);
    setDestQuery(''); setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = 'Required';
    if (!form.start_date) err.start_date = 'Required';
    if (!form.end_date) err.end_date = 'Required';
    if (form.start_date && form.end_date && new Date(form.end_date) < new Date(form.start_date)) err.end_date = 'Must be after start';
    if (stops.length === 0) err.stops = 'Add at least one destination';
    setErrors(err);
    if (Object.keys(err).length) return;

    mutation.mutate({
      name: form.name, start_date: form.start_date, end_date: form.end_date,
      trip_scope: form.trip_scope, visibility: 'private',
      total_budget: form.total_budget ? parseFloat(form.total_budget) : null,
      cover_photo_url: stops[0]?.cover_image || null,
      stops: stops.map(s => ({
        destination_id: s.destination_id, custom_place: s.custom_place,
        section_title: s.section_title,
        arrival_date: form.start_date, departure_date: form.end_date,
        stop_budget: s.stop_budget ? parseFloat(s.stop_budget) : null,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-sand py-10 px-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-display text-3xl font-bold text-body">Create a New Trip</h1>
          <p className="text-muted mt-1">Add your destinations, dates, and budget to get started.</p>
        </div>

        {/* Card 1 — Basics */}
        <div className="bg-white rounded-card shadow-card border border-border p-6 space-y-5">
          <Input label="Trip Name" placeholder="e.g. Summer Goa Getaway" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} required />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.start_date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, start_date: e.target.value })} error={errors.start_date} required />
            <Input label="End Date" type="date" value={form.end_date}
              min={form.start_date || new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, end_date: e.target.value })} error={errors.end_date} required />
          </div>

          {days > 0 && <Badge variant="green">{days} day{days !== 1 ? 's' : ''}</Badge>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-body">Scope</label>
              <div className="flex gap-2">
                {['Domestic', 'International'].map(s => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, trip_scope: s })}
                    className={`flex-1 py-2 rounded-badge text-sm font-medium border transition-all ${
                      form.trip_scope === s ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border hover:border-primary/30'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-body">Budget (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">₹</span>
                <input type="number" className="input-field pl-8" placeholder="50000"
                  value={form.total_budget} onChange={e => setForm({ ...form, total_budget: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 — Destinations */}
        <div className="bg-white rounded-card shadow-card border border-border p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-body">📍 Where are you going?</h2>

          {/* Search */}
          <div className="relative" ref={searchRef}>
            <input type="text" className="input-field" placeholder="Search for a city or place..."
              value={destQuery} autoComplete="off"
              onChange={e => { setDestQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)} />
            {errors.stops && <p className="text-xs text-danger mt-1">{errors.stops}</p>}

            {showDropdown && destQuery.length > 2 && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-card shadow-card border border-border max-h-52 overflow-y-auto">
                {searching ? (
                  <div className="p-4 flex justify-center"><Spinner size="sm" /></div>
                ) : results?.length > 0 ? (
                  <>
                    {results.map(d => (
                      <button key={d.id} type="button" onClick={() => addStop(d)}
                        className="w-full text-left px-4 py-3 hover:bg-sand transition-colors flex items-center gap-3">
                        <img src={d.cover_image_url || getDestImage(d.name)} alt="" className="w-8 h-8 rounded-full object-cover" onError={e => { e.target.src = FALLBACK_IMAGE_URL; }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-body truncate">{d.name}</p>
                          <p className="text-xs text-muted">{d.country || d.trip_scope}</p>
                        </div>
                      </button>
                    ))}
                    <button type="button" onClick={addCustom}
                      className="w-full text-left px-4 py-2.5 border-t border-border text-primary text-sm font-semibold hover:bg-sand">
                      + Add "{destQuery}" as custom place
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={addCustom}
                    className="w-full text-left px-4 py-3 text-primary text-sm font-semibold hover:bg-sand">
                    + Add "{destQuery}" as custom place
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stop chips */}
          {stops.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stops.map((s, i) => (
                <div key={s._key} className="flex items-center gap-2 bg-sand border border-border rounded-badge pl-1 pr-2 py-1">
                  <img src={s.cover_image} alt="" className="w-7 h-7 rounded-full object-cover" onError={e => { e.target.src = FALLBACK_IMAGE_URL; }} />
                  <span className="text-sm font-medium text-body">{s.section_title}</span>
                  <button type="button" onClick={() => setStops(p => p.filter(x => x._key !== s._key))}
                    className="text-muted hover:text-danger text-xs font-bold ml-1">✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-border rounded-card">
              <p className="text-muted text-sm">Search above to add destinations</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full py-4 text-lg font-bold shadow-lg shadow-primary/20" loading={mutation.isPending}>
          🚀 Create Trip
        </Button>
      </form>
    </div>
  );
}
