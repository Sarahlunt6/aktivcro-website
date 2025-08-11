import React, { useState, useEffect } from 'react';

interface Hotspot {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  color: string;
}

const hotspots: Hotspot[] = [
  {
    id: 'instant-quote',
    title: 'Instant Quote Calculator',
    description: 'Smart calculator that provides instant pricing based on location, service type, and property details.',
    x: 25,
    y: 45,
    color: 'bg-accent-600'
  },
  {
    id: 'gps-booking',
    title: 'GPS-Based Scheduling',
    description: 'Location-aware booking system that shows available time slots based on technician proximity.',
    x: 75,
    y: 30,
    color: 'bg-success'
  },
  {
    id: 'push-notifications',
    title: 'Push Notifications',
    description: 'Real-time notifications for appointment confirmations, technician arrival, and service updates.',
    x: 50,
    y: 85,
    color: 'bg-primary'
  },
  {
    id: 'offline-mode',
    title: 'Offline Capability',
    description: 'Works without internet connection - customers can still browse services and submit requests.',
    x: 85,
    y: 60,
    color: 'bg-purple-600'
  }
];

const MobilePWADemoInteractive: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    service: '',
    propertySize: '',
    frequency: ''
  });
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quotePrice, setQuotePrice] = useState<number | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Detecting location...');

  useEffect(() => {
    // Simulate location detection
    setTimeout(() => {
      setCurrentLocation('Austin, TX');
    }, 2000);
  }, []);

  const handleHotspotClick = (hotspotId: string) => {
    setActiveHotspot(activeHotspot === hotspotId ? null : hotspotId);
    
    if (hotspotId === 'instant-quote') {
      setShowQuoteModal(true);
    } else if (hotspotId === 'push-notifications') {
      enableNotifications();
    } else if (hotspotId === 'offline-mode') {
      toggleOfflineMode();
    }
  };

  const calculateQuote = () => {
    const basePrice = 80;
    const sizeMultiplier = quoteForm.propertySize === 'small' ? 1 : quoteForm.propertySize === 'medium' ? 1.5 : 2;
    const frequencyDiscount = quoteForm.frequency === 'weekly' ? 0.9 : quoteForm.frequency === 'monthly' ? 0.95 : 1;
    
    const price = Math.round(basePrice * sizeMultiplier * frequencyDiscount);
    setQuotePrice(price);
  };

  const enableNotifications = () => {
    setNotificationEnabled(true);
    setTimeout(() => {
      alert('🔔 Push notification: "Your lawn care appointment is confirmed for tomorrow at 2:00 PM!"');
    }, 1000);
  };

  const toggleOfflineMode = () => {
    setIsOffline(!isOffline);
    if (!isOffline) {
      alert('📱 Now in offline mode - you can still browse services and the app will sync when reconnected!');
    }
  };

  const bookService = () => {
    alert('📅 Service booked! You\'ll receive a confirmation notification and calendar invite.');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Demo Navigation */}
        <div className="bg-gray-100 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg text-sm text-gray-600 flex-1">
              https://quicklawnpro.com (PWA)
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-accent-100 text-accent-800 px-3 py-1 rounded-full text-sm font-medium">
              PWA Demo
            </span>
            {isOffline && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Demo Content - Mobile First Design */}
        <div className="aspect-video bg-gradient-to-br from-accent-50 to-success-50 relative overflow-hidden">
          {/* Simulated Mobile PWA */}
          <div className="absolute inset-4 bg-white rounded-2xl shadow-lg overflow-hidden" style={{ maxWidth: '380px', margin: '0 auto', left: '50%', transform: 'translateX(-50%)' }}>
            {/* Mobile Header */}
            <div className="bg-success text-white p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-lg">QuickLawn Pro</div>
                <div className="text-xs opacity-90">{currentLocation}</div>
              </div>
              <div className="flex items-center space-x-2">
                {notificationEnabled && (
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                )}
                <button className="p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Hero Section */}
            <div className="p-4">
              <h1 className="text-lg font-bold text-gray-900 mb-2">Professional Lawn Care</h1>
              <p className="text-sm text-gray-600 mb-4">Fast, reliable, and affordable lawn maintenance in your area</p>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => handleHotspotClick('instant-quote')}
                  className="bg-accent text-white p-3 rounded-lg text-center hover:bg-accent-600 transition-colors"
                >
                  <div className="text-sm font-semibold">Get Instant Quote</div>
                  <div className="text-xs opacity-90">30-second estimate</div>
                </button>
                <button 
                  onClick={bookService}
                  className="bg-success text-white p-3 rounded-lg text-center hover:bg-success-600 transition-colors"
                >
                  <div className="text-sm font-semibold">Book Service</div>
                  <div className="text-xs opacity-90">Same-day available</div>
                </button>
              </div>

              {/* Service Cards */}
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Lawn Mowing</div>
                    <div className="text-xs text-gray-600">Weekly/Monthly service</div>
                    <div className="text-sm font-bold text-success">From $80</div>
                  </div>
                  <button 
                    onClick={() => handleHotspotClick('instant-quote')}
                    className="bg-accent text-white px-3 py-1 rounded text-xs hover:bg-accent-600"
                  >
                    Quote
                  </button>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Landscaping</div>
                    <div className="text-xs text-gray-600">Design & maintenance</div>
                    <div className="text-sm font-bold text-success">From $150</div>
                  </div>
                  <button 
                    onClick={() => handleHotspotClick('gps-booking')}
                    className="bg-success text-white px-3 py-1 rounded text-xs hover:bg-success-600"
                  >
                    Book
                  </button>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Cleanup Services</div>
                    <div className="text-xs text-gray-600">Seasonal cleanup</div>
                    <div className="text-sm font-bold text-success">From $120</div>
                  </div>
                  <button className="bg-primary text-white px-3 py-1 rounded text-xs hover:bg-primary-600">
                    Schedule
                  </button>
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3" style={{ position: 'absolute', bottom: '0' }}>
                <div className="flex justify-around">
                  <button className="text-center">
                    <div className="w-6 h-6 mx-auto mb-1 bg-success rounded"></div>
                    <div className="text-xs">Services</div>
                  </button>
                  <button className="text-center">
                    <div className="w-6 h-6 mx-auto mb-1 bg-gray-300 rounded"></div>
                    <div className="text-xs">Schedule</div>
                  </button>
                  <button className="text-center">
                    <div className="w-6 h-6 mx-auto mb-1 bg-gray-300 rounded"></div>
                    <div className="text-xs">Account</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Hotspots - positioned for mobile layout */}
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className={`absolute w-6 h-6 ${hotspot.color} rounded-full animate-pulse cursor-pointer transform hover:scale-110 transition-transform shadow-lg`}
              style={{ 
                top: `${hotspot.y}%`, 
                left: hotspot.id === 'gps-booking' ? '65%' : hotspot.id === 'offline-mode' ? '75%' : `${hotspot.x}%`
              }}
              onClick={() => handleHotspotClick(hotspot.id)}
              title={hotspot.title}
            >
              <div className="w-full h-full rounded-full border-2 border-white"></div>
            </div>
          ))}

          {/* Active Hotspot Tooltip */}
          {activeHotspot && !showQuoteModal && (
            <div className="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-xl">
              {hotspots
                .filter(h => h.id === activeHotspot)
                .map(hotspot => (
                  <div key={hotspot.id}>
                    <h4 className="font-semibold text-gray-900 mb-2">{hotspot.title}</h4>
                    <p className="text-sm text-gray-600">{hotspot.description}</p>
                    <button 
                      onClick={() => setActiveHotspot(null)}
                      className="mt-2 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Close
                    </button>
                  </div>
                ))
              }
            </div>
          )}

          {/* Quote Calculator Modal */}
          {showQuoteModal && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Instant Quote Calculator</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                    <select
                      value={quoteForm.service}
                      onChange={(e) => setQuoteForm({...quoteForm, service: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:border-accent focus:outline-none"
                    >
                      <option value="">Select service</option>
                      <option value="mowing">Lawn Mowing</option>
                      <option value="landscaping">Landscaping</option>
                      <option value="cleanup">Cleanup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Size</label>
                    <select
                      value={quoteForm.propertySize}
                      onChange={(e) => setQuoteForm({...quoteForm, propertySize: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:border-accent focus:outline-none"
                    >
                      <option value="">Select size</option>
                      <option value="small">Small (under 0.25 acre)</option>
                      <option value="medium">Medium (0.25-0.5 acre)</option>
                      <option value="large">Large (over 0.5 acre)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Frequency</label>
                    <select
                      value={quoteForm.frequency}
                      onChange={(e) => setQuoteForm({...quoteForm, frequency: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:border-accent focus:outline-none"
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly (10% discount)</option>
                      <option value="monthly">Monthly (5% discount)</option>
                      <option value="one-time">One-time service</option>
                    </select>
                  </div>
                  
                  {quotePrice && (
                    <div className="bg-success-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-success">${quotePrice}</div>
                      <div className="text-sm text-gray-600">Estimated price per service</div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={calculateQuote}
                      className="flex-1 bg-accent text-white py-2 px-4 rounded hover:bg-accent-600 transition-colors"
                      disabled={!quoteForm.service || !quoteForm.propertySize || !quoteForm.frequency}
                    >
                      Calculate Quote
                    </button>
                    <button
                      onClick={() => {setShowQuoteModal(false); setQuotePrice(null);}}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Controls */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Click the colored hotspots to explore Mobile PWA features
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-sm text-accent-600 hover:underline">← Before</button>
              <button className="text-sm text-accent-600 hover:underline">After →</button>
              <a
                href="/calculator"
                className="bg-accent text-white px-4 py-2 rounded text-sm hover:bg-accent-600 transition-colors"
              >
                Get This Framework
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePWADemoInteractive;