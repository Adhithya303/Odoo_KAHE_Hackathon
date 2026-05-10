import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getChecklist, addItem, updateItem, deleteItem, resetChecklist, aiSuggestItems } from '../api/checklist';
import { getTrip } from '../api/trips';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { formatDate, getDuration } from '../utils/formatters';

const CATEGORIES = ['All', 'Documents', 'Clothing', 'Electronics', 'Toiletries', 'Miscellaneous'];
const CAT_COLORS = {
  Documents: 'primary', Clothing: 'coral', Electronics: 'warning',
  Toiletries: 'green', Miscellaneous: 'muted',
};

function ProgressBar({ packed, total }) {
  const pct = total ? Math.round((packed / total) * 100) : 0;
  const color = pct === 100 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-danger';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white/90">{packed} of {total} items packed</span>
        <span className="font-bold text-white">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-white/20 rounded-badge overflow-hidden">
        <div className={`h-full ${color} rounded-badge transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ItemRow({ item, tripId, onUpdate, onDelete, aiHighlightIds }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.item_name);
  const [optimistic, setOptimistic] = useState(item.is_packed);
  const inputRef = useRef(null);

  const handleToggle = async () => {
    const next = !optimistic;
    setOptimistic(next);
    try {
      const { data } = await updateItem(tripId, item.id, { is_packed: next });
      onUpdate(data);
    } catch {
      setOptimistic(!next);
      toast.error('Failed to update item');
    }
  };

  const handleNameSave = async () => {
    setEditing(false);
    if (editName.trim() === item.item_name) return;
    try {
      const { data } = await updateItem(tripId, item.id, { item_name: editName.trim() });
      onUpdate(data);
    } catch { toast.error('Failed to rename item'); }
  };

  const handleDelete = async () => {
    onDelete(item.id);
    try {
      await deleteItem(tripId, item.id);
      toast('Item removed', { icon: '🗑️', duration: 2000 });
    } catch { toast.error('Failed to delete item'); }
  };

  const isAi = aiHighlightIds.has(item.id);

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-card group transition-all ${optimistic ? 'opacity-60' : ''}`}>
      <button onClick={handleToggle} className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${optimistic ? 'bg-success border-success' : 'border-border hover:border-primary'}`}>
        {optimistic && <span className="text-white text-xs">✓</span>}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          className="flex-1 text-sm border-b border-primary outline-none bg-transparent"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditing(false); }}
          autoFocus
        />
      ) : (
        <span
          className={`flex-1 text-sm cursor-text hover:text-primary transition-colors ${optimistic ? 'line-through text-muted' : 'text-body'}`}
          onClick={() => setEditing(true)}
        >
          {item.item_name}
        </span>
      )}

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isAi && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-badge font-semibold">✨ AI</span>}
        <Badge variant={CAT_COLORS[item.category] || 'muted'} className="text-[10px] py-0.5 px-2">{item.category}</Badge>
        <button onClick={handleDelete} className="text-danger hover:text-red-700 text-sm transition-colors">🗑</button>
      </div>
    </div>
  );
}

function AddItemRow({ tripId, category, onAdd }) {
  const [name, setName] = useState('');
  const [cat, setCat] = useState(category === 'All' ? 'Miscellaneous' : category);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      const { data } = await addItem(tripId, { item_name: name.trim(), category: cat });
      onAdd(data);
      setName('');
    } catch { toast.error('Failed to add item'); }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <span className="text-primary font-bold text-lg">+</span>
      <input
        className="flex-1 text-sm border-b border-border focus:border-primary outline-none bg-transparent placeholder:text-muted"
        placeholder="Add item..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
      />
      <select
        className="text-xs border border-border rounded-input px-2 py-1 bg-white text-body"
        value={cat}
        onChange={e => setCat(e.target.value)}
      >
        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
      </select>
      <button onClick={handleAdd} className="text-xs bg-primary text-white px-3 py-1.5 rounded-input hover:bg-primary-light transition-colors">Add</button>
    </div>
  );
}

export default function PackingChecklistPage() {
  const { id: tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState({ packed: 0, total: 0, percentage: 0 });
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHighlightIds, setAiHighlightIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [tripRes, checkRes] = await Promise.allSettled([getTrip(tripId), getChecklist(tripId)]);
        if (tripRes.status === 'fulfilled') setTrip(tripRes.value.data);
        if (checkRes.status === 'fulfilled') {
          setItems(checkRes.value.data.items || []);
          setProgress(checkRes.value.data.progress || { packed: 0, total: 0, percentage: 0 });
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [tripId]);

  const recalcProgress = useCallback((list) => {
    const total = list.length;
    const packed = list.filter(i => i.is_packed).length;
    setProgress({ packed, total, percentage: total ? Math.round((packed / total) * 100) : 0 });
  }, []);

  const handleUpdate = useCallback((updated) => {
    setItems(prev => {
      const next = prev.map(i => i.id === updated.id ? updated : i);
      recalcProgress(next);
      return next;
    });
  }, [recalcProgress]);

  const handleDelete = useCallback((itemId) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== itemId);
      recalcProgress(next);
      return next;
    });
  }, [recalcProgress]);

  const handleAdd = useCallback((newItem) => {
    setItems(prev => {
      const next = [...prev, newItem];
      recalcProgress(next);
      return next;
    });
  }, [recalcProgress]);

  const handleReset = async () => {
    try {
      const { data } = await resetChecklist(tripId);
      setItems(prev => prev.map(i => ({ ...i, is_packed: false })));
      setProgress(data.progress || { packed: 0, total: items.length, percentage: 0 });
      toast.success('All items reset to unpacked');
    } catch { toast.error('Failed to reset checklist'); }
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    const tid = toast.loading('🤖 Analysing your trip...');
    try {
      const { data } = await aiSuggestItems(tripId);
      toast.dismiss(tid);
      const newIds = new Set((data.items || []).filter(i => i.ai_suggested).map(i => i.id));
      setAiHighlightIds(newIds);
      setItems(data.items || []);
      recalcProgress(data.items || []);
      toast.success(`✨ Added ${data.added} AI suggestions!`);
      // Fade out highlights after 30s
      setTimeout(() => setAiHighlightIds(new Set()), 30000);
    } catch {
      toast.dismiss(tid);
      toast.error('Could not reach AI. Please try again.');
    }
    setAiLoading(false);
  };

  const filteredItems = activeTab === 'All' ? items : items.filter(i => i.category === activeTab);
  const packedItems = filteredItems.filter(i => i.is_packed);
  const unpackedItems = filteredItems.filter(i => !i.is_packed);

  const catCounts = CATEGORIES.slice(1).reduce((acc, cat) => {
    const catItems = items.filter(i => i.category === cat);
    const packedCount = catItems.filter(i => i.is_packed).length;
    acc[cat] = `${packedCount}/${catItems.length}`;
    return acc;
  }, {});

  const duration = trip ? getDuration(trip.start_date, trip.end_date) : 0;

  if (loading) return (
    <div className="min-h-screen bg-sand flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-primary text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">🎒 Packing Checklist</h1>
              {trip && <p className="text-white/70 text-sm">{trip.name}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleAiSuggest} disabled={aiLoading}
                className="text-sm border border-white/50 text-white px-4 py-2 rounded-input hover:bg-white/10 transition-colors disabled:opacity-50">
                🤖 AI Suggest
              </button>
              <button onClick={handleReset}
                className="text-sm text-white/70 px-4 py-2 rounded-input hover:bg-white/10 transition-colors">
                🔄 Reset All
              </button>
            </div>
          </div>
          <ProgressBar packed={progress.packed} total={progress.total} />
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {CATEGORIES.map(cat => {
              const count = cat === 'All' ? `${items.filter(i => i.is_packed).length}/${items.length}` : catCounts[cat];
              return (
                <button key={cat} onClick={() => setActiveTab(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-badge text-sm font-medium transition-all ${activeTab === cat ? 'bg-primary text-white' : 'text-muted hover:text-body hover:bg-sand'}`}>
                  {cat} <span className="ml-1 text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="bg-white rounded-card shadow-card p-12 text-center">
                <div className="text-6xl mb-4">🎒</div>
                <h3 className="font-display text-xl font-semibold mb-2">No items yet</h3>
                <p className="text-muted mb-4">Start with AI suggestions or add items manually</p>
                <button onClick={handleAiSuggest} disabled={aiLoading} className="btn-primary text-sm">
                  {aiLoading ? '🤖 Generating...' : '✨ Start with AI →'}
                </button>
              </div>
            ) : (
              (() => {
                const sections = activeTab === 'All'
                  ? CATEGORIES.slice(1).filter(cat => items.some(i => i.category === cat))
                  : [activeTab];

                return sections.map(cat => {
                  const catUnpacked = (activeTab === 'All' ? items : filteredItems).filter(i => i.category === cat && !i.is_packed);
                  const catPacked = (activeTab === 'All' ? items : filteredItems).filter(i => i.category === cat && i.is_packed);
                  if (catUnpacked.length === 0 && catPacked.length === 0) return null;
                  return (
                    <div key={cat} className="bg-white rounded-card shadow-card overflow-hidden">
                      {activeTab === 'All' && (
                        <div className="px-4 py-3 bg-sand border-b border-border">
                          <h3 className="font-semibold text-sm text-body">{cat}</h3>
                        </div>
                      )}
                      <div className="divide-y divide-border/50">
                        {catUnpacked.map(item => (
                          <ItemRow key={item.id} item={item} tripId={tripId} onUpdate={handleUpdate} onDelete={handleDelete} aiHighlightIds={aiHighlightIds} />
                        ))}
                        {catPacked.length > 0 && (
                          <>
                            <div className="px-4 py-1 text-[10px] text-muted text-center tracking-widest">— packed —</div>
                            {catPacked.map(item => (
                              <ItemRow key={item.id} item={item} tripId={tripId} onUpdate={handleUpdate} onDelete={handleDelete} aiHighlightIds={aiHighlightIds} />
                            ))}
                          </>
                        )}
                      </div>
                      <AddItemRow tripId={tripId} category={activeTab} onAdd={handleAdd} />
                    </div>
                  );
                });
              })()
            )}
          </div>

          {/* AI Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-card shadow-card p-6">
              <h3 className="font-display text-lg font-semibold mb-1">✨ AI Packing Assistant</h3>
              <p className="text-muted text-sm mb-4">Let AI build your checklist based on your destination, dates, and trip type</p>

              {trip && (
                <div className="bg-sand rounded-card p-3 mb-4 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2"><span>📍</span><span className="text-body">{trip.stops?.[0]?.destination_name || 'Your destination'}</span></div>
                  <div className="flex items-center gap-2"><span>📅</span><span className="text-body">{duration} days</span></div>
                  <div className="flex items-center gap-2"><span>🌍</span><span className="text-body">{trip.trip_scope}</span></div>
                </div>
              )}

              <Button onClick={handleAiSuggest} loading={aiLoading} className="w-full text-sm">
                Generate Smart Packing List
              </Button>

              <div className="mt-6">
                <h4 className="font-semibold text-sm mb-3">💡 Quick Tips</h4>
                <div className="space-y-2">
                  {(trip?.trip_scope === 'International' ? [
                    { icon: '🛂', tip: 'Carry passport + visa copies' },
                    { icon: '🛡️', tip: 'Get travel insurance' },
                    { icon: '🔌', tip: 'Carry adaptor for local power sockets' },
                  ] : [
                    { icon: '🪪', tip: 'Carry your Aadhaar/PAN card' },
                    { icon: '🗺️', tip: 'Download offline maps' },
                    { icon: '🩹', tip: 'Pack a first aid kit' },
                  ]).map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted">
                      <span>{t.icon}</span><span>{t.tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => window.print()} className="mt-4 w-full text-sm text-muted hover:text-body border border-border rounded-input py-2 transition-colors">
                🖨️ Print Checklist
              </button>
            </div>

            <Link to={`/trips/${tripId}`} className="block text-center text-primary text-sm font-semibold hover:text-primary-light transition-colors">
              ← Back to Trip
            </Link>
          </div>
        </div>
      </div>

      <style>{`@media print { .lg\\:col-span-1, nav, header { display: none !important; } }`}</style>
    </div>
  );
}
