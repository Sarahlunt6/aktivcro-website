import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Function to get demo URL for each framework
const getDemoUrl = (frameworkId: string): string => {
  const demoUrls: Record<string, string> = {
    'authority': '/demo/authority',
    'mobile-first': '/demo/mobile-pwa',
    'cre': '/demo/cre',
    'conversion-centered': '/demo/conversion-centered'
  };
  return demoUrls[frameworkId] || '/demos';
};

interface Framework {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  bestFor: string[];
  methodology: string;
  results: string;
  features: string[];
  icon: string;
  color: string;
  gradient: string;
}

const frameworks: Framework[] = [
  {
    id: 'authority',
    name: 'Authority Architecture',
    shortName: 'Authority',
    tagline: 'Trust-Driven Conversion',
    description: 'Establishes credibility through social proof, certifications, and expertise demonstrations.',
    bestFor: ['Professional services', 'High-ticket B2B', 'Consultancy'],
    methodology: 'Trust signals → Credibility building → Authority positioning → Conversion',
    results: '3-5x increase in qualified leads',
    features: [
      'Certification showcases',
      'Client testimonial integration',
      'Case study presentations',
      'Expert positioning content',
      'Trust badge displays'
    ],
    icon: '🏆',
    color: 'from-blue-500 to-indigo-600',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100'
  },
  {
    id: 'mobile-first',
    name: 'Mobile-First PWA',
    shortName: 'Mobile PWA',
    tagline: 'Speed Meets Engagement',
    description: 'Progressive web app approach optimized for mobile-first user experiences.',
    bestFor: ['Local services', 'E-commerce', 'Consumer apps'],
    methodology: 'Mobile optimization → PWA features → Engagement tools → Conversion',
    results: '4-6x mobile conversion improvement',
    features: [
      'Progressive web app capabilities',
      'Offline functionality',
      'Push notifications',
      'Fast loading (< 2s)',
      'App-like experience'
    ],
    icon: '📱',
    color: 'from-green-500 to-teal-600',
    gradient: 'bg-gradient-to-br from-green-50 to-teal-100'
  },
  {
    id: 'cre-methodology',
    name: 'CRE Methodology',
    shortName: 'CRE',
    tagline: 'Data-Driven Optimization',
    description: 'Systematic conversion rate optimization through continuous testing and refinement.',
    bestFor: ['SaaS platforms', 'B2B software', 'Tech companies'],
    methodology: 'Data analysis → Hypothesis testing → A/B optimization → Performance scaling',
    results: '2-4x conversion rate increase',
    features: [
      'Advanced analytics integration',
      'A/B testing framework',
      'Funnel optimization',
      'User behavior tracking',
      'Performance monitoring'
    ],
    icon: '📊',
    color: 'from-purple-500 to-pink-600',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-100'
  },
  {
    id: 'conversion-centered',
    name: 'Conversion-Centered Design',
    shortName: 'CCD',
    tagline: 'Single-Goal Focus',
    description: 'Laser-focused design approach with singular conversion objectives per page.',
    bestFor: ['Landing pages', 'Lead generation', 'Sales funnels'],
    methodology: 'Goal definition → Distraction removal → Flow optimization → Conversion',
    results: '5-8x landing page performance',
    features: [
      'Single-objective pages',
      'Distraction elimination',
      'Conversion flow optimization',
      'Persuasive copywriting',
      'Strategic CTA placement'
    ],
    icon: '🎯',
    color: 'from-orange-500 to-red-600',
    gradient: 'bg-gradient-to-br from-orange-50 to-red-100'
  }
];

const FrameworkShowcase: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState<string>(frameworks[0].id);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });

  const selectedFrameworkData = frameworks.find(f => f.id === selectedFramework) || frameworks[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
          >
            Four Proven
            <span className="bg-gradient-to-r from-primary to-primary-800 bg-clip-text text-transparent"> Frameworks</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Each framework is strategically designed for specific business types and conversion goals. 
            Discover which approach will transform your website's performance.
          </motion.p>
        </motion.div>

        {/* Framework Selector Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {frameworks.map((framework) => (
            <motion.div
              key={framework.id}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                selectedFramework === framework.id
                  ? 'ring-2 ring-primary shadow-xl'
                  : 'hover:shadow-lg'
              } ${framework.gradient}`}
              onClick={() => setSelectedFramework(framework.id)}
            >
              {/* Selection Indicator */}
              {selectedFramework === framework.id && (
                <motion.div
                  className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {/* Framework Content */}
              <div className="text-center">
                <div className="text-4xl mb-3">{framework.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {framework.shortName}
                </h3>
                <p className="text-sm text-gray-600 font-medium mb-4">
                  {framework.tagline}
                </p>
                <div className="text-xs text-gray-500 mb-2">Best for:</div>
                <div className="text-sm font-medium text-gray-700">
                  {framework.bestFor[0]}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Selected Framework Details */}
        <motion.div
          key={selectedFramework}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`rounded-3xl overflow-hidden shadow-2xl ${selectedFrameworkData.gradient}`}
        >
          <div className="p-8 md:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Framework Info */}
              <div>
                <div className="flex items-center mb-6">
                  <div className="text-5xl mr-4">{selectedFrameworkData.icon}</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedFrameworkData.name}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium">
                      {selectedFrameworkData.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  {selectedFrameworkData.description}
                </p>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Perfect for:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFrameworkData.bestFor.map((item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/70 text-gray-700 rounded-full text-sm font-medium border border-gray-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Methodology:</h4>
                    <p className="text-gray-700 bg-white/50 p-4 rounded-lg border border-gray-200">
                      {selectedFrameworkData.methodology}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Expected Results:</h4>
                    <div className="flex items-center bg-white/70 p-4 rounded-lg border border-gray-200">
                      <svg className="w-6 h-6 text-success mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-gray-800 font-semibold">
                        {selectedFrameworkData.results}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Framework Features */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h4>
                <div className="space-y-4">
                  {selectedFrameworkData.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start p-4 bg-white/70 rounded-lg border border-gray-200 shadow-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{feature}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8">
                  <motion.a
                    href={getDemoUrl(selectedFramework)}
                    className="block w-full bg-gradient-to-r from-primary to-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    See {selectedFrameworkData.shortName} in Action
                    <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FrameworkShowcase;