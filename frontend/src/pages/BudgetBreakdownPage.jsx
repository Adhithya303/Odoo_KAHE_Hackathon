import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudget, addBudgetItem, deleteBudgetItem } from '../api/budget';
import { getTrip } from '../api/trips';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Download, Share2, X, AlertTriangle } from 'lucide-react';

const CATEGORY_ICONS = { Transport: '🚗', Stay: '🏨', Food: '🍽️', Activities: '🏛️', Other: '💼' };
const CATEGORY_COLORS = { Transport: '#0F6E56', Stay: '#F59E0B', Food: '#3B82F6', Activities: '#D85A30', Other: '#6B7280' };
const PIE_COLORS = ['#0F6E56', '#F59E0B', '#3B82F6', '#D85A30', '#6B7280'];
const CATEGORIES = ['Transport', 'Stay', 'Food', 'Activities', 'Other'];

const formatINR = (val) => {
  if (val === undefined || val === null) return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

function StatCard({ label, value, color = 'text-body', sub }) {
  return (
    <div className="bg-white rounded-card shadow-card p-4 text-center">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

function AddExpenseModal({ tripId, onClose, onAdded }) {
  const [form, setForm] = useState({ category: 'Food', description: '', qty: 1, unit_cost: '' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.unit_cost) return toast.error('Fill all required fields');
    setLoading(true);
    try {
      await addBudgetItem(tripId, {
        category_name: form.category,
        description: form.description,
        qty: Number(form.qty),
        unit_cost: Number(form.unit_cost),
      });
      toast.success('Expense added!');
      onAdded();
      onClose();
    } catch { toast.error('Failed to add expense'); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-card shadow-elevated max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-bold">Add Expense</h3>
          <button onClick={onClose} className="text-muted hover:text-body"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-body mb-1">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full border border-border rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-body mb-1">Description <span className="text-danger">*</span></label>
            <input value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="e.g. Hotel for 3 nights"
              className="w-full border border-border rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-body mb-1">Qty / Nights</label>
              <input type="number" min="1" value={form.qty} onChange={e => set('qty', e.target.value)}
                className="w-full border border-border rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">Unit Cost (₹) <span className="text-danger">*</span></label>
              <input type="number" min="0" value={form.unit_cost} onChange={e => set('unit_cost', e.target.value)}
                placeholder="0"
                className="w-full border border-border rounded-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          {form.unit_cost && form.qty && (
            <p className="text-sm text-primary font-semibold text-right">Total: {formatINR(Number(form.qty) * Number(form.unit_cost))}</p>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2.5 rounded-card font-semibold transition-colors disabled:opacity-60">
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BudgetBreakdownPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { data: tripRes, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => getTrip(id),
  });

  const { data: budgetRes, isLoading: budgetLoading, refetch } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => getBudget(id),
    retry: 1,
  });

  const trip = tripRes?.data;
  const rawBudget = budgetRes?.data;

  // Normalise: backend returns summary inside .summary or top-level
  const summary = rawBudget?.summary || rawBudget || {};
  const items = rawBudget?.items || [];

  const totalBudget = trip?.total_budget || summary.total_budget || 0;
  const totalSpent = summary.total_spent || 0;
  const remaining = summary.remaining ?? (totalBudget - totalSpent);
  const isOverBudget = totalSpent > totalBudget;

  const byCategory = summary.by_category || {};
  const byDay = summary.by_day || [];
  const duration = trip?.duration_days || 1;
  const avgDailyBudget = totalBudget / duration;

  // Charts data
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  const barData = byDay.length > 0
    ? byDay.map(d => ({ name: `Day ${d.day}`, amount: d.amount, over: d.amount > avgDailyBudget }))
    : [...Array(Math.min(duration, 7))].map((_, i) => ({ name: `Day ${i + 1}`, amount: 0, over: false }));

  const handleDelete = async (itemId) => {
    setDeletingId(itemId);
    try {
      await deleteBudgetItem(id, itemId);
      toast.success('Expense deleted');
      refetch();
    } catch { toast.error('Failed to delete'); }
    setDeletingId(null);
  };

  if (tripLoading || budgetLoading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading budget details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return <div className="min-h-screen bg-sand flex items-center justify-center"><p className="text-muted">Trip not found</p></div>;
  }

  return (
    <div className="min-h-screen bg-sand pb-16">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <button onClick={() => navigate(`/trips/${id}`)} className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors">
                <ArrowLeft size={16} /> Back to Trip
              </button>
              <h1 className="font-display text-3xl font-bold">{trip.name}</h1>
              <p className="text-white/70 mt-1 text-sm">
                {trip.destination} · {trip.duration_days} days ·
                {trip.start_date && ` ${new Date(trip.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Budget vs Spent</p>
              <p className="font-mono text-3xl font-bold">{formatINR(totalSpent)}</p>
              <p className="text-white/70 text-sm">of {formatINR(totalBudget)}</p>
              {/* Progress bar */}
              <div className="mt-2 w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-400' : 'bg-green-300'}`}
                  style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Over-budget alert */}
        {isOverBudget && !alertDismissed && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle size={18} />
              <span className="font-semibold text-sm">
                ⚠️ You've exceeded your budget by {formatINR(totalSpent - totalBudget)}
              </span>
            </div>
            <button onClick={() => setAlertDismissed(true)} className="text-red-400 hover:text-red-600"><X size={18} /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT — Expense Table (60%) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-card shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Expenses</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-input hover:bg-primary-dark transition-colors"
                >
                  <Plus size={14} /> Add Expense
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-sand text-muted text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Unit Cost</th>
                      <th className="px-4 py-3 text-right font-bold">Amount</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted">
                          <p className="text-3xl mb-2">🧾</p>
                          <p>No expenses yet. Click "+ Add Expense" to get started.</p>
                        </td>
                      </tr>
                    ) : (
                      items.map((item, i) => (
                        <tr key={item.id} className="hover:bg-sand/50 transition-colors">
                          <td className="px-4 py-3 text-muted">{i + 1}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1">
                              <span>{CATEGORY_ICONS[item.category] || '💼'}</span>
                              <span className="font-medium">{item.category}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-body">{item.description}</td>
                          <td className="px-4 py-3 text-right text-muted">{item.quantity ?? 1}</td>
                          <td className="px-4 py-3 text-right text-muted">{formatINR(item.unit_cost)}</td>
                          <td className="px-4 py-3 text-right font-semibold font-mono text-primary">{formatINR(item.amount)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="text-muted hover:text-danger transition-colors disabled:opacity-40"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  {items.length > 0 && (
                    <tfoot className="bg-primary/5 font-semibold text-sm">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right text-muted">Subtotal</td>
                        <td className="px-4 py-3 text-right font-mono text-body">{formatINR(totalSpent)}</td>
                        <td />
                      </tr>
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-right text-muted text-xs">Tax (5%)</td>
                        <td className="px-4 py-2 text-right font-mono text-muted text-xs">{formatINR(totalSpent * 0.05)}</td>
                        <td />
                      </tr>
                      <tr className="border-t-2 border-border">
                        <td colSpan={5} className="px-4 py-3 text-right font-bold text-body">Grand Total</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-primary text-base">{formatINR(totalSpent * 1.05)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT — Charts (40%) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total Budget" value={formatINR(totalBudget)} color="text-primary" />
              <StatCard label="Total Spent" value={formatINR(totalSpent)} color={isOverBudget ? 'text-danger' : 'text-body'} />
              <StatCard label="Remaining" value={formatINR(remaining)} color={remaining < 0 ? 'text-danger' : 'text-success'} />
              <StatCard label="Daily Average" value={formatINR(Math.round(totalSpent / duration))} sub={`of ${formatINR(Math.round(avgDailyBudget))} budget`} />
            </div>

            {/* Donut Chart */}
            {pieData.length > 0 && (
              <div className="bg-white rounded-card shadow-card p-5">
                <h3 className="font-display text-lg font-semibold mb-4">Budget Allocation</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatINR(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bar Chart */}
            <div className="bg-white rounded-card shadow-card p-5">
              <h3 className="font-display text-lg font-semibold mb-4">Daily Spending</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0D8CC" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B6B68' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6B68' }} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip formatter={v => formatINR(v)} />
                  <ReferenceLine y={avgDailyBudget} stroke="#D85A30" strokeDasharray="4 4" label={{ value: 'Daily avg', fill: '#D85A30', fontSize: 10, position: 'right' }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.over ? '#A32D2D' : '#0F6E56'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-card shadow-card p-4 flex flex-col gap-2">
              <button onClick={() => toast('Generating PDF...', { icon: '📄' })}
                className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-input text-sm font-semibold text-body hover:bg-sand transition-colors">
                <Download size={15} /> Export as PDF
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-input text-sm font-semibold text-body hover:bg-sand transition-colors">
                <Share2 size={15} /> Share Budget
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddExpenseModal tripId={id} onClose={() => setShowAddModal(false)} onAdded={refetch} />
      )}
    </div>
  );
}
