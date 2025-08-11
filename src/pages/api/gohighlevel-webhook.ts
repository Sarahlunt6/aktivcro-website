import type { APIRoute } from 'astro';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from '../../utils/rate-limiter.js';
import { setCORSHeaders, handleCORSPreflight } from '../../utils/cors.js';
import { createHmac, timingSafeEqual } from 'crypto';

function verifyGHLSignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  
  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace('sha256=', '');
    
    return timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(cleanSignature, 'hex')
    );
  } catch {
    return false;
  }
}

// GoHighLevel webhook endpoint for receiving events from GHL
export const POST: APIRoute = async ({ request }) => {
  try {
    // Handle CORS preflight
    const preflightResponse = handleCORSPreflight(request);
    if (preflightResponse) return preflightResponse;

    // Rate limiting check
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMITS.WEBHOOK);
    
    if (!rateLimitResult.allowed) {
      const response = new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        message: rateLimitResult.message,
        resetTime: rateLimitResult.resetTime
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      });
      return setCORSHeaders(response, request);
    }

    const bodyText = await request.text();
    const ghlSignature = request.headers.get('x-ghl-signature');
    const ghlSecret = process.env.GHL_WEBHOOK_SECRET || '';
    
    // Verify webhook signature
    if (!ghlSignature || !verifyGHLSignature(bodyText, ghlSignature, ghlSecret)) {
      console.warn('Invalid GoHighLevel webhook signature:', {
        hasSignature: !!ghlSignature,
        hasSecret: !!ghlSecret,
        ip: clientId,
        timestamp: new Date().toISOString()
      });
      const response = new Response('Invalid signature', { status: 401 });
      return setCORSHeaders(response, request);
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      console.error('Invalid JSON in GoHighLevel webhook');
      const response = new Response('Invalid JSON', { status: 400 });
      return setCORSHeaders(response, request);
    }
    
    // Secure logging (no sensitive data)
    console.log('GoHighLevel webhook received:', {
      type: body.type,
      timestamp: new Date().toISOString(),
      ip: clientId,
      userAgent: request.headers.get('user-agent')?.substring(0, 100)
    });
    
    // Handle different GHL event types
    switch (body.type) {
      case 'contact.created':
        await handleContactCreated(body.data);
        break;
        
      case 'contact.updated':
        await handleContactUpdated(body.data);
        break;
        
      case 'opportunity.created':
        await handleOpportunityCreated(body.data);
        break;
        
      case 'appointment.scheduled':
        await handleAppointmentScheduled(body.data);
        break;
        
      default:
        console.log(`Unhandled GoHighLevel event type: ${body.type}`);
    }
    
    const response = new Response('Webhook processed', { status: 200 });
    return setCORSHeaders(response, request);
    
  } catch (error) {
    console.error('GoHighLevel webhook error:', error);
    const response = new Response('Webhook error', { status: 500 });
    return setCORSHeaders(response, request);
  }
};

export const OPTIONS: APIRoute = async ({ request }) => {
  return handleCORSPreflight(request) || new Response(null, { status: 405 });
};

async function handleContactCreated(data: any) {
  // Secure logging (no sensitive contact data)
  console.log('New contact created in GoHighLevel:', {
    contactId: data.id,
    timestamp: new Date().toISOString()
  });
  
  // Update internal systems, send welcome emails, etc.
  // This could trigger additional automation workflows
}

async function handleContactUpdated(data: any) {
  // Secure logging (no sensitive contact data)
  console.log('Contact updated in GoHighLevel:', {
    contactId: data.id,
    timestamp: new Date().toISOString()
  });
  
  // Handle status changes, tag updates, etc.
}

async function handleOpportunityCreated(data: any) {
  // Secure logging (no sensitive opportunity data)
  console.log('New opportunity created in GoHighLevel:', {
    opportunityId: data.id,
    timestamp: new Date().toISOString()
  });
  
  // Handle new sales opportunities
  // Could trigger internal notifications or CRM updates
}

async function handleAppointmentScheduled(data: any) {
  // Secure logging (no sensitive appointment data)
  console.log('Appointment scheduled in GoHighLevel:', {
    appointmentId: data.id,
    timestamp: new Date().toISOString()
  });
  
  // Handle calendar bookings
  // Could send confirmation emails or prep team notifications
}