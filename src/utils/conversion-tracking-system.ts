/**
 * Conversion Tracking System
 * Manages tracking pixels and conversion events across multiple advertising platforms
 */

import { trackEvent } from './analytics-manager';

export interface ConversionPixel {
  id: string;
  name: string;
  platform: 'google_ads' | 'facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'bing' | 'custom';
  pixelId: string;
  conversionId?: string;
  conversionLabel?: string;
  customEventName?: string;
  isActive: boolean;
  trackingMethods: TrackingMethod[];
  conditions?: PixelCondition[];
}

export interface TrackingMethod {
  type: 'pageview' | 'click' | 'form_submit' | 'purchase' | 'lead' | 'custom_event' | 'timer';
  selector?: string;
  eventName?: string;
  value?: number;
  currency?: string;
  delay?: number;
  customParameters?: Record<string, any>;
}

export interface PixelCondition {
  type: 'url' | 'referrer' | 'utm_source' | 'utm_campaign' | 'device' | 'user_agent' | 'custom';
  operator: 'equals' | 'contains' | 'starts_with' | 'matches_regex';
  value: string;
  field?: string;
}

export interface ConversionEvent {
  pixelId: string;
  platform: string;
  eventType: string;
  value?: number;
  currency?: string;
  orderId?: string;
  customParameters?: Record<string, any>;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

class ConversionTrackingSystem {
  private pixels: Map<string, ConversionPixel> = new Map();
  private firedEvents: Set<string> = new Set(); // Prevent duplicate events
  private eventQueue: ConversionEvent[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeDefaultPixels();
    this.setupEventListeners();
  }

  private initializeDefaultPixels() {
    // Google Ads conversion tracking
    this.addPixel({
      id: 'google_ads_lead',
      name: 'Google Ads Lead Conversion',
      platform: 'google_ads',
      pixelId: process.env.PUBLIC_GOOGLE_ADS_ID || 'AW-XXXXXXXXX',
      conversionId: process.env.PUBLIC_GOOGLE_CONVERSION_ID || 'XXXXXXXXX',
      conversionLabel: process.env.PUBLIC_GOOGLE_CONVERSION_LABEL || 'XXXXXXXXX',
      isActive: true,
      trackingMethods: [
        {
          type: 'form_submit',
          selector: 'form[id*="contact"], form[id*="lead"]',
          value: 100,
          currency: 'USD'
        },
        {
          type: 'click',
          selector: '.demo-request-btn, .consultation-btn',
          value: 150,
          currency: 'USD'
        }
      ],
      conditions: [
        {
          type: 'utm_source',
          operator: 'equals',
          value: 'google'
        }
      ]
    });

    // Facebook/Meta pixel
    this.addPixel({
      id: 'facebook_lead',
      name: 'Facebook Lead Conversion',
      platform: 'facebook',
      pixelId: process.env.PUBLIC_FACEBOOK_PIXEL_ID || 'XXXXXXXXXXXXXXX',
      customEventName: 'Lead',
      isActive: true,
      trackingMethods: [
        {
          type: 'form_submit',
          selector: 'form[id*="contact"], form[id*="lead"]',
          value: 100,
          currency: 'USD',
          customParameters: {
            content_name: 'Lead Generation Form',
            content_category: 'lead_generation'
          }
        },
        {
          type: 'custom_event',
          eventName: 'demo_request',
          value: 200,
          currency: 'USD',
          customParameters: {
            content_name: 'Demo Request',
            content_category: 'high_intent'
          }
        }
      ],
      conditions: [
        {
          type: 'utm_source',
          operator: 'contains',
          value: 'facebook'
        }
      ]
    });

    // LinkedIn conversion tracking
    this.addPixel({
      id: 'linkedin_lead',
      name: 'LinkedIn Lead Conversion',
      platform: 'linkedin',
      pixelId: process.env.PUBLIC_LINKEDIN_PARTNER_ID || 'XXXXXXX',
      conversionId: process.env.PUBLIC_LINKEDIN_CONVERSION_ID || 'XXXXXXX',
      isActive: true,
      trackingMethods: [
        {
          type: 'form_submit',
          selector: 'form[id*="contact"], form[id*="lead"]',
          value: 120,
          currency: 'USD'
        }
      ],
      conditions: [
        {
          type: 'utm_source',
          operator: 'equals',
          value: 'linkedin'
        }
      ]
    });

    // Microsoft Ads (Bing)
    this.addPixel({
      id: 'microsoft_ads_lead',
      name: 'Microsoft Ads Lead Conversion',
      platform: 'bing',
      pixelId: process.env.PUBLIC_MICROSOFT_UET_ID || 'XXXXXXX',
      customEventName: 'lead',
      isActive: true,
      trackingMethods: [
        {
          type: 'form_submit',
          selector: 'form[id*="contact"], form[id*="lead"]',
          value: 100,
          currency: 'USD'
        }
      ],
      conditions: [
        {
          type: 'utm_source',
          operator: 'equals',
          value: 'bing'
        }
      ]
    });

    // Generic high-value conversion pixel (for retargeting)
    this.addPixel({
      id: 'high_value_action',
      name: 'High-Value Action Tracking',
      platform: 'custom',
      pixelId: 'high_value_actions',
      isActive: true,
      trackingMethods: [
        {
          type: 'click',
          selector: '.pricing-card, .book-consultation',
          value: 250,
          currency: 'USD'
        },
        {
          type: 'timer',
          delay: 180000, // 3 minutes
          value: 50,
          currency: 'USD',
          customParameters: {
            engagement_level: 'high'
          }
        }
      ]
    });

    // Calculator completion tracking
    this.addPixel({
      id: 'calculator_completion',
      name: 'ROI Calculator Completion',
      platform: 'custom',
      pixelId: 'calculator_events',
      isActive: true,
      trackingMethods: [
        {
          type: 'custom_event',
          eventName: 'calculator_completed',
          value: 200,
          currency: 'USD',
          customParameters: {
            tool_type: 'roi_calculator',
            completion_stage: 'full'
          }
        }
      ]
    });

    console.log('Conversion Tracking: Default pixels initialized');
  }

