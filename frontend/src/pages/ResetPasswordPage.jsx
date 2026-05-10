import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, otp, new_password: newPassword });
      toast.success('Password reset successfully! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed');
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
          <h2 className="font-bold text-4xl mb-3">Reset Your Password</h2>
          <p className="text-white/80">Enter the OTP sent to your email and your new password.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Resetting password for {email || 'your email'}.</p>
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

            <Input 
              label="New Password" 
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
            />

            <Button type="submit" loading={loading} className="w-full text-base py-3.5">Reset Password</Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Remembered your password? <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
