import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const ValuePropositionSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.3 });
  const [hoveredSide, setHoveredSide] = useState<'static' | 'intelligent' | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const staticFeatures = [
    'Basic contact forms',
    'Static product listings',
    'Generic testimonials',
    'One-size-fits-all content',
    'Manual follow-ups'
  ];

  const intelligentFeatures = [
    'Smart qualification wizards',
    'Dynamic ROI calculators',
    'Personalized experiences',
    'Adaptive content delivery',
    'Automated nurture sequences'
  ];

  const metrics = [
    { label: 'Conversion Rate', static: '2-3%', intelligent: '8-12%', improvement: '+400%' },
    { label: 'Lead Quality', static: 'Mixed', intelligent: 'Qualified', improvement: '+300%' },
    { label: 'Time to Close', static: '45 days', intelligent: '18 days', improvement: '-60%' },
    { label: 'Customer LTV', static: '$2,400', intelligent: '$7,200', improvement: '+200%' }
  ];

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
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
            The Difference Is
            <span className="bg-gradient-to-r from-primary to-primary-800 bg-clip-text text-transparent"> Dramatic</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Stop losing potential customers to generic, static websites. 
            See what happens when your site becomes an intelligent conversion machine.
          </motion.p>
        </motion.div>

        {/* Comparison Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-8 mb-16"
        >
          {/* Static Website */}
          <motion.div
            variants={cardVariants}
            className={`relative overflow-hidden rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
              hoveredSide === 'static' ? 'transform -translate-y-2' : ''
            }`}
            onMouseEnter={() => setHoveredSide('static')}
            onMouseLeave={() => setHoveredSide(null)}
            style={{
              background: hoveredSide === 'static' 
                ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
            }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-300 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Static Website</h3>
              <p className="text-gray-500">Traditional, one-size-fits-all approach</p>
            </div>

            <div className="space-y-3">
              {staticFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center p-3 bg-white/50 rounded-lg border border-gray-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Intelligent Platform */}
          <motion.div
            variants={cardVariants}
            className={`relative overflow-hidden rounded-2xl p-8 transition-all duration-300 cursor-pointer ${
              hoveredSide === 'intelligent' ? 'transform -translate-y-2' : ''
            }`}
            onMouseEnter={() => setHoveredSide('intelligent')}
            onMouseLeave={() => setHoveredSide(null)}
            style={{
              background: hoveredSide === 'intelligent'
                ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
            
            <div className="relative z-10 text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-700 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">Intelligent Platform</h3>
              <p className="text-primary-700">AI-powered, personalized experiences</p>
            </div>

            <div className="relative z-10 space-y-3">
              {intelligentFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center p-3 bg-white/70 rounded-lg border border-primary/20 shadow-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <svg className="w-5 h-5 text-success mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-primary-800 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Metrics Comparison */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl font-bold text-center mb-8"
          >
            Real Performance Impact
          </motion.h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-6 rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100"
              >
                <h4 className="font-semibold text-gray-900 mb-4">{metric.label}</h4>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-500">
                    Before: <span className="font-medium">{metric.static}</span>
                  </div>
                  <div className="text-sm text-primary-700">
                    After: <span className="font-bold">{metric.intelligent}</span>
                  </div>
                </div>
                <div className="inline-flex items-center px-3 py-1 bg-success-100 text-success-800 rounded-full text-sm font-bold">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  {metric.improvement}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;