  private setupEventListeners() {
    // Wait for consent before initializing tracking
    this.checkConsentAndInitialize();

    // Listen for custom conversion events
    document.addEventListener('aktivcro:conversion_event', (event: any) => {
      this.handleCustomConversionEvent(event.detail);
    });

    // Listen for form submissions
    document.addEventListener('submit', (event) => {
      this.handleFormSubmission(event);
    });

    // Listen for clicks
    document.addEventListener('click', (event) => {
      this.handleClickEvent(event);
    });

    // Listen for page view conversions
    this.handlePageViewConversions();

    // Set up timer-based conversions
    this.setupTimerConversions();

    console.log('Conversion Tracking: Event listeners set up');
  }

  private checkConsentAndInitialize() {
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('aktivcro-cookie-preferences');
        if (consent) {
          const preferences = JSON.parse(consent);
          if (preferences.marketing) {
            this.initializeTrackingScripts();
            return true;
          }
        }
      } catch (error) {
        console.error('Conversion Tracking: Failed to check consent', error);
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

  private initializeTrackingScripts() {
    if (this.isInitialized) return;

    try {
      // Initialize Google Ads gtag if not already initialized
      this.initializeGoogleAds();
      
      // Initialize Facebook Pixel if not already initialized
      this.initializeFacebookPixel();
      
      // Initialize LinkedIn Insight Tag
      this.initializeLinkedInPixel();
      
      // Initialize Microsoft UET
      this.initializeMicrosoftUET();

      this.isInitialized = true;
      console.log('Conversion Tracking: All tracking scripts initialized');

      // Process queued events
      this.processEventQueue();
    } catch (error) {
      console.error('Conversion Tracking: Failed to initialize scripts', error);
    }
  }

  private initializeGoogleAds() {
    const googleAdsId = process.env.PUBLIC_GOOGLE_ADS_ID;
    if (!googleAdsId || typeof (window as any).gtag === 'function') return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function(...args: any[]) {
      (window as any).dataLayer.push(args);
    };

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', googleAdsId);

    console.log('Conversion Tracking: Google Ads initialized');
  }

  private initializeFacebookPixel() {
    const facebookPixelId = process.env.PUBLIC_FACEBOOK_PIXEL_ID;
    if (!facebookPixelId || typeof (window as any).fbq === 'function') return;

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

    (window as any).fbq('init', facebookPixelId);

    console.log('Conversion Tracking: Facebook Pixel initialized');
  }

  private initializeLinkedInPixel() {
    const linkedinPartnerId = process.env.PUBLIC_LINKEDIN_PARTNER_ID;
    if (!linkedinPartnerId) return;

    (window as any)._linkedin_partner_id = linkedinPartnerId;
    (window as any)._linkedin_data_partner_ids = (window as any)._linkedin_data_partner_ids || [];
    (window as any)._linkedin_data_partner_ids.push(linkedinPartnerId);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(script);

    console.log('Conversion Tracking: LinkedIn Pixel initialized');
  }

  private initializeMicrosoftUET() {
    const microsoftUETId = process.env.PUBLIC_MICROSOFT_UET_ID;
    if (!microsoftUETId) return;

    (window as any).uetq = (window as any).uetq || [];
    (window as any).uetq.push('event', 'page_view', {});

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://bat.bing.com/bat.js';
    document.head.appendChild(script);

    console.log('Conversion Tracking: Microsoft UET initialized');
  }

  // Public Methods
  public addPixel(pixel: ConversionPixel): boolean {
    try {
      if (!this.validatePixel(pixel)) {
        throw new Error('Invalid pixel configuration');
      }

      this.pixels.set(pixel.id, pixel);
      console.log('Conversion Tracking: Pixel added successfully', pixel.id);
      return true;
    } catch (error) {
      console.error('Conversion Tracking: Failed to add pixel', error);
      return false;
    }
  }

  public removePixel(pixelId: string): boolean {
    return this.pixels.delete(pixelId);
  }

  public activatePixel(pixelId: string): boolean {
    const pixel = this.pixels.get(pixelId);
    if (pixel) {
      pixel.isActive = true;
      return true;
    }
    return false;
  }

  public deactivatePixel(pixelId: string): boolean {
    const pixel = this.pixels.get(pixelId);
    if (pixel) {
      pixel.isActive = false;
      return true;
    }
    return false;
  }

  public fireConversionEvent(eventData: {
    pixelId?: string;
    eventType: string;
    value?: number;
    currency?: string;
    customParameters?: Record<string, any>;
  }): boolean {
    try {
      const relevantPixels = this.findRelevantPixels(eventData);
      
      let successCount = 0;
      for (const pixel of relevantPixels) {
        const success = this.firePixelEvent(pixel, eventData);
        if (success) successCount++;
      }

      console.log('Conversion Tracking: Fired conversion events', {
        eventType: eventData.eventType,
        pixelsTriggered: successCount,
        totalRelevantPixels: relevantPixels.length
      });

      return successCount > 0;
    } catch (error) {
      console.error('Conversion Tracking: Failed to fire conversion event', error);
      return false;
    }
  }

  public getActivePixels(): ConversionPixel[] {
    return Array.from(this.pixels.values()).filter(pixel => pixel.isActive);
  }

  public getConversionEvents(): ConversionEvent[] {
    return [...this.eventQueue];
  }

  // Private Methods
  private findRelevantPixels(eventData: { pixelId?: string; eventType: string }): ConversionPixel[] {
    const activePixels = this.getActivePixels();
    
    if (eventData.pixelId) {
      const specificPixel = this.pixels.get(eventData.pixelId);
      return specificPixel && specificPixel.isActive ? [specificPixel] : [];
    }

    return activePixels.filter(pixel => {
      // Check if pixel has matching tracking method
      const hasMatchingMethod = pixel.trackingMethods.some(method => 
        method.type === eventData.eventType || 
        method.eventName === eventData.eventType
      );

      // Check conditions
      const meetsConditions = this.checkPixelConditions(pixel);

      return hasMatchingMethod && meetsConditions;
    });
  }

  private checkPixelConditions(pixel: ConversionPixel): boolean {
    if (!pixel.conditions || pixel.conditions.length === 0) return true;

    return pixel.conditions.every(condition => this.evaluateCondition(condition));
  }

  private evaluateCondition(condition: PixelCondition): boolean {
    let value: string;

    switch (condition.type) {
      case 'url':
        value = window.location.href;
        break;
      case 'referrer':
        value = document.referrer;
        break;
      case 'utm_source':
        value = new URLSearchParams(window.location.search).get('utm_source') || '';
        break;
      case 'utm_campaign':
        value = new URLSearchParams(window.location.search).get('utm_campaign') || '';
        break;
      case 'device':
        value = window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop';
        break;
      case 'user_agent':
        value = navigator.userAgent;
        break;
      case 'custom':
        value = condition.field ? (window as any)[condition.field] || '' : '';
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return value.includes(condition.value);
      case 'starts_with':
        return value.startsWith(condition.value);
      case 'matches_regex':
        return new RegExp(condition.value).test(value);
      default:
        return false;
    }
  }

  private firePixelEvent(pixel: ConversionPixel, eventData: any): boolean {
    if (!this.isInitialized) {
      // Queue event for later processing
      this.eventQueue.push({
        pixelId: pixel.id,
        platform: pixel.platform,
        eventType: eventData.eventType,
        value: eventData.value,
        currency: eventData.currency,
        customParameters: eventData.customParameters,
        timestamp: new Date(),
        success: false
      });
      return false;
    }

    try {
      const eventKey = `${pixel.id}_${eventData.eventType}_${Date.now()}`;
      if (this.firedEvents.has(eventKey)) {
        console.log('Conversion Tracking: Duplicate event prevented', eventKey);
        return false;
      }

      let success = false;

      switch (pixel.platform) {
        case 'google_ads':
          success = this.fireGoogleAdsConversion(pixel, eventData);
          break;
        case 'facebook':
          success = this.fireFacebookConversion(pixel, eventData);
          break;
        case 'linkedin':
          success = this.fireLinkedInConversion(pixel, eventData);
          break;
        case 'bing':
          success = this.fireMicrosoftConversion(pixel, eventData);
          break;
        case 'custom':
          success = this.fireCustomConversion(pixel, eventData);
          break;
        default:
          console.warn('Conversion Tracking: Unknown platform', pixel.platform);
          break;
      }

      if (success) {
        this.firedEvents.add(eventKey);
        
        // Track the conversion event in analytics
        trackEvent({
          name: 'conversion_pixel_fired',
          parameters: {
            pixel_id: pixel.id,
            platform: pixel.platform,
            event_type: eventData.eventType,
            value: eventData.value || 0
          },
          value: eventData.value || 0
        });
      }

      // Log event
      this.eventQueue.push({
        pixelId: pixel.id,
        platform: pixel.platform,
        eventType: eventData.eventType,
        value: eventData.value,
        currency: eventData.currency,
        customParameters: eventData.customParameters,
        timestamp: new Date(),
        success
      });

      return success;
    } catch (error) {
      console.error('Conversion Tracking: Failed to fire pixel event', error);
      return false;
    }
  }

  private fireGoogleAdsConversion(pixel: ConversionPixel, eventData: any): boolean {
    if (typeof (window as any).gtag !== 'function') return false;

    try {
      (window as any).gtag('event', 'conversion', {
        send_to: `${pixel.conversionId}/${pixel.conversionLabel}`,
        value: eventData.value || 0,
        currency: eventData.currency || 'USD',
        transaction_id: eventData.orderId || `conv_${Date.now()}`,
        ...eventData.customParameters
      });

      console.log('Conversion Tracking: Google Ads conversion fired', pixel.id);
      return true;
    } catch (error) {
      console.error('Conversion Tracking: Google Ads conversion failed', error);
      return false;
    }
  }

  private fireFacebookConversion(pixel: ConversionPixel, eventData: any): boolean {
    if (typeof (window as any).fbq !== 'function') return false;

    try {
      const eventName = pixel.customEventName || 'Purchase';
      
      (window as any).fbq('track', eventName, {
        value: eventData.value || 0,
        currency: eventData.currency || 'USD',
        content_ids: [eventData.orderId || `conv_${Date.now()}`],
        content_type: 'product',
        ...eventData.customParameters
      });

      console.log('Conversion Tracking: Facebook conversion fired', pixel.id);
      return true;
    } catch (error) {
      console.error('Conversion Tracking: Facebook conversion failed', error);
      return false;
    }
  }

  private fireLinkedInConversion(pixel: ConversionPixel, eventData: any): boolean {
    try {
      if (typeof (window as any).lintrk === 'function') {
        (window as any).lintrk('track', {
          conversion_id: pixel.conversionId,
          conversion_value: eventData.value || 0,
          conversion_currency: eventData.currency || 'USD'
        });
      }

      console.log('Conversion Tracking: LinkedIn conversion fired', pixel.id);
      return true;
    } catch (error) {
      console.error('Conversion Tracking: LinkedIn conversion failed', error);
      return false;
    }
  }

  private fireMicrosoftConversion(pixel: ConversionPixel, eventData: any): boolean {
    try {
      if (typeof (window as any).uetq !== 'undefined') {
        (window as any).uetq.push('event', pixel.customEventName || 'conversion', {
          event_category: 'conversion',
          event_label: eventData.eventType,
          event_value: eventData.value || 0,
          revenue_value: eventData.value || 0,
          currency: eventData.currency || 'USD'
        });
      }

      console.log('Conversion Tracking: Microsoft conversion fired', pixel.id);
      return true;
    } catch (error) {
      console.error('Conversion Tracking: Microsoft conversion failed', error);
      return false;
    }
  }

  private fireCustomConversion(pixel: ConversionPixel, eventData: any): boolean {
    try {
      // Custom tracking logic - could send to webhook, custom analytics, etc.
      console.log('Conversion Tracking: Custom conversion fired', {
        pixelId: pixel.id,
        eventType: eventData.eventType,
        value: eventData.value,
        parameters: eventData.customParameters
      });

      // Example: Send to custom webhook
      if (process.env.PUBLIC_CUSTOM_CONVERSION_WEBHOOK) {
        fetch(process.env.PUBLIC_CUSTOM_CONVERSION_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pixelId: pixel.id,
            eventType: eventData.eventType,
            value: eventData.value,
            currency: eventData.currency,
            timestamp: new Date().toISOString(),
            ...eventData.customParameters
          })
        }).catch(console.error);
      }

