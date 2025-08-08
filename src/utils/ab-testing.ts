// A/B Testing Infrastructure
// Simple client-side A/B testing system for conversion optimization

export interface ABTest {
  id: string;
  name: string;
  variants: ABVariant[];
  traffic: number; // Percentage of traffic to include (0-100)
  active: boolean;
}

export interface ABVariant {
  id: string;
  name: string;
  weight: number; // Percentage of test traffic (0-100)
  changes: ABChange[];
}

export interface ABChange {
  type: 'text' | 'style' | 'element' | 'redirect';
  selector: string;
  content?: string;
  styles?: Record<string, string>;
  url?: string;
}

// Cookie-based user assignment for consistent experience
export function getUserVariant(testId: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookieName = `ab_test_${testId}`;
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${cookieName}=`));
  
  return cookie ? cookie.split('=')[1] : null;
}

export function setUserVariant(testId: string, variantId: string): void {
  if (typeof document === 'undefined') return;
  
  const cookieName = `ab_test_${testId}`;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 day cookie
  
  document.cookie = `${cookieName}=${variantId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
}

// Assign user to test variant
export function assignToVariant(test: ABTest): string | null {
  if (!test.active) return null;
  
  // Check if user should be in test based on traffic percentage
  const userHash = Math.random() * 100;
  if (userHash > test.traffic) return null;
  
  // Check for existing assignment
  const existingVariant = getUserVariant(test.id);
  if (existingVariant && test.variants.find(v => v.id === existingVariant)) {
    return existingVariant;
  }
  
  // Assign to variant based on weights
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const variant of test.variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      setUserVariant(test.id, variant.id);
      return variant.id;
    }
  }
  
  return null;
}

// Apply variant changes to the page
export function applyVariant(test: ABTest, variantId: string): void {
  if (typeof document === 'undefined') return;
  
  const variant = test.variants.find(v => v.id === variantId);
  if (!variant) return;
  
  variant.changes.forEach(change => {
    switch (change.type) {
      case 'text':
        const textElement = document.querySelector(change.selector);
        if (textElement && change.content) {
          textElement.textContent = change.content;
        }
        break;
        
      case 'style':
        const styleElement = document.querySelector(change.selector);
        if (styleElement && change.styles) {
          Object.assign((styleElement as HTMLElement).style, change.styles);
        }
        break;
        
      case 'element':
        const element = document.querySelector(change.selector);
        if (element && change.content) {
          element.innerHTML = change.content;
        }
        break;
        
      case 'redirect':
        if (change.url) {
          window.location.href = change.url;
        }
        break;
    }
  });
}

// Track conversion events
export function trackConversion(testId: string, event: string, value?: number): void {
  if (typeof window === 'undefined') return;
  
  const variantId = getUserVariant(testId);
  if (!variantId) return;
  
  // Send to analytics (Google Analytics example)
  if (typeof gtag !== 'undefined') {
    gtag('event', 'ab_test_conversion', {
      test_id: testId,
      variant_id: variantId,
      event_name: event,
      value: value || 1
    });
  }
  
  // Send to other analytics platforms
  if (typeof clarity !== 'undefined') {
    clarity('set', `ab_test_${testId}`, variantId);
    clarity('event', `ab_conversion_${event}`);
  }
}

// Example test configuration
export const heroButtonTest: ABTest = {
  id: 'hero_button_test',
  name: 'Hero Button Text Test',
  variants: [
    {
      id: 'control',
      name: 'Control - Get Your Free Demo Now',
      weight: 50,
      changes: []
    },
    {
      id: 'variant_a',
      name: 'Variant A - See Your Website Transform',
      weight: 50,
      changes: [
        {
          type: 'text',
          selector: '[data-testid="hero-primary-button"]',
          content: 'See Your Website Transform'
        }
      ]
    }
  ],
  traffic: 100,
  active: false // Set to true to activate
};