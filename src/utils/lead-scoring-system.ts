/**
 * Advanced Lead Scoring System
 * Calculates lead quality scores based on behavioral, demographic, and engagement data
 */

import { trackEvent } from './analytics-manager';

export interface LeadProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  phone?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BehavioralData {
  pageViews: PageView[];
  formSubmissions: FormSubmission[];
  emailInteractions: EmailInteraction[];
  contentEngagement: ContentEngagement[];
  sessionData: SessionData[];
  chatInteractions: ChatInteraction[];
  calculatorUsage: CalculatorUsage[];
  demoRequests: DemoRequest[];
}

export interface PageView {
  url: string;
  title: string;
  timestamp: Date;
  timeOnPage: number;
  referrer?: string;
  device: 'desktop' | 'mobile' | 'tablet';
}

export interface FormSubmission {
  formType: 'contact' | 'demo' | 'newsletter' | 'calculator' | 'download';
  formId: string;
  data: Record<string, any>;
  timestamp: Date;
  completed: boolean;
}

export interface EmailInteraction {
  emailId: string;
  action: 'sent' | 'opened' | 'clicked' | 'replied';
  timestamp: Date;
  linkClicked?: string;
}

export interface ContentEngagement {
  contentType: 'blog' | 'case_study' | 'guide' | 'video' | 'demo';
  contentId: string;
  action: 'view' | 'download' | 'share' | 'complete';
  timeEngaged: number;
  timestamp: Date;
}

export interface SessionData {
  sessionId: string;
  duration: number;
  pagesViewed: number;
  bounced: boolean;
  timestamp: Date;
  source: string;
}

export interface ChatInteraction {
  sessionId: string;
  messageCount: number;
  duration: number;
  leadCaptured: boolean;
  timestamp: Date;
  topics: string[];
}

export interface CalculatorUsage {
  calculatorType: 'roi' | 'conversion' | 'revenue';
  inputs: Record<string, number>;
  results: Record<string, number>;
  completedAll: boolean;
  timestamp: Date;
}

export interface DemoRequest {
  framework: string;
  industry: string;
  businessSize: string;
  urgency: 'immediate' | 'soon' | 'researching';
  timestamp: Date;
}

export interface LeadScore {
  total: number;
  demographic: number;
  behavioral: number;
  engagement: number;
  intent: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  category: 'hot' | 'warm' | 'cold' | 'unqualified';
  reasons: string[];
  recommendations: string[];
  lastUpdated: Date;
}

class LeadScoringSystem {
  private readonly DEMOGRAPHIC_WEIGHTS = {
    industry: {
      'professional-services': 25,
      'saas-tech': 25,
      'healthcare': 20,
      'ecommerce': 18,
      'financial-services': 22,
      'education': 15,
      'manufacturing': 18,
      'real-estate': 20,
      'other': 10
    },
    companySize: {
      'enterprise': 25,
      'large': 20,
      'medium': 18,
      'small': 15,
      'startup': 12
    },
    jobTitle: {
      'ceo': 25,
      'founder': 25,
      'president': 25,
      'vp': 22,
      'director': 20,
      'manager': 18,
      'marketing': 20,
      'developer': 15,
      'other': 10
    }
  };

  private readonly BEHAVIORAL_WEIGHTS = {
    pageViews: {
      pricing: 15,
      calculator: 20,
      'case-studies': 18,
      demos: 15,
      contact: 25,
      about: 12,
      blog: 8,
      home: 10
    },
    timeOnPage: {
      lessThan30s: 5,
      thirtyTo60s: 10,
      oneToThreeMin: 15,
      moreThanThreeMin: 20
    },
    formSubmissions: {
      contact: 25,
      demo: 20,
      calculator: 15,
      newsletter: 10,
      download: 12
    }
  };

  private readonly ENGAGEMENT_WEIGHTS = {
    emailOpen: 8,
    emailClick: 15,
    emailReply: 25,
    contentDownload: 12,
    socialShare: 10,
    returnVisit: 15,
    chatInitiation: 18,
    chatLeadCapture: 25
  };

  private readonly INTENT_SIGNALS = {
    calculatorCompletion: 20,
    demoRequest: 25,
    pricingPageVisit: 15,
    competitorComparison: 18,
    urgentInquiry: 25,
    budgetDiscussion: 22,
    decisionMakerTitle: 20
  };

