import type { APIRoute } from 'astro';
import Stripe from 'stripe';

// Initialize Stripe with secret key (only when available)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })
  : null;

export const POST: APIRoute = async ({ request, url }) => {
  try {
    if (!stripe) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { priceId, tier, mode = 'payment' } = body;

    // Validate required fields
    if (!priceId || !tier) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: mode as 'payment' | 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: getProductName(tier),
              description: getProductDescription(tier),
              images: [`${url.origin}/images/aktivcro-service-${tier}.png`],
            },
            unit_amount: getPrice(tier) * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${url.origin}/#pricing`,
      metadata: {
        tier: tier,
        source: 'website',
      },
      customer_creation: 'always',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL'],
      },
      custom_fields: [
        {
          key: 'company_name',
          label: {
            type: 'custom',
            custom: 'Company Name',
          },
          type: 'text',
          optional: true,
        },
        {
          key: 'website_url',
          label: {
            type: 'custom',
            custom: 'Current Website URL',
          },
          type: 'text',
          optional: true,
        },
        {
          key: 'industry',
          label: {
            type: 'custom',
            custom: 'Industry',
          },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Professional Services', value: 'professional-services' },
              { label: 'Local Services', value: 'local-services' },
              { label: 'SaaS & Tech', value: 'saas-tech' },
              { label: 'E-commerce', value: 'ecommerce' },
              { label: 'Healthcare', value: 'healthcare' },
              { label: 'Education', value: 'education' },
              { label: 'Other', value: 'other' },
            ],
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
    });

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Stripe session creation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An error occurred' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function getProductName(tier: string): string {
  const names = {
    foundation: 'AktivCRO Foundation Package',
    growth: 'AktivCRO Growth Package',
    enterprise: 'AktivCRO Enterprise Platform',
  };
  return names[tier as keyof typeof names] || 'AktivCRO Service';
}

function getProductDescription(tier: string): string {
  const descriptions = {
    foundation: 'Intelligent framework selection and professional implementation with mobile optimization and 30-day support.',
    growth: 'Everything in Foundation plus 2-3 custom micro-experiences, advanced conversion tracking, A/B testing setup, and 60-day support.',
    enterprise: 'Complete platform transformation with 5+ custom micro-experiences, ongoing optimization, monthly reports, and dedicated success manager.',
  };
  return descriptions[tier as keyof typeof descriptions] || 'Professional conversion optimization service';
}

function getPrice(tier: string): number {
  const prices = {
    foundation: 5000,
    growth: 5000,
    enterprise: 15000,
  };
  return prices[tier as keyof typeof prices] || 5000;
}