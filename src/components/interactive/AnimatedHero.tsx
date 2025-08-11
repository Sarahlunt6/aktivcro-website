import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedHeroProps {
  onCTAClick?: (type: 'primary' | 'secondary') => void;
}

const AnimatedHero: React.FC<AnimatedHeroProps> = ({ onCTAClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  // Floating particles animation
  const particleVariants = {
    animate: {
      y: [-10, 10, -10],
      x: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            style={{
              left: `${20 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            variants={particleVariants}
            animate="animate"
            transition={{ delay: i * 0.5 }}
          >
            <div className="w-4 h-4 bg-primary rounded-full blur-sm"></div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Badge */}
        <motion.div variants={badgeVariants} className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            🚀 Conversion Optimization Platform
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={itemVariants}
          className="hero-headline text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-primary to-primary-800 bg-clip-text text-transparent">
            Stop Losing 95% of Visitors
          </span>
          <br />
          <span className="text-gray-900">
            Turn Your Website Into a
          </span>
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-600 bg-clip-text text-transparent">
            Lead Generation Machine
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="hero-subheadline text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Our proven 4-framework system transforms underperforming websites into intelligent platforms that 
          <span className="font-semibold text-primary"> convert 3-4x more visitors into qualified leads</span> in just 30 days
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.a
            href="/#demo"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="homepage-cta primary-cta group relative overflow-hidden bg-primary text-white px-8 py-4 rounded-lg text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="relative z-10 flex items-center">
              Get Your Free Demo Now
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-primary-700 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>
          </motion.a>

          <motion.a
            href="/calculator"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="group bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary hover:text-white transition-colors duration-300"
          >
            <span className="flex items-center">
              Calculate Your Revenue Increase
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </motion.a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          variants={itemVariants}
          className="social-proof-container flex flex-wrap justify-center items-center gap-8 opacity-60"
        >
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-5 h-5 mr-2 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            4 Proven Frameworks
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-5 h-5 mr-2 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            200-400% Lead Increase
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-5 h-5 mr-2 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            30-Day Results Guarantee
          </div>
        </motion.div>

        {/* Urgency Container - Will be populated by personalization */}
        <motion.div
          variants={itemVariants}
          className="urgency-container mt-8"
        >
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedHero;