import type { APIRoute } from 'astro';

export const prerender = false;

interface DemoFormData {
  businessName: string;
  industry: string;
  currentWebsite: string;
  primaryColor: string;
  secondaryColor: string;
  services: string[];
  targetAudience: string;
  valueProposition: string;
  email: string;
  phone: string;
  framework: string;
  microExperiences: string[];
}

const frameworkNames: Record<string, string> = {
  'authority': 'Authority Architecture',
  'mobile-first': 'Mobile-First PWA',
  'cre-methodology': 'CRE Methodology',
  'conversion-centered': 'Conversion-Centered Design'
};

const industryNames: Record<string, string> = {
  'professional-services': 'Professional Services',
  'local-services': 'Local Services',
  'saas-tech': 'SaaS & Tech',
  'ecommerce': 'E-commerce',
  'healthcare': 'Healthcare',
  'education': 'Education'
};

// Demo generation endpoint (Cloudflare Workers)
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData: DemoFormData = await request.json();

    // Validate required fields
    if (!formData.businessName || !formData.industry || !formData.email || !formData.framework) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate demo metadata
    const frameworkName = frameworkNames[formData.framework] || formData.framework;
    const industryName = industryNames[formData.industry] || formData.industry;
    const improvements = getFrameworkImprovements(formData.framework);
    
    // Prepare comprehensive payload for GoHighLevel
    const ghlPayload = {
      // Lead Information
      contact: {
        email: formData.email,
        firstName: formData.businessName.split(' ')[0] || '',
        lastName: formData.businessName.split(' ').slice(1).join(' ') || '',
        phone: formData.phone || '',
        companyName: formData.businessName,
        website: formData.currentWebsite || ''
      },
      
      // Demo Request Details
      demoRequest: {
        businessName: formData.businessName,
        industry: formData.industry,
        industryName: industryName,
        framework: formData.framework,
        frameworkName: frameworkName,
        services: formData.services,
        valueProposition: formData.valueProposition,
        microExperiences: formData.microExperiences,
        branding: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        },
        currentWebsite: formData.currentWebsite,
        targetAudience: formData.targetAudience
      },
      
      // Performance Projections
      projections: improvements,
      
      // Lead Scoring Data
      leadScore: calculateLeadScore(formData),
      
      // Automation Triggers
      triggers: {
        sendDemoEmail: true,
        scheduleFollowUp: true,
        addToNurtureCampaign: true,
        notifyTeam: true
      },
      
      // Metadata
      source: 'demo-generator',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('User-Agent') || ''
    };

    // Send to GoHighLevel webhook
    const ghlWebhookUrl = import.meta.env.GHL_WEBHOOK_URL || import.meta.env.GOHIGHLEVEL_WEBHOOK_URL;
    
    if (!ghlWebhookUrl) {
      console.error('GoHighLevel webhook URL not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'CRM integration not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ghlResponse = await fetch(ghlWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AktivCRO-Demo-Generator/1.0'
      },
      body: JSON.stringify(ghlPayload)
    });

    if (!ghlResponse.ok) {
      console.error('GoHighLevel webhook failed:', ghlResponse.status, ghlResponse.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to process demo request' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Demo request processed successfully',
      leadId: `demo_${Date.now()}`,
      framework: frameworkName,
      projections: improvements
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Demo generation error:', error);
    const response = new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
    return setCORSHeaders(response, request);
  }
};

export const OPTIONS: APIRoute = async ({ request }) => {
  return handleCORSPreflight(request) || new Response(null, { status: 405 });
};

function calculateLeadScore(formData: DemoFormData): number {
  let score = 0;
  
  // Business completeness (0-30 points)
  if (formData.businessName) score += 5;
  if (formData.currentWebsite) score += 10;
  if (formData.phone) score += 10;
  if (formData.valueProposition && formData.valueProposition.length > 50) score += 5;
  
  // Service complexity (0-25 points)
  score += Math.min(formData.services.length * 5, 15);
  score += Math.min(formData.microExperiences.length * 2, 10);
  
  // Industry value (0-20 points)
  const industryScores: Record<string, number> = {
    'professional-services': 20,
    'saas-tech': 20,
    'healthcare': 18,
    'ecommerce': 15,
    'local-services': 12,
    'education': 10
  };
  score += industryScores[formData.industry] || 5;
  
  // Framework sophistication (0-15 points)
  const frameworkScores: Record<string, number> = {
    'conversion-centered': 15,
    'authority': 12,
    'cre-methodology': 10,
    'mobile-first': 8
  };
  score += frameworkScores[formData.framework] || 5;
  
  // Engagement quality (0-10 points)
  if (formData.targetAudience && formData.targetAudience.length > 20) score += 5;
  if (formData.services.length >= 2) score += 3;
  if (formData.microExperiences.length >= 2) score += 2;
  
  return Math.min(score, 100); // Cap at 100
}

function getFrameworkImprovements(framework: string) {
  const improvements: Record<string, any> = {
    'authority': {
      conversionIncrease: '+340%',
      leadQuality: '+280%',
      timeToClose: '-45%',
      roi: '850%',
      timeframe: '6-8 weeks'
    },
    'mobile-first': {
      conversionIncrease: '+420%',
      leadQuality: '+300%',
      timeToClose: '-50%',
      roi: '1200%',
      timeframe: '4-6 weeks'
    },
    'cre-methodology': {
      conversionIncrease: '+280%',
      leadQuality: '+220%',
      timeToClose: '-40%',
      roi: '720%',
      timeframe: '6-8 weeks'
    },
    'conversion-centered': {
      conversionIncrease: '+280%',
      leadQuality: '+300%',
      timeToClose: '-60%',
      roi: '650%',
      timeframe: '8-12 weeks'
    }
  };

  return improvements[framework] || improvements['authority'];
}

