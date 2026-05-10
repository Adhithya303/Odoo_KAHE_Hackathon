import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getNotes, createNote, updateNote, deleteNote, pinNote } from '../api/notes';
import { getTrip } from '../api/trips';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { formatDate, getDuration } from '../utils/formatters';

const NOTE_TYPES = [
  { value: 'general', label: 'General', icon: '📋' },
  { value: 'hotel', label: 'Hotel Check-in', icon: '🏨' },
  { value: 'day_note', label: 'Day Note', icon: '📅' },
  { value: 'reminder', label: 'Reminder', icon: '⏰' },
  { value: 'contact', label: 'Contact', icon: '📞' },
];

const TYPE_VARIANT = { general: 'muted', hotel: 'primary', day_note: 'green', reminder: 'warning', contact: 'coral' };

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function typeIcon(type) {
  return NOTE_TYPES.find(t => t.value === type)?.icon || '📋';
}

export default function TripNotesPage() {
  const { id: tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [notes, setNotes] = useState([]);
  const [byDay, setByDay] = useState({});
  const [byStop, setByStop] = useState({});
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('all');
  const [mode, setMode] = useState('read'); // read | edit | create
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saving' | 'saved'
  const [deleteModal, setDeleteModal] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState('general');
  const [editDay, setEditDay] = useState('');
  const [editStop, setEditStop] = useState('');
  const [editPinned, setEditPinned] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [createdNoteId, setCreatedNoteId] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [tripRes, notesRes] = await Promise.allSettled([getTrip(tripId), getNotes(tripId)]);
        if (tripRes.status === 'fulfilled') setTrip(tripRes.value.data);
        if (notesRes.status === 'fulfilled') {
          setNotes(notesRes.value.data.notes || []);
          setByDay(notesRes.value.data.by_day || {});
          setByStop(notesRes.value.data.by_stop || {});
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [tripId]);

  const refreshNotes = async () => {
    try {
      const { data } = await getNotes(tripId);
      setNotes(data.notes || []);
      setByDay(data.by_day || {});
      setByStop(data.by_stop || {});
    } catch {}
  };

  const startCreate = () => {
    setSelected(null);
    setEditTitle(''); setEditContent(''); setEditType('general');
    setEditDay(''); setEditStop(''); setEditPinned(false);
    setIsCreatingNew(true); setCreatedNoteId(null);
    setMode('create');
  };

  const selectNote = (note) => {
    setSelected(note);
    setMode('read');
    setIsCreatingNew(false);
  };

  const startEdit = (note) => {
    setEditTitle(note.title || '');
    setEditContent(note.content || '');
    setEditType(note.note_type || 'general');
    setEditDay(note.day_number ? String(note.day_number) : '');
    setEditStop(note.stop_tag || '');
    setEditPinned(note.is_pinned || false);
    setCreatedNoteId(note.id);
    setIsCreatingNew(false);
    setMode('edit');
  };

  // Auto-save with debounce
  const triggerAutoSave = useCallback(async (title, content, type, day, stop, pinned) => {
    if (!title && !content) return;
    setSaveStatus('saving');
    try {
      if (isCreatingNew && !createdNoteId) {
        // First save — POST
        const { data } = await createNote(tripId, {
          title: title || 'Untitled Note', content: content || '',
          note_type: type, day_number: day ? parseInt(day) : null,
          stop_tag: stop || null, is_pinned: pinned,
        });
        setCreatedNoteId(data.id);
        setSelected(data);
        setIsCreatingNew(false);
        await refreshNotes();
      } else if (createdNoteId) {
        // PUT
        const { data } = await updateNote(tripId, createdNoteId, {
          title: title || 'Untitled Note', content: content || '',
          note_type: type, day_number: day ? parseInt(day) : null,
          stop_tag: stop || null, is_pinned: pinned,
        });
        setSelected(data);
        setNotes(prev => prev.map(n => n.id === data.id ? data : n));
      }
      setSaveStatus('saved');
    } catch { setSaveStatus(''); }
  }, [tripId, isCreatingNew, createdNoteId]);

  const scheduleAutoSave = (title, content, type, day, stop, pinned) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    saveTimer.current = setTimeout(() => {
      triggerAutoSave(title, content, type, day, stop, pinned);
    }, 1500);
  };

  const handleDone = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await triggerAutoSave(editTitle, editContent, editType, editDay, editStop, editPinned);
    setMode('read');
    await refreshNotes();
  };

  const handlePin = async (note) => {
    try {
      const { data } = await pinNote(tripId, note.id);
      setSelected(prev => prev ? { ...prev, is_pinned: data.is_pinned } : prev);
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, is_pinned: data.is_pinned } : n));
    } catch { toast.error('Failed to toggle pin'); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteNote(tripId, selected.id);
      setNotes(prev => prev.filter(n => n.id !== selected.id));
      setSelected(null); setMode('read');
      setDeleteModal(false);
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete note'); }
  };

  const duration = trip ? getDuration(trip.start_date, trip.end_date) : 0;

  const sidebarNotes = notes.filter(n =>
    view === 'by_day' ? n.day_number !== null :
    view === 'by_stop' ? n.stop_tag : true
  );

  if (loading) return <div className="min-h-screen bg-sand flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col">
          <div className="bg-white rounded-card shadow-card overflow-hidden flex-1 flex flex-col">
            <div className="p-4 bg-primary text-white">
              <h2 className="font-display font-bold text-lg mb-3">📓 Trip Journal</h2>
              <Button onClick={startCreate} className="w-full text-sm py-2">+ Add Note</Button>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 p-3 border-b border-border">
              {[['all', 'All Notes'], ['by_day', 'By Day'], ['by_stop', 'By Stop']].map(([v, label]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`flex-1 text-xs py-1.5 rounded-badge font-medium transition-all ${view === v ? 'bg-primary text-white' : 'text-muted hover:text-body'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Note list */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/50">
              {sidebarNotes.length === 0 && (
                <div className="p-6 text-center text-muted text-sm">No notes yet — add your first one ↑</div>
              )}
              {sidebarNotes.map(note => (
                <button key={note.id} onClick={() => selectNote(note)}
                  className={`w-full text-left px-4 py-3 transition-all hover:bg-sand ${selected?.id === note.id ? 'bg-primary/10 border-l-4 border-primary' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {note.is_pinned && <span className="text-xs">📌</span>}
                    <span className="text-xs">{typeIcon(note.note_type)}</span>
                    <span className="text-sm font-medium text-body truncate">{note.title || 'Untitled'}</span>
                  </div>
                  <div className="text-xs text-muted">{relativeTime(note.updated_at)}</div>
                  {note.stop_tag && <span className="text-[10px] bg-sand px-1.5 py-0.5 rounded-badge text-muted mt-1 inline-block">{note.stop_tag}</span>}
                </button>
              ))}
            </div>
          </div>

          <Link to={`/trips/${tripId}`} className="mt-3 text-center text-primary text-sm font-semibold hover:text-primary-light transition-colors">
            ← Back to Trip
          </Link>
        </div>

        {/* Main panel */}
        <div className="flex-1 bg-white rounded-card shadow-card overflow-hidden flex flex-col">
          {(mode === 'edit' || mode === 'create') ? (
            /* Edit / Create mode */
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-sand">
                <div className="flex items-center gap-3 flex-wrap">
                  <select value={editType} onChange={e => { setEditType(e.target.value); scheduleAutoSave(editTitle, editContent, e.target.value, editDay, editStop, editPinned); }}
                    className="text-xs border border-border rounded-input px-2 py-1 bg-white">
                    {NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                  </select>
                  <input type="number" min="1" max={duration || 99} placeholder="Day #" value={editDay}
                    onChange={e => { setEditDay(e.target.value); scheduleAutoSave(editTitle, editContent, editType, e.target.value, editStop, editPinned); }}
                    className="w-20 text-xs border border-border rounded-input px-2 py-1 bg-white" />
                  <input type="text" placeholder="Stop tag" value={editStop}
                    onChange={e => { setEditStop(e.target.value); scheduleAutoSave(editTitle, editContent, editType, editDay, e.target.value, editPinned); }}
                    className="w-28 text-xs border border-border rounded-input px-2 py-1 bg-white" />
                  <button onClick={() => { const p = !editPinned; setEditPinned(p); scheduleAutoSave(editTitle, editContent, editType, editDay, editStop, p); }}
                    className={`text-xs px-2 py-1 rounded-badge transition-all ${editPinned ? 'bg-warning/10 text-warning' : 'text-muted hover:text-body'}`}>
                    📌 {editPinned ? 'Pinned' : 'Pin'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : ''}</span>
                  <Button onClick={handleDone} className="text-sm px-4 py-2">Done</Button>
                </div>
              </div>
              <input
                className="px-6 pt-5 pb-2 font-display text-2xl font-bold text-body outline-none border-none placeholder:text-muted/50"
                placeholder="Note title..."
                value={editTitle}
                onChange={e => { setEditTitle(e.target.value); scheduleAutoSave(e.target.value, editContent, editType, editDay, editStop, editPinned); }}
              />
              <textarea
                className="flex-1 px-6 py-2 text-body outline-none resize-none placeholder:text-muted/50 min-h-[300px]"
                placeholder="Write your note here..."
                value={editContent}
                onChange={e => { setEditContent(e.target.value); scheduleAutoSave(editTitle, e.target.value, editType, editDay, editStop, editPinned); }}
              />
            </div>
          ) : selected ? (
            /* Read mode */
            <div className="flex flex-col h-full">
              <div className="px-6 py-4 border-b border-border bg-sand">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={TYPE_VARIANT[selected.note_type] || 'muted'} className="text-xs">
                      {typeIcon(selected.note_type)} {NOTE_TYPES.find(t => t.value === selected.note_type)?.label}
                    </Badge>
                    {selected.stop_tag && <Badge variant="muted" className="text-xs">{selected.stop_tag}</Badge>}
                    {selected.day_number && <Badge variant="muted" className="text-xs">Day {selected.day_number}</Badge>}
                    <span className="text-xs text-muted">{relativeTime(selected.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handlePin(selected)} className={`text-sm hover:scale-110 transition-transform ${selected.is_pinned ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>📌</button>
                    <button onClick={() => startEdit(selected)} className="text-sm text-primary hover:text-primary-light transition-colors font-medium">✏️ Edit</button>
                    <button onClick={() => setDeleteModal(true)} className="text-sm text-danger hover:text-red-700 transition-colors font-medium">🗑️ Delete</button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <h2 className="font-display text-2xl font-bold text-body mb-4">{selected.title}</h2>
                <div className="whitespace-pre-wrap text-body leading-relaxed">{selected.content}</div>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center text-center p-12">
              <div>
                <div className="text-6xl mb-4">📝</div>
                <p className="text-muted">Select a note to read it, or add a new one</p>
                <button onClick={startCreate} className="mt-4 btn-primary text-sm px-6 py-2">+ Add Note</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Note">
        <p className="text-muted mb-6">Are you sure you want to delete this note? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
