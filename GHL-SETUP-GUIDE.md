# GoHighLevel Setup Guide for AktivCRO Demo System

This guide explains how to set up GoHighLevel workflows to handle email automation for the AktivCRO demo generation system.

## Overview

The AktivCRO website sends comprehensive demo request data to GoHighLevel via webhook, which then triggers automated email workflows for lead nurturing and team notifications.

## Webhook Payload Structure

When a user completes the demo generator, the following JSON payload is sent to your GHL webhook:

```json
{
  "contact": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "companyName": "Acme Corp",
    "website": "https://acmecorp.com"
  },
  "demoRequest": {
    "businessName": "Acme Corp",
    "industry": "professional-services",
    "industryName": "Professional Services",
    "framework": "authority",
    "frameworkName": "Authority Architecture",
    "services": ["law-firm", "consulting"],
    "valueProposition": "We help businesses grow through legal expertise",
    "microExperiences": ["case-evaluator", "consultation-scheduler"],
    "branding": {
      "primaryColor": "#20466f",
      "secondaryColor": "#ffd147"
    },
    "currentWebsite": "https://acmecorp.com",
    "targetAudience": "Small business owners"
  },
  "projections": {
    "conversionIncrease": "+340%",
    "leadQuality": "+280%",
    "timeToClose": "-45%",
    "roi": "850%",
    "timeframe": "6-8 weeks"
  },
  "leadScore": 85,
  "triggers": {
    "sendDemoEmail": true,
    "scheduleFollowUp": true,
    "addToNurtureCampaign": true,
    "notifyTeam": true
  },
  "source": "demo-generator",
  "timestamp": "2024-01-15T10:30:00Z",
  "userAgent": "Mozilla/5.0..."
}
```

## Environment Setup

1. **Set GHL Webhook URL** in your `.env` file:
   ```bash
   GHL_WEBHOOK_URL=https://your-ghl-webhook-url.com/webhook
   ```

2. **Optional GHL API credentials** (for advanced integrations):
   ```bash
   GHL_API_KEY=your_gohighlevel_api_key
   GHL_LOCATION_ID=your_location_id
   ```

## GoHighLevel Workflow Configuration

### 1. Create Webhook Trigger

1. In GHL, go to **Automation** → **Workflows**
2. Create new workflow: "AktivCRO Demo Request"
3. Set trigger type: **Webhook**
4. Copy the webhook URL to your `.env` file
5. Configure webhook to accept JSON payload

### 2. Lead Processing Steps

Add these workflow steps:

#### Step 1: Create/Update Contact
- **Action**: Create or Update Contact
- **Mapping**:
  - Email: `{{ contact.email }}`
  - First Name: `{{ contact.first_name }}`
  - Last Name: `{{ contact.last_name }}`
  - Phone: `{{ contact.phone }}`
  - Business Name: `{{ contact.company_name }}`
  - Website: `{{ contact.website }}`

#### Step 2: Add Custom Fields
Create and populate these custom fields:
- `demo_industry`: `{{ contact.industry_name }}`
- `demo_framework`: `{{ contact.framework_name }}`
- `demo_services`: `{{ contact.services }}`
- `demo_value_prop`: `{{ contact.demo_value_proposition }}`
- `demo_primary_color`: `{{ contact.primary_color }}`
- `demo_secondary_color`: `{{ contact.secondary_color }}`
- `demo_lead_score`: `{{ contact.lead_score }}`
- `demo_conversion_increase`: `{{ contact.conversion_increase }}`
- `demo_roi`: `{{ contact.roi }}`
- `demo_timeframe`: `{{ contact.timeframe }}`

#### Step 3: Add Tags
Add these tags based on the demo data:
- `demo-request`
- `{{ contact.industry_name }}`
- `{{ contact.framework_name }}`
- `lead-score-{{ contact.lead_score }}`

### 3. Email Automation Setup

#### Demo Results Email
Create an email template with the following structure:

**Subject**: `🎉 Your {{ contact.framework_name }} Demo Results - {{ contact.company_name }}`

