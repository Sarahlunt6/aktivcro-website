import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

interface CalculatorData {
  monthlyVisitors: number;
  currentConversionRate: number;
  averageOrderValue: number;
  industry: string;
  businessType: string;
  primaryGoal: string;
  currentChallenges: string[];
  email: string;
  phone: string;
  company: string;
}

interface IndustryBenchmark {
  id: string;
  name: string;
  icon: string;
  avgConversion: number;
  topPerformerConversion: number;
  challenges: string[];
  improvements: {
    framework: string;
    conversionIncrease: number;
    timeToClose: number;
    leadQuality: number;
  };
}

const industryBenchmarks: IndustryBenchmark[] = [
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: '💼',
    avgConversion: 3.5,
    topPerformerConversion: 12.0,
    challenges: ['Long sales cycles', 'Trust building', 'Lead qualification'],
    improvements: {
      framework: 'Authority Architecture',
      conversionIncrease: 340,
      timeToClose: -45,
      leadQuality: 280
    }
  },
  {
    id: 'local-services',
    name: 'Local Services',
    icon: '🏠',
    avgConversion: 4.2,
    topPerformerConversion: 15.8,
    challenges: ['Mobile optimization', 'Local SEO', 'Instant quotes'],
    improvements: {
      framework: 'Mobile-First PWA',
      conversionIncrease: 420,
      timeToClose: -35,
      leadQuality: 210
    }
  },
  {
    id: 'saas-tech',
    name: 'SaaS & Tech',
    icon: '💻',
    avgConversion: 2.8,
    topPerformerConversion: 8.5,
    challenges: ['Complex product explanation', 'Trial conversions', 'Feature comparison'],
    improvements: {
      framework: 'CRE Methodology',
      conversionIncrease: 280,
      timeToClose: -25,
      leadQuality: 190
    }
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: '🛒',
    avgConversion: 2.1,
    topPerformerConversion: 6.8,
    challenges: ['Cart abandonment', 'Product discovery', 'Trust signals'],
    improvements: {
      framework: 'Conversion-Centered Design',
      conversionIncrease: 180,
      timeToClose: -15,
      leadQuality: 150
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    avgConversion: 5.2,
    topPerformerConversion: 18.5,
    challenges: ['Compliance requirements', 'Patient trust', 'Appointment booking'],
    improvements: {
      framework: 'Authority Architecture',
      conversionIncrease: 380,
      timeToClose: -50,
      leadQuality: 320
    }
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    avgConversion: 3.8,
    topPerformerConversion: 14.2,
    challenges: ['Course selection', 'Value demonstration', 'Enrollment process'],
    improvements: {
      framework: 'Conversion-Centered Design',
      conversionIncrease: 250,
      timeToClose: -30,
      leadQuality: 180
    }
  }
];

const businessTypes = [
  { id: 'b2b', name: 'B2B Services', multiplier: 1.2 },
  { id: 'b2c', name: 'B2C Services', multiplier: 1.0 },
  { id: 'ecommerce', name: 'E-commerce', multiplier: 0.8 },
  { id: 'saas', name: 'SaaS/Software', multiplier: 1.1 },
  { id: 'marketplace', name: 'Marketplace', multiplier: 0.9 }
];

const primaryGoals = [
  { id: 'increase-leads', name: 'Increase Lead Generation', impact: 1.0 },
  { id: 'improve-quality', name: 'Improve Lead Quality', impact: 1.1 },
  { id: 'reduce-cost', name: 'Reduce Acquisition Cost', impact: 1.0 },
  { id: 'faster-sales', name: 'Faster Sales Cycle', impact: 0.9 },
  { id: 'increase-revenue', name: 'Increase Revenue', impact: 1.2 }
];

const ConversionCalculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    monthlyVisitors: 0,
    currentConversionRate: 0,
    averageOrderValue: 0,
    industry: '',
    businessType: '',
    primaryGoal: '',
    currentChallenges: [],
    email: '',
    phone: '',
    company: ''
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });

  const totalSteps = 4;

  const updateCalculatorData = (updates: Partial<CalculatorData>) => {
    setCalculatorData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCalculate();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSelectedIndustry = () => {
    return industryBenchmarks.find(ind => ind.id === calculatorData.industry);
  };

  const calculateResults = () => {
    const industry = getSelectedIndustry();
    if (!industry) return null;

    const businessTypeMultiplier = businessTypes.find(bt => bt.id === calculatorData.businessType)?.multiplier || 1.0;
    const goalMultiplier = primaryGoals.find(pg => pg.id === calculatorData.primaryGoal)?.impact || 1.0;

    const currentMonthlyLeads = (calculatorData.monthlyVisitors * calculatorData.currentConversionRate) / 100;
    const currentMonthlyRevenue = currentMonthlyLeads * calculatorData.averageOrderValue;
    const currentAnnualRevenue = currentMonthlyRevenue * 12;

    const improvementMultiplier = (industry.improvements.conversionIncrease / 100) * businessTypeMultiplier * goalMultiplier;
    const newConversionRate = calculatorData.currentConversionRate * (1 + improvementMultiplier);
    const newMonthlyLeads = (calculatorData.monthlyVisitors * newConversionRate) / 100;
    const newMonthlyRevenue = newMonthlyLeads * calculatorData.averageOrderValue;
    const newAnnualRevenue = newMonthlyRevenue * 12;

    const leadIncrease = newMonthlyLeads - currentMonthlyLeads;
    const revenueIncrease = newAnnualRevenue - currentAnnualRevenue;
    const percentageIncrease = ((newConversionRate - calculatorData.currentConversionRate) / calculatorData.currentConversionRate) * 100;

    return {
      current: {
        conversionRate: calculatorData.currentConversionRate,
        monthlyLeads: Math.round(currentMonthlyLeads),
        monthlyRevenue: currentMonthlyRevenue,
        annualRevenue: currentAnnualRevenue
      },
      projected: {
        conversionRate: Math.round(newConversionRate * 10) / 10,
        monthlyLeads: Math.round(newMonthlyLeads),
        monthlyRevenue: newMonthlyRevenue,
        annualRevenue: newAnnualRevenue
      },
      improvements: {
        additionalLeads: Math.round(leadIncrease),
        additionalRevenue: revenueIncrease,
        percentageIncrease: Math.round(percentageIncrease),
        paybackPeriod: Math.ceil((15000 / (revenueIncrease / 12)) * 10) / 10, // Assuming $15K investment
        framework: industry.improvements.framework,
        timeToClose: industry.improvements.timeToClose,
        leadQuality: industry.improvements.leadQuality
      }
    };
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setIsCalculating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.3
      }
    }
  };

  if (results) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-b from-accent-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Results Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your Conversion Potential 📈
              </h2>
              <p className="text-xl text-gray-600 mb-2">
                Here's how AktivCRO could transform your business performance
              </p>
              {calculatorData.company && (
                <p className="text-lg text-gray-500">Analysis for {calculatorData.company}</p>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-4xl font-bold text-success mb-2">
                  +{results.improvements.additionalLeads}
                </div>
                <div className="text-gray-600 mb-4">Additional Monthly Leads</div>
                <div className="text-sm text-gray-500">
                  From {formatNumber(results.current.monthlyLeads)} to {formatNumber(results.projected.monthlyLeads)}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatCurrency(results.improvements.additionalRevenue)}
                </div>
                <div className="text-gray-600 mb-4">Additional Annual Revenue</div>
                <div className="text-sm text-gray-500">
                  {results.improvements.percentageIncrease}% increase
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-4xl font-bold text-accent-700 mb-2">
                  {results.improvements.paybackPeriod}mo
                </div>
                <div className="text-gray-600 mb-4">Investment Payback</div>
                <div className="text-sm text-gray-500">
                  ROI: {Math.round((results.improvements.additionalRevenue / 15000) * 100)}%
                </div>
              </div>
            </div>

            {/* Before vs After */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-100 p-6 border-b">
                  <h3 className="text-xl font-bold text-gray-800">Current Performance</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-semibold">{results.current.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Leads</span>
                    <span className="font-semibold">{formatNumber(results.current.monthlyLeads)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-semibold">{formatCurrency(results.current.monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-600 font-medium">Annual Revenue</span>
                    <span className="font-bold text-lg">{formatCurrency(results.current.annualRevenue)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-success">
                <div className="bg-success p-6 border-b">
                  <h3 className="text-xl font-bold text-white">With AktivCRO Optimization</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-semibold text-success">{results.projected.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Leads</span>
                    <span className="font-semibold text-success">{formatNumber(results.projected.monthlyLeads)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-semibold text-success">{formatCurrency(results.projected.monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-gray-600 font-medium">Annual Revenue</span>
                    <span className="font-bold text-lg text-success">{formatCurrency(results.projected.annualRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Roadmap */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-center mb-8">Recommended Implementation</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2">Framework Implementation</h4>
                  <p className="text-sm text-gray-600">{results.improvements.framework} optimized for your industry</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent-700 font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2">Micro-Experiences</h4>
                  <p className="text-sm text-gray-600">Lead qualification and conversion tools</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-success font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2">Optimization</h4>
                  <p className="text-sm text-gray-600">Continuous testing and improvement</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary to-primary-700 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Unlock This Potential?</h3>
              <p className="text-lg mb-6 opacity-90">
                Get a detailed implementation plan and start your transformation today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Download Full Report (PDF)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
                >
                  Schedule Strategy Call
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (isCalculating) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-b from-accent-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-8"
            />
            <h2 className="text-3xl font-bold mb-4">Calculating Your Potential...</h2>
            <p className="text-xl text-gray-600 mb-8">
              Analyzing your industry benchmarks and optimization opportunities
            </p>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-3 text-left">
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Analyzing current performance metrics
                </div>
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Comparing to industry benchmarks
                </div>
                <div className="flex items-center text-yellow-600">
                  <div className="w-5 h-5 mr-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  Calculating optimization potential
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-5 h-5 mr-3 border-2 border-gray-300 rounded-full" />
                  Generating revenue projections
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-accent-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h2
              variants={stepVariants}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            >
              Calculate Your
              <span className="bg-gradient-to-r from-accent to-accent-700 bg-clip-text text-transparent"> ROI Potential</span>
            </motion.h2>
            <motion.p
              variants={stepVariants}
              className="text-xl text-gray-600 mb-8"
            >
              See exactly how much additional revenue AktivCRO optimization could generate for your business
            </motion.p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-accent h-2 rounded-full"
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Calculator Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Current Metrics */}
              {currentStep === 1 && (
                <motion.div
                  key="calc-step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Your current performance</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Website Visitors *
                      </label>
                      <input
                        type="number"
                        value={calculatorData.monthlyVisitors || ''}
                        onChange={(e) => updateCalculatorData({ monthlyVisitors: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        placeholder="e.g., 5000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Conversion Rate (%) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={calculatorData.currentConversionRate || ''}
                        onChange={(e) => updateCalculatorData({ currentConversionRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        placeholder="e.g., 2.5"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Don't know? Industry average is 2-4%
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Average Order/Project Value ($) *
                      </label>
                      <input
                        type="number"
                        value={calculatorData.averageOrderValue || ''}
                        onChange={(e) => updateCalculatorData({ averageOrderValue: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        placeholder="e.g., 2500"
                      />
                    </div>

                    {calculatorData.monthlyVisitors > 0 && calculatorData.currentConversionRate > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Current Performance Summary:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Monthly Leads: ~{Math.round((calculatorData.monthlyVisitors * calculatorData.currentConversionRate) / 100)}</div>
                          <div>Monthly Revenue: ~{formatCurrency((calculatorData.monthlyVisitors * calculatorData.currentConversionRate / 100) * calculatorData.averageOrderValue)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Industry & Business Type */}
              {currentStep === 2 && (
                <motion.div
                  key="calc-step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Your industry & business model</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Industry *
                      </label>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {industryBenchmarks.map((industry) => (
                          <div
                            key={industry.id}
                            onClick={() => updateCalculatorData({ industry: industry.id })}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              calculatorData.industry === industry.id
                                ? 'border-accent bg-accent-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{industry.icon}</div>
                            <div className="font-medium mb-1">{industry.name}</div>
                            <div className="text-xs text-gray-500">Avg: {industry.avgConversion}%</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Business Type *
                      </label>
                      <div className="space-y-2">
                        {businessTypes.map((type) => (
                          <label
                            key={type.id}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                              calculatorData.businessType === type.id
                                ? 'border-accent bg-accent-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="businessType"
                              value={type.id}
                              checked={calculatorData.businessType === type.id}
                              onChange={(e) => updateCalculatorData({ businessType: e.target.value })}
                              className="sr-only"
                            />
                            <span className="font-medium">{type.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Goals & Challenges */}
              {currentStep === 3 && (
                <motion.div
                  key="calc-step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Your goals & challenges</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Primary Goal *
                      </label>
                      <div className="space-y-2">
                        {primaryGoals.map((goal) => (
                          <label
                            key={goal.id}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                              calculatorData.primaryGoal === goal.id
                                ? 'border-accent bg-accent-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="primaryGoal"
                              value={goal.id}
                              checked={calculatorData.primaryGoal === goal.id}
                              onChange={(e) => updateCalculatorData({ primaryGoal: e.target.value })}
                              className="sr-only"
                            />
                            <span className="font-medium">{goal.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Current Challenges (Select all that apply)
                      </label>
                      <div className="space-y-2">
                        {getSelectedIndustry()?.challenges.map((challenge, index) => (
                          <label
                            key={index}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                              calculatorData.currentChallenges.includes(challenge)
                                ? 'border-accent bg-accent-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={calculatorData.currentChallenges.includes(challenge)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateCalculatorData({ 
                                    currentChallenges: [...calculatorData.currentChallenges, challenge] 
                                  });
                                } else {
                                  updateCalculatorData({ 
                                    currentChallenges: calculatorData.currentChallenges.filter(c => c !== challenge) 
                                  });
                                }
                              }}
                              className="mr-3"
                            />
                            <span className="font-medium">{challenge}</span>
                          </label>
                        )) || []}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Contact Information */}
              {currentStep === 4 && (
                <motion.div
                  key="calc-step4"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Get your detailed ROI report</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={calculatorData.company}
                        onChange={(e) => updateCalculatorData({ company: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        placeholder="Your Company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={calculatorData.email}
                        onChange={(e) => updateCalculatorData({ email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={calculatorData.phone}
                        onChange={(e) => updateCalculatorData({ phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="bg-accent-50 rounded-lg p-6">
                      <h4 className="font-semibold mb-4">You'll receive:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-accent-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Detailed ROI analysis and revenue projections</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-accent-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Industry benchmark comparison</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-accent-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Recommended optimization framework</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-accent-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Implementation timeline and next steps</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                ← Back
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i + 1 <= currentStep ? 'bg-accent' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && (!calculatorData.monthlyVisitors || !calculatorData.currentConversionRate || !calculatorData.averageOrderValue)) ||
                  (currentStep === 2 && (!calculatorData.industry || !calculatorData.businessType)) ||
                  (currentStep === 3 && !calculatorData.primaryGoal) ||
                  (currentStep === 4 && !calculatorData.email)
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-accent text-white px-8 py-3 rounded-lg font-medium hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === totalSteps ? 'Calculate ROI' : 'Next →'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConversionCalculator;