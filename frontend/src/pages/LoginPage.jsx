import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/auth';
import useAuthStore from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { setUser, setTokens } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.first_name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200" alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/30" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="font-display text-4xl font-bold mb-3">Welcome Back Explorer</h2>
          <p className="text-white/80">Your next adventure is waiting. Sign in to continue planning.</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-sand">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">✈️</span>
              <span className="text-2xl font-display font-bold text-primary">WanderIQ</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-body mb-2">Sign In</h1>
            <p className="text-muted">Welcome back! Enter your credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} error={errors.email}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />

            <Input label="Password" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} error={errors.password}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" /> Remember me
              </label>
              <a href="#" className="text-primary hover:text-primary-light font-medium">Forgot password?</a>
            </div>

            <Button type="submit" loading={loading} className="w-full text-base py-3.5">Sign In</Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:text-primary-light">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
