import type { APIRoute } from 'astro';
import { generateWebsiteContent, type BusinessInfo } from '../../utils/ai-content-generator';
import { generateDemoTemplate } from '../../utils/demo-templates';

export const prerender = false;

interface DemoRequest {
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
  primaryColor: string;
  secondaryColor: string;
  email: string;
}

// AI-powered demo generation endpoint (Cloudflare Workers)
export const POST: APIRoute = async ({ request }) => {
  try {
    const demoRequest: DemoRequest = await request.json();

    // Validate required fields
    if (!demoRequest.businessName || !demoRequest.industry || !demoRequest.framework || !demoRequest.valueProposition) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: businessName, industry, framework, valueProposition' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if Gemini API key is configured
    if (!import.meta.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AI service not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Generating AI content for:', demoRequest.businessName);

    // Prepare business info for AI generation
    const businessInfo: BusinessInfo = {
      businessName: demoRequest.businessName,
      industry: demoRequest.industry,
      industryName: demoRequest.industryName,
      framework: demoRequest.framework,
      frameworkName: demoRequest.frameworkName,
      services: demoRequest.services,
      valueProposition: demoRequest.valueProposition,
      targetAudience: demoRequest.targetAudience,
      currentWebsite: demoRequest.currentWebsite,
      microExperiences: demoRequest.microExperiences
    };

    // Generate AI content
    const generatedContent = await generateWebsiteContent(businessInfo);
    console.log('AI content generated successfully');

    // Generate demo HTML template
    const demoTemplate = generateDemoTemplate(
      businessInfo, 
      generatedContent,
      demoRequest.primaryColor,
      demoRequest.secondaryColor
    );
    console.log('Demo template generated successfully');

    // Generate unique demo ID
    const demoId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // For now, return the HTML directly
    // Later we'll store this in Cloudflare R2 and return a URL
    return new Response(JSON.stringify({ 
      success: true, 
      demoId: demoId,
      html: demoTemplate.html,
      generatedContent: generatedContent,
      message: 'Demo generated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Demo generation error:', error);
    
    // Return more specific error messages
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'AI service configuration error';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'AI response parsing error';
      } else if (error.message.includes('quota')) {
        errorMessage = 'AI service quota exceeded';
      } else {
        errorMessage = error.message;
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};