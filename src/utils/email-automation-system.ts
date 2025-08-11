/**
 * Advanced Email Automation System
 * Triggers personalized email sequences based on user behavior, lead scoring, and engagement data
 */

import { trackEvent } from './analytics-manager';
import { calculateLeadScore, LeadProfile, BehavioralData } from './lead-scoring-system';

export interface AutomationTrigger {
  id: string;
  name: string;
  description: string;
  conditions: TriggerCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  priority: number;
  cooldownHours: number; // Prevent spam
  maxTriggers: number; // Lifetime limit per user
}

export interface TriggerCondition {
  type: 'event' | 'score' | 'behavior' | 'demographic' | 'time_based' | 'page_visit';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals';
  field: string;
  value: any;
  timeframe?: number; // in hours
}

export interface AutomationAction {
  type: 'send_email' | 'add_tag' | 'update_score' | 'schedule_follow_up' | 'notify_team' | 'update_crm';
  emailTemplate?: EmailTemplate;
  delay?: number; // delay in minutes before execution
  tags?: string[];
  scoreAdjustment?: number;
  crmData?: Record<string, any>;
  teamNotification?: TeamNotification;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  personalizations: PersonalizationField[];
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  trackOpens: boolean;
  trackClicks: boolean;
}

export interface PersonalizationField {
  field: string;
  fallback: string;
  transformation?: 'uppercase' | 'lowercase' | 'capitalize' | 'titlecase';
}

export interface TeamNotification {
  type: 'slack' | 'email' | 'webhook';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  recipients: string[];
  webhookUrl?: string;
}

export interface AutomationExecution {
  id: string;
  triggerId: string;
  userId: string;
  executedAt: Date;
  status: 'pending' | 'executed' | 'failed' | 'cancelled';
  results: ExecutionResult[];
  errorMessage?: string;
}

export interface ExecutionResult {
  actionType: string;
  success: boolean;
  data?: any;
  errorMessage?: string;
  executedAt: Date;
}

class EmailAutomationSystem {
  private triggers: Map<string, AutomationTrigger> = new Map();
  private executions: Map<string, AutomationExecution[]> = new Map(); // userId -> executions
  private userCooldowns: Map<string, Map<string, Date>> = new Map(); // userId -> triggerId -> lastTrigger

  constructor() {
    this.initializeDefaultTriggers();
    this.startEventListeners();
  }

