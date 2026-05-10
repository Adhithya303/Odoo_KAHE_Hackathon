import { useState, useEffect } from 'react';
import DestinationCard from '../components/destination/DestinationCard';
import { DestinationCardSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import { listDestinations, searchDestinations, filterDestinations } from '../api/destinations';
import { VIBES, SCOPES, COST_INDEXES } from '../utils/constants';

export default function DiscoverPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ scope: '', vibes: [], cost_index: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      let res;
      if (search.trim()) {
        res = await searchDestinations(search);
      } else if (filters.scope || filters.vibes.length || filters.cost_index) {
        res = await filterDestinations({
          scope: filters.scope || undefined,
          vibes: filters.vibes.join(',') || undefined,
          cost_index: filters.cost_index || undefined,
          page,
        });
      } else {
        res = await listDestinations({ page });
      }
      setDestinations(res.data.destinations || []);
      setTotal(res.data.total || 0);
    } catch { setDestinations([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const toggleVibe = (v) => {
    setFilters(f => ({ ...f, vibes: f.vibes.includes(v) ? f.vibes.filter(x => x !== v) : [...f.vibes, v] }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-bold mb-3">Discover Destinations</h1>
          <p className="text-white/70 mb-6">Find your perfect getaway from 69+ handpicked destinations</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex max-w-2xl">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search destinations... (e.g., 'peaceful hill station under ₹20,000')"
              className="flex-1 px-5 py-3.5 rounded-l-input bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/15 text-sm" />
            <button type="submit" className="px-6 py-3.5 bg-coral hover:bg-coral-hover rounded-r-input font-semibold text-sm transition-colors">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-card shadow-card mb-8 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-body">Scope:</span>
            {['', ...SCOPES].map(s => (
              <button key={s} onClick={() => { setFilters(f => ({ ...f, scope: s })); setPage(1); }}
                className={`px-4 py-1.5 rounded-badge text-sm transition-all ${
                  filters.scope === s ? 'bg-primary text-white' : 'bg-sand text-body hover:bg-primary/10'}`}>
                {s || 'All'}
              </button>
            ))}

            <span className="text-sm font-semibold text-body ml-4">Budget:</span>
            {['', ...COST_INDEXES].map(c => (
              <button key={c} onClick={() => { setFilters(f => ({ ...f, cost_index: c })); setPage(1); }}
                className={`px-4 py-1.5 rounded-badge text-sm transition-all ${
                  filters.cost_index === c ? 'bg-coral text-white' : 'bg-sand text-body hover:bg-coral/10'}`}>
                {c || 'All'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-body">Vibes:</span>
            {VIBES.map(v => (
              <button key={v} onClick={() => toggleVibe(v)}
                className={`px-3 py-1.5 rounded-badge text-xs transition-all ${
                  filters.vibes.includes(v) ? 'bg-primary text-white' : 'bg-sand text-muted hover:bg-primary/10 hover:text-primary'}`}>
                {v}
              </button>
            ))}
            {(filters.vibes.length > 0 || filters.scope || filters.cost_index) && (
              <button onClick={() => { setFilters({ scope: '', vibes: [], cost_index: '' }); setPage(1); }}
                className="text-xs text-danger hover:text-danger/80 ml-2">✕ Clear filters</button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <DestinationCardSkeleton key={i} />)}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display text-2xl font-semibold mb-2">No destinations found</h3>
            <p className="text-muted mb-6">Try adjusting your filters or search terms</p>
            <Button variant="ghost" onClick={() => { setFilters({ scope: '', vibes: [], cost_index: '' }); setSearch(''); setPage(1); }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-4">{total} destinations found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map(d => <DestinationCard key={d.id} destination={d} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
