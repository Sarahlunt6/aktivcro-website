/**
 * Advanced Analytics Manager
 * Integrates multiple analytics platforms with privacy compliance and advanced tracking
 */

import { useCookieConsent } from '../components/gdpr/CookieConsent';
import { trackUserInteraction } from './performance-monitor';

interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  value?: number;
  currency?: string;
  items?: any[];
}

interface ConversionEvent extends AnalyticsEvent {
  conversionId?: string;
  conversionLabel?: string;
  transactionId?: string;
}

interface UserProperties {
  userId?: string;
  userType?: 'lead' | 'customer' | 'visitor';
  industry?: string;
  companySize?: string;
  source?: string;
  campaign?: string;
}

class AnalyticsManager {
  private initialized = false;
  private consentGiven = false;
  private queue: AnalyticsEvent[] = [];
  private userProperties: UserProperties = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAnalytics();
    }
  }

  private async initializeAnalytics() {
    // Wait for cookie consent
    const checkConsent = () => {
      const consent = localStorage.getItem('aktivcro-cookie-preferences');
      if (consent) {
        try {
          const preferences = JSON.parse(consent);
          this.consentGiven = preferences.analytics || false;
          if (this.consentGiven) {
            this.loadAnalyticsScripts();
          }
          return true;
        } catch (error) {
          console.error('Analytics: Failed to parse consent preferences', error);
        }
      }
      return false;
    };

    // Check immediately
    if (!checkConsent()) {
      // Poll for consent decision
      const pollInterval = setInterval(() => {
        if (checkConsent()) {
          clearInterval(pollInterval);
        }
      }, 1000);

      // Stop polling after 30 seconds
      setTimeout(() => clearInterval(pollInterval), 30000);
    }
  }

  private loadAnalyticsScripts() {
    if (this.initialized) return;
    
    try {
      // Initialize Google Analytics 4
      this.initializeGA4();
      
      // Initialize Microsoft Clarity
      this.initializeClarity();
      
      // Initialize Facebook Pixel (if consent given for marketing)
      this.initializeFacebookPixel();
      
      // Initialize custom tracking
      this.initializeCustomTracking();

      this.initialized = true;
      console.log('Analytics: All platforms initialized successfully');

      // Process queued events
      this.processQueue();
    } catch (error) {
      console.error('Analytics: Failed to initialize', error);
    }
  }

  private initializeGA4() {
    const GA4_ID = process.env.PUBLIC_GA4_ID || 'G-XXXXXXXXXX'; // Replace with actual GA4 ID
    
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function(...args: any[]) {
      (window as any).dataLayer.push(args);
    };

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', GA4_ID, {
      cookie_flags: 'SameSite=None;Secure',
      anonymize_ip: true,
      allow_google_signals: false, // Disable advertising features for privacy
      cookie_expires: 63072000, // 2 years
    });

    console.log('Analytics: Google Analytics 4 initialized');
  }

  private initializeClarity() {
    const CLARITY_ID = process.env.PUBLIC_CLARITY_ID || 'xxxxxxxxxx'; // Replace with actual Clarity ID
    
    (function(c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
      c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);

    console.log('Analytics: Microsoft Clarity initialized');
  }

  private initializeFacebookPixel() {
    const marketingConsent = this.getMarketingConsent();
    if (!marketingConsent) return;

    const FACEBOOK_PIXEL_ID = process.env.PUBLIC_FACEBOOK_PIXEL_ID || 'xxxxxxxxxxxxxxxxx'; // Replace with actual Pixel ID

    // Facebook Pixel initialization
    !(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    (window as any).fbq('init', FACEBOOK_PIXEL_ID);
    (window as any).fbq('track', 'PageView');

    console.log('Analytics: Facebook Pixel initialized');
  }

  private initializeCustomTracking() {
    // Custom conversion tracking system
    this.trackPageView();
    this.setupScrollTracking();
    this.setupEngagementTracking();
    this.setupFormTracking();
  }

  private getMarketingConsent(): boolean {
    try {
      const consent = localStorage.getItem('aktivcro-cookie-preferences');
      if (consent) {
        const preferences = JSON.parse(consent);
        return preferences.marketing || false;
      }
    } catch (error) {
      console.error('Analytics: Failed to get marketing consent', error);
    }
    return false;
  }

  // Public Methods
  public trackEvent(event: AnalyticsEvent) {
    if (!this.consentGiven) {
      this.queue.push(event);
      return;
    }

    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    try {
      // Google Analytics 4
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', event.name, {
          ...event.parameters,
          value: event.value,
          currency: event.currency || 'USD',
          custom_parameters: {
            page_url: window.location.href,
            user_type: this.userProperties.userType || 'visitor'
          }
        });
      }

      // Microsoft Clarity custom events
      if (typeof (window as any).clarity === 'function') {
        (window as any).clarity('event', event.name, event.parameters);
      }

      // Facebook Pixel
      if (this.getMarketingConsent() && typeof (window as any).fbq === 'function') {
        (window as any).fbq('trackCustom', event.name, event.parameters);
      }

      // Track interaction for performance monitoring
      trackUserInteraction(event.name, event.value);

      console.log('Analytics: Event tracked successfully', event.name, event.parameters);
    } catch (error) {
      console.error('Analytics: Failed to track event', error);
    }
  }

  public trackConversion(event: ConversionEvent) {
    if (!this.consentGiven || !this.initialized) {
      this.queue.push(event);
      return;
    }

    try {
      // Google Ads conversion tracking
      if (event.conversionId && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'conversion', {
          send_to: `${event.conversionId}/${event.conversionLabel}`,
          value: event.value,
          currency: event.currency || 'USD',
          transaction_id: event.transactionId
        });
      }

      // Facebook conversion tracking
      if (this.getMarketingConsent() && typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'Purchase', {
          value: event.value,
          currency: event.currency || 'USD',
          content_ids: [event.transactionId],
          content_type: 'product'
        });
      }

      // Track as regular event as well
      this.trackEvent(event);

      console.log('Analytics: Conversion tracked successfully', event);
    } catch (error) {
      console.error('Analytics: Failed to track conversion', error);
    }
  }

  public setUserProperties(properties: UserProperties) {
    this.userProperties = { ...this.userProperties, ...properties };

    if (!this.initialized) return;

    try {
      // Google Analytics user properties
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('config', process.env.PUBLIC_GA4_ID, {
          user_id: properties.userId,
          custom_map: {
            user_type: this.userProperties.userType,
            industry: this.userProperties.industry,
            company_size: this.userProperties.companySize
          }
        });
      }

      // Microsoft Clarity user identification
      if (typeof (window as any).clarity === 'function' && properties.userId) {
        (window as any).clarity('identify', properties.userId, {
          userType: this.userProperties.userType,
          industry: this.userProperties.industry
        });
      }

      console.log('Analytics: User properties set', properties);
    } catch (error) {
      console.error('Analytics: Failed to set user properties', error);
    }
  }

  public trackPageView(url?: string) {
    const pageUrl = url || window.location.href;
    
    this.trackEvent({
      name: 'page_view',
      parameters: {
        page_location: pageUrl,
        page_title: document.title,
        page_referrer: document.referrer,
        ...this.userProperties
      }
    });
  }

  public trackFormSubmission(formName: string, success: boolean, errorMessage?: string) {
    this.trackEvent({
      name: success ? 'form_submit_success' : 'form_submit_error',
      parameters: {
        form_name: formName,
        success: success,
        error_message: errorMessage,
        page_url: window.location.href
      },
      value: success ? 1 : 0
    });
  }

  public trackLeadGeneration(leadData: {
    email: string;
    source: string;
    value?: number;
    leadId?: string;
  }) {
    // Track as conversion
    this.trackConversion({
      name: 'generate_lead',
      parameters: {
        email_hash: this.hashEmail(leadData.email),
        lead_source: leadData.source,
        lead_id: leadData.leadId,
        page_url: window.location.href
      },
      value: leadData.value || 100, // Default lead value
      transactionId: leadData.leadId
    });

    // Also track Facebook lead event if consent given
    if (this.getMarketingConsent() && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'Lead', {
        content_name: 'Lead Generation',
        content_category: leadData.source,
        value: leadData.value || 100,
        currency: 'USD'
      });
    }
  }

  public trackDemoRequest(demoData: {
    framework: string;
    industry: string;
    email: string;
    businessName: string;
  }) {
    this.trackEvent({
      name: 'request_demo',
      parameters: {
        demo_type: demoData.framework,
        industry: demoData.industry,
        business_name: demoData.businessName,
        email_hash: this.hashEmail(demoData.email),
        page_url: window.location.href
      },
      value: 200 // Demo requests are high-value events
    });
  }

  public trackCalculatorUsage(calculatorData: {
    currentConversionRate: number;
    trafficVolume: number;
    estimatedImprovement: number;
    projectedValue: number;
  }) {
    this.trackEvent({
      name: 'use_calculator',
      parameters: {
        current_conversion_rate: calculatorData.currentConversionRate,
        traffic_volume: calculatorData.trafficVolume,
        estimated_improvement: calculatorData.estimatedImprovement,
        projected_value: calculatorData.projectedValue,
        page_url: window.location.href
      },
      value: calculatorData.projectedValue / 100 // Convert to reasonable value
    });
  }

  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.trackEvent(event);
      }
    }
  }

  private hashEmail(email: string): string {
    // Simple hash for privacy (in production, use a proper hashing library)
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private setupScrollTracking() {
    let maxScroll = 0;
    let scrollTimer: NodeJS.Timeout;

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track significant scroll milestones
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          this.trackEvent({
            name: 'scroll_depth',
            parameters: {
              scroll_depth: scrollPercent,
              page_url: window.location.href
            },
            value: scrollPercent
          });
        }
      }
    };

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(trackScroll, 100);
    });
  }

  private setupEngagementTracking() {
    let startTime = Date.now();
    let engaged = false;

    // Track engagement after 30 seconds
    setTimeout(() => {
      if (!engaged) {
        engaged = true;
        this.trackEvent({
          name: 'engaged_session',
          parameters: {
            time_on_page: 30,
            page_url: window.location.href
          },
          value: 1
        });
      }
    }, 30000);

    // Track exit intent
    document.addEventListener('mouseout', (e) => {
      if (e.clientY <= 0 && !engaged) {
        this.trackEvent({
          name: 'exit_intent',
          parameters: {
            time_on_page: Math.round((Date.now() - startTime) / 1000),
            page_url: window.location.href
          }
        });
      }
    });
  }

  private setupFormTracking() {
    // Track form interactions
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const form = target.closest('form');
        const formName = form?.id || form?.className || 'unknown_form';
        
        this.trackEvent({
          name: 'form_interaction',
          parameters: {
            form_name: formName,
            field_name: target.getAttribute('name') || target.id || 'unknown_field',
            page_url: window.location.href
          }
        });
      }
    });
  }
}

// Singleton instance
const analyticsManager = new AnalyticsManager();

// Convenience functions
export function trackEvent(event: AnalyticsEvent) {
  analyticsManager.trackEvent(event);
}

export function trackConversion(event: ConversionEvent) {
  analyticsManager.trackConversion(event);
}

export function setUserProperties(properties: UserProperties) {
  analyticsManager.setUserProperties(properties);
}

export function trackPageView(url?: string) {
  analyticsManager.trackPageView(url);
}

export function trackFormSubmission(formName: string, success: boolean, errorMessage?: string) {
  analyticsManager.trackFormSubmission(formName, success, errorMessage);
}

export function trackLeadGeneration(leadData: {
  email: string;
  source: string;
  value?: number;
  leadId?: string;
}) {
  analyticsManager.trackLeadGeneration(leadData);
}

export function trackDemoRequest(demoData: {
  framework: string;
  industry: string;
  email: string;
  businessName: string;
}) {
  analyticsManager.trackDemoRequest(demoData);
}

export function trackCalculatorUsage(calculatorData: {
  currentConversionRate: number;
  trafficVolume: number;
  estimatedImprovement: number;
  projectedValue: number;
}) {
  analyticsManager.trackCalculatorUsage(calculatorData);
}

export default analyticsManager;