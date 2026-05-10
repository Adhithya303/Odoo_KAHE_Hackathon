import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-hot-toast';
import { FaCopy, FaShareAlt, FaTwitter, FaWhatsapp, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

export default function SharedItineraryPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/public/trips/${tripId}`);
      setTrip(data);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to copy this trip");
      navigate(`/login?redirect=/share/${tripId}`);
      return;
    }

    try {
      const { data } = await api.post(`/api/trips/${tripId}/copy`);
      toast.success("Trip copied to your dashboard!");
      navigate(`/trips/${data.id}`);
    } catch (err) {
      toast.error("Failed to copy trip");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const shareOnTwitter = () => {
    const text = `Check out this amazing trip: ${trip.name} on Traveloop!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnWhatsapp = () => {
    const text = `Check out this amazing trip: ${trip.name} on Traveloop! ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save trips");
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await api.delete(`/api/profile/saved-trips/${tripId}`);
        setIsSaved(false);
        toast.success("Removed from saved trips");
      } else {
        await api.post(`/api/profile/saved-trips/${tripId}`);
        setIsSaved(true);
        toast.success("Trip saved!");
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Itinerary Not Available</h2>
        <p className="text-gray-600 mb-8 max-w-md">This itinerary is private, not found, or has been removed by the owner.</p>
        <button onClick={() => navigate('/discover')} className="bg-[#1D9E75] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#167e5d] transition-all">
          Plan Your Own Trip
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F0E8] min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[300px] bg-gradient-to-r from-[#1D9E75] to-[#2C2C2A] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* Subtle pattern or image placeholder */}
        </div>
        <div className="max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{trip.name}</h1>
              <p className="text-teal-100 text-lg opacity-90 max-w-2xl">{trip.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm">
                  {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                </span>
                <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-sm">
                  Budget: ₹{trip.total_budget?.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveTrip} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all">
                {isSaved ? <FaBookmark /> : <FaRegBookmark />}
              </button>
              <button onClick={handleCopyLink} className="flex items-center gap-2 bg-white text-[#2C2C2A] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg">
                <FaCopy /> Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {trip.stops.map((stop, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-[#E0D8CC]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[#1D9E75] font-bold text-sm tracking-widest uppercase mb-1 block">Stop {idx + 1}</span>
                    <h2 className="text-2xl font-bold text-[#2C2C2A]">{stop.destination_name}</h2>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {stop.arrival_date ? `${new Date(stop.arrival_date).toLocaleDateString()} - ${new Date(stop.departure_date).toLocaleDateString()}` : 'Date pending'}
                  </div>
                </div>

                <div className="space-y-4">
                  {stop.activities.length > 0 ? stop.activities.map((act, actIdx) => (
                    <div key={actIdx} className="flex items-start gap-4 p-4 rounded-2xl bg-[#F5F0E8]/50 hover:bg-[#F5F0E8] transition-all border border-transparent hover:border-[#E0D8CC]">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                        📍
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-800">{act.name}</h4>
                          <span className="text-xs font-bold text-[#1D9E75] bg-teal-50 px-2 py-1 rounded">₹{act.cost}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{act.description}</p>
                        <div className="text-xs text-gray-400 mt-2">Duration: {act.duration} hrs</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-400 italic">No activities planned for this stop.</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <div className="bg-[#2C2C2A] text-white rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-4">Love this plan?</h3>
              <p className="text-gray-400 text-sm mb-6">Copy this itinerary to your own dashboard and customize it for your next adventure.</p>
              <button onClick={handleCopyTrip} className="w-full bg-[#1D9E75] hover:bg-[#167e5d] text-white py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                📋 Copy This Trip
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E0D8CC]">
              <h3 className="text-xl font-bold mb-4 text-[#2C2C2A]">Share with friends</h3>
              <div className="flex gap-4">
                <button onClick={shareOnTwitter} className="flex-1 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] p-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold">
                  <FaTwitter /> X
                </button>
                <button onClick={shareOnWhatsapp} className="flex-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] p-4 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold">
                  <FaWhatsapp /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
