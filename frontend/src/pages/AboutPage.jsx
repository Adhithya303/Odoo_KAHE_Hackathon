import React from 'react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">About Us</h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          Discover why we exist and the vision that drives us.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="text-blue-500 mr-3 text-3xl">🎯</span> Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Our mission is to simplify travel planning by leveraging cutting-edge Artificial Intelligence. We curate personalized, end-to-end journeys with expert guidance so you can focus on making memories instead of managing itineraries.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="text-blue-500 mr-3 text-3xl">🔭</span> Our Vision
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            To make global travel seamlessly accessible and unforgettable for everyone. We envision a world where anyone can explore new horizons confidently, powered by smart, intuitive technology.
          </p>
        </div>
      </div>

      <div className="mb-20 bg-slate-50 rounded-3xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Why This Platform Exists</h2>
        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
          Planning a trip is often overwhelming—from researching destinations to booking flights and hotels. We realized there was a gap between the desire to travel and the execution of the trip. This platform was born out of a passion to bridge that gap using AI, providing a one-stop solution that understands your unique preferences and builds a complete, customized travel plan in seconds.
        </p>
        <h3 className="text-2xl font-semibold text-slate-800 mb-4">Future Goals</h3>
        <ul className="list-disc list-inside text-gray-600 text-lg space-y-2">
          <li>Integration with real-time flight and hotel booking engines.</li>
          <li>Collaborative trip planning features for families and groups.</li>
          <li>AR-based virtual tours before you travel.</li>
          <li>Eco-friendly travel tracking and carbon offset options.</li>
        </ul>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-500 text-3xl font-bold">
              JD
            </div>
            <h3 className="text-xl font-bold text-slate-900">John Doe</h3>
            <p className="text-sm text-blue-600 font-medium mb-3">CEO & Founder</p>
            <p className="text-gray-500 text-sm mb-4">
              Passionate traveler and tech enthusiast aiming to revolutionize how we explore the world.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Twitter</a>
            </div>
          </div>
          
          {/* Team Member 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center text-pink-500 text-3xl font-bold">
              JS
            </div>
            <h3 className="text-xl font-bold text-slate-900">Jane Smith</h3>
            <p className="text-sm text-blue-600 font-medium mb-3">Lead AI Engineer</p>
            <p className="text-gray-500 text-sm mb-4">
              Expert in machine learning, ensuring your travel recommendations are perfectly tailored.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Twitter</a>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center text-green-500 text-3xl font-bold">
              MJ
            </div>
            <h3 className="text-xl font-bold text-slate-900">Mike Johnson</h3>
            <p className="text-sm text-blue-600 font-medium mb-3">Head of Design</p>
            <p className="text-gray-500 text-sm mb-4">
              Creates the beautiful, intuitive interfaces that make planning your trip a joy.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">Dribbble</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
