import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

interface FormData {
  businessName: string;
  industry: string;
  currentWebsite: string;
  logo: File | null;
  primaryColor: string;
  secondaryColor: string;
  services: string[];
  customServices: string;
  targetAudience: string;
  valueProposition: string;
  email: string;
  phone: string;
  framework: string;
  microExperiences: string[];
}

interface Industry {
  id: string;
  name: string;
  icon: string;
  templates: string[];
  suggestedFramework: string;
  microExperiences: string[];
}

const industries: Industry[] = [
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: '💼',
    templates: ['law-firm', 'consulting', 'accounting'],
    suggestedFramework: 'authority',
    microExperiences: ['case-evaluator', 'consultation-scheduler', 'expertise-quiz']
  },
  {
    id: 'local-services',
    name: 'Local Services',
    icon: '🏠',
    templates: ['plumbing', 'landscaping', 'cleaning'],
    suggestedFramework: 'mobile-first',
    microExperiences: ['instant-quote', 'service-scheduler', 'area-checker']
  },
  {
    id: 'saas-tech',
    name: 'SaaS & Tech',
    icon: '💻',
    templates: ['software', 'analytics', 'automation'],
    suggestedFramework: 'cre-methodology',
    microExperiences: ['roi-calculator', 'feature-comparison', 'demo-request']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: '🛒',
    templates: ['retail', 'subscription', 'marketplace'],
    suggestedFramework: 'conversion-centered',
    microExperiences: ['product-finder', 'size-guide', 'abandoned-cart-recovery']
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    templates: ['dental', 'medical', 'wellness'],
    suggestedFramework: 'authority',
    microExperiences: ['appointment-scheduler', 'insurance-checker', 'symptom-checker']
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    templates: ['online-courses', 'tutoring', 'certification'],
    suggestedFramework: 'conversion-centered',
    microExperiences: ['course-finder', 'skill-assessment', 'progress-tracker']
  }
];

const frameworks = [
  { id: 'authority', name: 'Authority Architecture', icon: '🏆', color: 'blue' },
  { id: 'mobile-first', name: 'Mobile-First PWA', icon: '📱', color: 'green' },
  { id: 'cre-methodology', name: 'CRE Methodology', icon: '📊', color: 'purple' },
  { id: 'conversion-centered', name: 'Conversion-Centered Design', icon: '🎯', color: 'orange' }
];