  private initializeDefaultTriggers() {
    // Welcome sequence for new leads
    this.addTrigger({
      id: 'welcome_new_lead',
      name: 'Welcome New Lead',
      description: 'Send welcome email when someone submits contact form',
      conditions: [
        {
          type: 'event',
          operator: 'equals',
          field: 'form_submission',
          value: 'contact',
          timeframe: 1
        }
      ],
      actions: [
        {
          type: 'send_email',
          delay: 5, // 5 minutes delay
          emailTemplate: {
            id: 'welcome_new_lead',
            name: 'Welcome New Lead',
            subject: 'Welcome to AktivCRO! Let\'s optimize your conversions 🚀',
            htmlContent: this.getWelcomeEmailTemplate(),
            textContent: this.getWelcomeEmailTextTemplate(),
            personalizations: [
              { field: 'firstName', fallback: 'there' },
              { field: 'company', fallback: 'your business' }
            ],
            fromEmail: 'hello@aktivcro.com',
            fromName: 'Sarah from AktivCRO',
            replyTo: 'sarah@aktivcro.com',
            trackOpens: true,
            trackClicks: true
          }
        },
        {
          type: 'add_tag',
          tags: ['new_lead', 'welcome_sent']
        }
      ],
      isActive: true,
      priority: 1,
      cooldownHours: 24,
      maxTriggers: 1
    });

    // Demo follow-up sequence
    this.addTrigger({
      id: 'demo_follow_up',
      name: 'Demo Request Follow-up',
      description: 'Follow up after demo request',
      conditions: [
        {
          type: 'event',
          operator: 'equals',
          field: 'demo_request',
          value: true,
          timeframe: 1
        }
      ],
      actions: [
        {
          type: 'send_email',
          delay: 30, // 30 minutes
          emailTemplate: {
            id: 'demo_follow_up',
            name: 'Demo Follow-up',
            subject: 'Your Custom CRO Demo is Ready! 🎯',
            htmlContent: this.getDemoFollowUpTemplate(),
            textContent: this.getDemoFollowUpTextTemplate(),
            personalizations: [
              { field: 'firstName', fallback: 'there' },
              { field: 'company', fallback: 'your business' },
              { field: 'framework', fallback: 'Authority Framework' },
              { field: 'demoUrl', fallback: '/demos' }
            ],
            fromEmail: 'demos@aktivcro.com',
            fromName: 'AktivCRO Demo Team',
            trackOpens: true,
            trackClicks: true
          }
        },
        {
          type: 'notify_team',
          teamNotification: {
            type: 'slack',
            message: 'New demo request from {{firstName}} at {{company}}',
            urgency: 'high',
            recipients: ['#sales']
          }
        }
      ],
      isActive: true,
      priority: 1,
      cooldownHours: 48,
      maxTriggers: 2
    });

    // High-value lead alert
    this.addTrigger({
      id: 'high_value_lead_alert',
      name: 'High-Value Lead Alert',
      description: 'Alert team when lead score exceeds 80',
      conditions: [
        {
          type: 'score',
          operator: 'greater_than',
          field: 'total_score',
          value: 80
        }
      ],
      actions: [
        {
          type: 'notify_team',
          teamNotification: {
            type: 'slack',
            message: '🔥 High-value lead alert: {{firstName}} at {{company}} (Score: {{leadScore}})',
            urgency: 'high',
            recipients: ['#sales', '#management']
          }
        },
        {
          type: 'send_email',
          delay: 60, // 1 hour
          emailTemplate: {
            id: 'high_value_lead',
            name: 'High-Value Lead Nurture',
            subject: 'Ready to 2x your conversions? Let\'s talk strategy 💡',
            htmlContent: this.getHighValueLeadTemplate(),
            textContent: this.getHighValueLeadTextTemplate(),
            personalizations: [
              { field: 'firstName', fallback: 'there' },
              { field: 'company', fallback: 'your business' }
            ],
            fromEmail: 'sarah@aktivcro.com',
            fromName: 'Sarah Lunt, CEO',
            replyTo: 'sarah@aktivcro.com',
            trackOpens: true,
            trackClicks: true
          }
        }
      ],
      isActive: true,
      priority: 1,
      cooldownHours: 168, // 1 week
      maxTriggers: 1
    });

    // Calculator completion follow-up
    this.addTrigger({
      id: 'calculator_completion',
      name: 'Calculator Completion Follow-up',
      description: 'Follow up after ROI calculator completion',
      conditions: [
        {
          type: 'event',
          operator: 'equals',
          field: 'calculator_completed',
          value: true,
          timeframe: 2
        }
      ],
      actions: [
        {
          type: 'send_email',
          delay: 15, // 15 minutes
          emailTemplate: {
            id: 'calculator_follow_up',
            name: 'Calculator Follow-up',
            subject: 'Your ROI Report: ${{projectedValue}} in potential revenue 📊',
            htmlContent: this.getCalculatorFollowUpTemplate(),
            textContent: this.getCalculatorFollowUpTextTemplate(),
            personalizations: [
              { field: 'firstName', fallback: 'there' },
              { field: 'projectedValue', fallback: '50,000' },
              { field: 'currentConversionRate', fallback: '2.5' },
              { field: 'estimatedImprovement', fallback: '40' }
            ],
            fromEmail: 'insights@aktivcro.com',
            fromName: 'AktivCRO Insights Team',
            trackOpens: true,
            trackClicks: true
          }
        }
      ],
      isActive: true,
      priority: 2,
      cooldownHours: 24,
      maxTriggers: 1
    });

    // Abandoned cart/form sequence
    this.addTrigger({
      id: 'form_abandonment',
      name: 'Form Abandonment Recovery',
      description: 'Re-engage users who started but didn\'t complete forms',
      conditions: [
        {
          type: 'behavior',
          operator: 'equals',
          field: 'form_started',
          value: true,
          timeframe: 24
        },
        {
          type: 'behavior',
          operator: 'equals',
          field: 'form_completed',
          value: false,
          timeframe: 24
        }
      ],
      actions: [
        {
          type: 'send_email',
          delay: 1440, // 24 hours
          emailTemplate: {
            id: 'form_abandonment',
            name: 'Form Abandonment Recovery',
            subject: 'Quick question - what stopped you from reaching out?',
            htmlContent: this.getFormAbandonmentTemplate(),
            textContent: this.getFormAbandonmentTextTemplate(),
            personalizations: [
              { field: 'firstName', fallback: 'there' }
            ],
            fromEmail: 'hello@aktivcro.com',
            fromName: 'Sarah from AktivCRO',
            replyTo: 'sarah@aktivcro.com',
            trackOpens: true,
            trackClicks: true
          }
        }
      ],
      isActive: true,
      priority: 3,
      cooldownHours: 72,
      maxTriggers: 1
    });

    console.log('Email Automation: Default triggers initialized');
  }

