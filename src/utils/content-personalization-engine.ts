/**
 * Dynamic Content Personalization Engine
 * Personalizes website content based on user behavior, demographics, lead score, and engagement patterns
 */

import { trackEvent } from './analytics-manager';
import { calculateLeadScore, type LeadProfile, type BehavioralData } from './lead-scoring-system';

export interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  conditions: PersonalizationCondition[];
  content: PersonalizedContent;
  priority: number;
  isActive: boolean;
  audience?: AudienceSegment;
  testGroup?: string;
}

export interface PersonalizationCondition {
  type: 'demographic' | 'behavioral' | 'score' | 'source' | 'time' | 'location' | 'device';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: any;
  weight?: number;
}

export interface PersonalizedContent {
  type: 'headline' | 'subheadline' | 'cta_text' | 'cta_color' | 'image' | 'testimonial' | 'case_study' | 'pricing_highlight' | 'form_fields' | 'social_proof' | 'urgency_message';
  selector: string;
  content: string | ContentVariation[];
  fallback: string;
  position?: 'replace' | 'prepend' | 'append';
  animation?: 'fade' | 'slide' | 'none';
}

export interface ContentVariation {
  id: string;
  content: string;
  weight: number;
  conditions?: PersonalizationCondition[];
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  industries?: string[];
  companySizes?: string[];
  jobTitles?: string[];
  sources?: string[];
  behaviors?: string[];
  minScore?: number;
  maxScore?: number;
}

export interface PersonalizationContext {
  userId: string;
  profile?: LeadProfile;
  behavioralData?: BehavioralData;
  leadScore?: any;
  session: {
    source: string;
    device: string;
    location?: string;
    timeOnSite: number;
    pagesViewed: number;
    isReturning: boolean;
  };
  currentPage: string;
  timestamp: Date;
}

class ContentPersonalizationEngine {
  private rules: Map<string, PersonalizationRule> = new Map();
  private appliedPersonalizations: Map<string, string[]> = new Map(); // userId -> ruleIds
  private context: PersonalizationContext | null = null;

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // High-value lead personalization
    this.addRule({
      id: 'high_value_lead_hero',
      name: 'High-Value Lead Hero Message',
      description: 'Personalized hero message for leads with high scores',
      conditions: [
        {
          type: 'score',
          field: 'total_score',
          operator: 'greater_than',
          value: 75,
          weight: 1.0
        }
      ],
      content: {
        type: 'headline',
        selector: '.hero-headline',
        content: 'Ready to Scale Your Success? Let\'s Optimize for Maximum Impact 🚀',
        fallback: 'Transform Your Website Into a Conversion Powerhouse',
        animation: 'fade'
      },
      priority: 1,
      isActive: true,
      audience: {
        id: 'high_value_leads',
        name: 'High-Value Leads',
        description: 'Leads with high engagement and qualification scores',
        minScore: 75
      }
    });

    // Industry-specific personalization
    this.addRule({
      id: 'saas_industry_messaging',
      name: 'SaaS Industry Messaging',
      description: 'Tailored messaging for SaaS companies',
      conditions: [
        {
          type: 'demographic',
          field: 'industry',
          operator: 'equals',
          value: 'saas-tech',
          weight: 1.0
        }
      ],
      content: {
        type: 'subheadline',
        selector: '.hero-subheadline',
        content: 'Increase your SaaS trial-to-paid conversion rates by 40%+ with proven CRO frameworks designed specifically for subscription businesses.',
        fallback: 'Our proven frameworks have helped 500+ businesses increase conversions by an average of 127%',
        animation: 'slide'
      },
      priority: 2,
      isActive: true,
      audience: {
        id: 'saas_companies',
        name: 'SaaS Companies',
        description: 'Software-as-a-Service businesses',
        industries: ['saas-tech']
      }
    });

    // E-commerce specific personalization
    this.addRule({
      id: 'ecommerce_industry_messaging',
      name: 'E-commerce Industry Messaging',
      description: 'Tailored messaging for e-commerce businesses',
      conditions: [
        {
          type: 'demographic',
          field: 'industry',
          operator: 'equals',
          value: 'ecommerce',
          weight: 1.0
        }
      ],
      content: {
        type: 'subheadline',
        selector: '.hero-subheadline',
        content: 'Boost your e-commerce conversion rates and average order value with shopping-focused optimization strategies that work.',
        fallback: 'Our proven frameworks have helped 500+ businesses increase conversions by an average of 127%',
        animation: 'slide'
      },
      priority: 2,
      isActive: true,
      audience: {
        id: 'ecommerce_companies',
        name: 'E-commerce Companies',
        description: 'Online retail businesses',
        industries: ['ecommerce']
      }
    });

    // Mobile-first personalization
    this.addRule({
      id: 'mobile_cta_optimization',
      name: 'Mobile CTA Optimization',
      description: 'Optimized CTA for mobile users',
      conditions: [
        {
          type: 'device',
          field: 'device_type',
          operator: 'equals',
          value: 'mobile',
          weight: 1.0
        }
      ],
      content: {
        type: 'cta_text',
        selector: '.primary-cta',
        content: 'Get Free Mobile Audit',
        fallback: 'Get Started Today',
        animation: 'none'
      },
      priority: 3,
      isActive: true,
      audience: {
        id: 'mobile_users',
        name: 'Mobile Users',
        description: 'Users browsing on mobile devices'
      }
    });

    // New visitor personalization
    this.addRule({
      id: 'new_visitor_social_proof',
      name: 'New Visitor Social Proof',
      description: 'Enhanced social proof for first-time visitors',
      conditions: [
        {
          type: 'behavioral',
          field: 'is_returning',
          operator: 'equals',
          value: false,
          weight: 1.0
        }
      ],
      content: {
        type: 'social_proof',
        selector: '.social-proof-container',
        content: '<div class="trust-indicators"><span class="stat">500+ Websites Optimized</span><span class="stat">127% Avg. Conversion Increase</span><span class="stat">$2M+ Revenue Generated</span></div>',
        fallback: '',
        position: 'prepend',
        animation: 'fade'
      },
      priority: 4,
      isActive: true,
      audience: {
        id: 'new_visitors',
        name: 'New Visitors',
        description: 'First-time website visitors'
      }
    });

    // High-intent behavioral personalization
    this.addRule({
      id: 'high_intent_urgency',
      name: 'High Intent Urgency Messaging',
      description: 'Urgency messaging for users showing high buying intent',
      conditions: [
        {
          type: 'behavioral',
          field: 'pages_viewed',
          operator: 'greater_than',
          value: 3,
          weight: 0.5
        },
        {
          type: 'behavioral',
          field: 'time_on_site',
          operator: 'greater_than',
          value: 180, // 3 minutes
          weight: 0.5
        }
      ],
      content: {
        type: 'urgency_message',
        selector: '.urgency-container',
        content: '<div class="urgency-banner">🔥 Limited Time: Book your free consultation this week and get a bonus conversion audit (valued at $500)</div>',
        fallback: '',
        position: 'prepend',
        animation: 'slide'
      },
      priority: 5,
      isActive: true,
      audience: {
        id: 'high_intent_users',
        name: 'High Intent Users',
        description: 'Users showing strong buying signals'
      }
    });

    // Returning visitor personalization
    this.addRule({
      id: 'returning_visitor_welcome',
      name: 'Returning Visitor Welcome',
      description: 'Welcome back message for returning visitors',
      conditions: [
        {
          type: 'behavioral',
          field: 'is_returning',
          operator: 'equals',
          value: true,
          weight: 1.0
        }
      ],
      content: {
        type: 'headline',
        selector: '.hero-headline',
        content: 'Welcome Back! Ready to Take the Next Step? 👋',
        fallback: 'Transform Your Website Into a Conversion Powerhouse',
        animation: 'fade'
      },
      priority: 6,
      isActive: true,
      audience: {
        id: 'returning_visitors',
        name: 'Returning Visitors',
        description: 'Users who have visited before'
      }
    });