const DemoHomepageGenerator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    industry: '',
    currentWebsite: '',
    logo: null,
    primaryColor: '#20466f',
    secondaryColor: '#ffd147',
    services: [],
    customServices: '',
    targetAudience: '',
    valueProposition: '',
    email: '',
    phone: '',
    framework: '',
    microExperiences: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [demoGenerated, setDemoGenerated] = useState(false);
  const [generatedDemo, setGeneratedDemo] = useState<{
    demoId: string;
    html: string;
    generatedContent: any;
  } | null>(null);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.2 });

  const totalSteps = 5;

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // First, send to GoHighLevel workflow for lead capture
      const ghlResponse = await fetch('/api/generate-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Process services - use custom services if provided, otherwise use selected predefined services
      const processedServices = formData.customServices.trim() 
        ? formData.customServices.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : formData.services;

      // Then generate AI-powered demo
      const aiDemoRequest = {
        businessName: formData.businessName,
        industry: formData.industry,
        industryName: industries.find(i => i.id === formData.industry)?.name || formData.industry,
        framework: formData.framework,
        frameworkName: frameworks.find(f => f.id === formData.framework)?.name || formData.framework,
        services: processedServices,
        valueProposition: formData.valueProposition,
        targetAudience: formData.targetAudience,
        currentWebsite: formData.currentWebsite,
        microExperiences: formData.microExperiences,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        email: formData.email
      };

      const aiResponse = await fetch('/api/generate-ai-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiDemoRequest),
      });

      const aiResult = await aiResponse.json();

      if (aiResult.success) {
        setGeneratedDemo({
          demoId: aiResult.demoId,
          html: aiResult.html,
          generatedContent: aiResult.generatedContent
        });
        setIsGenerating(false);
        setDemoGenerated(true);
      } else {
        console.error('AI Demo generation failed:', aiResult.error);
        setIsGenerating(false);
        // Show error message to user
        alert(`Demo generation failed: ${aiResult.error}. Please ensure you have a valid Gemini API key configured.`);
      }
    } catch (error) {
      console.error('API call failed:', error);
      setIsGenerating(false);
      alert('Sorry, there was an error generating your demo. Please try again or contact support.');
    }
  };

  const getSelectedIndustry = () => {
    return industries.find(ind => ind.id === formData.industry);
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

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${(currentStep / totalSteps) * 100}%`,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  if (demoGenerated) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your AI-Generated Demo is Ready! 🎉
              </h2>
              <p className="text-xl text-gray-600 mb-4">
                Here's how {formData.businessName} could look with AktivCRO optimization using AI-powered content
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-medium">
                    ✅ Demo request processed! Detailed results will be emailed to {formData.email} within 15 minutes.
                  </span>
                </div>
              </div>
            </div>

            {/* AI Generated Content Preview */}
            {generatedDemo?.generatedContent && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">AI-Generated Content for {formData.businessName}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Hero Section</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-bold text-lg mb-2">{generatedDemo.generatedContent.heroHeadline}</p>
                      <p className="text-gray-600">{generatedDemo.generatedContent.heroSubheadline}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Services Generated</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {generatedDemo.generatedContent.servicesContent?.slice(0, 2).map((service: any, index: number) => (
                        <div key={index} className="mb-2">
                          <p className="font-medium text-sm">{service.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Demo Preview */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-primary p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Live AI-Generated Demo</h3>
                <button
                  onClick={() => {
                    if (generatedDemo?.html) {
                      const newWindow = window.open('', '_blank');
                      if (newWindow) {
                        newWindow.document.write(generatedDemo.html);
                        newWindow.document.close();
                      }
                    }
                  }}
                  className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                  Open Full Demo →
                </button>
              </div>
              <div className="aspect-video relative">
                {generatedDemo?.html ? (
                  <iframe
                    srcDoc={generatedDemo.html}
                    className="w-full h-full border-0"
                    title="AI Generated Demo"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">Demo preview loading...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-center mb-8">Projected Performance Impact</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">+400%</div>
                  <div className="text-gray-600">Conversion Rate Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">+300%</div>
                  <div className="text-gray-600">Lead Quality Improvement</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">-60%</div>
                  <div className="text-gray-600">Time to Close</div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-primary to-primary-700 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Website?</h3>
              <p className="text-lg mb-6 opacity-90">
                Get a detailed implementation proposal and start your optimization journey
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Download Detailed Proposal
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

  if (isGenerating) {
    return (
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-8"
            />
            <h2 className="text-3xl font-bold mb-4">Processing Your Demo Request...</h2>
            <p className="text-xl text-gray-600 mb-8">
              We're using AI to generate personalized content and creating your optimization preview using the {frameworks.find(f => f.id === formData.framework)?.name} framework.
            </p>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="space-y-3 text-left">
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Processing business requirements and lead scoring
                </div>
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sending data to GoHighLevel CRM workflow
                </div>
                <div className="flex items-center text-yellow-600">
                  <div className="w-5 h-5 mr-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                  Generating AI-powered website content and demo
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-5 h-5 mr-3 border-2 border-gray-300 rounded-full" />
                  Scheduling team follow-up
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20 md:py-32 bg-gradient-to-b from-primary-50 to-white">
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
              See Your Website's
              <span className="bg-gradient-to-r from-primary to-primary-800 bg-clip-text text-transparent"> Potential</span>
            </motion.h2>
            <motion.p
              variants={stepVariants}
              className="text-xl text-gray-600 mb-8"
            >
              Get a personalized preview of your optimized website in just 2 minutes
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
                variants={progressVariants}
                animate="visible"
                className="bg-primary h-2 rounded-full"
              />
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Tell us about your business</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => updateFormData({ businessName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your business name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                      </label>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {industries.map((industry) => (
                          <div
                            key={industry.id}
                            onClick={() => updateFormData({ industry: industry.id })}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.industry === industry.id
                                ? 'border-primary bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-2">{industry.icon}</div>
                            <div className="font-medium">{industry.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Website (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.currentWebsite}
                        onChange={(e) => updateFormData({ currentWebsite: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Branding */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Your brand identity</h3>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.primaryColor}
                            onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={formData.secondaryColor}
                            onChange={(e) => updateFormData({ secondaryColor: e.target.value })}
                            className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.secondaryColor}
                            onChange={(e) => updateFormData({ secondaryColor: e.target.value })}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Services
                      </label>
                      
                      <textarea
                        value={formData.customServices}
                        onChange={(e) => updateFormData({ customServices: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., Tax Planning, Business Consulting, Contract Review"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Describe the services you offer, separated by commas
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What makes you unique? *
                      </label>
                      <textarea
                        value={formData.valueProposition}
                        onChange={(e) => updateFormData({ valueProposition: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Describe what sets your business apart from competitors..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Framework Selection */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Choose your optimization framework</h3>
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-blue-800 font-medium">
                          Recommended: {frameworks.find(f => f.id === getSelectedIndustry()?.suggestedFramework)?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {frameworks.map((framework) => (
                      <div
                        key={framework.id}
                        onClick={() => updateFormData({ framework: framework.id })}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.framework === framework.id
                            ? 'border-primary bg-primary-50 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center mb-4">
                          <div className="text-3xl mr-3">{framework.icon}</div>
                          <div>
                            <h4 className="font-bold text-lg">{framework.name}</h4>
                          </div>
                        </div>
                        {framework.id === getSelectedIndustry()?.suggestedFramework && (
                          <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
                            ⭐ Recommended for {getSelectedIndustry()?.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Micro-Experiences */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Select micro-experiences</h3>
                  <p className="text-gray-600 mb-6">
                    These interactive tools will be integrated into your optimized website to capture and qualify leads.
                  </p>
                  
                  <div className="space-y-4">
                    {getSelectedIndustry()?.microExperiences.map((experience, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.microExperiences.includes(experience)
                            ? 'border-primary bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.microExperiences.includes(experience)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFormData({ microExperiences: [...formData.microExperiences, experience] });
                            } else {
                              updateFormData({ microExperiences: formData.microExperiences.filter(exp => exp !== experience) });
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 border-2 rounded mr-4 flex items-center justify-center ${
                          formData.microExperiences.includes(experience)
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}>
                          {formData.microExperiences.includes(experience) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium capitalize">{experience.replace('-', ' ')}</div>
                          <div className="text-sm text-gray-500">
                            Interactive tool to qualify and capture leads
                          </div>
                        </div>
                      </label>
                    )) || []}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Contact Information */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h3 className="text-2xl font-bold mb-6">Get your personalized demo</h3>
                  <p className="text-gray-600 mb-6">
                    We'll generate your demo and send you the detailed results along with implementation recommendations.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold mb-4">What you'll receive:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Personalized website demo with your branding</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Detailed performance projections and ROI analysis</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Implementation roadmap and timeline</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Free 30-minute strategy consultation</span>
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
                      i + 1 <= currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && (!formData.businessName || !formData.industry)) ||
                  (currentStep === 2 && !formData.valueProposition) ||
                  (currentStep === 3 && !formData.framework) ||
                  (currentStep === 5 && !formData.email)
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === totalSteps ? 'Generate Demo' : 'Next →'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoHomepageGenerator;