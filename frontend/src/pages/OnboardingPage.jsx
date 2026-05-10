import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { savePreferences } from '../api/auth';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { VIBES, GROUP_TYPES } from '../utils/constants';

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({ group_types: [], trip_scope: 'Both', trip_types: [], min_budget: 5000, max_budget: 50000, budget_tier: 'Mid-range' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const groupIcons = { Solo: '🧑', Couple: '💑', Friends: '👫', Family: '👨‍👩‍👧‍👦' };
  const vibeIcons = { Adventure: '🏔️', Beach: '🏖️', Cultural: '🏛️', Luxury: '💎', Nature: '🌿', Pilgrimage: '🕌', Relaxation: '🧘', Wildlife: '🦁' };

  const toggleArray = (arr, val) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const finish = async () => {
    setLoading(true);
    try {
      await savePreferences(prefs);
      toast.success('Preferences saved! Let\'s find your perfect trip.');
      navigate('/dashboard');
    } catch { toast.error('Failed to save. You can update later in Profile.'); navigate('/dashboard'); }
    setLoading(false);
  };

  const steps = [
    /* Step 0: Travel Group */
    <div key={0} className="space-y-8 text-center">
      <div><p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Step 1 of 4</p>
        <h2 className="font-display text-3xl font-bold text-body">Who are you traveling with?</h2></div>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {GROUP_TYPES.map(g => (
          <button key={g} onClick={() => setPrefs({ ...prefs, group_types: toggleArray(prefs.group_types, g) })}
            className={`p-6 rounded-card border-2 transition-all duration-200 hover:shadow-card ${
              prefs.group_types.includes(g) ? 'border-primary bg-primary/5 shadow-glow' : 'border-border bg-white hover:border-primary/30'}`}>
            <div className="text-4xl mb-3">{groupIcons[g]}</div>
            <div className="font-semibold text-body">{g}</div>
          </button>
        ))}
      </div>
    </div>,

    /* Step 1: Scope */
    <div key={1} className="space-y-8 text-center">
      <div><p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Step 2 of 4</p>
        <h2 className="font-display text-3xl font-bold text-body">Where do you want to go?</h2></div>
      <div className="flex justify-center gap-4">
        {['Domestic', 'International', 'Both'].map(s => (
          <button key={s} onClick={() => setPrefs({ ...prefs, trip_scope: s })}
            className={`px-8 py-4 rounded-card border-2 transition-all duration-200 ${
              prefs.trip_scope === s ? 'border-primary bg-primary/5 shadow-glow' : 'border-border bg-white hover:border-primary/30'}`}>
            <div className="text-3xl mb-2">{s === 'Domestic' ? '🇮🇳' : s === 'International' ? '🌍' : '✈️'}</div>
            <div className="font-semibold text-body">{s}</div>
          </button>
        ))}
      </div>
    </div>,

    /* Step 2: Vibes */
    <div key={2} className="space-y-8 text-center">
      <div><p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Step 3 of 4</p>
        <h2 className="font-display text-3xl font-bold text-body">What's your travel vibe?</h2>
        <p className="text-muted mt-2">Select all that apply</p></div>
      <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
        {VIBES.map(v => (
          <button key={v} onClick={() => setPrefs({ ...prefs, trip_types: toggleArray(prefs.trip_types, v) })}
            className={`px-5 py-3 rounded-badge border-2 transition-all duration-200 flex items-center gap-2 ${
              prefs.trip_types.includes(v) ? 'border-primary bg-primary text-white shadow-glow' : 'border-border bg-white text-body hover:border-primary/30'}`}>
            <span>{vibeIcons[v]}</span> {v}
          </button>
        ))}
      </div>
    </div>,

    /* Step 3: Budget */
    <div key={3} className="space-y-8 text-center">
      <div><p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Step 4 of 4</p>
        <h2 className="font-display text-3xl font-bold text-body">What's your budget per person?</h2></div>
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center gap-3">
          {['Budget', 'Mid-range', 'Premium'].map(t => (
            <button key={t} onClick={() => setPrefs({ ...prefs, budget_tier: t })}
              className={`px-6 py-3 rounded-badge border-2 transition-all ${
                prefs.budget_tier === t ? 'border-primary bg-primary text-white' : 'border-border bg-white text-body hover:border-primary/30'}`}>
              {t === 'Budget' ? '💵' : t === 'Mid-range' ? '💰' : '💎'} {t}
            </button>
          ))}
        </div>
        <div className="bg-white p-6 rounded-card border border-border">
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>₹{prefs.min_budget.toLocaleString()}</span><span>₹{prefs.max_budget.toLocaleString()}</span>
          </div>
          <input type="range" min="1000" max="500000" step="1000" value={prefs.max_budget}
            onChange={e => setPrefs({ ...prefs, max_budget: parseInt(e.target.value) })}
            className="w-full accent-primary" />
          <p className="text-center mt-3 font-mono text-lg font-semibold text-primary">
            Up to ₹{prefs.max_budget.toLocaleString()}
          </p>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      {/* Progress */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary w-10' : 'bg-border w-6'}`} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl animate-fade-in">{steps[step]}</div>
      </div>

      {/* Navigation */}
      <div className="pb-8 px-4 flex justify-center gap-4">
        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>← Back</Button>}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)}>Next →</Button>
        ) : (
          <Button onClick={finish} loading={loading}>Complete Setup →</Button>
        )}
        <button onClick={() => navigate('/dashboard')} className="text-sm text-muted hover:text-body transition-colors self-center ml-4">Skip for now</button>
      </div>
    </div>
  );
}