    // Company size-based pricing highlight
    this.addRule({
      id: 'enterprise_pricing_highlight',
      name: 'Enterprise Pricing Highlight',
      description: 'Highlight enterprise pricing for large companies',
      conditions: [
        {
          type: 'demographic',
          field: 'company_size',
          operator: 'equals',
          value: 'enterprise',
          weight: 1.0
        }
      ],
      content: {
        type: 'pricing_highlight',
        selector: '.pricing-enterprise',
        content: '<div class="recommended-badge">Recommended for You</div>',
        fallback: '',
        position: 'prepend',
        animation: 'fade'
      },
      priority: 7,
      isActive: true,
      audience: {
        id: 'enterprise_companies',
        name: 'Enterprise Companies',
        description: 'Large enterprise organizations',
        companySizes: ['enterprise']
      }
    });

    // Geographic personalization (example)
    this.addRule({
      id: 'timezone_scheduling',
      name: 'Timezone-based Scheduling',
      description: 'Adjust scheduling CTAs based on user timezone',
      conditions: [
        {
          type: 'time',
          field: 'local_hour',
          operator: 'in_range',
          value: [9, 17], // Business hours
          weight: 1.0
        }
      ],
      content: {
        type: 'cta_text',
        selector: '.schedule-call-cta',
        content: 'Schedule a Call Today',
        fallback: 'Schedule a Call',
        animation: 'none'
      },
      priority: 8,
      isActive: true,
      audience: {
        id: 'business_hours_users',
        name: 'Business Hours Users',
        description: 'Users browsing during business hours'
      }
    });

