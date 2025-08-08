import type { APIRoute } from 'astro';

// Simple test endpoint to verify webhook payload structure
export const POST: APIRoute = async ({ request }) => {
  try {
    // Sample payload that matches what the demo generator sends
    const samplePayload = {
      contact: {
        email: "test@example.com",
        firstName: "Test",
        lastName: "Company", 
        phone: "+1234567890",
        companyName: "Test Company",
        website: "https://testcompany.com"
      },
      demoRequest: {
        businessName: "Test Company",
        industry: "professional-services",
        industryName: "Professional Services",
        framework: "authority", 
        frameworkName: "Authority Architecture",
        services: ["law-firm", "consulting"],
        valueProposition: "We help businesses grow through legal expertise",
        microExperiences: ["case-evaluator", "consultation-scheduler"],
        branding: {
          primaryColor: "#20466f",
          secondaryColor: "#ffd147"
        },
        currentWebsite: "https://testcompany.com",
        targetAudience: "Small business owners"
      },
      projections: {
        conversionIncrease: "+340%",
        leadQuality: "+280%", 
        timeToClose: "-45%",
        roi: "850%",
        timeframe: "6-8 weeks"
      },
      leadScore: 85,
      triggers: {
        sendDemoEmail: true,
        scheduleFollowUp: true,
        addToNurtureCampaign: true,
        notifyTeam: true
      },
      source: "demo-generator-test",
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('User-Agent') || 'Test-Agent'
    };

    // Send to GoHighLevel webhook
    const ghlWebhookUrl = import.meta.env.GHL_WEBHOOK_URL || import.meta.env.GOHIGHLEVEL_WEBHOOK_URL;
    
    if (!ghlWebhookUrl) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'GoHighLevel webhook URL not configured',
        message: 'Please set GHL_WEBHOOK_URL in your .env file'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Sending test payload to GHL webhook:', ghlWebhookUrl);
    console.log('Payload:', JSON.stringify(samplePayload, null, 2));

    const ghlResponse = await fetch(ghlWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AktivCRO-Test-Webhook/1.0'
      },
      body: JSON.stringify(samplePayload)
    });

    const responseText = await ghlResponse.text();
    console.log('GHL Response Status:', ghlResponse.status);
    console.log('GHL Response:', responseText);

    if (!ghlResponse.ok) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'GoHighLevel webhook failed',
        status: ghlResponse.status,
        response: responseText,
        webhookUrl: ghlWebhookUrl
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test webhook sent successfully to GoHighLevel',
      webhookUrl: ghlWebhookUrl,
      status: ghlResponse.status,
      response: responseText,
      payload: samplePayload
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async () => {
  return new Response(`
<!DOCTYPE html>
<html>
<head>
  <title>GoHighLevel Webhook Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .button { background: #20466f; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    .result { margin-top: 20px; padding: 15px; border-radius: 5px; }
    .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
    .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
    pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>GoHighLevel Webhook Test</h1>
  <p>Click the button below to send a sample webhook payload to your configured GoHighLevel webhook URL.</p>
  
  <button class="button" onclick="testWebhook()">Send Test Webhook</button>
  
  <div id="result"></div>

  <script>
    async function testWebhook() {
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '<p>Sending test webhook...</p>';
      
      try {
        const response = await fetch('/api/test-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
          resultDiv.innerHTML = \`
            <div class="result success">
              <h3>✅ Webhook sent successfully!</h3>
              <p><strong>Webhook URL:</strong> \${result.webhookUrl}</p>
              <p><strong>GHL Response Status:</strong> \${result.status}</p>
              <details>
                <summary>View Payload</summary>
                <pre>\${JSON.stringify(result.payload, null, 2)}</pre>
              </details>
              <details>
                <summary>View GHL Response</summary>
                <pre>\${result.response}</pre>
              </details>
            </div>
          \`;
        } else {
          resultDiv.innerHTML = \`
            <div class="result error">
              <h3>❌ Webhook failed</h3>
              <p><strong>Error:</strong> \${result.error}</p>
              <p><strong>Details:</strong> \${result.details || result.message || 'No additional details'}</p>
              \${result.webhookUrl ? \`<p><strong>Webhook URL:</strong> \${result.webhookUrl}</p>\` : ''}
              \${result.response ? \`<details><summary>GHL Response</summary><pre>\${result.response}</pre></details>\` : ''}
            </div>
          \`;
        }
      } catch (error) {
        resultDiv.innerHTML = \`
          <div class="result error">
            <h3>❌ Request failed</h3>
            <p><strong>Error:</strong> \${error.message}</p>
          </div>
        \`;
      }
    }
  </script>
</body>
</html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
};