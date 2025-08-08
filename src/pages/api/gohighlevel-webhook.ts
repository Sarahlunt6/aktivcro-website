import type { APIRoute } from 'astro';

// GoHighLevel webhook endpoint for receiving events from GHL
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const ghlSignature = request.headers.get('x-ghl-signature');
    
    // Verify webhook signature (implement signature verification in production)
    if (!ghlSignature) {
      console.warn('Missing GoHighLevel webhook signature');
    }
    
    console.log('GoHighLevel webhook received:', body);
    
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
    
    return new Response('Webhook processed', { status: 200 });
    
  } catch (error) {
    console.error('GoHighLevel webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
};

async function handleContactCreated(data: any) {
  console.log('New contact created in GoHighLevel:', data);
  
  // Update internal systems, send welcome emails, etc.
  // This could trigger additional automation workflows
}

async function handleContactUpdated(data: any) {
  console.log('Contact updated in GoHighLevel:', data);
  
  // Handle status changes, tag updates, etc.
}

async function handleOpportunityCreated(data: any) {
  console.log('New opportunity created in GoHighLevel:', data);
  
  // Handle new sales opportunities
  // Could trigger internal notifications or CRM updates
}

async function handleAppointmentScheduled(data: any) {
  console.log('Appointment scheduled in GoHighLevel:', data);
  
  // Handle calendar bookings
  // Could send confirmation emails or prep team notifications
}