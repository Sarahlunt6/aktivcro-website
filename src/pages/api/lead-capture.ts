import type { APIRoute } from 'astro';
import type { LeadData } from '../../utils/lead-scoring';
import { calculateLeadScore } from '../../utils/lead-scoring';
import { formatForGHL, sendToGHL, triggerGHLWorkflow, getWorkflowId } from '../../utils/ghl-integration';

// Enhanced lead capture endpoint for form submissions
export const POST: APIRoute = async ({ request }) => {
  try {
    // Handle both JSON and FormData
    let data: any;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData);
    }
    
    const { 
      email, 
      firstName,
      lastName,
      name,
      phone,
      company,
      website,
      industry,
      service,
      message,
      source,
      formType,
      leadMagnet,
      answers 
    } = data;

    // Validate required fields
    if (!email) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Email is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Please enter a valid email address' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create lead data object
    const leadData: LeadData = {
      firstName: firstName || (name ? name.split(' ')[0] : undefined),
      lastName: lastName || (name ? name.split(' ').slice(1).join(' ') : undefined),
      email,
      company: company || undefined,
      website: website || undefined,
      phone: phone || undefined,
      service: service || undefined,
      message: message || (answers ? JSON.stringify(answers) : undefined),
      source: (source || formType || 'contact_form') as any,
      timestamp: new Date(),
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined
    };

    // Calculate lead score using our new system
    const leadScore = calculateLeadScore(leadData);

    // Format for GHL using our new system
    const ghlContact = formatForGHL(leadData, leadScore);

    // Send to GoHighLevel
    const ghlResult = await sendToGHL(ghlContact);

    // Trigger appropriate workflow if GHL integration successful
    if (ghlResult.success && ghlResult.contactId) {
      const workflowId = getWorkflowId(leadData.source, leadScore.priority);
      if (workflowId) {
        await triggerGHLWorkflow(ghlResult.contactId, workflowId);
      }
    }

    // Track conversion in analytics
    if (typeof globalThis !== 'undefined' && 'gtag' in globalThis) {
      // @ts-ignore
      gtag('event', 'lead_capture', {
        lead_source: leadData.source,
        lead_score: leadScore.total,
        lead_priority: leadScore.priority,
        value: leadScore.total
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      leadScore: leadScore.total,
      priority: leadScore.priority,
      message: 'Thank you! Your information has been submitted successfully.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'An error occurred while processing your request. Please try again.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Note: Lead scoring, GHL integration, and workflow management
// is now handled by the comprehensive system in:
// - /utils/lead-scoring.ts
// - /utils/ghl-integration.ts