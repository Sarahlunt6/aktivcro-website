// Lead Scoring System
export interface LeadData {
  firstName?: string;
  lastName?: string;
  email: string;
  company?: string;
  website?: string;
  phone?: string;
  service?: string;
  message?: string;
  source: LeadSource;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
}

export type LeadSource = 
  | 'hero_demo' 
  | 'contact_form' 
  | 'calculator' 
  | 'newsletter' 
  | 'footer_demo'
  | 'pricing_inquiry'
  | 'resource_download';

export interface LeadScore {
  total: number;
  breakdown: {
    source: number;
    completeness: number;
    engagement: number;
    intent: number;
  };
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Lead scoring algorithm
export function calculateLeadScore(lead: LeadData): LeadScore {
  let score = 0;
  const tags: string[] = [];
  
  // Source scoring (intent level)
  const sourceScores: Record<LeadSource, number> = {
    'hero_demo': 85,        // High intent - primary CTA
    'calculator': 70,       // High intent - tool engagement
    'contact_form': 60,     // Medium-high intent
    'pricing_inquiry': 75,  // High commercial intent
    'footer_demo': 65,      // Medium-high intent
    'newsletter': 25,       // Low intent - nurture needed
    'resource_download': 45 // Medium intent - education phase
  };
  
  const sourceScore = sourceScores[lead.source] || 0;
  score += sourceScore;
  tags.push(`source_${lead.source}`);
  
  // Data completeness scoring
  let completeness = 0;
  if (lead.firstName) completeness += 5;
  if (lead.lastName) completeness += 5;
  if (lead.company) completeness += 10;
  if (lead.website) completeness += 15;
  if (lead.phone) completeness += 10;
  if (lead.message && lead.message.length > 20) completeness += 10;
  
  score += completeness;
  
  // Intent signals from message content
  let intentScore = 0;
  if (lead.message) {
    const message = lead.message.toLowerCase();
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'quickly', 'deadline'];
    const budgetKeywords = ['budget', 'investment', 'cost', 'price', 'quote'];
    const timelineKeywords = ['timeline', 'when', 'schedule', 'launch', 'start'];
    const problemKeywords = ['struggling', 'problem', 'issue', 'losing', 'frustrated'];
    
    if (urgentKeywords.some(keyword => message.includes(keyword))) {
      intentScore += 20;
      tags.push('urgent_timeline');
    }
    if (budgetKeywords.some(keyword => message.includes(keyword))) {
      intentScore += 15;
      tags.push('budget_discussion');
    }
    if (timelineKeywords.some(keyword => message.includes(keyword))) {
      intentScore += 10;
      tags.push('timeline_defined');
    }
    if (problemKeywords.some(keyword => message.includes(keyword))) {
      intentScore += 10;
      tags.push('pain_point_identified');
    }
  }
  
  score += intentScore;
  
  // Website analysis bonus
  if (lead.website) {
    tags.push('website_provided');
    score += 5;
  }
  
  // Service interest scoring
  if (lead.service) {
    const serviceScores: Record<string, number> = {
      'enterprise': 25,
      'growth': 20,
      'foundation': 15,
      'consultation': 10,
      'other': 5
    };
    score += serviceScores[lead.service] || 0;
    tags.push(`service_${lead.service}`);
  }
  
  // Determine priority
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
  if (score >= 100) priority = 'urgent';
  else if (score >= 75) priority = 'high';
  else if (score >= 50) priority = 'medium';
  
  // Add priority and industry tags
  tags.push(`priority_${priority}`);
  
  // Industry detection from email domain or company name
  if (lead.email || lead.company) {
    const domain = lead.email?.split('@')[1]?.toLowerCase() || '';
    const company = lead.company?.toLowerCase() || '';
    
    if (domain.includes('shopify') || company.includes('ecommerce') || company.includes('shop')) {
      tags.push('industry_ecommerce');
    } else if (domain.includes('saas') || company.includes('software') || company.includes('app')) {
      tags.push('industry_saas');
    } else if (company.includes('health') || company.includes('medical') || company.includes('clinic')) {
      tags.push('industry_healthcare');
    } else if (company.includes('law') || company.includes('legal') || company.includes('attorney')) {
      tags.push('industry_legal');
    } else if (company.includes('real estate') || company.includes('property') || company.includes('realty')) {
      tags.push('industry_realestate');
    }
  }
  
  return {
    total: Math.min(score, 100), // Cap at 100
    breakdown: {
      source: sourceScore,
      completeness,
      engagement: 0, // Will be updated based on website behavior
      intent: intentScore
    },
    tags,
    priority
  };
}