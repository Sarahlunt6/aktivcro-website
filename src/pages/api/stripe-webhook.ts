import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    })
  : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!stripe) {
      return new Response('Stripe not configured', { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;
      
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook received', { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  try {
    // Extract customer and order information
    const customerData = {
      stripeCustomerId: session.customer as string,
      email: session.customer_details?.email,
      name: session.customer_details?.name,
      phone: session.customer_details?.phone,
      tier: session.metadata?.tier,
      amount: session.amount_total,
      currency: session.currency,
      sessionId: session.id,
    };

    // Send to GoHighLevel (implement in next function)
    await sendToGoHighLevel(customerData);

    // Send confirmation email (implement email service)
    await sendConfirmationEmail(customerData);

    // Create customer record in database (if using one)
    // await createCustomerRecord(customerData);

  } catch (error) {
    console.error('Error processing completed checkout:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Additional payment processing if needed
  // This is called after successful payment completion
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Customer created:', customer.id);
  
  // Initial customer setup if needed
}

async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  console.log('Subscription payment succeeded:', invoice.id);
  
  // Handle recurring subscription payments
  // Update customer status, send receipts, etc.
}

async function sendToGoHighLevel(customerData: any) {
  try {
    const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
    const ghlApiKey = process.env.GHL_API_KEY;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    
    if (!ghlWebhookUrl) {
      console.log('GoHighLevel webhook URL not configured');
      return;
    }

    // Calculate lead score based on tier and purchase amount
    let leadScore = 90; // Base score for paying customers
    switch (customerData.tier) {
      case 'foundation':
        leadScore = 92;
        break;
      case 'growth':
        leadScore = 95;
        break;
      case 'enterprise':
        leadScore = 98;
        break;
    }

    // Enhanced customer data for GoHighLevel
    const ghlData = {
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone || '',
      source: 'AktivCRO Website Purchase',
      status: 'Customer - Paid',
      tags: [
        'stripe-customer',
        'paid-customer',
        `tier-${customerData.tier}`,
        'website-purchase',
        'high-value-customer'
      ],
      customFields: {
        stripe_customer_id: customerData.stripeCustomerId,
        purchase_amount: (customerData.amount / 100).toFixed(2), // Convert from cents
        purchase_currency: customerData.currency?.toUpperCase() || 'USD',
        tier: customerData.tier,
        lead_score: leadScore,
        session_id: customerData.sessionId,
        purchase_date: new Date().toISOString(),
        customer_lifetime_value: calculateCLV(customerData.tier),
        next_action: getNextAction(customerData.tier),
        priority_level: 'High'
      },
      // Add location ID if available
      ...(ghlLocationId && { locationId: ghlLocationId })
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (ghlApiKey) {
      headers['Authorization'] = `Bearer ${ghlApiKey}`;
    }

    const response = await fetch(ghlWebhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(ghlData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GoHighLevel webhook failed: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Successfully sent customer data to GoHighLevel:', {
      email: customerData.email,
      tier: customerData.tier,
      ghlResponse: responseData
    });

    // Trigger follow-up automations
    await triggerCustomerOnboarding(customerData);

  } catch (error) {
    console.error('Error sending to GoHighLevel:', error);
    
    // Don't fail the entire webhook for GHL errors
    // Log for manual follow-up
    await logFailedGHLIntegration(customerData, error);
  }
}

function calculateCLV(tier: string): number {
  // Calculate Customer Lifetime Value based on tier
  const baseValues = {
    foundation: 5000,
    growth: 8000,    // Potential for add-ons
    enterprise: 25000 // High retention and expansion
  };
  return baseValues[tier as keyof typeof baseValues] || 5000;
}

function getNextAction(tier: string): string {
  const actions = {
    foundation: 'Schedule onboarding call within 24 hours',
    growth: 'Assign account manager and schedule strategy session',
    enterprise: 'Executive onboarding and dedicated success manager assignment'
  };
  return actions[tier as keyof typeof actions] || 'Standard onboarding process';
}

async function triggerCustomerOnboarding(customerData: any) {
  try {
    // This could trigger additional automation sequences
    console.log(`Triggering onboarding sequence for ${customerData.tier} customer:`, customerData.email);
    
    // Example: Create calendar booking links, send welcome sequences, etc.
    // Implementation depends on your automation platform
    
  } catch (error) {
    console.error('Error triggering customer onboarding:', error);
  }
}

async function logFailedGHLIntegration(customerData: any, error: any) {
  try {
    // Log failed integrations for manual processing
    const failedIntegration = {
      timestamp: new Date().toISOString(),
      customerData,
      error: error.message,
      type: 'ghl_integration_failure'
    };
    
    console.error('Failed GoHighLevel integration logged:', failedIntegration);
    
    // In production, you might want to:
    // - Send to a dead letter queue
    // - Log to external monitoring service
    // - Send alert to team
    
  } catch (logError) {
    console.error('Error logging failed GHL integration:', logError);
  }
}

async function sendConfirmationEmail(customerData: any) {
  try {
    // This would integrate with your email service (SendGrid, Resend, etc.)
    console.log('Sending confirmation email to:', customerData.email);
    
    // Example with a generic email service
    // const emailData = {
    //   to: customerData.email,
    //   subject: `Welcome to AktivCRO - ${customerData.tier} Package Confirmed!`,
    //   template: 'purchase-confirmation',
    //   variables: {
    //     name: customerData.name,
    //     tier: customerData.tier,
    //     amount: customerData.amount / 100, // Convert from cents
    //   }
    // };
    
    // await emailService.send(emailData);
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}