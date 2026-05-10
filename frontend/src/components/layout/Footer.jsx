import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaGithub } from 'react-icons/fa';
import { Globe, MapPin, Compass, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0f1d] text-gray-400 py-20 px-6 relative overflow-hidden border-t border-white/5">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        
        {/* Column 1: Brand & Socials */}
        <div className="flex flex-col space-y-6">
          <Link to="/" className="group flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Globe className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic">WanderIQ</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            Smart journeys powered by AI. We redefine travel by matching your unique personality with the world's most breathtaking destinations.
          </p>
          
          <div className="flex space-x-3 mt-4">
            {[
              { icon: <FaInstagram />, label: 'Instagram', color: 'hover:text-pink-500' },
              { icon: <FaLinkedin />, label: 'LinkedIn', color: 'hover:text-blue-600' },
              { icon: <FaTwitter />, label: 'Twitter', color: 'hover:text-sky-400' },
              { icon: <FaGithub />, label: 'GitHub', color: 'hover:text-white' }
            ].map((social, i) => (
              <a 
                key={i}
                href="#" 
                aria-label={social.label} 
                className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 ${social.color} hover:bg-white/10 transform transition-all duration-300 hover:-translate-y-1 border border-white/5`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Explore */}
        <div className="flex flex-col space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Explore</h3>
          <ul className="space-y-3">
            {[
              { name: 'AI Trip Planner', path: '/discover' },
              { name: 'Travel Blogs', path: '/blogs' },
              { name: 'Destination Trends', path: '/trends' },
              { name: 'Popular Spots', path: '/destinations' },
              { name: 'About WanderIQ', path: '/about' }
            ].map((link, i) => (
              <li key={i}>
                <Link to={link.path} className="text-sm hover:text-blue-400 transition-all duration-300 flex items-center group">
                  <span className="w-0 group-hover:w-4 h-[1px] bg-blue-400 transition-all duration-300"></span>
                  <span className="group-hover:ml-2">{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Travel Trends */}
        <div className="flex flex-col space-y-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Live Trends</h3>
          <div className="space-y-6">
            <div>
              <Link to="/trends/domestic" className="text-xs font-black text-blue-400/80 uppercase tracking-widest flex items-center gap-2 mb-3 hover:text-blue-400 transition-colors">
                <MapPin className="w-3 h-3" />
                Domestic
              </Link>
              <div className="flex flex-wrap gap-2">
                {['Goa', 'Manali', 'Kerala', 'Ooty', 'Kashmir', 'Andaman'].map((item, i) => (
                  <Link key={i} to="/trends/domestic" className="text-[11px] px-3 py-1 bg-white/5 rounded-lg hover:bg-blue-500/20 hover:text-white transition-all border border-white/5">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <Link to="/trends/international" className="text-xs font-black text-purple-400/80 uppercase tracking-widest flex items-center gap-2 mb-3 hover:text-purple-400 transition-colors">
                <Compass className="w-3 h-3" />
                International
              </Link>
              <div className="flex flex-wrap gap-2">
                {['Bali', 'Dubai', 'Swiss', 'Paris', 'Maldives', 'Thai'].map((item, i) => (
                  <Link key={i} to="/trends/international" className="text-[11px] px-3 py-1 bg-white/5 rounded-lg hover:bg-purple-500/20 hover:text-white transition-all border border-white/5">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div className="flex flex-col space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Newsletter</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Get AI-curated travel deals and trend reports delivered weekly.
          </p>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              required
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1.5 bottom-1.5 w-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-[#0a0f1d] bg-slate-700`}></div>
              ))}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Join 20k+ travelers</span>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <p className="text-[11px] text-gray-500">© 2026 WanderIQ. AI-Powered Excellence.</p>
        <div className="flex space-x-6">
          <Link to="/privacy-policy" className="text-[11px] text-gray-500 hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="text-[11px] text-gray-500 hover:text-white transition-colors">Terms</Link>
          <Link to="/contact" className="text-[11px] text-gray-500 hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

