import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Valid email address is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For now, log the email signup (in production, integrate with GoHighLevel or email service)
    console.log('Newsletter signup:', email);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In production, add to your email service:
    // - GoHighLevel API integration
    // - Mailchimp API
    // - ConvertKit API
    // - etc.

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Something went wrong. Please try again.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};