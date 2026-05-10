import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success('OTP sent to your email.');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1555392816-e24395e4efcd?w=1200" alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-teal-600/30" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="font-bold text-4xl mb-3">Recover Your Account</h2>
          <p className="text-white/80">Don't worry, it happens. Enter your email to receive a password reset code.</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-amber-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">✈️</span>
              <span className="text-2xl font-bold text-teal-600">WanderIQ</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
            <p className="text-gray-600">Enter your email to receive an OTP.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="Email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            />

            <Button type="submit" loading={loading} className="w-full text-base py-3.5">Send OTP</Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password? <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
