// GoHighLevel CRM Integration
import type { LeadData, LeadScore } from './lead-scoring';

export interface GHLContact {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  website?: string;
  companyName?: string;
  source: string;
  tags: string[];
  customFields: Record<string, any>;
}

export interface GHLResponse {
  success: boolean;
  contactId?: string;
  error?: string;
}

// Convert lead data to GHL contact format
export function formatForGHL(lead: LeadData, score: LeadScore): GHLContact {
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    website: lead.website,
    companyName: lead.company,
    source: `AktivCRO Website - ${lead.source}`,
    tags: [
      ...score.tags,
      `lead_score_${score.total}`,
      `priority_${score.priority}`
    ],
    customFields: {
      lead_score: score.total,
      lead_priority: score.priority,
      original_message: lead.message,
      signup_date: lead.timestamp.toISOString(),
      user_agent: lead.userAgent,
      referrer: lead.referrer,
      service_interest: lead.service,
      source_breakdown: JSON.stringify(score.breakdown)
    }
  };
}

// Send lead to GoHighLevel
export async function sendToGHL(contact: GHLContact): Promise<GHLResponse> {
  const ghlApiKey = import.meta.env.GHL_API_KEY;
  const ghlLocationId = import.meta.env.GHL_LOCATION_ID;
  
  if (!ghlApiKey || !ghlLocationId) {
    console.warn('GHL credentials not configured');
    return { success: false, error: 'GHL credentials not configured' };
  }
  
  try {
    // First, check if contact exists
    const searchResponse = await fetch(
      `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${ghlLocationId}&email=${contact.email}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      }
    );
    
    const existingContact = await searchResponse.json();
    
    if (existingContact.contact) {
      // Update existing contact
      const updateResponse = await fetch(
        `https://services.leadconnectorhq.com/contacts/${existingContact.contact.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${ghlApiKey}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
          },
          body: JSON.stringify({
            ...contact,
            locationId: ghlLocationId
          })
        }
      );
      
      if (updateResponse.ok) {
        const result = await updateResponse.json();
        return { success: true, contactId: result.contact.id };
      } else {
        throw new Error(`Failed to update contact: ${updateResponse.statusText}`);
      }
    } else {
      // Create new contact
      const createResponse = await fetch(
        'https://services.leadconnectorhq.com/contacts/',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ghlApiKey}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
          },
          body: JSON.stringify({
            ...contact,
            locationId: ghlLocationId
          })
        }
      );
      
      if (createResponse.ok) {
        const result = await createResponse.json();
        return { success: true, contactId: result.contact.id };
      } else {
        throw new Error(`Failed to create contact: ${createResponse.statusText}`);
      }
    }
  } catch (error) {
    console.error('GHL integration error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Trigger automated workflows in GHL
export async function triggerGHLWorkflow(contactId: string, workflowId: string): Promise<boolean> {
  const ghlApiKey = import.meta.env.GHL_API_KEY;
  
  if (!ghlApiKey) {
    console.warn('GHL API key not configured');
    return false;
  }
  
  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/workflows/${workflowId}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          contactId: contactId
        })
      }
    );
    
    return response.ok;
  } catch (error) {
    console.error('Failed to trigger GHL workflow:', error);
    return false;
  }
}

// Get workflow IDs for different lead types
export function getWorkflowId(leadSource: string, priority: string): string | null {
  const workflows: Record<string, Record<string, string>> = {
    hero_demo: {
      urgent: import.meta.env.GHL_WORKFLOW_DEMO_URGENT || '',
      high: import.meta.env.GHL_WORKFLOW_DEMO_HIGH || '',
      medium: import.meta.env.GHL_WORKFLOW_DEMO_MEDIUM || '',
      low: import.meta.env.GHL_WORKFLOW_DEMO_LOW || ''
    },
    contact_form: {
      urgent: import.meta.env.GHL_WORKFLOW_CONTACT_URGENT || '',
      high: import.meta.env.GHL_WORKFLOW_CONTACT_HIGH || '',
      medium: import.meta.env.GHL_WORKFLOW_CONTACT_MEDIUM || '',
      low: import.meta.env.GHL_WORKFLOW_CONTACT_LOW || ''
    },
    calculator: {
      urgent: import.meta.env.GHL_WORKFLOW_CALCULATOR_URGENT || '',
      high: import.meta.env.GHL_WORKFLOW_CALCULATOR_HIGH || '',
      medium: import.meta.env.GHL_WORKFLOW_CALCULATOR_MEDIUM || '',
      low: import.meta.env.GHL_WORKFLOW_CALCULATOR_LOW || ''
    },
    newsletter: {
      urgent: import.meta.env.GHL_WORKFLOW_NEWSLETTER || '',
      high: import.meta.env.GHL_WORKFLOW_NEWSLETTER || '',
      medium: import.meta.env.GHL_WORKFLOW_NEWSLETTER || '',
      low: import.meta.env.GHL_WORKFLOW_NEWSLETTER || ''
    }
  };
  
  return workflows[leadSource]?.[priority] || null;
}