  private startEventListeners() {
    // Listen for custom events that trigger automations
    document.addEventListener('aktivcro:user_action', (event: any) => {
      this.handleUserAction(event.detail);
    });

    document.addEventListener('aktivcro:lead_scored', (event: any) => {
      this.handleLeadScored(event.detail);
    });
  }

  // Public Methods
  public addTrigger(trigger: AutomationTrigger): boolean {
    try {
      if (!this.validateTrigger(trigger)) {
        throw new Error('Invalid trigger configuration');
      }

      this.triggers.set(trigger.id, trigger);
      console.log('Email Automation: Trigger added successfully', trigger.id);
      return true;
    } catch (error) {
      console.error('Email Automation: Failed to add trigger', error);
      return false;
    }
  }

  public removeTrigger(triggerId: string): boolean {
    return this.triggers.delete(triggerId);
  }

  public activateTrigger(triggerId: string): boolean {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.isActive = true;
      return true;
    }
    return false;
  }

  public deactivateTrigger(triggerId: string): boolean {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.isActive = false;
      return true;
    }
    return false;
  }

  public triggerAutomation(userId: string, eventData: any): boolean {
    try {
      const matchingTriggers = this.findMatchingTriggers(userId, eventData);
      
      matchingTriggers.forEach(trigger => {
        if (this.canExecuteTrigger(userId, trigger.id)) {
          this.executeTrigger(userId, trigger, eventData);
        }
      });

      return true;
    } catch (error) {
      console.error('Email Automation: Failed to trigger automation', error);
      return false;
    }
  }

  public getExecutionHistory(userId: string): AutomationExecution[] {
    return this.executions.get(userId) || [];
  }

  public getActiveTriggers(): AutomationTrigger[] {
    return Array.from(this.triggers.values()).filter(trigger => trigger.isActive);
  }

  // Event Handlers
  private handleUserAction(eventData: any) {
    const { userId, action, data } = eventData;
    this.triggerAutomation(userId, { action, ...data });
  }

  private handleLeadScored(eventData: any) {
    const { userId, leadScore, profile } = eventData;
    this.triggerAutomation(userId, { 
      action: 'lead_scored', 
      total_score: leadScore.total,
      grade: leadScore.grade,
      category: leadScore.category,
      profile 
    });
  }

  // Private Methods
  private findMatchingTriggers(userId: string, eventData: any): AutomationTrigger[] {
    const activeTriggers = this.getActiveTriggers();
    
    return activeTriggers.filter(trigger => {
      return trigger.conditions.every(condition => {
        return this.evaluateCondition(condition, eventData, userId);
      });
    }).sort((a, b) => a.priority - b.priority);
  }

  private evaluateCondition(condition: TriggerCondition, eventData: any, userId: string): boolean {
    const fieldValue = this.getFieldValue(condition.field, eventData, userId);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      default:
        return false;
    }
  }

  private getFieldValue(field: string, eventData: any, userId: string): any {
    // Handle nested field access with dot notation
    const fieldPath = field.split('.');
    let value = eventData;
    
    for (const key of fieldPath) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private canExecuteTrigger(userId: string, triggerId: string): boolean {
    // Check cooldown
    const userCooldowns = this.userCooldowns.get(userId);
    if (userCooldowns && userCooldowns.has(triggerId)) {
      const lastTrigger = userCooldowns.get(triggerId)!;
      const trigger = this.triggers.get(triggerId)!;
      const cooldownEnd = new Date(lastTrigger.getTime() + (trigger.cooldownHours * 60 * 60 * 1000));
      
      if (new Date() < cooldownEnd) {
        console.log('Email Automation: Trigger in cooldown', triggerId);
        return false;
      }
    }

    // Check max triggers limit
    const userExecutions = this.executions.get(userId) || [];
    const triggerExecutions = userExecutions.filter(exec => exec.triggerId === triggerId);
    const trigger = this.triggers.get(triggerId)!;
    
    if (triggerExecutions.length >= trigger.maxTriggers) {
      console.log('Email Automation: Max triggers exceeded', triggerId);
      return false;
    }

    return true;
  }

  private async executeTrigger(userId: string, trigger: AutomationTrigger, eventData: any) {
    const execution: AutomationExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggerId: trigger.id,
      userId,
      executedAt: new Date(),
      status: 'pending',
      results: []
    };

    try {
      // Execute actions
      for (const action of trigger.actions) {
        const result = await this.executeAction(action, userId, eventData, execution);
        execution.results.push(result);
      }

      execution.status = 'executed';
      
      // Update cooldown
      if (!this.userCooldowns.has(userId)) {
        this.userCooldowns.set(userId, new Map());
      }
      this.userCooldowns.get(userId)!.set(trigger.id, new Date());

      console.log('Email Automation: Trigger executed successfully', trigger.id);
    } catch (error) {
      execution.status = 'failed';
      execution.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Email Automation: Trigger execution failed', error);
    }

    // Store execution
    if (!this.executions.has(userId)) {
      this.executions.set(userId, []);
    }
    this.executions.get(userId)!.push(execution);

    // Track execution event
    trackEvent({
      name: 'email_automation_executed',
      parameters: {
        trigger_id: trigger.id,
        user_id: userId,
        status: execution.status,
        actions_count: execution.results.length
      }
    });
  }

  private async executeAction(
    action: AutomationAction, 
    userId: string, 
    eventData: any, 
    execution: AutomationExecution
  ): Promise<ExecutionResult> {
    const result: ExecutionResult = {
      actionType: action.type,
      success: false,
      executedAt: new Date()
    };

    try {
      // Apply delay if specified
      if (action.delay && action.delay > 0) {
        await this.delay(action.delay * 60 * 1000); // Convert minutes to milliseconds
      }

      switch (action.type) {
        case 'send_email':
          if (action.emailTemplate) {
            result.data = await this.sendEmail(action.emailTemplate, userId, eventData);
            result.success = true;
          }
          break;

        case 'add_tag':
          if (action.tags) {
            result.data = await this.addUserTags(userId, action.tags);
            result.success = true;
          }
          break;

        case 'notify_team':
          if (action.teamNotification) {
            result.data = await this.sendTeamNotification(action.teamNotification, eventData);
            result.success = true;
          }
          break;

        case 'update_score':
          if (action.scoreAdjustment) {
            result.data = await this.updateUserScore(userId, action.scoreAdjustment);
            result.success = true;
          }
          break;

        case 'update_crm':
          if (action.crmData) {
            result.data = await this.updateCRM(userId, action.crmData);
            result.success = true;
          }
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      result.success = false;
      result.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async sendEmail(template: EmailTemplate, userId: string, eventData: any): Promise<any> {
    // In production, integrate with email service provider (SendGrid, Mailgun, etc.)
    const personalizedContent = this.personalizeEmailContent(template, eventData);
    
    console.log('Email Automation: Sending email', {
      to: eventData.email || 'unknown@example.com',
      subject: personalizedContent.subject,
      template: template.id
    });

    // Simulate email sending
    trackEvent({
      name: 'automation_email_sent',
      parameters: {
        template_id: template.id,
        template_name: template.name,
        user_id: userId,
        email: this.hashEmail(eventData.email || '')
      }
    });

    return { emailSent: true, templateId: template.id };
  }

  private personalizeEmailContent(template: EmailTemplate, eventData: any) {
    let subject = template.subject;
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;

    template.personalizations.forEach(personalization => {
      const value = eventData[personalization.field] || personalization.fallback;
      const transformedValue = this.transformValue(value, personalization.transformation);
      
      subject = subject.replace(new RegExp(`{{${personalization.field}}}`, 'g'), transformedValue);
      htmlContent = htmlContent.replace(new RegExp(`{{${personalization.field}}}`, 'g'), transformedValue);
      textContent = textContent.replace(new RegExp(`{{${personalization.field}}}`, 'g'), transformedValue);
    });

    return { subject, htmlContent, textContent };
  }

  private transformValue(value: string, transformation?: string): string {
    if (!transformation) return value;

    switch (transformation) {
      case 'uppercase':
        return value.toUpperCase();
      case 'lowercase':
        return value.toLowerCase();
      case 'capitalize':
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      case 'titlecase':
        return value.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      default:
        return value;
    }
  }

  private async addUserTags(userId: string, tags: string[]): Promise<any> {
    console.log('Email Automation: Adding tags to user', userId, tags);
    
    // In production, integrate with CRM/database
    const existingTags = localStorage.getItem(`user_tags_${userId}`);
    const currentTags = existingTags ? JSON.parse(existingTags) : [];
    const newTags = [...new Set([...currentTags, ...tags])];
    
    localStorage.setItem(`user_tags_${userId}`, JSON.stringify(newTags));
    
    return { tags: newTags };
  }

  private async sendTeamNotification(notification: TeamNotification, eventData: any): Promise<any> {
    const personalizedMessage = this.personalizeMessage(notification.message, eventData);
    
    console.log('Email Automation: Sending team notification', {
      type: notification.type,
      message: personalizedMessage,
      urgency: notification.urgency,
      recipients: notification.recipients
    });

    // In production, integrate with Slack, email, or webhook services
    if (notification.type === 'webhook' && notification.webhookUrl) {
      // Send webhook
      fetch(notification.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: personalizedMessage,
          urgency: notification.urgency,
          eventData
        })
      }).catch(console.error);
    }

    return { notificationSent: true, message: personalizedMessage };
  }

  private personalizeMessage(message: string, eventData: any): string {
    let personalizedMessage = message;
    
    // Replace common placeholders
    Object.keys(eventData).forEach(key => {
      if (eventData[key]) {
        personalizedMessage = personalizedMessage.replace(
          new RegExp(`{{${key}}}`, 'g'), 
          String(eventData[key])
        );
      }
    });

    return personalizedMessage;
  }

  private async updateUserScore(userId: string, adjustment: number): Promise<any> {
    console.log('Email Automation: Updating user score', userId, adjustment);
    
    // In production, integrate with lead scoring system
    const currentScore = parseInt(localStorage.getItem(`user_score_${userId}`) || '0');
    const newScore = Math.max(0, Math.min(100, currentScore + adjustment));
    
    localStorage.setItem(`user_score_${userId}`, newScore.toString());
    
    return { oldScore: currentScore, newScore, adjustment };
  }

  private async updateCRM(userId: string, crmData: Record<string, any>): Promise<any> {
    console.log('Email Automation: Updating CRM', userId, crmData);
    
    // In production, integrate with GoHighLevel or other CRM
    const existingData = localStorage.getItem(`crm_data_${userId}`);
    const currentData = existingData ? JSON.parse(existingData) : {};
    const updatedData = { ...currentData, ...crmData, lastUpdated: new Date().toISOString() };
    
    localStorage.setItem(`crm_data_${userId}`, JSON.stringify(updatedData));
    
    return updatedData;
  }

  private validateTrigger(trigger: AutomationTrigger): boolean {
    if (!trigger.id || !trigger.name || !trigger.conditions || !trigger.actions) {
      return false;
    }

    if (trigger.conditions.length === 0 || trigger.actions.length === 0) {
      return false;
    }

    return true;
  }

  private hashEmail(email: string): string {
    if (!email) return '';
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Email Template Methods
  private getWelcomeEmailTemplate(): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #20466f; font-size: 28px; margin-bottom: 10px;">Welcome to AktivCRO, {{firstName}}! 🚀</h1>
          <p style="color: #666; font-size: 16px;">Ready to transform your website into a conversion powerhouse?</p>
        </div>
        
        <div style="background: #f8f9ff; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #20466f; font-size: 22px; margin-bottom: 15px;">Here's what happens next:</h2>
          <ul style="color: #444; line-height: 1.8; padding-left: 20px;">
            <li><strong>Demo Creation:</strong> We'll create a custom demo showing how {{company}} could look optimized</li>
            <li><strong>ROI Analysis:</strong> Use our calculator to see your potential revenue increase</li>
            <li><strong>Strategy Session:</strong> Book a 30-minute consultation to discuss your specific needs</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="https://aktivcro.com/demos" style="background: #20466f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 10px;">View Demo Gallery</a>
          <a href="https://aktivcro.com/calculator" style="background: #ffd147; color: #20466f; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 10px;">Calculate Your ROI</a>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffd147;">
          <p style="margin: 0; color: #856404;"><strong>Quick Win:</strong> Most clients see 20-40% conversion improvements within the first 30 days. What could that mean for {{company}}?</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">Questions? Just reply to this email - I read every message personally.</p>
          <p style="color: #666; font-size: 14px;"><strong>Sarah Lunt</strong><br>Founder & CEO, AktivCRO</p>
        </div>
      </div>
    `;
  }

  private getWelcomeEmailTextTemplate(): string {
    return `
Welcome to AktivCRO, {{firstName}}! 

Ready to transform your website into a conversion powerhouse?

Here's what happens next:
• Demo Creation: We'll create a custom demo showing how {{company}} could look optimized
• ROI Analysis: Use our calculator to see your potential revenue increase  
• Strategy Session: Book a 30-minute consultation to discuss your specific needs

Quick Win: Most clients see 20-40% conversion improvements within the first 30 days. What could that mean for {{company}}?

View Demo Gallery: https://aktivcro.com/demos
Calculate Your ROI: https://aktivcro.com/calculator

Questions? Just reply to this email - I read every message personally.

Sarah Lunt
Founder & CEO, AktivCRO
    `;
  }

  private getDemoFollowUpTemplate(): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #20466f; font-size: 28px; margin-bottom: 10px;">Your Custom Demo is Ready! 🎯</h1>
          <p style="color: #666; font-size: 16px;">See how the {{framework}} could transform {{company}}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #20466f 0%, #2d5aa0 100%); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
          <h2 style="color: white; font-size: 22px; margin-bottom: 15px;">🚀 Your Personalized Demo</h2>
          <a href="{{demoUrl}}" style="background: #ffd147; color: #20466f; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 10px; font-size: 18px;">View Your Demo →</a>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #20466f; font-size: 20px;">What you'll see in your demo:</h3>
          <ul style="color: #444; line-height: 1.8; padding-left: 20px;">
            <li>Optimized conversion flows specific to your industry</li>
            <li>Trust signals and social proof strategically placed</li>
            <li>Mobile-first design that converts on all devices</li>
            <li>A/B test ideas you can implement immediately</li>
          </ul>
        </div>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #155724; margin-top: 0;">💡 Implementation Timeline</h3>
          <p style="color: #155724; margin: 0;"><strong>Week 1-2:</strong> Foundation setup and framework implementation<br>
          <strong>Week 3-4:</strong> Advanced optimizations and A/B testing<br>
          <strong>Week 5+:</strong> Ongoing optimization and performance monitoring</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="color: #444; font-size: 16px; margin-bottom: 15px;">Ready to discuss your specific needs?</p>
          <a href="https://aktivcro.com/book-consultation" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Book Strategy Session</a>
        </div>
      </div>
    `;
  }

  private getDemoFollowUpTextTemplate(): string {
    return `
Your Custom Demo is Ready! 🎯

See how the {{framework}} could transform {{company}}

Your Personalized Demo: {{demoUrl}}

What you'll see in your demo:
• Optimized conversion flows specific to your industry
• Trust signals and social proof strategically placed  
• Mobile-first design that converts on all devices
• A/B test ideas you can implement immediately

Implementation Timeline:
Week 1-2: Foundation setup and framework implementation
Week 3-4: Advanced optimizations and A/B testing
Week 5+: Ongoing optimization and performance monitoring

Ready to discuss your specific needs?
Book Strategy Session: https://aktivcro.com/book-consultation
    `;
  }

  private getHighValueLeadTemplate(): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #20466f; font-size: 28px; margin-bottom: 10px;">Ready to 2x your conversions? 💡</h1>
          <p style="color: #666; font-size: 16px;">Let's discuss a custom strategy for {{company}}</p>
        </div>
        
        <div style="background: #fff8e1; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ffd147;">
          <p style="color: #444; font-size: 16px; margin: 0; line-height: 1.6;">Hi {{firstName}},<br><br>
          I've been reviewing your engagement with AktivCRO, and I can see {{company}} is serious about optimizing conversions. That's exactly the kind of commitment that leads to breakthrough results.</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #20466f; font-size: 20px;">Here's what I'm thinking for {{company}}:</h3>
          <ul style="color: #444; line-height: 1.8; padding-left: 20px;">
            <li><strong>Rapid Implementation:</strong> 30-day sprint to implement high-impact optimizations</li>
            <li><strong>Custom Framework:</strong> Tailored approach based on your industry and audience</li>
            <li><strong>Dedicated Support:</strong> Direct access to our optimization team</li>
            <li><strong>Performance Guarantee:</strong> Measurable results or we keep working</li>
          </ul>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1565c0; margin-top: 0;">🎯 Typical Results</h3>
          <p style="color: #1565c0; margin: 0;">Companies similar to {{company}} typically see:<br>
          <strong>25-50% conversion increase</strong> within the first month<br>
          <strong>$500K+ additional revenue</strong> in year one</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="color: #444; font-size: 16px; margin-bottom: 15px;">Let's schedule a 20-minute strategy call to discuss your specific situation.</p>
          <a href="https://aktivcro.com/book-strategy-call" style="background: #20466f; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 18px;">Schedule Strategy Call →</a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;"><strong>Sarah Lunt</strong><br>Founder & CEO<br>sarah@aktivcro.com</p>
        </div>
      </div>
    `;
  }

  private getHighValueLeadTextTemplate(): string {
    return `
Ready to 2x your conversions? Let's discuss a custom strategy for {{company}}

Hi {{firstName}},

I've been reviewing your engagement with AktivCRO, and I can see {{company}} is serious about optimizing conversions. That's exactly the kind of commitment that leads to breakthrough results.

Here's what I'm thinking for {{company}}:
• Rapid Implementation: 30-day sprint to implement high-impact optimizations
• Custom Framework: Tailored approach based on your industry and audience  
• Dedicated Support: Direct access to our optimization team
• Performance Guarantee: Measurable results or we keep working

Typical Results:
Companies similar to {{company}} typically see:
• 25-50% conversion increase within the first month
• $500K+ additional revenue in year one

Let's schedule a 20-minute strategy call to discuss your specific situation.
Schedule Strategy Call: https://aktivcro.com/book-strategy-call

Sarah Lunt
Founder & CEO
sarah@aktivcro.com
    `;
  }

  private getCalculatorFollowUpTemplate(): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #20466f; font-size: 28px; margin-bottom: 10px;">Your ROI Report: ${{projectedValue}} 📊</h1>
          <p style="color: #666; font-size: 16px;">Here's how we can help you achieve this potential</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin-bottom: 25px; border: 2px solid #0ea5e9;">
          <h2 style="color: #0369a1; font-size: 22px; margin-bottom: 15px; text-align: center;">💰 Your Conversion Opportunity</h2>
          <div style="text-align: center;">
            <div style="display: inline-block; margin: 10px 20px;">
              <div style="font-size: 24px; font-weight: bold; color: #dc2626;">{{currentConversionRate}}%</div>
              <div style="color: #666; font-size: 14px;">Current Rate</div>
            </div>
            <div style="display: inline-block; margin: 10px 20px; color: #16a34a;">
              <div style="font-size: 32px;">→</div>
            </div>
            <div style="display: inline-block; margin: 10px 20px;">
              <div style="font-size: 24px; font-weight: bold; color: #16a34a;">+{{estimatedImprovement}}%</div>
              <div style="color: #666; font-size: 14px;">Improvement</div>
            </div>
            <div style="display: inline-block; margin: 10px 20px; color: #16a34a;">
              <div style="font-size: 32px;">=</div>
            </div>
            <div style="display: inline-block; margin: 10px 20px;">
              <div style="font-size: 24px; font-weight: bold; color: #0ea5e9;">${{projectedValue}}</div>
              <div style="color: #666; font-size: 14px;">Additional Revenue</div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #20466f; font-size: 20px;">How we'll achieve this:</h3>
          <ul style="color: #444; line-height: 1.8; padding-left: 20px;">
            <li><strong>Conversion Audit:</strong> Identify the biggest opportunities first</li>
            <li><strong>Framework Implementation:</strong> Apply proven methodologies to your site</li>
            <li><strong>A/B Testing:</strong> Validate improvements with statistical significance</li>
            <li><strong>Performance Tracking:</strong> Monitor and optimize continuously</li>
          </ul>
        </div>
        
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #166534; margin-top: 0;">⚡ Quick Wins Available</h3>
          <p style="color: #166534; margin: 0;">Based on your current performance, we can likely achieve 20-30% of this improvement in the first 2 weeks through landing page optimization and trust signal enhancement.</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="color: #444; font-size: 16px; margin-bottom: 15px;">Ready to turn this projection into reality?</p>
          <a href="https://aktivcro.com/get-started" style="background: #16a34a; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 18px;">Get Started Today →</a>
        </div>
      </div>
    `;
  }

  private getCalculatorFollowUpTextTemplate(): string {
    return `
Your ROI Report: ${{projectedValue}}

Here's how we can help you achieve this potential

Your Conversion Opportunity:
Current Rate: {{currentConversionRate}}% → +{{estimatedImprovement}}% Improvement = ${{projectedValue}} Additional Revenue

How we'll achieve this:
• Conversion Audit: Identify the biggest opportunities first
• Framework Implementation: Apply proven methodologies to your site
• A/B Testing: Validate improvements with statistical significance  
• Performance Tracking: Monitor and optimize continuously

Quick Wins Available:
Based on your current performance, we can likely achieve 20-30% of this improvement in the first 2 weeks through landing page optimization and trust signal enhancement.

Ready to turn this projection into reality?
Get Started Today: https://aktivcro.com/get-started
    `;
  }

  private getFormAbandonmentTemplate(): string {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #20466f; font-size: 28px; margin-bottom: 10px;">Quick question - what stopped you? 🤔</h1>
          <p style="color: #666; font-size: 16px;">We noticed you started reaching out but didn't finish</p>
        </div>
        
        <div style="background: #fff8dc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <p style="color: #444; font-size: 16px; margin: 0; line-height: 1.6;">Hi {{firstName}},<br><br>
          I noticed you started filling out our contact form but didn't submit it. No worries - these things happen!<br><br>
          I'm curious: was there something specific that gave you pause? Maybe a question we didn't answer, or you just needed more information first?</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #20466f; font-size: 20px;">Common concerns we address:</h3>
          <ul style="color: #444; line-height: 1.8; padding-left: 20px;">
            <li><strong>"How much does this cost?"</strong> - Our Foundation package starts at $5,000</li>
            <li><strong>"How long does it take?"</strong> - Most implementations are 2-4 weeks</li>
            <li><strong>"Will this work for my industry?"</strong> - We've optimized 500+ sites across 20+ industries</li>
            <li><strong>"What if it doesn't work?"</strong> - We guarantee measurable results or keep working</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="color: #444; font-size: 16px; margin-bottom: 15px;">Rather talk than type? Let's have a quick 10-minute call.</p>
          <a href="https://aktivcro.com/quick-call" style="background: #20466f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 10px;">Schedule Quick Call</a>
          <a href="https://aktivcro.com/contact" style="background: #f8f9fa; color: #20466f; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 10px; border: 2px solid #20466f;">Complete Your Message</a>
        </div>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <p style="color: #0c5460; margin: 0; text-align: center;"><strong>P.S.</strong> Even if you're just curious or exploring options, I'm happy to chat. No sales pressure - just helpful insights about conversion optimization.</p>
        </div>
      </div>
    `;
  }

  private getFormAbandonmentTextTemplate(): string {
    return `
Quick question - what stopped you?

Hi {{firstName}},

I noticed you started filling out our contact form but didn't submit it. No worries - these things happen!

I'm curious: was there something specific that gave you pause? Maybe a question we didn't answer, or you just needed more information first?

Common concerns we address:
• "How much does this cost?" - Our Foundation package starts at $5,000
• "How long does it take?" - Most implementations are 2-4 weeks  
• "Will this work for my industry?" - We've optimized 500+ sites across 20+ industries
• "What if it doesn't work?" - We guarantee measurable results or keep working

Rather talk than type? Let's have a quick 10-minute call.

Schedule Quick Call: https://aktivcro.com/quick-call
Complete Your Message: https://aktivcro.com/contact

P.S. Even if you're just curious or exploring options, I'm happy to chat. No sales pressure - just helpful insights about conversion optimization.
    `;
  }
}

// Singleton instance
const emailAutomationSystem = new EmailAutomationSystem();

// Convenience functions
export function addAutomationTrigger(trigger: AutomationTrigger): boolean {
  return emailAutomationSystem.addTrigger(trigger);
}

export function triggerEmailAutomation(userId: string, eventData: any): boolean {
  return emailAutomationSystem.triggerAutomation(userId, eventData);
}

export function getAutomationHistory(userId: string): AutomationExecution[] {
  return emailAutomationSystem.getExecutionHistory(userId);
}

export function getActiveAutomationTriggers(): AutomationTrigger[] {
  return emailAutomationSystem.getActiveTriggers();
}

// Event dispatch helpers
export function dispatchUserAction(userId: string, action: string, data: any = {}) {
  document.dispatchEvent(new CustomEvent('aktivcro:user_action', {
    detail: { userId, action, data }
  }));
}

export function dispatchLeadScored(userId: string, leadScore: any, profile: any) {
  document.dispatchEvent(new CustomEvent('aktivcro:lead_scored', {
    detail: { userId, leadScore, profile }
  }));
}

export default emailAutomationSystem;