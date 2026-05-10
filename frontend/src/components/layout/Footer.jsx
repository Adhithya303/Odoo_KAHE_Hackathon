import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <span className="text-xl font-display font-bold">WanderIQ</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              AI-powered travel planning that helps you discover perfect destinations, build smart itineraries, and manage budgets effortlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[['Discover', '/discover'], ['My Trips', '/trips'], ['Travel Tips', '/tips'], ['About', '/about']].map(([label, to]) => (
                <Link key={to} to={to} className="block text-white/70 hover:text-white text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-display font-semibold mb-4">Features</h4>
            <div className="space-y-2 text-white/70 text-sm">
              <p>🤖 AI Itinerary Builder</p>
              <p>💰 Smart Budget Planner</p>
              <p>🗺️ Interactive Maps</p>
              <p>💬 Travel AI Assistant</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold mb-4">Newsletter</h4>
            <p className="text-white/70 text-sm mb-3">Get travel tips & exclusive deals</p>
            <div className="flex">
              <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 rounded-l-input bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-white/15" />
              <button className="px-4 py-2 bg-coral hover:bg-coral-hover rounded-r-input text-sm font-semibold transition-colors">→</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">© 2026 WanderIQ. All rights reserved.</p>
          <div className="flex gap-4 text-white/50 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
