import React from 'react';

const ContactPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Contact Us</h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          Have questions or need assistance? We're here to help you plan your perfect trip.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                id="name" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea 
                id="message" 
                rows={4} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Submit Message
            </button>
          </form>
        </div>

        {/* Contact Information & Map */}
        <div className="flex flex-col space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
            <div className="space-y-4 text-gray-600">
              <p className="flex items-center">
                <span className="text-xl mr-4">✉️</span> 
                <span>support@travelbrand.com</span>
              </p>
              <p className="flex items-center">
                <span className="text-xl mr-4">📞</span> 
                <span>+1 (800) 123-4567</span>
              </p>
              <p className="flex items-start">
                <span className="text-xl mr-4 mt-1">📍</span> 
                <span>123 Explorer's Way,<br/>Wanderlust City, NY 10001,<br/>United States</span>
              </p>
              <p className="flex items-center pt-4 border-t border-gray-100">
                <span className="text-xl mr-4">🕒</span> 
                <span><strong>Business Hours:</strong> Mon-Fri, 9am - 6pm EST</span>
              </p>
            </div>
          </div>

          {/* Embedded Map Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 overflow-hidden h-64 relative">
            {/* Placeholder for an actual iframe map */}
            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl">🗺️</span>
                <p className="text-gray-500 font-medium mt-2">Interactive Map Embedded Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
