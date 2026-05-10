import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard' }, 
        { to: '/discover', label: 'Discover' }, 
        { to: '/trends', label: 'Trends' },
        { to: '/trips', label: 'My Trips' }, 
        { to: '/tips', label: 'Tips' }, 
        { to: '/blogs', label: '📝 Blogs' }
      ]
    : [
        { to: '/', label: 'Home' }, 
        { to: '/discover', label: 'Discover' }, 
        { to: '/trends', label: 'Trends' },
        { to: '/tips', label: 'Tips' }, 
        { to: '/blogs', label: '📝 Blogs' }
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-display font-bold text-white tracking-wide">WanderIQ</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-input text-sm font-medium transition-all duration-200 ${
                  isActive(link.to) ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-badge text-white transition-all">
                  <div className="w-7 h-7 rounded-full bg-coral flex items-center justify-center text-xs font-bold">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.first_name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-card shadow-elevated border border-border py-1 animate-fade-in">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-body hover:bg-sand transition-colors" onClick={() => setProfileOpen(false)}>Profile</Link>
                    <Link to="/trips" className="block px-4 py-2 text-sm text-body hover:bg-sand transition-colors" onClick={() => setProfileOpen(false)}>My Trips</Link>
                    <hr className="my-1 border-border" />
                    <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }}
                      className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition-colors">
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-white/90 hover:text-white text-sm font-medium px-4 py-2 transition-colors">Login</Link>
                <Link to="/signup" className="bg-coral hover:bg-coral-hover text-white text-sm font-semibold px-5 py-2 rounded-input transition-all">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button className="md:hidden text-white p-2" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-white/10 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-input text-sm font-medium ${
                  isActive(link.to) ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
