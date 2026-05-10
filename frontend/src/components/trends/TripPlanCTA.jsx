import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Plane } from 'lucide-react';

export default function TripPlanCTA({ destination }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);

  const handlePlanClick = () => {
    if (isAuthenticated) {
      const season = destination.seasons[0];
      navigate(`/dashboard?newTrip=1&destination=${encodeURIComponent(destination.name)}&season=${season}`);
    } else {
      setShowPrompt(true);
    }
  };

  return (
    <div className="mt-4">
      {!showPrompt ? (
        <button 
          onClick={handlePlanClick}
          className="w-full bg-[#0F6E56] hover:bg-[#0c5c48] text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plane size={16} />
          Plan This Trip &rarr;
        </button>
      ) : (
        <div className="animate-slide-up bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
          <p className="text-sm text-gray-700 mb-3 font-medium">
            Sign in to plan your trip to <span className="text-[#0F6E56] font-bold">{destination.name}</span> with AI ✨
          </p>
          <div className="flex gap-2">
            <Link to="/signup" className="flex-1 bg-[#0F6E56] text-white text-xs font-semibold py-2 rounded text-center hover:bg-[#0c5c48] transition-colors">
              Sign Up Free
            </Link>
            <Link to="/login" className="flex-1 bg-white text-gray-700 border border-gray-300 text-xs font-semibold py-2 rounded text-center hover:bg-gray-50 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
