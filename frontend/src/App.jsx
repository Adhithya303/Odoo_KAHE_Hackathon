import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './store/authStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatWindow from './components/chat/ChatWindow';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import DiscoverPage from './pages/DiscoverPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import MyTripsPage from './pages/MyTripsPage';
import TripDetailPage from './pages/TripDetailPage';
import TravelTipsPage from './pages/TravelTipsPage';
import ProfilePage from './pages/ProfilePage';
import ExperienceDetailPage from './pages/ExperienceDetailPage';
import ContinentPage from './pages/ContinentPage';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } } });

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]"><Outlet /></main>
      <Footer />
      <ChatWindow />
    </>
  );
}

function AuthLayout() {
  return <Outlet />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { background: '#FFFFFF', color: '#2C2C2A', border: '1px solid #E0D8CC', fontFamily: 'DM Sans' },
          success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
          error: { iconTheme: { primary: '#A32D2D', secondary: '#fff' } },
        }} />

        <Routes>
          {/* Auth pages (no navbar) */}
          <Route element={<AuthLayout />}>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Route>
          </Route>

          {/* Main layout pages */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/destinations/:id" element={<DestinationDetailPage />} />
            <Route path="/tips" element={<TravelTipsPage />} />
            <Route path="/experiences/:slug" element={<ExperienceDetailPage />} />
            <Route path="/continents/:slug" element={<ContinentPage />} />

            {/* Protected pages */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/trips" element={<MyTripsPage />} />
              <Route path="/trips/:id" element={<TripDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
