import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  interval: 'one-time' | 'monthly';
  popular?: boolean;
  features: string[];
  includes: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'accent' | 'success';
}

const pricingTiers: PricingTier[] = [
  {
    id: 'foundation',
    name: 'Foundation Package',
    description: 'Perfect for businesses ready to optimize their conversion funnel',
    price: 5000,
    interval: 'one-time',
    features: [
      'Intelligent framework selection',
      'Professional implementation',
      'Mobile optimization',
      'Basic analytics setup',
      '30-day support'
    ],
    includes: [
      'Framework consultation',
      'Custom design implementation',
      'Responsive optimization',
      'Performance optimization',
      'Analytics integration'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'primary'
  },
  {
    id: 'growth',
    name: 'Growth Package',
    description: 'Accelerate growth with custom micro-experiences and advanced tracking',
    price: 5000,
    originalPrice: 7000,
    interval: 'one-time',
    popular: true,
    features: [
      'Everything in Foundation',
      '2-3 custom micro-experiences',
      'Advanced conversion tracking',
      'A/B testing setup',
      '60-day support'
    ],
    includes: [
      'All Foundation features',
      'Custom interactive tools',
      'Lead qualification systems',
      'Advanced analytics',
      'A/B testing framework'
    ],
    buttonText: 'Most Popular',
    buttonVariant: 'accent'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Platform',
    description: 'Complete transformation with ongoing optimization and dedicated support',
    price: 15000,
    interval: 'one-time',
    features: [
      'Full platform implementation',
      '5+ custom micro-experiences',
      'Ongoing optimization',
      'Monthly performance reports',
      'Dedicated success manager'
    ],
    includes: [
      'All Growth features',
      'Multiple micro-experiences',
      'Dedicated account manager',
      'Monthly optimization',
      'Priority support'
    ],
    buttonText: 'Go Enterprise',
    buttonVariant: 'success'
  }
];

const addOnServices = [
  {
    id: 'additional-microexp',
    name: 'Additional Micro-Experience',
    description: 'Custom interactive tool for lead capture and qualification',
    priceRange: '$2,000 - $10,000'
  },
  {
    id: 'platform-subscription',
    name: 'Platform Subscription',
    description: 'Monthly maintenance, updates, and optimization',
    priceRange: '$500 - $2,000/month'
  },
  {
    id: 'performance-analytics',
    name: 'Performance Analytics',
    description: 'Advanced reporting and conversion tracking',
    priceRange: '$200 - $500/month'
  }
];

const PricingSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePackageInquiry = async (tier: PricingTier) => {
    setIsLoading(tier.id);
    
    try {
      // Track the pricing interaction
      if (typeof gtag !== 'undefined') {
        // @ts-ignore
        gtag('event', 'pricing_package_interest', {
          package_name: tier.name,
          package_price: tier.price,
          package_id: tier.id,
          value: tier.price / 100 // Convert to lead value
        });
      }
      
      setTimeout(() => {
        setIsLoading(null);
        
        // Construct Calendly URL with pre-filled information
        const params = new URLSearchParams({
          'prefill[package]': tier.name,
          'prefill[budget]': `$${tier.price.toLocaleString()}`,
          'prefill[source]': 'pricing_page'
        });
        
        const calendlyUrl = `https://calendly.com/aktivcro/strategy-call?${params.toString()}`;
        
        // Open in same tab for better conversion tracking
        window.location.href = calendlyUrl;
      }, 800);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(null);
      
      // Fallback to contact page
      window.location.href = '/contact?service=' + encodeURIComponent(tier.name);
    }
  };

  const handleConsultation = () => {
    // Track consultation interest
    if (typeof gtag !== 'undefined') {
      // @ts-ignore
      gtag('event', 'consultation_interest', {
        source: 'pricing_page',
        location: 'general_consultation'
      });
    }
    
    // Open Calendly with source tracking
    const params = new URLSearchParams({
      'prefill[source]': 'pricing_consultation'
    });
    window.location.href = `https://calendly.com/aktivcro/strategy-call?${params.toString()}`;
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            Transparent
            <span className="bg-gradient-to-r from-primary to-primary-800 bg-clip-text text-transparent"> Pricing</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Choose the package that fits your business needs. All packages include our 30-day performance guarantee.
          </motion.p>

        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                tier.popular ? 'ring-2 ring-accent transform scale-105' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-accent text-center py-2">
                  <span className="text-sm font-semibold text-gray-900">🔥 Most Popular</span>
                </div>
              )}

              <div className={`p-8 ${tier.popular ? 'pt-16' : ''}`}>
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-600 mb-6">{tier.description}</p>
                  
                  <div className="mb-6">
                    {tier.originalPrice && (
                      <div className="text-lg text-gray-500 line-through mb-1">
                        ${tier.originalPrice.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        ${tier.price.toLocaleString()}
                      </span>
                      {tier.interval === 'monthly' && (
                        <span className="text-gray-600 ml-2">/month</span>
                      )}
                    </div>
                    {tier.originalPrice && (
                      <div className="text-sm text-success font-medium mt-1">
                        Save ${(tier.originalPrice - tier.price).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <motion.button
                    onClick={() => handlePackageInquiry(tier)}
                    disabled={isLoading === tier.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                      tier.buttonVariant === 'primary'
                        ? 'bg-primary text-white hover:bg-primary-700'
                        : tier.buttonVariant === 'accent'
                        ? 'bg-accent text-gray-900 hover:bg-accent-600'
                        : 'bg-success text-white hover:bg-success-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading === tier.id ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Scheduling Call...
                      </div>
                    ) : (
                      `Schedule Call - ${tier.buttonText}`
                    )}
                  </motion.button>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">What's included:</h4>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detailed Includes */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      <span>View detailed breakdown</span>
                      <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4 space-y-2">
                      {tier.includes.map((include, includeIndex) => (
                        <div key={includeIndex} className="flex items-start text-sm">
                          <svg className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-600">{include}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add-on Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Add-on Services</h3>
            <p className="text-gray-600">
              Enhance your package with additional services tailored to your specific needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {addOnServices.map((addon, index) => (
              <div key={addon.id} className="p-6 border border-gray-200 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">{addon.name}</h4>
                <p className="text-gray-600 text-sm mb-4">{addon.description}</p>
                <div className="text-lg font-bold text-primary mb-4">{addon.priceRange}</div>
                <button 
                  onClick={handleConsultation}
                  className="w-full px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                >
                  Get Quote
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Guarantee & Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-success-50 to-primary-50 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-success mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-gray-900">30-Day Performance Guarantee</span>
              </div>
              <div className="flex items-center">
                <svg className="w-8 h-8 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-gray-900">Free Strategy Consultation</span>
              </div>
              <div className="flex items-center">
                <svg className="w-8 h-8 text-accent-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-semibold text-gray-900">Implementation Support</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Not sure which package is right for you?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule a free 30-minute strategy call with our conversion experts. We'll analyze your current setup and recommend the best approach for your business.
          </p>
          <motion.button
            onClick={handleConsultation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-primary to-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Schedule Free Strategy Call
            <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;