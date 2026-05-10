import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp } from '../api/auth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function VerifyOtpPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      toast.success('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200" alt="Travel" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-teal-600/30" />
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="font-bold text-4xl mb-3">Verify Your Account</h2>
          <p className="text-white/80">We've sent a code to your email. Enter it here to continue.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
            <p className="text-gray-600">Enter the 6-digit code sent to {email || 'your email'}.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              label="OTP Code" 
              type="text" 
              placeholder="123456" 
              value={otp}
              onChange={e => setOtp(e.target.value)} 
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />

            <Button type="submit" loading={loading} className="w-full text-base py-3.5">Verify</Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Didn't receive code? <button className="text-teal-600 font-semibold hover:text-teal-700">Resend</button>
          </p>
        </div>
      </div>
    </div>
  );
}
