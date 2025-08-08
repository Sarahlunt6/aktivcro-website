import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Cost-effective model

export interface BusinessInfo {
  businessName: string;
  industry: string;
  industryName: string;
  framework: string;
  frameworkName: string;
  services: string[];
  valueProposition: string;
  targetAudience?: string;
  currentWebsite?: string;
  microExperiences: string[];
}

export interface GeneratedContent {
  heroHeadline: string;
  heroSubheadline: string;
  valueProposition: string;
  servicesContent: {
    title: string;
    description: string;
  }[];
  ctaText: string;
  trustElements: string[];
  aboutText: string;
}

// Framework-specific content generation prompts
const frameworkPrompts = {
  authority: {
    context: "Focus on trust-building, expertise, credentials, and professional authority. Emphasize experience, certifications, and proven results.",
    ctaStyle: "Professional, trust-building CTAs like 'Schedule Consultation', 'Get Expert Analysis'",
    trustElements: "Client testimonials, years of experience, certifications, case studies, awards"
  },
  'mobile-first': {
    context: "Focus on immediate action, local services, convenience, and mobile-first experience. Emphasize speed, availability, and local presence.",
    ctaStyle: "Action-oriented CTAs like 'Call Now', 'Book Today', 'Get Instant Quote'",
    trustElements: "Local reviews, response time, availability, licensed/insured status"
  },
  'cre-methodology': {
    context: "Focus on real estate expertise, market knowledge, property investment, and professional real estate services.",
    ctaStyle: "Real estate specific CTAs like 'Get Property Valuation', 'Schedule Viewing', 'List Your Property'",
    trustElements: "Years in real estate, properties sold, market knowledge, professional associations"
  },
  'conversion-centered': {
    context: "Focus on direct benefits, clear value propositions, and conversion optimization. Emphasize results, ROI, and immediate value.",
    ctaStyle: "Direct, benefit-focused CTAs like 'Start Free Trial', 'Get Results Now', 'Increase Revenue'",
    trustElements: "Performance metrics, success rates, client results, money-back guarantees"
  }
};

export async function generateWebsiteContent(businessInfo: BusinessInfo): Promise<GeneratedContent> {
  const frameworkPrompt = frameworkPrompts[businessInfo.framework as keyof typeof frameworkPrompts] || frameworkPrompts.authority;
  
  const prompt = `
You are creating website content for a business. Follow these exact instructions:

BUSINESS: ${businessInfo.businessName}
INDUSTRY: ${businessInfo.industryName}
VALUE PROP: ${businessInfo.valueProposition}

REQUIRED OUTPUT FORMAT (JSON only):

{
  "heroHeadline": "Must start with '${businessInfo.businessName}' - do not use generic industry terms",
  "heroSubheadline": "SHORT tagline like 'Your trusted legal partner' or 'Expert solutions for growth' - NO generic terms", 
  "valueProposition": "Benefit statement about results/outcomes - completely different from heroSubheadline",
  "servicesContent": [
    {"title": "Service 1 Name", "description": "What this service does"},
    {"title": "Service 2 Name", "description": "What this service does"},
    {"title": "Service 3 Name", "description": "What this service does"}
  ],
  "ctaText": "${frameworkPrompt.ctaText}",
  "trustElements": ["Trust element 1", "Trust element 2", "Trust element 3"],
  "aboutText": "Brief description of ${businessInfo.businessName}"
}

STRICT RULES:
1. heroHeadline MUST start with "${businessInfo.businessName}" 
2. heroSubheadline: NO industry words like "professional", "services", etc. Use benefit words instead
3. valueProposition: Focus on outcomes/results, not service descriptions
4. NEVER repeat the same content between heroSubheadline and valueProposition
5. NEVER use "Professional Professional" or repeated words
6. BANNED WORDS in heroSubheadline: "professional", "services", "solutions" - use benefit words instead
7. Make it specific to THIS business: ${businessInfo.businessName}
8. Based on their services: ${businessInfo.services.join(', ')}

GOOD EXAMPLES:
- heroSubheadline: "Your trusted legal partner" 
- valueProposition: "We help businesses grow through expert legal guidance and risk management"

BAD EXAMPLES (DON'T USE):
- heroSubheadline: "Professional legal services" ❌
- heroSubheadline: "Expert professional solutions" ❌

Generate content now:

Return ONLY a JSON object with this exact structure:
{
  "heroHeadline": "string",
  "heroSubheadline": "string", 
  "valueProposition": "string",
  "servicesContent": [
    {"title": "Service 1", "description": "Service 1 description"},
    {"title": "Service 2", "description": "Service 2 description"},
    {"title": "Service 3", "description": "Service 3 description"}
  ],
  "ctaText": "string",
  "trustElements": ["element1", "element2", "element3"],
  "aboutText": "string"
}
`;

  try {
    const fullPrompt = `You are a professional copywriter specializing in conversion-focused website content. Always return valid JSON.

${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('No content generated');
    }

    // Clean up the response to extract JSON (Gemini sometimes adds extra text)
    let jsonContent = content.trim();
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd);
    }

    // Parse JSON response
    const generatedContent = JSON.parse(jsonContent) as GeneratedContent;
    
    // Validate required fields
    if (!generatedContent.heroHeadline || !generatedContent.heroSubheadline) {
      throw new Error('Missing required content fields');
    }

    return generatedContent;

  } catch (error) {
    console.error('AI content generation error:', error);
    
    // Fallback content if AI fails
    return getFallbackContent(businessInfo);
  }
}

// Fallback content in case AI generation fails
function getFallbackContent(businessInfo: BusinessInfo): GeneratedContent {
  const frameworks: Record<string, any> = {
    authority: {
      heroHeadline: `${businessInfo.businessName} - Expert Solutions`,
      heroSubheadline: "Your trusted business partner",
      ctaText: "Schedule Consultation",
      trustElements: ["Trusted by 500+ clients", "15+ years experience", "Licensed & certified"]
    },
    'mobile-first': {
      heroHeadline: `${businessInfo.businessName} - Fast Solutions`,
      heroSubheadline: "Quick results you can count on",
      ctaText: "Call Now",
      trustElements: ["Available 24/7", "Same-day service", "Licensed & insured"]
    },
    'cre-methodology': {
      heroHeadline: `${businessInfo.businessName} - Real Estate Experts`,
      heroSubheadline: "Your property success partner",
      ctaText: "Get Property Valuation", 
      trustElements: ["500+ properties sold", "Local market expert", "Top 1% agent"]
    },
    'conversion-centered': {
      heroHeadline: `${businessInfo.businessName} - Growth Partners`,
      heroSubheadline: "Driving measurable business growth",
      ctaText: "Start Free Trial",
      trustElements: ["Proven results", "Money-back guarantee", "5-star rated"]
    }
  };

  const framework = frameworks[businessInfo.framework] || frameworks.authority;

  return {
    heroHeadline: framework.heroHeadline,
    heroSubheadline: framework.heroSubheadline,
    valueProposition: businessInfo.valueProposition,
    servicesContent: businessInfo.services.slice(0, 3).map(service => ({
      title: service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `Expert ${service.replace('-', ' ')} services designed for your success.`
    })),
    ctaText: framework.ctaText,
    trustElements: framework.trustElements,
    aboutText: `${businessInfo.businessName} is committed to delivering exceptional results for our clients in the ${businessInfo.industryName.toLowerCase()} industry.`
  };
}