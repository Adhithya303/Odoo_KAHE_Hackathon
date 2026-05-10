import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import useAuthStore from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
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
  const strengthColors = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success', 'bg-success'];

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      toast.success('Account created! Let\'s set up your preferences.');
      navigate('/onboarding');
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
        <div className="absolute inset-0 bg-primary/30" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="font-display text-4xl font-bold mb-3">Start Your Journey</h2>
          <p className="text-white/80">Join thousands of smart travelers using AI to plan better trips.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-sand">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">✈️</span>
              <span className="text-2xl font-display font-bold text-primary">WanderIQ</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-body mb-2">Create Account</h1>
            <p className="text-muted">Start planning your dream trips today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : 'bg-border'}`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${strength >= 3 ? 'text-success' : strength >= 2 ? 'text-warning' : 'text-danger'}`}>
                    {strengthLabels[strength - 1] || 'Too short'}
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full text-base py-3.5">Create Account →</Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-primary-light">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
