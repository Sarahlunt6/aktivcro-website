import React, { useState } from 'react';

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
    id: 'valuation',
    title: 'Instant Property Valuation',
    description: 'AI-powered property valuation tool that provides instant estimates based on market data, comparable sales, and property features.',
    x: 85,
    y: 25,
    color: 'bg-success'
  },
  {
    id: 'search',
    title: 'Smart Property Search',
    description: 'Advanced search with filters, map integration, and saved searches. Includes mortgage calculator and market insights.',
    x: 15,
    y: 60,
    color: 'bg-primary'
  },
  {
    id: 'featured',
    title: 'Featured Property Showcase',
    description: 'Dynamic featured properties with virtual tours, detailed specs, and instant scheduling for showings.',
    x: 50,
    y: 75,
    color: 'bg-accent-600'
  },
  {
    id: 'market-tools',
    title: 'Market Analysis Tools',
    description: 'Comprehensive market reports, trend analysis, and neighborhood insights to educate and engage prospects.',
    x: 50,
    y: 85,
    color: 'bg-purple-600'
  }
];

const CREDemoInteractive: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [propertyValue, setPropertyValue] = useState<string>('$650,000');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [showValuation, setShowValuation] = useState(false);

  const handleHotspotClick = (hotspotId: string) => {
    setActiveHotspot(activeHotspot === hotspotId ? null : hotspotId);
    
    // Simulate interactive features
    if (hotspotId === 'valuation') {
      setShowValuation(true);
      setTimeout(() => {
        setPropertyValue(`$${Math.floor(Math.random() * 200000 + 450000).toLocaleString()}`);
      }, 1000);
    }
  };

  const handleSearch = () => {
    if (searchLocation) {
      // Simulate search results
      alert(`Searching for properties in ${searchLocation}... Found 47 matching properties!`);
    }
  };

  const handleScheduleTour = () => {
    alert('Tour scheduling popup would open here with calendar integration!');
  };

  const handleMarketReport = () => {
    alert('Downloading comprehensive market report for this area...');
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
              https://demo-realestate.aktivcro.com
            </div>
          </div>
          <span className="bg-success-100 text-success-800 px-3 py-1 rounded-full text-sm font-medium">
            Live Demo
          </span>
        </div>

        {/* Demo Content */}
        <div className="aspect-video bg-gradient-to-br from-success-50 to-primary-50 relative overflow-hidden">
          {/* Simulated Real Estate Website */}
          <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-success text-white p-4 flex items-center justify-between">
              <div className="font-bold text-lg">MetroRealty Group</div>
              <div className="flex space-x-4 text-sm">
                <span className="hover:underline cursor-pointer">Buy</span>
                <span className="hover:underline cursor-pointer">Sell</span>
                <span className="hover:underline cursor-pointer">Market Reports</span>
                <button 
                  onClick={() => handleHotspotClick('valuation')}
                  className="bg-accent text-success px-3 py-1 rounded-full hover:bg-accent-200 transition-colors"
                >
                  Get Valuation
                </button>
              </div>
            </div>
            
            {/* Hero Section */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Search Tool */}
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-3">Find Your Dream Property</h1>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input 
                        type="text" 
                        placeholder="Location" 
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="text-xs p-2 border rounded focus:border-success focus:outline-none"
                      />
                      <select className="text-xs p-2 border rounded focus:border-success focus:outline-none">
                        <option>Price Range</option>
                        <option>$200K - $400K</option>
                        <option>$400K - $600K</option>
                        <option>$600K - $800K</option>
                        <option>$800K+</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <select className="text-xs p-2 border rounded focus:border-success focus:outline-none">
                        <option>Bedrooms</option>
                        <option>1+</option>
                        <option>2+</option>
                        <option>3+</option>
                        <option>4+</option>
                      </select>
                      <select className="text-xs p-2 border rounded focus:border-success focus:outline-none">
                        <option>Property Type</option>
                        <option>House</option>
                        <option>Condo</option>
                        <option>Townhouse</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleSearch}
                      className="w-full bg-success text-white py-2 rounded text-sm font-semibold hover:bg-success-600 transition-colors"
                    >
                      Search Properties
                    </button>
                  </div>
                </div>
                
                {/* Right: Featured Property */}
                <div>
                  <div className="bg-gray-200 rounded-lg p-3 text-center">
                    <div className="text-sm font-semibold mb-2">Featured Property</div>
                    <div className="bg-gradient-to-br from-gray-300 to-gray-400 h-16 rounded mb-2 flex items-center justify-center">
                      <span className="text-xs text-gray-600">Property Image</span>
                    </div>
                    <div className="text-lg font-bold text-success">{propertyValue}</div>
                    <div className="text-xs text-gray-600">3 bed • 2 bath • Downtown</div>
                    <button 
                      onClick={handleScheduleTour}
                      className="mt-2 text-xs bg-success text-white px-3 py-1 rounded hover:bg-success-600 transition-colors"
                    >
                      Schedule Tour
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Market Tools */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <button 
                  onClick={() => handleHotspotClick('valuation')}
                  className="bg-blue-50 p-2 rounded text-center hover:bg-blue-100 transition-colors"
                >
                  <div className="font-semibold text-blue-800">Home Valuation</div>
                  <div className="text-blue-600">Get instant estimate</div>
                </button>
                <button 
                  onClick={handleMarketReport}
                  className="bg-green-50 p-2 rounded text-center hover:bg-green-100 transition-colors"
                >
                  <div className="font-semibold text-green-800">Market Report</div>
                  <div className="text-green-600">Area trends & data</div>
                </button>
                <button 
                  className="bg-purple-50 p-2 rounded text-center hover:bg-purple-100 transition-colors"
                  onClick={() => alert('Mortgage calculator would open here with payment estimates!')}
                >
                  <div className="font-semibold text-purple-800">Mortgage Calc</div>
                  <div className="text-purple-600">Payment estimates</div>
                </button>
              </div>

              {/* Valuation Modal */}
              {showValuation && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
                    <h3 className="text-lg font-bold mb-4">Instant Property Valuation</h3>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-success mb-2">{propertyValue}</div>
                      <p className="text-gray-600 mb-4">Estimated market value</p>
                      <div className="text-sm text-gray-500 mb-4">
                        Based on recent comparable sales, market trends, and property characteristics.
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert('Detailed report would be sent to email!')}
                          className="flex-1 bg-success text-white py-2 px-4 rounded text-sm hover:bg-success-600"
                        >
                          Get Full Report
                        </button>
                        <button 
                          onClick={() => setShowValuation(false)}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm hover:bg-gray-300"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Hotspots */}
          {hotspots.map((hotspot) => (
            <div
              key={hotspot.id}
              className={`absolute w-6 h-6 ${hotspot.color} rounded-full animate-pulse cursor-pointer transform hover:scale-110 transition-transform shadow-lg`}
              style={{ top: `${hotspot.y}%`, left: `${hotspot.x}%` }}
              onClick={() => handleHotspotClick(hotspot.id)}
              title={hotspot.title}
            >
              <div className="w-full h-full rounded-full border-2 border-white"></div>
            </div>
          ))}

          {/* Active Hotspot Tooltip */}
          {activeHotspot && (
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
        </div>

        {/* Demo Controls */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Click the colored hotspots to explore interactive features
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-sm text-success hover:underline">← Before</button>
              <button className="text-sm text-success hover:underline">After →</button>
              <a
                href="/calculator"
                className="bg-success text-white px-4 py-2 rounded text-sm hover:bg-success-600 transition-colors"
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

export default CREDemoInteractive;