  public calculateLeadScore(profile: LeadProfile, behavioralData: BehavioralData): LeadScore {
    const demographic = this.calculateDemographicScore(profile);
    const behavioral = this.calculateBehavioralScore(behavioralData);
    const engagement = this.calculateEngagementScore(behavioralData);
    const intent = this.calculateIntentScore(profile, behavioralData);

    const total = Math.min(100, demographic + behavioral + engagement + intent);
    const grade = this.calculateGrade(total);
    const category = this.calculateCategory(total, profile, behavioralData);
    const reasons = this.generateScoringReasons(profile, behavioralData, { demographic, behavioral, engagement, intent });
    const recommendations = this.generateRecommendations(total, category, profile);

    const score: LeadScore = {
      total,
      demographic,
      behavioral,
      engagement,
      intent,
      grade,
      category,
      reasons,
      recommendations,
      lastUpdated: new Date()
    };

    // Track scoring event
    trackEvent({
      name: 'lead_scored',
      parameters: {
        lead_id: profile.id,
        total_score: total,
        grade: grade,
        category: category,
        industry: profile.industry,
        company_size: profile.companySize
      },
      value: total
    });

    return score;
  }

  private calculateDemographicScore(profile: LeadProfile): number {
    let score = 0;
    const reasons = [];

    // Industry scoring
    if (profile.industry) {
      const industryScore = this.DEMOGRAPHIC_WEIGHTS.industry[profile.industry as keyof typeof this.DEMOGRAPHIC_WEIGHTS.industry] || 10;
      score += industryScore;
    }

    // Company size scoring
    if (profile.companySize) {
      const sizeScore = this.DEMOGRAPHIC_WEIGHTS.companySize[profile.companySize];
      score += sizeScore;
    }

    // Job title scoring
    if (profile.jobTitle) {
      const titleScore = this.getJobTitleScore(profile.jobTitle);
      score += titleScore;
    }

    // Company website (indicates legitimacy)
    if (profile.website) {
      score += 5;
    }

    // Phone number (indicates serious interest)
    if (profile.phone) {
      score += 5;
    }

    return Math.min(40, score); // Cap demographic score at 40
  }

  private calculateBehavioralScore(behavioralData: BehavioralData): number {
    let score = 0;

    // Page view scoring
    behavioralData.pageViews.forEach(view => {
      const pageType = this.getPageType(view.url);
      const pageScore = this.BEHAVIORAL_WEIGHTS.pageViews[pageType as keyof typeof this.BEHAVIORAL_WEIGHTS.pageViews] || 5;
      score += pageScore * 0.5; // Reduce individual page impact

      // Time on page bonus
      const timeScore = this.getTimeOnPageScore(view.timeOnPage);
      score += timeScore * 0.3;
    });

    // Form submission scoring
    behavioralData.formSubmissions.forEach(submission => {
      if (submission.completed) {
        const formScore = this.BEHAVIORAL_WEIGHTS.formSubmissions[submission.formType];
        score += formScore;
      } else {
        score += 5; // Partial credit for incomplete submissions
      }
    });

    // Session quality scoring
    const avgSessionDuration = behavioralData.sessionData.reduce((sum, session) => sum + session.duration, 0) / behavioralData.sessionData.length;
    if (avgSessionDuration > 180) score += 10; // >3 minutes
    if (avgSessionDuration > 300) score += 5;  // >5 minutes

    const totalSessions = behavioralData.sessionData.length;
    if (totalSessions > 1) score += 8; // Return visitor
    if (totalSessions > 3) score += 12; // Highly engaged

    // Bounce rate penalty
    const bounceRate = behavioralData.sessionData.filter(s => s.bounced).length / totalSessions;
    if (bounceRate > 0.7) score -= 10; // High bounce rate penalty

    return Math.min(35, score); // Cap behavioral score at 35
  }

