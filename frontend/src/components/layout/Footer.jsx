import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Column 1: Brand & Socials */}
        <div className="flex flex-col space-y-4">
          <Link to="/" className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>🌍 TravelBrand</span>
          </Link>
          <p className="text-white font-medium">Smart journeys powered by AI.</p>
          <p className="text-sm text-gray-400">
            Our platform helps you plan personalized trips effortlessly, turning your travel dreams into reality with cutting-edge AI recommendations.
          </p>
          
          <div className="flex space-x-4 mt-4 pt-2">
            <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-pink-500 hover:scale-110 transform transition-all duration-300">
              <FaInstagram size={20} />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-blue-600 hover:scale-110 transform transition-all duration-300">
              <FaLinkedin size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-400 hover:scale-110 transform transition-all duration-300">
              <FaTwitter size={20} />
            </a>
            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-500 hover:scale-110 transform transition-all duration-300">
              <FaFacebook size={20} />
            </a>
            <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-red-500 hover:scale-110 transform transition-all duration-300">
              <FaYoutube size={20} />
            </a>
            <a href="#" aria-label="GitHub" className="text-gray-400 hover:text-white hover:scale-110 transform transition-all duration-300">
              <FaGithub size={20} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-white tracking-wide">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="hover:text-blue-400 transition-colors duration-300 inline-block hover:translate-x-1 transform">Home</Link></li>
            <li><Link to="/about" className="hover:text-blue-400 transition-colors duration-300 inline-block hover:translate-x-1 transform">About</Link></li>
            <li><Link to="/faq" className="hover:text-blue-400 transition-colors duration-300 inline-block hover:translate-x-1 transform">FAQ</Link></li>
            <li><Link to="/trends" className="hover:text-blue-400 transition-colors duration-300 inline-block hover:translate-x-1 transform">Trends</Link></li>
            <li><Link to="/destinations" className="hover:text-blue-400 transition-colors duration-300 inline-block hover:translate-x-1 transform">Popular Destinations</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors duration-300 inline-block hover:translate-x-1 transform">Contact</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-blue-400 transition-colors duration-300 inline-block hover:translate-x-1 transform">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-blue-400 transition-colors duration-300 inline-block hover:translate-x-1 transform">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Column 3: Travel Trends */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-white tracking-wide">Travel Trends</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Link to="/trends/domestic" className="font-medium text-gray-400 hover:text-white mb-3 text-sm uppercase tracking-wider block transition-colors duration-300">
                Domestic Trends
              </Link>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/trends/domestic" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Goa</Link></li>
                <li><Link to="/trends/domestic" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Manali</Link></li>
                <li><Link to="/trends/domestic" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Kerala</Link></li>
                <li><Link to="/trends/domestic" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Ooty</Link></li>
                <li><Link to="/trends/domestic" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Kashmir</Link></li>
                <li><Link to="/trends/domestic" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Andaman</Link></li>
              </ul>
            </div>
            <div>
              <Link to="/trends/international" className="font-medium text-gray-400 hover:text-white mb-3 text-sm uppercase tracking-wider block transition-colors duration-300">
                International Trends
              </Link>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/trends/international" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Bali</Link></li>
                <li><Link to="/trends/international" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Dubai</Link></li>
                <li><Link to="/trends/international" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Switzerland</Link></li>
                <li><Link to="/trends/international" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Paris</Link></li>
                <li><Link to="/trends/international" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Maldives</Link></li>
                <li><Link to="/trends/international" className="hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300">Thailand</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-white tracking-wide">Stay Updated</h3>
          <p className="text-sm text-gray-400">Get latest travel trends and destination updates.</p>
          <div className="mt-2">
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-3 py-2 bg-slate-800 text-sm text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 border border-slate-700"
                required
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-r-md text-sm transition-colors duration-300 font-medium shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-sm text-gray-500">
        <p>© 2026 TravelBrand. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
