import type { APIRoute } from 'astro';
import type { LeadData } from '../../utils/lead-scoring';
import { calculateLeadScore } from '../../utils/lead-scoring';
import { formatForGHL, sendToGHL, triggerGHLWorkflow, getWorkflowId } from '../../utils/ghl-integration';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '../../utils/rate-limiter';
import { leadCaptureSchema, validateInput, detectBot, validateCSRF } from '../../utils/validation-schemas';

// Enhanced lead capture endpoint with security features (Cloudflare Workers)
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMITS.LEAD_CAPTURE);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          message: rateLimitResult.message,
          resetTime: rateLimitResult.resetTime
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMITS.LEAD_CAPTURE.maxRequests.toString(),
            'X-RateLimit-Remaining': '0'
          }
        }
      );
    }

    // Basic CSRF protection for AJAX requests
    if (request.headers.get('content-type')?.includes('application/json')) {
      if (!validateCSRF(request)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid request origin'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle both JSON and FormData
    let rawData: any;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      rawData = await request.json();
    } else {
      const formData = await request.formData();
      rawData = Object.fromEntries(formData);
    }

    // Bot detection
    if (detectBot(rawData)) {
      // Log potential bot activity but return success to avoid revealing detection
      console.warn('Potential bot detected:', {
        ip: clientId,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Thank you! Your information has been submitted successfully.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate input using Zod schema
    const validation = validateInput(leadCaptureSchema, rawData);
    
    if (!validation.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = validation.data!

    // Create lead data object
    const leadData: LeadData = {
      firstName: data.firstName || data.name?.split(' ')[0],
      lastName: data.lastName || data.name?.split(' ').slice(1).join(' '),
      email: data.email,
      company: data.company,
      website: data.website,
      phone: data.phone,
      service: data.service,
      message: data.message,
      source: (data.source || data.formType || 'contact_form') as any,
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
      headers: { 
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': RATE_LIMITS.LEAD_CAPTURE.maxRequests.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remainingRequests.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });

  } catch (error) {
    // Secure error logging - no sensitive data
    console.error('Lead capture error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: getClientIdentifier(request)
    });
    
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