  private calculateEngagementScore(behavioralData: BehavioralData): number {
    let score = 0;

    // Email engagement
    behavioralData.emailInteractions.forEach(interaction => {
      switch (interaction.action) {
        case 'opened':
          score += this.ENGAGEMENT_WEIGHTS.emailOpen;
          break;
        case 'clicked':
          score += this.ENGAGEMENT_WEIGHTS.emailClick;
          break;
        case 'replied':
          score += this.ENGAGEMENT_WEIGHTS.emailReply;
          break;
      }
    });

    // Content engagement
    behavioralData.contentEngagement.forEach(engagement => {
      switch (engagement.action) {
        case 'download':
          score += this.ENGAGEMENT_WEIGHTS.contentDownload;
          break;
        case 'share':
          score += this.ENGAGEMENT_WEIGHTS.socialShare;
          break;
        case 'complete':
          score += 15; // Completing content (video, course, etc.)
          break;
      }

      // Time-based engagement bonus
      if (engagement.timeEngaged > 120) score += 8; // >2 minutes
      if (engagement.timeEngaged > 300) score += 12; // >5 minutes
    });

    // Chat engagement
    behavioralData.chatInteractions.forEach(chat => {
      score += this.ENGAGEMENT_WEIGHTS.chatInitiation;
      if (chat.leadCaptured) {
        score += this.ENGAGEMENT_WEIGHTS.chatLeadCapture;
      }
      if (chat.messageCount > 5) score += 10; // Extended conversation
    });

    return Math.min(20, score); // Cap engagement score at 20
  }

  private calculateIntentScore(profile: LeadProfile, behavioralData: BehavioralData): number {
    let score = 0;

    // Calculator usage (strong buying intent)
    behavioralData.calculatorUsage.forEach(usage => {
      score += this.INTENT_SIGNALS.calculatorCompletion;
      if (usage.completedAll) score += 10; // Bonus for completion
      
      // High-value calculations indicate serious consideration
      if (usage.results.projectedValue && usage.results.projectedValue > 50000) {
        score += 15;
      }
    });

    // Demo requests (very strong intent)
    behavioralData.demoRequests.forEach(demo => {
      score += this.INTENT_SIGNALS.demoRequest;
      
      if (demo.urgency === 'immediate') score += 15;
      else if (demo.urgency === 'soon') score += 10;
      
      // Enterprise demos are higher value
      if (demo.businessSize === 'large' || demo.businessSize === 'enterprise') {
        score += 10;
      }
    });

    // Pricing page visits
    const pricingVisits = behavioralData.pageViews.filter(view => 
      view.url.includes('/pricing') || view.url.includes('/#pricing')
    );
    if (pricingVisits.length > 0) {
      score += this.INTENT_SIGNALS.pricingPageVisit;
      if (pricingVisits.length > 2) score += 10; // Multiple pricing visits
    }

    // Contact form submissions
    const contactSubmissions = behavioralData.formSubmissions.filter(form => 
      form.formType === 'contact'
    );
    if (contactSubmissions.length > 0) {
      score += 20; // Direct contact is high intent
    }

    // Quick timeline indicators
    const recentActivity = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const recentEngagement = [
      ...behavioralData.pageViews.filter(v => v.timestamp > recentActivity),
      ...behavioralData.formSubmissions.filter(f => f.timestamp > recentActivity),
      ...behavioralData.chatInteractions.filter(c => c.timestamp > recentActivity)
    ];
    
    if (recentEngagement.length > 5) score += 15; // High recent activity

    return Math.min(30, score); // Cap intent score at 30
  }

  private getJobTitleScore(jobTitle: string): number {
    const title = jobTitle.toLowerCase();
    
    if (title.includes('ceo') || title.includes('chief executive')) return 25;
    if (title.includes('founder') || title.includes('co-founder')) return 25;
    if (title.includes('president')) return 25;
    if (title.includes('vp') || title.includes('vice president')) return 22;
    if (title.includes('director')) return 20;
    if (title.includes('manager')) return 18;
    if (title.includes('marketing') || title.includes('growth')) return 20;
    if (title.includes('developer') || title.includes('engineer')) return 15;
    
    return 10;
  }

  private getPageType(url: string): string {
    if (url.includes('/pricing') || url.includes('/#pricing')) return 'pricing';
    if (url.includes('/calculator')) return 'calculator';
    if (url.includes('/case-studies')) return 'case-studies';
    if (url.includes('/demo')) return 'demos';
    if (url.includes('/contact')) return 'contact';
    if (url.includes('/about')) return 'about';
    if (url.includes('/blog')) return 'blog';
    if (url === '/') return 'home';
    return 'other';
  }

