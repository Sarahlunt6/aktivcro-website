import type { APIRoute } from 'astro';
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from '../../utils/rate-limiter.js';
import { validateInput, emailSchema } from '../../utils/validation-schemas.js';
import { setCORSHeaders, handleCORSPreflight } from '../../utils/cors.js';
import { z } from 'zod';

export const prerender = false;

const newsletterSchema = z.object({
  email: emailSchema,
  website_url: z.string().max(0, 'Bot detected').optional(), // Honeypot
});

// Newsletter signup endpoint (Cloudflare Workers)
export const POST: APIRoute = async ({ request }) => {
  try {
    // Handle CORS preflight
    const preflightResponse = handleCORSPreflight(request);
    if (preflightResponse) return preflightResponse;

    // Rate limiting check
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMITS.NEWSLETTER_SIGNUP);
    
    if (!rateLimitResult.allowed) {
      const response = new Response(JSON.stringify({
        success: false,
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

    const formData = await request.formData();
    const rawData = {
      email: formData.get('email') as string,
      website_url: formData.get('website_url') as string || ''
    };

    // Bot detection
    if (rawData.website_url && rawData.website_url.length > 0) {
      console.warn('Potential bot detected on newsletter signup:', {
        ip: clientId,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      // Return success to fool bots
      const response = new Response(JSON.stringify({ 
        success: true, 
        message: 'Successfully subscribed to newsletter!' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      return setCORSHeaders(response, request);
    }

    // Validate input
    const validation = validateInput(newsletterSchema, rawData);
    if (!validation.success) {
      const response = new Response(JSON.stringify({
        success: false,
        error: 'Invalid input',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
      return setCORSHeaders(response, request);
    }

    const { email } = validation.data!;

    // Secure logging (no sensitive data)
    console.log('Newsletter signup processed:', {
      timestamp: new Date().toISOString(),
      ip: clientId,
      userAgent: request.headers.get('user-agent')?.substring(0, 100)
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, add to your email service:
    // - GoHighLevel API integration
    // - Mailchimp API
    // - ConvertKit API
    // - etc.

    const response = new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    return setCORSHeaders(response, request);

  } catch (error) {
    console.error('Newsletter signup error:', error);
    const response = new Response(JSON.stringify({ 
      success: false, 
      error: 'Something went wrong. Please try again.' 
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