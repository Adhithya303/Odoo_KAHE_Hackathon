import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, ArrowRight, TrendingUp, Compass, Map } from 'lucide-react';

const TrendsPage = () => {
  const trends = [
    {
      id: 'domestic',
      title: 'Domestic Trends',
      description: 'Discover the hidden gems and popular hotspots within the country. From sun-soaked beaches to snowy peaks.',
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      link: '/trends/domestic',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1000',
      count: '6 Destinations'
    },
    {
      id: 'international',
      title: 'International Trends',
      description: 'Explore the world\'s most coveted destinations. Experience diverse cultures, iconic landmarks, and global adventures.',
      icon: <Globe className="w-8 h-8 text-purple-500" />,
      link: '/trends/international',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=1000',
      count: '6 Destinations'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-2 mb-4 bg-blue-500/20 px-4 py-1.5 rounded-full border border-blue-400/30 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Live Market Data</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Trends</span> 2026
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Stay ahead of the curve with our AI-curated insights into the most popular destinations trending right now.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trends.map((category) => (
            <Link 
              key={category.id} 
              to={category.link}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100"
            >
              <div className="h-64 relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Compass className="w-4 h-4" />
                    {category.count}
                  </div>
                  <h2 className="text-3xl font-bold">{category.title}</h2>
                </div>
              </div>
              <div className="p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors duration-300">
                    {category.icon}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors duration-300">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {category.description}
                </p>
                <div className="flex items-center gap-4 text-sm font-semibold text-blue-600">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Trending Now
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500">Updated today</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Feature Section */}
        <div className="mt-20 bg-white rounded-3xl p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">How we track trends?</h2>
            <div className="space-y-6">
              {[
                { title: 'AI Sentiment Analysis', desc: 'We analyze millions of social media posts and travel forums to gauge traveler excitement.', icon: <Map className="w-6 h-6 text-blue-500" /> },
                { title: 'Booking Demand', desc: 'Real-time monitoring of flight and hotel booking volumes across global platforms.', icon: <TrendingUp className="w-6 h-6 text-green-500" /> },
                { title: 'Personalized Matching', desc: 'Our AI matches these trends with your unique travel profile for better recommendations.', icon: <Compass className="w-6 h-6 text-purple-500" /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full h-80 rounded-2xl bg-slate-900 overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover opacity-60" 
              alt="Analytics"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
                <div className="text-4xl font-bold text-white mb-1">98.4%</div>
                <div className="text-white/80 text-sm">Trend Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsPage;