  private getTimeOnPageScore(timeOnPage: number): number {
    if (timeOnPage < 30) return 5;
    if (timeOnPage < 60) return 10;
    if (timeOnPage < 180) return 15;
    return 20;
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private calculateCategory(score: number, profile: LeadProfile, behavioralData: BehavioralData): 'hot' | 'warm' | 'cold' | 'unqualified' {
    // Hot leads: High score + recent activity + buying intent
    if (score >= 75) {
      const recentActivity = behavioralData.formSubmissions.some(f => 
        f.timestamp > new Date(Date.now() - 48 * 60 * 60 * 1000) // Last 48 hours
      );
      const hasBuyingIntent = behavioralData.calculatorUsage.length > 0 || behavioralData.demoRequests.length > 0;
      
      if (recentActivity && hasBuyingIntent) return 'hot';
    }

    // Warm leads: Good score + some engagement
    if (score >= 60) {
      const hasEngagement = behavioralData.pageViews.length > 3 || behavioralData.formSubmissions.length > 0;
      if (hasEngagement) return 'warm';
    }

    // Cold leads: Some potential but low engagement
    if (score >= 40) return 'cold';

    // Unqualified: Low score across all dimensions
    return 'unqualified';
  }

  private generateScoringReasons(profile: LeadProfile, behavioralData: BehavioralData, scores: any): string[] {
    const reasons = [];

    // Demographic reasons
    if (scores.demographic > 25) {
      reasons.push(`Strong demographic profile (${scores.demographic} points)`);
    }
    if (profile.industry && this.DEMOGRAPHIC_WEIGHTS.industry[profile.industry as keyof typeof this.DEMOGRAPHIC_WEIGHTS.industry] > 20) {
      reasons.push(`High-value industry: ${profile.industry}`);
    }
    if (profile.companySize === 'enterprise' || profile.companySize === 'large') {
      reasons.push(`Large company size: ${profile.companySize}`);
    }

    // Behavioral reasons
    if (behavioralData.formSubmissions.length > 0) {
      reasons.push(`${behavioralData.formSubmissions.length} form submission(s)`);
    }
    if (behavioralData.pageViews.length > 5) {
      reasons.push(`High page engagement (${behavioralData.pageViews.length} pages viewed)`);
    }

    // Intent reasons
    if (behavioralData.calculatorUsage.length > 0) {
      reasons.push('Used ROI calculator (strong buying intent)');
    }
    if (behavioralData.demoRequests.length > 0) {
      reasons.push('Requested demo (very strong intent)');
    }
    if (behavioralData.chatInteractions.some(c => c.leadCaptured)) {
      reasons.push('Engaged in chat and provided contact info');
    }

    return reasons;
  }

  private generateRecommendations(score: number, category: string, profile: LeadProfile): string[] {
    const recommendations = [];

    switch (category) {
      case 'hot':
        recommendations.push('Priority follow-up within 24 hours');
        recommendations.push('Schedule discovery call immediately');
        recommendations.push('Send personalized proposal');
        break;

      case 'warm':
        recommendations.push('Follow up within 48-72 hours');
        recommendations.push('Send relevant case studies');
        recommendations.push('Invite to demo or consultation');
        break;

      case 'cold':
        recommendations.push('Add to nurture email sequence');
        recommendations.push('Share educational content');
        recommendations.push('Follow up in 1-2 weeks');
        break;

      case 'unqualified':
        recommendations.push('Add to long-term nurture campaign');
        recommendations.push('Focus on education and value delivery');
        recommendations.push('Re-evaluate in 3 months');
        break;
    }

    // Industry-specific recommendations
    if (profile.industry === 'saas-tech' || profile.industry === 'professional-services') {
      recommendations.push('Highlight relevant case studies from similar industry');
    }

    // Score-specific recommendations
    if (score < 50) {
      recommendations.push('Focus on building trust and credibility');
    } else if (score > 80) {
      recommendations.push('Fast-track to sales team');
    }

    return recommendations;
  }
}

// Singleton instance
const leadScoringSystem = new LeadScoringSystem();

// Convenience functions
export function calculateLeadScore(profile: LeadProfile, behavioralData: BehavioralData): LeadScore {
  return leadScoringSystem.calculateLeadScore(profile, behavioralData);
}

export function createLeadProfile(data: Partial<LeadProfile>): LeadProfile {
  return {
    id: data.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: data.email || '',
    firstName: data.firstName,
    lastName: data.lastName,
    company: data.company,
    jobTitle: data.jobTitle,
    industry: data.industry,
    companySize: data.companySize,
    website: data.website,
    phone: data.phone,
    source: data.source || 'website',
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date()
  };
}

export function createBehavioralData(): BehavioralData {
  return {
    pageViews: [],
    formSubmissions: [],
    emailInteractions: [],
    contentEngagement: [],
    sessionData: [],
    chatInteractions: [],
    calculatorUsage: [],
    demoRequests: []
  };
}

export default leadScoringSystem;