      return true;
    } catch (error) {
      console.error('Conversion Tracking: Custom conversion failed', error);
      return false;
    }
  }

  private handleCustomConversionEvent(eventData: any) {
    this.fireConversionEvent(eventData);
  }

  private handleFormSubmission(event: Event) {
    const form = event.target as HTMLFormElement;
    const formId = form.id || form.className;
    
    // Find relevant pixels for form submissions
    const relevantPixels = this.getActivePixels().filter(pixel => 
      pixel.trackingMethods.some(method => 
        method.type === 'form_submit' && 
        (!method.selector || form.matches(method.selector))
      )
    );

    relevantPixels.forEach(pixel => {
      const method = pixel.trackingMethods.find(m => 
        m.type === 'form_submit' && 
        (!m.selector || form.matches(m.selector))
      );

      if (method) {
        setTimeout(() => {
          this.firePixelEvent(pixel, {
            eventType: 'form_submit',
            value: method.value,
            currency: method.currency,
            customParameters: {
              form_id: formId,
              ...method.customParameters
            }
          });
        }, method.delay || 100);
      }
    });
  }

  private handleClickEvent(event: Event) {
    const target = event.target as Element;
    
    // Find relevant pixels for click events
    const relevantPixels = this.getActivePixels().filter(pixel => 
      pixel.trackingMethods.some(method => 
        method.type === 'click' && 
        method.selector && 
        target.matches(method.selector)
      )
    );

    relevantPixels.forEach(pixel => {
      const method = pixel.trackingMethods.find(m => 
        m.type === 'click' && 
        m.selector && 
        target.matches(m.selector)
      );

      if (method) {
        setTimeout(() => {
          this.firePixelEvent(pixel, {
            eventType: 'click',
            value: method.value,
            currency: method.currency,
            customParameters: {
              element_text: target.textContent?.trim(),
              element_id: target.id,
              ...method.customParameters
            }
          });
        }, method.delay || 0);
      }
    });
  }

  private handlePageViewConversions() {
    // Fire pageview conversions immediately
    const pageviewPixels = this.getActivePixels().filter(pixel =>
      pixel.trackingMethods.some(method => method.type === 'pageview')
    );

    pageviewPixels.forEach(pixel => {
      const method = pixel.trackingMethods.find(m => m.type === 'pageview');
      if (method) {
        this.firePixelEvent(pixel, {
          eventType: 'pageview',
          value: method.value,
          currency: method.currency,
          customParameters: method.customParameters
        });
      }
    });
  }

  private setupTimerConversions() {
    const timerPixels = this.getActivePixels().filter(pixel =>
      pixel.trackingMethods.some(method => method.type === 'timer')
    );

    timerPixels.forEach(pixel => {
      const method = pixel.trackingMethods.find(m => m.type === 'timer');
      if (method && method.delay) {
        setTimeout(() => {
          this.firePixelEvent(pixel, {
            eventType: 'timer',
            value: method.value,
            currency: method.currency,
            customParameters: {
              timer_duration: method.delay,
              ...method.customParameters
            }
          });
        }, method.delay);
      }
    });
  }

  private processEventQueue() {
    const queuedEvents = [...this.eventQueue.filter(event => !event.success)];
    queuedEvents.forEach(event => {
      const pixel = this.pixels.get(event.pixelId);
      if (pixel) {
        this.firePixelEvent(pixel, {
          eventType: event.eventType,
          value: event.value,
          currency: event.currency,
          customParameters: event.customParameters
        });
      }
    });
  }

  private validatePixel(pixel: ConversionPixel): boolean {
    if (!pixel.id || !pixel.name || !pixel.platform || !pixel.pixelId) {
      return false;
    }

    if (pixel.trackingMethods.length === 0) {
      console.warn('Conversion Tracking: Pixel has no tracking methods', pixel.id);
    }

    return true;
  }
}

// Singleton instance
const conversionTrackingSystem = new ConversionTrackingSystem();

// Convenience functions
export function addConversionPixel(pixel: ConversionPixel): boolean {
  return conversionTrackingSystem.addPixel(pixel);
}

export function fireConversionEvent(eventData: {
  pixelId?: string;
  eventType: string;
  value?: number;
  currency?: string;
  customParameters?: Record<string, any>;
}): boolean {
  return conversionTrackingSystem.fireConversionEvent(eventData);
}

export function getActiveConversionPixels(): ConversionPixel[] {
  return conversionTrackingSystem.getActivePixels();
}

export function getConversionEventHistory(): ConversionEvent[] {
  return conversionTrackingSystem.getConversionEvents();
}

// Event dispatch helpers
export function dispatchConversionEvent(eventData: any) {
  document.dispatchEvent(new CustomEvent('aktivcro:conversion_event', {
    detail: eventData
  }));
}

export default conversionTrackingSystem;