/**
 * Comprehensive Input Validation Schemas using Zod
 * Ensures all user inputs are properly validated and sanitized
 */

import { z } from 'zod';

// Base validation helpers
const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, ''); // Basic XSS protection
};

const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
const urlRegex = /^https?:\/\/.+/;

// Common field validators
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .transform(sanitizeString);

export const phoneSchema = z
  .string()
  .regex(phoneRegex, 'Please enter a valid phone number')
  .optional();

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .transform(sanitizeString);

export const companySchema = z
  .string()
  .min(2, 'Company name must be at least 2 characters')
  .max(100, 'Company name must be less than 100 characters')
  .transform(sanitizeString)
  .optional();

export const websiteSchema = z
  .string()
  .regex(urlRegex, 'Please enter a valid website URL (include http:// or https://)')
  .max(255, 'Website URL is too long')
  .optional();

export const messageSchema = z
  .string()
  .min(10, 'Message must be at least 10 characters')
  .max(2000, 'Message must be less than 2000 characters')
  .transform(sanitizeString);

// Lead Capture Form Schema
export const leadCaptureSchema = z.object({
  email: emailSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  name: nameSchema.optional(),
  phone: phoneSchema,
  company: companySchema,
  website: websiteSchema,
  industry: z
    .enum([
      'technology', 'healthcare', 'finance', 'retail', 'manufacturing', 
      'education', 'real-estate', 'consulting', 'non-profit', 'other'
    ])
    .optional(),
  service: z
    .enum(['foundation', 'growth', 'enterprise', 'consultation', 'other'])
    .optional(),
  message: messageSchema.optional(),
  source: z.string().max(50).optional(),
  formType: z.string().max(50).optional(),
  leadMagnet: z.string().max(100).optional(),
  // Honeypot field for bot detection
  website_url: z.string().max(0, 'Bot detected').optional(),
  // Consent checkboxes
  marketingConsent: z.boolean().optional(),
  privacyConsent: z.boolean(),
});

// Newsletter Signup Schema
export const newsletterSchema = z.object({
  email: emailSchema,
  firstName: nameSchema.optional(),
  interests: z.array(z.string()).max(5).optional(),
  source: z.string().max(50).optional(),
  marketingConsent: z.boolean().optional(),
  website_url: z.string().max(0, 'Bot detected').optional(), // Honeypot
});

// Demo Generation Schema
export const demoGenerationSchema = z.object({
  email: emailSchema,
  company: companySchema,
  website: websiteSchema,
  industry: z
    .enum([
      'technology', 'healthcare', 'finance', 'retail', 'manufacturing',
      'education', 'real-estate', 'consulting', 'non-profit', 'other'
    ]),
  framework: z
    .enum(['authority', 'conversion-centered', 'cre', 'mobile-pwa'])
    .default('authority'),
  currentConversionRate: z
    .number()
    .min(0)
    .max(100)
    .optional(),
  monthlyVisitors: z
    .number()
    .min(0)
    .max(10000000)
    .optional(),
  primaryGoal: z
    .enum(['leads', 'sales', 'signups', 'downloads', 'bookings', 'other'])
    .optional(),
  website_url: z.string().max(0, 'Bot detected').optional(), // Honeypot
});

// Contact Form Schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: companySchema,
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters')
    .transform(sanitizeString),
  message: messageSchema,
  service: z
    .enum(['foundation', 'growth', 'enterprise', 'consultation', 'other'])
    .optional(),
  budget: z
    .enum(['under-5k', '5k-15k', '15k-50k', 'over-50k', 'not-sure'])
    .optional(),
  timeline: z
    .enum(['immediate', '1-month', '2-3-months', '3-6-months', 'planning'])
    .optional(),
  source: z.string().max(50).optional(),
  website_url: z.string().max(0, 'Bot detected').optional(), // Honeypot
  privacyConsent: z.boolean(),
});

// Calculator Form Schema
export const calculatorSchema = z.object({
  monthlyVisitors: z
    .number()
    .min(100, 'Monthly visitors must be at least 100')
    .max(10000000, 'Monthly visitors seems too high'),
  currentConversionRate: z
    .number()
    .min(0.1, 'Conversion rate must be at least 0.1%')
    .max(20, 'Conversion rate must be less than 20%'),
  averageOrderValue: z
    .number()
    .min(1, 'Average order value must be at least $1')
    .max(50000, 'Average order value seems too high'),
  industry: z
    .enum([
      'technology', 'healthcare', 'finance', 'retail', 'manufacturing',
      'education', 'real-estate', 'consulting', 'non-profit', 'other'
    ]),
  email: emailSchema.optional(), // For sending results
  company: companySchema,
  website_url: z.string().max(0, 'Bot detected').optional(), // Honeypot
});

// Webhook Validation Schema
export const webhookSchema = z.object({
  event: z.string().min(1),
  timestamp: z.number(),
  data: z.record(z.any()),
  signature: z.string().optional(),
  source: z.string().optional(),
});

// Environment Variables Schema
export const envSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  GHL_API_KEY: z.string().min(1),
  GHL_LOCATION_ID: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  SITE_URL: z.string().url(),
  CONTACT_EMAIL: emailSchema,
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  MICROSOFT_CLARITY_ID: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

// Generic validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Security validation helpers
export function detectBot(data: any): boolean {
  // Check honeypot field
  if (data.website_url && data.website_url.length > 0) {
    return true;
  }
  
  // Check for common bot patterns
  const suspiciousPatterns = [
    /test@test\.com/i,
    /example@example\.com/i,
    /admin@admin\.com/i,
    /[0-9]{10}@[0-9]{5}\.com/,
  ];
  
  if (data.email && suspiciousPatterns.some(pattern => pattern.test(data.email))) {
    return true;
  }
  
  return false;
}

export function validateCSRF(request: Request): boolean {
  // Basic CSRF protection - check for custom header
  const csrfHeader = request.headers.get('X-Requested-With');
  return csrfHeader === 'XMLHttpRequest';
}

// Rate limit key generators
export function generateRateLimitKey(request: Request, prefix: string): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           'unknown';
  return `${prefix}:${ip}`;
}