    console.log('Content Personalization: Default rules initialized');
  }

  // Public Methods
  public addRule(rule: PersonalizationRule): boolean {
    try {
      if (!this.validateRule(rule)) {
        throw new Error('Invalid personalization rule');
      }

      this.rules.set(rule.id, rule);
      console.log('Content Personalization: Rule added successfully', rule.id);
      return true;
    } catch (error) {
      console.error('Content Personalization: Failed to add rule', error);
      return false;
    }
  }

  public removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  public activateRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.isActive = true;
      return true;
    }
    return false;
  }

  public deactivateRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.isActive = false;
      return true;
    }
    return false;
  }

  public async personalizeContent(context: PersonalizationContext): Promise<boolean> {
    try {
      this.context = context;
      
      // Find matching rules
      const matchingRules = this.findMatchingRules(context);
      
      if (matchingRules.length === 0) {
        console.log('Content Personalization: No matching rules found');
        return false;
      }

      // Sort by priority and apply personalizations
      const sortedRules = matchingRules.sort((a, b) => a.priority - b.priority);
      
      let applicationsApplied = 0;
      for (const rule of sortedRules) {
        const applied = await this.applyPersonalization(rule, context);
        if (applied) {
          applicationsApplied++;
          
          // Track personalization applied
          if (!this.appliedPersonalizations.has(context.userId)) {
            this.appliedPersonalizations.set(context.userId, []);
          }
          this.appliedPersonalizations.get(context.userId)!.push(rule.id);
        }
      }

      // Track personalization event
      trackEvent({
        name: 'content_personalized',
        parameters: {
          user_id: context.userId,
          personalizations_applied: applicationsApplied,
          rules_matched: matchingRules.length,
          page_url: context.currentPage
        },
        value: applicationsApplied
      });

      console.log('Content Personalization: Applied personalizations', {
        rulesApplied: applicationsApplied,
        rulesMatched: matchingRules.length
      });

      return applicationsApplied > 0;
    } catch (error) {
      console.error('Content Personalization: Failed to personalize content', error);
      return false;
    }
  }

  public getAppliedPersonalizations(userId: string): string[] {
    return this.appliedPersonalizations.get(userId) || [];
  }

  public getActiveRules(): PersonalizationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.isActive);
  }

  // Private Methods
  private findMatchingRules(context: PersonalizationContext): PersonalizationRule[] {
    const activeRules = this.getActiveRules();
    
    return activeRules.filter(rule => {
      return this.evaluateRuleConditions(rule, context);
    });
  }

  private evaluateRuleConditions(rule: PersonalizationRule, context: PersonalizationContext): boolean {
    if (rule.conditions.length === 0) return false;

    // Calculate weighted score for conditions
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const condition of rule.conditions) {
      const weight = condition.weight || 1.0;
      totalWeight += weight;

      if (this.evaluateCondition(condition, context)) {
        matchedWeight += weight;
      }
    }

    // Rule matches if more than 50% of weighted conditions are met
    return (matchedWeight / totalWeight) > 0.5;
  }

  private evaluateCondition(condition: PersonalizationCondition, context: PersonalizationContext): boolean {
    const fieldValue = this.getContextValue(condition.type, condition.field, context);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'in_range':
        const numValue = Number(fieldValue);
        const [min, max] = condition.value;
        return numValue >= min && numValue <= max;
      default:
        return false;
    }
  }

  private getContextValue(type: string, field: string, context: PersonalizationContext): any {
    switch (type) {
      case 'demographic':
        return context.profile?.[field as keyof LeadProfile];
      case 'behavioral':
        return context.session[field as keyof typeof context.session] || 
               context.behavioralData?.[field as keyof BehavioralData];
      case 'score':
        return context.leadScore?.[field];
      case 'source':
        return context.session.source;
      case 'device':
        if (field === 'device_type') return context.session.device;
        return context.session[field as keyof typeof context.session];
      case 'time':
        if (field === 'local_hour') return new Date().getHours();
        return context.timestamp;
      case 'location':
        return context.session.location;
      default:
        return undefined;
    }
  }

  private async applyPersonalization(rule: PersonalizationRule, context: PersonalizationContext): Promise<boolean> {
    try {
      const { content } = rule;
      const elements = document.querySelectorAll(content.selector);
      
      if (elements.length === 0) {
        console.warn('Content Personalization: No elements found for selector', content.selector);
        return false;
      }

      // Get personalized content
      const personalizedContent = this.getPersonalizedContent(content, context);
      
      // Apply to each matching element
      elements.forEach((element, index) => {
        this.applyContentToElement(element as HTMLElement, content, personalizedContent, index);
      });

      // Track specific personalization applied
      trackEvent({
        name: 'personalization_applied',
        parameters: {
          rule_id: rule.id,
          rule_name: rule.name,
          content_type: content.type,
          selector: content.selector,
          elements_count: elements.length,
          user_id: context.userId
        }
      });

      return true;
    } catch (error) {
      console.error('Content Personalization: Failed to apply personalization', error);
      return false;
    }
  }

  private getPersonalizedContent(content: PersonalizedContent, context: PersonalizationContext): string {
    if (typeof content.content === 'string') {
      return this.processContentTemplate(content.content, context);
    } else if (Array.isArray(content.content)) {
      // Handle content variations
      for (const variation of content.content) {
        if (!variation.conditions || this.evaluateVariationConditions(variation.conditions, context)) {
          return this.processContentTemplate(variation.content, context);
        }
      }
    }
    
    return this.processContentTemplate(content.fallback, context);
  }

  private evaluateVariationConditions(conditions: PersonalizationCondition[], context: PersonalizationContext): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, context));
  }

  private processContentTemplate(template: string, context: PersonalizationContext): string {
    let processed = template;

    // Replace common placeholders
    if (context.profile) {
      processed = processed.replace(/{{firstName}}/g, context.profile.firstName || '');
      processed = processed.replace(/{{lastName}}/g, context.profile.lastName || '');
      processed = processed.replace(/{{company}}/g, context.profile.company || 'your business');
      processed = processed.replace(/{{industry}}/g, context.profile.industry || '');
    }

    // Replace score placeholders
    if (context.leadScore) {
      processed = processed.replace(/{{leadScore}}/g, context.leadScore.total?.toString() || '0');
      processed = processed.replace(/{{leadGrade}}/g, context.leadScore.grade || 'N/A');
    }

    // Replace session placeholders
    processed = processed.replace(/{{timeOnSite}}/g, Math.round(context.session.timeOnSite / 60).toString());
    processed = processed.replace(/{{pagesViewed}}/g, context.session.pagesViewed.toString());
    processed = processed.replace(/{{device}}/g, context.session.device);
    processed = processed.replace(/{{source}}/g, context.session.source);

    return processed;
  }

  private applyContentToElement(element: HTMLElement, content: PersonalizedContent, personalizedContent: string, index: number) {
    const applyWithAnimation = () => {
      switch (content.position) {
        case 'prepend':
          element.insertAdjacentHTML('afterbegin', personalizedContent);
          break;
        case 'append':
          element.insertAdjacentHTML('beforeend', personalizedContent);
          break;
        case 'replace':
        default:
          if (content.type === 'image' && element.tagName === 'IMG') {
            (element as HTMLImageElement).src = personalizedContent;
          } else {
            element.innerHTML = personalizedContent;
          }
          break;
      }

      // Mark element as personalized
      element.setAttribute('data-personalized', 'true');
      element.setAttribute('data-personalization-type', content.type);
    };

    // Apply animation
    if (content.animation === 'fade') {
      element.style.opacity = '0';
      element.style.transition = 'opacity 0.5s ease-in-out';
      
      setTimeout(() => {
        applyWithAnimation();
        element.style.opacity = '1';
      }, index * 100); // Stagger animations
    } else if (content.animation === 'slide') {
      element.style.transform = 'translateY(-20px)';
      element.style.opacity = '0';
      element.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
      
      setTimeout(() => {
        applyWithAnimation();
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
      }, index * 100);
    } else {
      applyWithAnimation();
    }
  }

  private validateRule(rule: PersonalizationRule): boolean {
    if (!rule.id || !rule.name || !rule.content) {
      return false;
    }

    if (!rule.content.selector || !rule.content.fallback) {
      return false;
    }

    if (rule.conditions.length === 0) {
      console.warn('Content Personalization: Rule has no conditions', rule.id);
    }

    return true;
  }
}

