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
    id: 'testimonials',
    title: 'Social Proof & Testimonials',
    description: 'Strategically placed client testimonials with photos, case studies, and trust indicators to build immediate credibility.',
    x: 85,
    y: 30,
    color: 'bg-primary'
  },
  {
    id: 'expertise',
    title: 'Expertise Showcase',
    description: 'Prominent display of certifications, awards, years of experience, and industry recognition to establish authority.',
    x: 15,
    y: 25,
    color: 'bg-success'
  },
  {
    id: 'consultation',
    title: 'Free Consultation CTA',
    description: 'Strategic consultation booking with qualification questions to capture high-intent leads.',
    x: 50,
    y: 75,
    color: 'bg-accent-600'
  },
  {
    id: 'case-studies',
    title: 'Results-Driven Case Studies',
    description: 'Detailed case studies showing real client results with metrics, timelines, and success stories.',
    x: 80,
    y: 85,
    color: 'bg-purple-600'
  }
];

const AuthorityDemoInteractive: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [consultationForm, setConsultationForm] = useState({
    name: '',
    company: '',
    challenge: ''
  });
  const [showConsultation, setShowConsultation] = useState(false);
  const [showCaseStudy, setShowCaseStudy] = useState(false);

  const handleHotspotClick = (hotspotId: string) => {
    setActiveHotspot(activeHotspot === hotspotId ? null : hotspotId);
    
    if (hotspotId === 'consultation') {
      setShowConsultation(true);
    } else if (hotspotId === 'case-studies') {
      setShowCaseStudy(true);
    }
  };

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you ${consultationForm.name}! Your consultation request has been submitted. We'll contact you within 24 hours to discuss ${consultationForm.challenge}.`);
    setShowConsultation(false);
    setConsultationForm({ name: '', company: '', challenge: '' });
  };

  const handleNewsletterSignup = () => {
    alert('Subscribed to weekly insights! You\'ll receive expert tips and industry trends.');
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
              https://demo-consulting.aktivcro.com
            </div>
          </div>
          <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
            Live Demo
          </span>
        </div>

        {/* Demo Content */}
        <div className="aspect-video bg-gradient-to-br from-primary-50 to-accent-50 relative overflow-hidden">
          {/* Simulated Professional Services Website */}
          <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="font-bold text-lg">Sterling Consulting Group</div>
              <div className="flex space-x-4 text-sm">
                <span className="hover:underline cursor-pointer">Services</span>
                <span className="hover:underline cursor-pointer">About</span>
                <span className="hover:underline cursor-pointer">Case Studies</span>
                <button 
                  onClick={() => handleHotspotClick('consultation')}
                  className="bg-accent text-primary px-3 py-1 rounded-full hover:bg-accent-200 transition-colors"
                >
                  Free Consultation
                </button>
              </div>
            </div>
            
            {/* Hero Section */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Left: Authority Indicators */}
                <div>
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">TRUSTED BY</div>
                    <div className="flex space-x-2 mb-3">
                      <div className="w-8 h-4 bg-gray-200 rounded text-xs flex items-center justify-center">Forbes</div>
                      <div className="w-8 h-4 bg-gray-200 rounded text-xs flex items-center justify-center">WSJ</div>
                    </div>
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-primary mb-1">25+ Years Experience</div>
                    <div className="font-semibold text-success mb-1">500+ Clients Served</div>
                    <div className="font-semibold text-accent-600 mb-2">98% Success Rate</div>
                    
                    <div className="bg-gray-50 p-2 rounded text-center">
                      <div className="text-xs font-semibold mb-1">Latest Insights</div>
                      <input 
                        type="email" 
                        placeholder="Your email" 
                        className="text-xs p-1 border rounded w-full mb-2"
                      />
                      <button 
                        onClick={handleNewsletterSignup}
                        className="text-xs bg-primary text-white px-2 py-1 rounded w-full hover:bg-primary-600"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Center: Main Content */}
                <div className="col-span-2">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">Transform Your Business Strategy</h1>
                  <p className="text-sm text-gray-600 mb-4">
                    We help Fortune 500 companies and growing businesses optimize operations, increase revenue, and scale efficiently.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-primary-50 p-3 rounded">
                      <div className="text-sm font-semibold text-primary mb-1">Strategy Consulting</div>
                      <div className="text-xs text-gray-600">Business transformation & growth</div>
                    </div>
                    <div className="bg-success-50 p-3 rounded">
                      <div className="text-sm font-semibold text-success mb-1">Operations</div>
                      <div className="text-xs text-gray-600">Process optimization & efficiency</div>
                    </div>
                    <div className="bg-accent-50 p-3 rounded">
                      <div className="text-sm font-semibold text-accent-700 mb-1">Technology</div>
                      <div className="text-xs text-gray-600">Digital transformation solutions</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-sm font-semibold text-purple-700 mb-1">M&A Advisory</div>
                      <div className="text-xs text-gray-600">Mergers & acquisition support</div>
                    </div>
                  </div>

                  {/* Client Testimonial */}
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mr-3 flex items-center justify-center text-xs">JD</div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">
                          "Sterling helped us increase revenue by 340% in 18 months. Their strategic approach transformed our entire operation."
                        </div>
                        <div className="text-xs font-semibold text-gray-900">John Davis, CEO TechFlow Inc.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Section */}
              <div className="mt-4 bg-primary text-white p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm">Ready to Transform Your Business?</div>
                    <div className="text-xs opacity-90">Free 30-minute strategy consultation</div>
                  </div>
                  <button 
                    onClick={() => handleHotspotClick('consultation')}
                    className="bg-accent text-primary px-4 py-2 rounded font-semibold text-sm hover:bg-accent-200 transition-colors"
                  >
                    Book Consultation
                  </button>
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
          {activeHotspot && !showConsultation && !showCaseStudy && (
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

          {/* Consultation Form Modal */}
          {showConsultation && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-lg font-bold mb-4">Free Strategy Consultation</h3>
                <form onSubmit={handleConsultationSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={consultationForm.name}
                      onChange={(e) => setConsultationForm({...consultationForm, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      type="text"
                      required
                      value={consultationForm.company}
                      onChange={(e) => setConsultationForm({...consultationForm, company: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biggest Challenge</label>
                    <select
                      value={consultationForm.challenge}
                      onChange={(e) => setConsultationForm({...consultationForm, challenge: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded focus:border-primary focus:outline-none"
                    >
                      <option value="">Select a challenge</option>
                      <option value="Revenue Growth">Revenue Growth</option>
                      <option value="Operational Efficiency">Operational Efficiency</option>
                      <option value="Digital Transformation">Digital Transformation</option>
                      <option value="Market Expansion">Market Expansion</option>
                      <option value="Cost Reduction">Cost Reduction</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2 px-4 rounded hover:bg-primary-600 transition-colors"
                    >
                      Book Consultation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConsultation(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Case Study Modal */}
          {showCaseStudy && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                <h3 className="text-lg font-bold mb-4">Case Study: TechFlow Inc.</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-success">340%</div>
                      <div className="text-xs text-gray-600">Revenue Increase</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">18</div>
                      <div className="text-xs text-gray-600">Months Timeline</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent-600">$2.4M</div>
                      <div className="text-xs text-gray-600">Additional Revenue</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    We helped TechFlow Inc. transform their operations through strategic process optimization, 
                    digital transformation, and market expansion initiatives.
                  </p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => alert('Full case study PDF would be downloaded!')}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded hover:bg-primary-600 transition-colors"
                    >
                      Download Full Study
                    </button>
                    <button 
                      onClick={() => setShowCaseStudy(false)}
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
              Click the colored hotspots to explore Authority Framework features
            </div>
            <div className="flex items-center space-x-4">
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

export default AuthorityDemoInteractive;