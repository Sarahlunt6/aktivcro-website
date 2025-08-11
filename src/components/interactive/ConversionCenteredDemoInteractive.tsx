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
    id: 'ab-testing',
    title: 'Real-time A/B Testing',
    description: 'Live split testing on headlines, CTAs, and layouts with automatic winner selection based on conversion data.',
    x: 85,
    y: 25,
    color: 'bg-primary'
  },
  {
    id: 'smart-forms',
    title: 'Smart Progressive Forms',
    description: 'Multi-step forms that reduce abandonment by 60% with smart field ordering and conditional logic.',
    x: 20,
    y: 40,
    color: 'bg-success'
  },
  {
    id: 'urgency-engine',
    title: 'Dynamic Urgency Engine',
    description: 'Real-time scarcity indicators, countdown timers, and social proof based on actual user behavior.',
    x: 50,
    y: 75,
    color: 'bg-accent-600'
  },
  {
    id: 'conversion-analytics',
    title: 'Conversion Analytics Dashboard',
    description: 'Real-time conversion tracking with funnel analysis, heat maps, and user journey optimization.',
    x: 80,
    y: 80,
    color: 'bg-purple-600'
  }
];

interface ABVariant {
  id: string;
  name: string;
  headline: string;
  cta: string;
  conversionRate: number;
  visitors: number;
}

