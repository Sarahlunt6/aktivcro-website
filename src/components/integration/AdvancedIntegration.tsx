import React, { useEffect, useRef } from 'react';
import { 
  trackEvent, 
  trackLeadGeneration, 
  trackDemoRequest, 
  trackCalculatorUsage,
  setUserProperties 
} from '../../utils/analytics-manager';
import { 
  calculateLeadScore, 
  createLeadProfile, 
  createBehavioralData,
  type LeadProfile,
  type BehavioralData 
} from '../../utils/lead-scoring-system';
import { 
  createABTest, 
  getABVariant, 
  trackABConversion,
  type ABTest 
} from '../../utils/ab-testing-framework';
import { 
  triggerEmailAutomation, 
  dispatchUserAction, 
  dispatchLeadScored 
} from '../../utils/email-automation-system';
import ChatWidget from '../chat/ChatWidget';
import { PersonalizationProvider } from '../personalization/PersonalizationProvider';

interface AdvancedIntegrationProps {
  userId?: string;
  enableChat?: boolean;
  enableABTesting?: boolean;
  enableEmailAutomation?: boolean;
  enablePersonalization?: boolean;
  chatPosition?: 'bottom-right' | 'bottom-left';
  personalizationDebug?: boolean;
}

const AdvancedIntegration: React.FC<AdvancedIntegrationProps> = ({
  userId,
  enableChat = true,
  enableABTesting = true,
  enableEmailAutomation = true,
  enablePersonalization = true,
  chatPosition = 'bottom-right',
  personalizationDebug = false
}) => {
  const initializationRef = useRef(false);
  const currentUserId = useRef(userId || generateUserId());

  useEffect(() => {
    if (!initializationRef.current) {
      initializeAdvancedFeatures();
      initializationRef.current = true;
    }
  }, []);

  const generateUserId = (): string => {
    let storedUserId = localStorage.getItem('aktivcro_user_id');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('aktivcro_user_id', storedUserId);
    }
    return storedUserId;
  };

  const initializeAdvancedFeatures = async () => {
    try {
      console.log('Advanced Integration: Initializing advanced features');

      // Initialize A/B Testing
      if (enableABTesting) {
        await initializeABTesting();
      }

      // Set up comprehensive event tracking
      setupEventTracking();

      // Initialize lead scoring
      setupLeadScoring();

      // Set up form integrations
      setupFormIntegrations();

      // Initialize page-specific optimizations
      setupPageOptimizations();

      console.log('Advanced Integration: All features initialized successfully');
    } catch (error) {
      console.error('Advanced Integration: Initialization failed', error);
    }
  };

  const initializeABTesting = async () => {
    // Homepage CTA test
    const homepageCTATest: ABTest = {
      id: 'homepage_cta_test',
      name: 'Homepage CTA Button Test',
      description: 'Testing different CTA button texts on homepage',
      status: 'active',
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Original "Get Started" button',
          weight: 0.5,
          changes: [],
          isControl: true
        },
        {
          id: 'variant_a',
          name: 'Variant A',
          description: 'Book Free Consultation',
          weight: 0.5,
          changes: [
            {
              type: 'text',
              selector: '.homepage-cta',
              value: 'Book Free Consultation'
            }
          ],
          isControl: false
        }
      ],
      allocation: 'equal',
      startDate: new Date().toISOString(),
      conversionGoals: [
        {
          id: 'cta_click',
          name: 'CTA Click',
          type: 'click',
          selector: '.homepage-cta',
          primary: true
        }
      ],
      statisticalSignificance: 0.95,
      minimumSampleSize: 100,
      trafficAllocation: 0.5
    };

    // Pricing page layout test
    const pricingLayoutTest: ABTest = {
      id: 'pricing_layout_test',
      name: 'Pricing Layout Test',
      description: 'Testing different pricing page layouts',
      status: 'active',
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Original 3-column layout',
          weight: 0.5,
          changes: [],
          isControl: true
        },
        {
          id: 'variant_b',
          name: 'Variant B',
          description: 'Single column with comparison',
          weight: 0.5,
          changes: [
            {
              type: 'style',
              selector: '.pricing-grid',
              property: 'grid-template-columns',
              value: '1fr'
            },
            {
              type: 'style',
              selector: '.pricing-card',
              property: 'max-width',
              value: '500px'
            }
          ],
          isControl: false
        }
      ],
      allocation: 'equal',
      startDate: new Date().toISOString(),
      conversionGoals: [
        {
          id: 'contact_form_submit',
          name: 'Contact Form Submission',
          type: 'form_submit',
          selector: '#contact-form',
          primary: true
        }
      ],
      statisticalSignificance: 0.95,
      minimumSampleSize: 150,
      trafficAllocation: 0.3
    };

    // Create tests
    createABTest(homepageCTATest);
    createABTest(pricingLayoutTest);

    console.log('Advanced Integration: A/B tests initialized');
  };

  const setupEventTracking = () => {
    // Enhanced click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const classList = Array.from(target.classList);
      const id = target.id;

      // Track CTA clicks
      if (classList.includes('cta-button') || classList.includes('btn-primary')) {
        trackEvent({
          name: 'cta_click',
          parameters: {
            button_text: target.textContent?.trim(),
            button_id: id,
            page_url: window.location.href,
            button_classes: classList.join(' ')
          }
        });

        // Track A/B test conversions
        trackABConversion('homepage_cta_test', 'cta_click');
        
        // Trigger email automation
        if (enableEmailAutomation) {
          dispatchUserAction(currentUserId.current, 'cta_click', {
            buttonText: target.textContent?.trim(),
            pageUrl: window.location.href
          });
        }
      }

      // Track navigation clicks
      if (tagName === 'a' && !target.href?.startsWith('#')) {
        trackEvent({
          name: 'navigation_click',
          parameters: {
            link_text: target.textContent?.trim(),
            destination_url: target.getAttribute('href'),
            link_type: classList.includes('nav-link') ? 'navigation' : 'content',
            page_url: window.location.href
          }
        });
      }

      // Track pricing interactions
      if (classList.includes('pricing-card') || target.closest('.pricing-card')) {
        trackEvent({
          name: 'pricing_interaction',
          parameters: {
            interaction_type: 'click',
            pricing_tier: target.closest('.pricing-card')?.getAttribute('data-tier'),
            page_url: window.location.href
          }
        });
      }

      // Track demo interactions
      if (classList.includes('demo-card') || target.closest('.demo-card')) {
        const demoCard = target.closest('.demo-card');
        trackEvent({
          name: 'demo_interaction',
          parameters: {
            demo_type: demoCard?.getAttribute('data-demo-type'),
            interaction_type: 'click',
            page_url: window.location.href
          }
        });
      }
    });

    // Enhanced scroll tracking with engagement zones
    let maxScrollDepth = 0;
    let engagementZones = {
      hero: false,
      features: false,
      pricing: false,
      testimonials: false,
      cta: false
    };

    const trackScrollEngagement = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;

        // Track engagement zones
        const heroSection = document.getElementById('hero');
        const featuresSection = document.getElementById('features');
        const pricingSection = document.getElementById('pricing');
        const testimonialsSection = document.getElementById('testimonials');
        const ctaSection = document.getElementById('cta');

        const viewportTop = window.scrollY;
        const viewportBottom = viewportTop + window.innerHeight;

        // Check which sections are in view
        [
          { id: 'hero', element: heroSection, key: 'hero' as keyof typeof engagementZones },
          { id: 'features', element: featuresSection, key: 'features' as keyof typeof engagementZones },
          { id: 'pricing', element: pricingSection, key: 'pricing' as keyof typeof engagementZones },
          { id: 'testimonials', element: testimonialsSection, key: 'testimonials' as keyof typeof engagementZones },
          { id: 'cta', element: ctaSection, key: 'cta' as keyof typeof engagementZones }
        ].forEach(({ id, element, key }) => {
          if (element && !engagementZones[key]) {
            const elementTop = element.offsetTop;
            const elementBottom = elementTop + element.offsetHeight;

            if (viewportTop < elementBottom && viewportBottom > elementTop) {
              engagementZones[key] = true;
              
              trackEvent({
                name: 'section_viewed',
                parameters: {
                  section_id: id,
                  scroll_depth: scrollPercent,
                  page_url: window.location.href
                }
              });

              // Trigger email automation for high-value sections
              if (enableEmailAutomation && (key === 'pricing' || key === 'testimonials')) {
                dispatchUserAction(currentUserId.current, 'section_viewed', {
                  section: id,
                  scrollDepth: scrollPercent
                });
              }
            }
          }
        });

        // Track significant scroll milestones
        if ([25, 50, 75, 90, 100].includes(scrollPercent) && scrollPercent > (maxScrollDepth - 5)) {
          trackEvent({
            name: 'scroll_milestone',
            parameters: {
              scroll_depth: scrollPercent,
              page_url: window.location.href,
              engagement_zones: Object.keys(engagementZones).filter(key => engagementZones[key as keyof typeof engagementZones])
            }
          });
        }
      }
    };

    let scrollTimer: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(trackScrollEngagement, 100);
    });

    // Time-based engagement tracking
    let timeOnPage = 0;
    const trackTimeEngagement = () => {
      timeOnPage += 30;
      
      if ([30, 60, 120, 300, 600].includes(timeOnPage)) {
        trackEvent({
          name: 'time_engagement',
          parameters: {
            time_on_page: timeOnPage,
            max_scroll_depth: maxScrollDepth,
            sections_viewed: Object.keys(engagementZones).filter(key => engagementZones[key as keyof typeof engagementZones]),
            page_url: window.location.href
          }
        });

        // High engagement trigger for email automation
        if (enableEmailAutomation && timeOnPage >= 120) {
          dispatchUserAction(currentUserId.current, 'high_engagement', {
            timeOnPage,
            scrollDepth: maxScrollDepth,
            sectionsViewed: Object.keys(engagementZones).filter(key => engagementZones[key as keyof typeof engagementZones])
          });
        }
      }
    };

    setInterval(trackTimeEngagement, 30000); // Track every 30 seconds
  };

  const setupLeadScoring = () => {
    // Create behavioral data tracking
    let behavioralData = createBehavioralData();

    const updateBehavioralData = (data: Partial<BehavioralData>) => {
      behavioralData = { ...behavioralData, ...data };
      
      // Recalculate lead score if we have profile data
      const profileData = localStorage.getItem(`lead_profile_${currentUserId.current}`);
      if (profileData) {
        try {
          const profile: LeadProfile = JSON.parse(profileData);
          const leadScore = calculateLeadScore(profile, behavioralData);
          
          // Store updated score
          localStorage.setItem(`lead_score_${currentUserId.current}`, JSON.stringify(leadScore));
          
          // Dispatch lead scored event for email automation
          if (enableEmailAutomation) {
            dispatchLeadScored(currentUserId.current, leadScore, profile);
          }

          console.log('Advanced Integration: Lead score updated', leadScore);
        } catch (error) {
          console.error('Advanced Integration: Failed to update lead score', error);
        }
      }
    };

    // Track page views for behavioral data
    const currentPageView = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date(),
      timeOnPage: 0,
      referrer: document.referrer,
      device: window.innerWidth < 768 ? 'mobile' as const : 
              window.innerWidth < 1024 ? 'tablet' as const : 'desktop' as const
    };

    behavioralData.pageViews.push(currentPageView);
    
    // Update time on page periodically
    const startTime = Date.now();
    const updateTimeOnPage = () => {
      currentPageView.timeOnPage = Math.round((Date.now() - startTime) / 1000);
      updateBehavioralData({ pageViews: behavioralData.pageViews });
    };
    
    setInterval(updateTimeOnPage, 15000); // Update every 15 seconds

    // Store behavioral data globally for form submissions to access
    (window as any).aktivcroBehavioralData = behavioralData;
    (window as any).aktivcroUpdateBehavioralData = updateBehavioralData;
  };

  const setupFormIntegrations = () => {
    // Enhanced form tracking with lead scoring
    document.addEventListener('submit', async (event) => {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const formType = form.id || form.className || 'unknown_form';

      // Extract form data
      const email = formData.get('email') as string;
      const firstName = formData.get('firstName') || formData.get('name') as string;
      const lastName = formData.get('lastName') as string;
      const company = formData.get('company') as string;
      const phone = formData.get('phone') as string;
      const message = formData.get('message') as string;

      // Create or update lead profile
      if (email) {
        const leadProfile = createLeadProfile({
          id: currentUserId.current,
          email,
          firstName,
          lastName,
          company,
          phone,
          source: 'website_form',
          industry: formData.get('industry') as string,
          companySize: formData.get('companySize') as ('startup' | 'small' | 'medium' | 'large' | 'enterprise'),
          website: formData.get('website') as string
        });

        // Store profile
        localStorage.setItem(`lead_profile_${currentUserId.current}`, JSON.stringify(leadProfile));

        // Set user properties for analytics
        setUserProperties({
          userId: currentUserId.current,
          userType: 'lead',
          industry: leadProfile.industry,
          companySize: leadProfile.companySize,
          source: 'website'
        });

        // Track lead generation
        trackLeadGeneration({
          email,
          source: formType,
          leadId: currentUserId.current,
          value: 100
        });

        // Add form submission to behavioral data
        const behavioralData = (window as any).aktivcroBehavioralData;
        const updateBehavioralData = (window as any).aktivcroUpdateBehavioralData;
        
        if (behavioralData && updateBehavioralData) {
          behavioralData.formSubmissions.push({
            formType: formType.includes('contact') ? 'contact' : 
                     formType.includes('demo') ? 'demo' :
                     formType.includes('newsletter') ? 'newsletter' : 'contact',
            formId: form.id,
            data: Object.fromEntries(formData.entries()),
            timestamp: new Date(),
            completed: true
          });
          
          updateBehavioralData({ formSubmissions: behavioralData.formSubmissions });
        }

        // Trigger email automation
        if (enableEmailAutomation) {
          dispatchUserAction(currentUserId.current, 'form_submission', {
            formType,
            email,
            firstName,
            company,
            formData: Object.fromEntries(formData.entries())
          });
        }

        // Track A/B test conversion
        trackABConversion('pricing_layout_test', 'contact_form_submit');

        console.log('Advanced Integration: Form submission processed', { email, formType });
      }
    });

    // Track form interactions (focus events)
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const form = target.closest('form');
        const formName = form?.id || form?.className || 'unknown_form';
        
        trackEvent({
          name: 'form_field_focus',
          parameters: {
            form_name: formName,
            field_name: target.getAttribute('name') || target.id || 'unknown_field',
            field_type: target.getAttribute('type') || target.tagName.toLowerCase(),
            page_url: window.location.href
          }
        });

        // Track form start for abandonment recovery
        if (enableEmailAutomation) {
          dispatchUserAction(currentUserId.current, 'form_started', {
            formName,
            fieldName: target.getAttribute('name') || target.id
          });
        }
      }
    });
  };

  const setupPageOptimizations = () => {
    const currentPath = window.location.pathname;

    // Page-specific optimizations
    if (currentPath === '/' || currentPath === '/index.html') {
      setupHomepageOptimizations();
    } else if (currentPath.includes('/calculator')) {
      setupCalculatorOptimizations();
    } else if (currentPath.includes('/demo')) {
      setupDemoOptimizations();
    } else if (currentPath.includes('/pricing')) {
      setupPricingOptimizations();
    }
  };

  const setupHomepageOptimizations = () => {
    // Apply A/B test variant
    const variant = getABVariant('homepage_cta_test');
    if (variant) {
      console.log('Advanced Integration: Applied homepage CTA variant', variant);
    }

    // Track hero section engagement
    const heroSection = document.getElementById('hero');
    if (heroSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            trackEvent({
              name: 'hero_section_viewed',
              parameters: {
                visibility_ratio: entry.intersectionRatio,
                page_url: window.location.href
              }
            });
          }
        });
      }, { threshold: 0.5 });

      observer.observe(heroSection);
    }
  };

  const setupCalculatorOptimizations = () => {
    // Track calculator usage
    const trackCalculatorStep = (step: number, data: any) => {
      trackEvent({
        name: 'calculator_step_completed',
        parameters: {
          step_number: step,
          step_data: data,
          page_url: window.location.href
        }
      });
    };

    // Track calculator completion
    const trackCalculatorCompletion = (results: any) => {
      trackCalculatorUsage({
        currentConversionRate: results.currentConversionRate,
        trafficVolume: results.trafficVolume,
        estimatedImprovement: results.estimatedImprovement,
        projectedValue: results.projectedValue
      });

      // Trigger email automation
      if (enableEmailAutomation) {
        dispatchUserAction(currentUserId.current, 'calculator_completed', {
          ...results,
          completedAt: new Date().toISOString()
        });
      }

      console.log('Advanced Integration: Calculator completion tracked', results);
    };

    // Make tracking functions available globally for calculator component
    (window as any).aktivcroTrackCalculatorStep = trackCalculatorStep;
    (window as any).aktivcroTrackCalculatorCompletion = trackCalculatorCompletion;
  };

  const setupDemoOptimizations = () => {
    // Track demo interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.closest('.demo-request-btn')) {
        const demoType = target.getAttribute('data-demo-type') || 'unknown';
        
        trackDemoRequest({
          framework: demoType,
          industry: 'unknown',
          email: 'pending',
          businessName: 'pending'
        });

        // Trigger email automation
        if (enableEmailAutomation) {
          dispatchUserAction(currentUserId.current, 'demo_request', {
            framework: demoType,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  };

  const setupPricingOptimizations = () => {
    // Apply A/B test variant
    const variant = getABVariant('pricing_layout_test');
    if (variant) {
      console.log('Advanced Integration: Applied pricing layout variant', variant);
    }

    // Track pricing page engagement
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach((card, index) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            trackEvent({
              name: 'pricing_card_viewed',
              parameters: {
                card_index: index,
                pricing_tier: card.getAttribute('data-tier'),
                visibility_ratio: entry.intersectionRatio,
                page_url: window.location.href
              }
            });
          }
        });
      }, { threshold: 0.7 });

      observer.observe(card);
    });
  };

  return (
    <PersonalizationProvider
      userId={currentUserId.current}
      enabled={enablePersonalization}
      autoPersonalize={true}
      debugMode={personalizationDebug}
    >
      {enableChat && (
        <ChatWidget 
          position={chatPosition}
          primaryColor="#20466f"
          accentColor="#ffd147"
          autoOpen={false}
          triggerAfterSeconds={45}
        />
      )}
      
      {/* Hidden tracking beacon */}
      <div 
        id="aktivcro-advanced-integration" 
        data-user-id={currentUserId.current}
        data-features={JSON.stringify({
          chat: enableChat,
          abTesting: enableABTesting,
          emailAutomation: enableEmailAutomation,
          personalization: enablePersonalization
        })}
        style={{ display: 'none' }}
      />
    </PersonalizationProvider>
  );
};

export default AdvancedIntegration;