// Singleton instance
const contentPersonalizationEngine = new ContentPersonalizationEngine();

// Convenience functions
export function addPersonalizationRule(rule: PersonalizationRule): boolean {
  return contentPersonalizationEngine.addRule(rule);
}

export function personalizePageContent(context: PersonalizationContext): Promise<boolean> {
  return contentPersonalizationEngine.personalizeContent(context);
}

export function getAppliedPersonalizations(userId: string): string[] {
  return contentPersonalizationEngine.getAppliedPersonalizations(userId);
}

export function getActivePersonalizationRules(): PersonalizationRule[] {
  return contentPersonalizationEngine.getActiveRules();
}

// Helper function to create personalization context
export function createPersonalizationContext(
  userId: string,
  profile?: LeadProfile,
  behavioralData?: BehavioralData,
  leadScore?: any
): PersonalizationContext {
  const session = {
    source: getTrafficSource(),
    device: getDeviceType(),
    location: getUserLocation(),
    timeOnSite: getTimeOnSite(),
    pagesViewed: getPageViewCount(),
    isReturning: isReturningUser()
  };

  return {
    userId,
    profile,
    behavioralData,
    leadScore,
    session,
    currentPage: window.location.href,
    timestamp: new Date()
  };
}

// Helper functions
function getTrafficSource(): string {
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  if (referrer.includes('google')) return 'google';
  if (referrer.includes('facebook')) return 'facebook';
  if (referrer.includes('linkedin')) return 'linkedin';
  if (referrer.includes('twitter')) return 'twitter';
  return 'referral';
}

function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getUserLocation(): string | undefined {
  // In production, you would use a geolocation service
  return 'US'; // placeholder
}

function getTimeOnSite(): number {
  const startTime = sessionStorage.getItem('page_start_time');
  if (startTime) {
    return Math.round((Date.now() - parseInt(startTime)) / 1000);
  }
  return 0;
}

function getPageViewCount(): number {
  const count = sessionStorage.getItem('page_view_count');
  return count ? parseInt(count) : 1;
}

function isReturningUser(): boolean {
  return !!localStorage.getItem('returning_user');
}

export default contentPersonalizationEngine;