const ConversionCenteredDemoInteractive: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [currentVariant, setCurrentVariant] = useState<string>('A');
  const [urgencyTimer, setUrgencyTimer] = useState(287);
  const [socialProofCount, setSocialProofCount] = useState(1247);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    role: '',
    goals: ''
  });

  const abVariants: ABVariant[] = [
    {
      id: 'A',
      name: 'Original',
      headline: 'Boost Your SaaS Revenue',
      cta: 'Start Free Trial',
      conversionRate: 3.2,
      visitors: 1540
    },
    {
      id: 'B',
      name: 'Urgency Focus',
      headline: '10X Your SaaS Growth in 30 Days',
      cta: 'Get Instant Access',
      conversionRate: 5.8,
      visitors: 1502
    }
  ];

  useEffect(() => {
    // Urgency timer countdown
    const timer = setInterval(() => {
      setUrgencyTimer(prev => prev > 0 ? prev - 1 : 300);
    }, 1000);

    // Social proof counter
    const socialTimer = setInterval(() => {
      setSocialProofCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(socialTimer);
    };
  }, []);

  const handleHotspotClick = (hotspotId: string) => {
    setActiveHotspot(activeHotspot === hotspotId ? null : hotspotId);
    
    if (hotspotId === 'ab-testing') {
      switchVariant();
    } else if (hotspotId === 'conversion-analytics') {
      setShowAnalytics(true);
    } else if (hotspotId === 'smart-forms') {
      setShowFormBuilder(true);
    }
  };

  const switchVariant = () => {
    setCurrentVariant(prev => prev === 'A' ? 'B' : 'A');
  };

  const getCurrentVariant = () => abVariants.find(v => v.id === currentVariant) || abVariants[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextFormStep = () => {
    if (formStep < 4) {
      setFormStep(formStep + 1);
    } else {
      alert('🎉 Trial started! Welcome to your 14-day free trial with full access to all features.');
      setShowFormBuilder(false);
      setFormStep(1);
      setFormData({ email: '', company: '', role: '', goals: '' });
    }
  };

  const variant = getCurrentVariant();

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
              https://demo-saasboost.com
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
              Live A/B Test
            </span>
            <span className="text-xs text-gray-500">Variant {currentVariant}</span>
          </div>
        </div>

        {/* Demo Content */}
        <div className="aspect-video bg-gradient-to-br from-primary-50 to-purple-50 relative overflow-hidden">
          {/* Simulated SaaS Website */}
          <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with A/B Testing */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="font-bold text-lg">SaasBoost</div>
              <div className="flex space-x-4 text-sm">
                <span className="hover:underline cursor-pointer">Features</span>
                <span className="hover:underline cursor-pointer">Pricing</span>
                <span className="hover:underline cursor-pointer">Resources</span>
                <button 
                  onClick={() => handleHotspotClick('smart-forms')}
                  className="bg-accent text-primary px-3 py-1 rounded-full hover:bg-accent-200 transition-colors"
                >
                  {variant.cta}
                </button>
              </div>
            </div>
            
            {/* Hero Section with A/B Variants */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{variant.headline}</h1>
                <p className="text-gray-600 mb-4">
                  The complete platform to automate your sales process and increase revenue by 300%+
                </p>
                
                {/* Urgency Elements */}
                <div className="flex items-center justify-center space-x-6 mb-4">
                  <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">
                    ⏰ Special Offer Expires: {formatTime(urgencyTimer)}
                  </div>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    🔥 {socialProofCount} users joined today
                  </div>
                </div>

                <button 
                  onClick={() => handleHotspotClick('smart-forms')}
                  className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-600 transition-colors mb-4"
                >
                  {variant.cta} - 14 Days Free
                </button>
                
                <div className="text-sm text-gray-500">No credit card required • Cancel anytime • 5 min setup</div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">300%+</div>
                  <div className="text-sm text-gray-700">Revenue Increase</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">48hrs</div>
                  <div className="text-sm text-gray-700">Setup Time</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">10K+</div>
                  <div className="text-sm text-gray-700">Happy Customers</div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Live Activity</h3>
                  <button 
                    onClick={() => handleHotspotClick('conversion-analytics')}
                    className="text-sm text-primary hover:underline"
                  >
                    View Analytics →
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span>Sarah from TechCorp started her trial 2 min ago</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    <span>Mike from StartupXYZ upgraded to Pro plan</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
                    <span>3 companies signed up in the last 10 minutes</span>
                  </div>
                </div>
              </div>
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
          {activeHotspot && !showAnalytics && !showFormBuilder && (
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

          {/* Analytics Dashboard Modal */}
          {showAnalytics && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
                <h3 className="text-lg font-bold mb-4">Real-time Conversion Analytics</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">A/B Test Results</h4>
                    {abVariants.map(variant => (
                      <div key={variant.id} className={`p-3 border rounded mb-2 ${currentVariant === variant.id ? 'border-primary bg-primary-50' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">Variant {variant.id}</span>
                          <span className={`text-sm px-2 py-1 rounded ${variant.conversionRate > 4 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {variant.conversionRate}% CVR
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{variant.headline}</div>
                        <div className="text-xs text-gray-500">{variant.visitors} visitors</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Live Metrics</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-2xl font-bold text-green-600">+81%</div>
                        <div className="text-sm text-gray-600">Conversion Improvement</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-2xl font-bold text-blue-600">3,042</div>
                        <div className="text-sm text-gray-600">Total Visitors Today</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-2xl font-bold text-purple-600">$24,590</div>
                        <div className="text-sm text-gray-600">Revenue Generated</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAnalytics(false)}
                  className="mt-4 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Close Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Smart Form Modal */}
          {showFormBuilder && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Start Your Free Trial</h3>
                  <div className="text-sm text-gray-500">Step {formStep} of 4</div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{width: `${(formStep / 4) * 100}%`}}
                  ></div>
                </div>

                {formStep === 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:border-primary focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                )}

                {formStep === 2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:border-primary focus:outline-none"
                      placeholder="Your Company"
                    />
                  </div>
                )}

                {formStep === 3 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:border-primary focus:outline-none"
                    >
                      <option value="">Select your role</option>
                      <option value="founder">Founder/CEO</option>
                      <option value="marketing">Marketing Manager</option>
                      <option value="sales">Sales Director</option>
                      <option value="growth">Growth Manager</option>
                    </select>
                  </div>
                )}

                {formStep === 4 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
                    <select
                      value={formData.goals}
                      onChange={(e) => setFormData({...formData, goals: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded focus:border-primary focus:outline-none"
                    >
                      <option value="">What's your main goal?</option>
                      <option value="increase-conversions">Increase Conversions</option>
                      <option value="more-leads">Generate More Leads</option>
                      <option value="optimize-funnel">Optimize Sales Funnel</option>
                      <option value="grow-revenue">Grow Revenue</option>
                    </select>
                  </div>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={nextFormStep}
                    className="flex-1 bg-primary text-white py-3 px-4 rounded hover:bg-primary-600 transition-colors"
                  >
                    {formStep === 4 ? 'Start Free Trial' : 'Continue'}
                  </button>
                  <button
                    onClick={() => setShowFormBuilder(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Controls */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Click hotspots to explore conversion optimization features
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={switchVariant}
                className="text-sm text-primary hover:underline"
              >
                Switch A/B Variant
              </button>
              <button className="text-sm text-primary hover:underline">← Before</button>
              <button className="text-sm text-primary hover:underline">After →</button>
              <a
                href="/calculator"
                className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary-600 transition-colors"
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

export default ConversionCenteredDemoInteractive;