import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { googleLogin, register as registerApi } from '../api/auth';
import useAuthStore from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { setupGoogleButton } from '../utils/googleAuth';

const TRIP_TYPES = ['Adventure', 'Beach', 'Cultural', 'Nature', 'Relaxation', 'Luxury', 'Pilgrimage', 'Wildlife', 'Romantic', 'Family'];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    phone: '', city: '', country: '', profile_photo_url: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    trip_scope: 'Both', trip_types: [], budget_tier: 'Mid-range',
    min_budget: null, max_budget: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { setUser, setTokens } = useAuthStore();
  const navigate = useNavigate();



  const getPasswordStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++; if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'];

  const validateStep = (stepNum) => {
    const e = {};
    if (stepNum === 1) {
      if (!form.first_name.trim()) e.first_name = 'First name is required';
      if (!form.last_name.trim()) e.last_name = 'Last name is required';
      if (!form.email) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    } else if (stepNum === 2) {
      if (!form.phone.trim()) e.phone = 'Phone is required';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.country.trim()) e.country = 'Country is required';
    } else if (stepNum === 3) {
      if (!form.emergency_contact_name.trim()) e.emergency_contact_name = 'Emergency contact name is required';
      if (!form.emergency_contact_phone.trim()) e.emergency_contact_phone = 'Emergency contact phone is required';
      if (!form.emergency_contact_relation.trim()) e.emergency_contact_relation = 'Relation is required';
    } else if (stepNum === 4) {
      if (form.trip_types.length === 0) e.trip_types = 'Select at least one trip type';
      if (!form.min_budget || form.min_budget < 0) e.min_budget = 'Valid minimum budget is required';
      if (!form.max_budget || form.max_budget < form.min_budget) e.max_budget = 'Max budget must be greater than min budget';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setErrors({});
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    
    setLoading(true);
    try {
      await registerApi(form);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      toast.error(typeof msg === 'string' ? msg : 'Please check your inputs');
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200" alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-teal-600/30" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="font-bold text-4xl mb-3">Start Your Journey</h2>
          <p className="text-white/80">Join thousands of smart travelers using AI to plan better trips.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-amber-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">✈️</span>
              <span className="text-2xl font-bold text-teal-600">WanderIQ</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Step {step} of 4 • {['Identity', 'Profile', 'Emergency Contact', 'Travel Preferences'][step - 1]}</p>
            <div className="flex gap-1 mt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-teal-600' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>

          <form onSubmit={step === 4 ? handleSubmit : e => { e.preventDefault(); handleNext(); }} className="space-y-4">
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First Name" placeholder="John" value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })} error={errors.first_name} />
                  <Input label="Last Name" placeholder="Doe" value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })} error={errors.last_name} />
                </div>
                <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} error={errors.email} />
                <div>
                  <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} error={errors.password} />
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : 'bg-gray-300'}`} />
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${strength >= 3 ? 'text-green-600' : strength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {strengthLabels[strength - 1] || 'Too short'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* STEP 2: PROFILE */}
            {step === 2 && (
              <>
                <Input label="Phone" type="tel" placeholder="+1234567890" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
                <Input label="City" placeholder="New York" value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })} error={errors.city} />
                <Input label="Country" placeholder="United States" value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })} error={errors.country} />
                <Input label="Profile Photo URL (Optional)" type="url" placeholder="https://..." value={form.profile_photo_url}
                  onChange={e => setForm({ ...form, profile_photo_url: e.target.value })} />
              </>
            )}

            {/* STEP 3: EMERGENCY CONTACT */}
            {step === 3 && (
              <>
                <Input label="Emergency Contact Name" placeholder="Jane Doe" value={form.emergency_contact_name}
                  onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} error={errors.emergency_contact_name} />
                <Input label="Emergency Contact Phone" type="tel" placeholder="+1234567890" value={form.emergency_contact_phone}
                  onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} error={errors.emergency_contact_phone} />
                <Input label="Relation" placeholder="Sister, Mother, Friend, etc." value={form.emergency_contact_relation}
                  onChange={e => setForm({ ...form, emergency_contact_relation: e.target.value })} error={errors.emergency_contact_relation} />
              </>
            )}

            {/* STEP 4: TRAVEL PREFERENCES */}
            {step === 4 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Trip Scope</label>
                  <select value={form.trip_scope} onChange={e => setForm({ ...form, trip_scope: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option>Domestic</option>
                    <option>International</option>
                    <option>Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Trip Types (Select at least one)</label>
                  {errors.trip_types && <p className="text-red-600 text-xs mb-2">{errors.trip_types}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    {TRIP_TYPES.map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.trip_types.includes(type)}
                          onChange={e => setForm({
                            ...form,
                            trip_types: e.target.checked ? [...form.trip_types, type] : form.trip_types.filter(t => t !== type)
                          })} className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Budget Tier</label>
                  <select value={form.budget_tier} onChange={e => setForm({ ...form, budget_tier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                    <option>Budget</option>
                    <option>Mid-range</option>
                    <option>Premium</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Min Budget (₹)" type="number" placeholder="5000" value={form.min_budget}
                    onChange={e => setForm({ ...form, min_budget: parseInt(e.target.value) || null })} error={errors.min_budget} />
                  <Input label="Max Budget (₹)" type="number" placeholder="100000" value={form.max_budget}
                    onChange={e => setForm({ ...form, max_budget: parseInt(e.target.value) || null })} error={errors.max_budget} />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev} className="flex-1">← Back</Button>
              )}
              <Button type="submit" loading={loading} className={`flex-1 text-base py-3 ${step === 4 ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                {step === 4 ? 'Create Account →' : 'Next →'}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account? <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">Sign In</Link>
          </p>


        </div>
      </div>
    </div>
  );
}