**Email Content** (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Professional email styling */
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .header { background: linear-gradient(135deg, {{ contact.primary_color }} 0%, #1e3a61 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .metrics { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .metric { display: inline-block; margin: 15px; text-align: center; }
    .metric-value { font-size: 24px; font-weight: bold; color: #059669; }
    .cta-button { background: {{ contact.primary_color }}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Your Demo Results Are Ready!</h1>
    <p>Personalized optimization preview for {{ contact.company_name }}</p>
  </div>
  
  <div class="content">
    <h2>Hello {{ contact.first_name }}!</h2>
    
    <p>Thank you for your interest in transforming {{ contact.company_name }} with our proven conversion optimization frameworks.</p>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Your Optimization Summary</h3>
      <p><strong>Industry:</strong> {{ contact.industry_name }}</p>
      <p><strong>Framework:</strong> {{ contact.framework_name }}</p>
      <p><strong>Primary Color:</strong> <span style="color: {{ contact.primary_color }};">{{ contact.primary_color }}</span></p>
      <p><strong>Services:</strong> {{ contact.services }}</p>
      <p><strong>Value Proposition:</strong> "{{ contact.demo_value_proposition }}"</p>
    </div>
    
    <h3>Projected Performance Improvements</h3>
    <div class="metrics">
      <div class="metric">
        <div class="metric-value">{{ contact.conversion_increase }}</div>
        <div>Conversion Rate Increase</div>
      </div>
      <div class="metric">
        <div class="metric-value">+280%</div>
        <div>Lead Quality Improvement</div>
      </div>
      <div class="metric">
        <div class="metric-value">-45%</div>
        <div>Faster Time to Close</div>
      </div>
      <div class="metric">
        <div class="metric-value">ROI {{ contact.roi }}</div>
        <div>Return on Investment</div>
      </div>
    </div>
    
    <h3>Implementation Timeline</h3>
    <p>Your optimized website can be launched in approximately <strong>{{ contact.timeframe }}</strong>.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://aktivcro.com/about#contact" class="cta-button">Schedule Strategy Call</a>
      <a href="https://aktivcro.com/calculator" class="cta-button">Calculate Your ROI</a>
    </div>
    
    <h3>Next Steps</h3>
    <p>Our team will contact you within 24 hours with:</p>
    <ul>
      <li>Detailed wireframes and mockups</li>
      <li>Custom pricing based on your requirements</li>
      <li>Implementation timeline and milestones</li>
      <li>Free 30-minute strategy consultation</li>
    </ul>
    
    <p>Best regards,<br><strong>The AktivCRO Team</strong></p>
  </div>
</body>
</html>
```

#### Team Notification Email
Create a team notification email template:

**Subject**: `🚀 New Demo Request: {{ contact.company_name }} (Lead Score: {{ contact.lead_score }})`

**Email Content**:
```html
<h2>New Demo Request</h2>
<p><strong>Lead Score:</strong> {{ contact.lead_score }}/100</p>

<div style="background: #f8fafc; padding: 20px; margin: 20px 0;">
  <p><strong>Company:</strong> {{ contact.company_name }}</p>
  <p><strong>Contact:</strong> {{ contact.first_name }} {{ contact.last_name }}</p>
  <p><strong>Email:</strong> {{ contact.email }}</p>
  <p><strong>Phone:</strong> {{ contact.phone }}</p>
  <p><strong>Website:</strong> {{ contact.website }}</p>
  <p><strong>Industry:</strong> {{ contact.industry_name }}</p>
  <p><strong>Framework:</strong> {{ contact.framework_name }}</p>
  <p><strong>Services:</strong> {{ contact.services }}</p>
  <p><strong>Value Prop:</strong> "{{ contact.demo_value_proposition }}"</p>
</div>

<p><strong>Projections:</strong></p>
<ul>
  <li>Conversion Increase: {{ contact.conversion_increase }}</li>
  <li>ROI: {{ contact.roi }}</li>
  <li>Timeline: {{ contact.timeframe }}</li>
</ul>

<p><strong>Action Required:</strong> Follow up within 24 hours with detailed proposal.</p>
```

### 4. Workflow Timing

Set up the workflow with these timing considerations:

1. **Immediate**: Contact creation and tagging
2. **5 minutes**: Send demo results email (allows for processing time)
3. **10 minutes**: Send team notification
4. **1 day**: Add to follow-up sequence
5. **3 days**: Add to nurture campaign (if no response)

### 5. Lead Scoring Integration

Use the `leadScore` value to trigger different workflows:

- **Score 80-100**: High-priority lead → Immediate team notification + expedited follow-up
- **Score 60-79**: Medium priority → Standard workflow
- **Score 40-59**: Lower priority → Nurture campaign focus
- **Score 0-39**: Minimal engagement → Light touch follow-up

### 6. Conditional Logic

Add conditional steps based on triggers:

```
IF triggers.sendDemoEmail = true
  → Send demo results email

IF triggers.scheduleFollowUp = true  
  → Add to sales follow-up sequence

IF triggers.addToNurtureCampaign = true
  → Add to long-term nurture workflow

IF triggers.notifyTeam = true
  → Send team notification
```

## Testing the Integration

1. **Test webhook**: Use the demo generator on your website
2. **Verify data**: Check that all custom fields populate correctly
3. **Test emails**: Ensure both demo and team emails send properly
4. **Check timing**: Verify email delivery timing (within 15 minutes)
5. **Validate tags**: Confirm proper tagging and lead scoring

## Troubleshooting

### Common Issues:

1. **Webhook not triggering**
   - Verify webhook URL in `.env` file
   - Check GHL webhook logs for errors
   - Ensure JSON payload is properly formatted

2. **Missing custom fields**
   - Create all required custom fields in GHL
   - Check field mapping in workflow
   - Verify data types match

3. **Email not sending**
   - Check email template for syntax errors
   - Ensure all dynamic fields are properly mapped
   - Verify sender email is authenticated

4. **Timing issues**
   - Adjust delay settings in workflow
   - Check for workflow bottlenecks
   - Monitor GHL system status

## Maintenance

- **Monthly**: Review lead scoring accuracy and adjust weights
- **Quarterly**: Update email templates based on performance
- **Ongoing**: Monitor webhook success rates and response times

This setup creates a fully automated demo request system that provides immediate value to prospects while capturing comprehensive lead data for your sales team.