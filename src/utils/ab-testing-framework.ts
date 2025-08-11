/**
 * Advanced A/B Testing Framework
 * Provides client-side and server-side A/B testing capabilities with statistical analysis
 */

import { trackEvent } from './analytics-manager';
import { trackUserInteraction } from './performance-monitor';

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: ABVariant[];
  allocation: 'equal' | 'weighted' | 'winner';
  startDate: string;
  endDate?: string;
  targetAudience?: TargetingCriteria;
  conversionGoals: ConversionGoal[];
  statisticalSignificance: number; // 0.95 for 95% confidence
  minimumSampleSize: number;
  trafficAllocation: number; // 0.1 for 10% of traffic
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // 0.5 for 50% allocation
  changes: VariantChange[];
  isControl: boolean;
}

export interface VariantChange {
  type: 'element' | 'text' | 'style' | 'component' | 'redirect';
  selector?: string;
  property?: string;
  value: any;
  component?: string;
}

export interface ConversionGoal {
  id: string;
  name: string;
  type: 'pageview' | 'click' | 'form_submit' | 'custom_event';
  selector?: string;
  eventName?: string;
  value?: number;
  primary: boolean;
}

export interface TargetingCriteria {
  countries?: string[];
  devices?: ('desktop' | 'mobile' | 'tablet')[];
  browsers?: string[];
  newUsersOnly?: boolean;
  returningUsersOnly?: boolean;
  trafficSource?: string[];
  customAttributes?: Record<string, any>;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  conversions: number;
  visitors: number;
  conversionRate: number;
  confidence: number;
  improvement: number;
  isSignificant: boolean;
  isWinner: boolean;
}

class ABTestingFramework {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private results: Map<string, Map<string, ABTestResult>> = new Map(); // testId -> variantId -> result
  private userId: string;

  constructor() {
    this.userId = this.getUserId();
    this.loadStoredData();
    this.initializeFramework();
  }

  private getUserId(): string {
    let userId = localStorage.getItem('ab_test_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_test_user_id', userId);
    }
    return userId;
  }

  private loadStoredData() {
    try {
      // Load user assignments
      const assignments = localStorage.getItem('ab_test_assignments');
      if (assignments) {
        const parsed = JSON.parse(assignments);
        this.userAssignments = new Map(Object.entries(parsed).map(([userId, tests]) => [
          userId,
          new Map(Object.entries(tests as any))
        ]));
      }

      // Load test results
      const results = localStorage.getItem('ab_test_results');
      if (results) {
        const parsed = JSON.parse(results);
        this.results = new Map(Object.entries(parsed).map(([testId, variants]) => [
          testId,
          new Map(Object.entries(variants as any))
        ]));
      }
    } catch (error) {
      console.error('ABTesting: Failed to load stored data', error);
    }
  }

  private saveStoredData() {
    try {
      // Save user assignments
      const assignmentsObj: any = {};
      this.userAssignments.forEach((tests, userId) => {
        assignmentsObj[userId] = Object.fromEntries(tests);
      });
      localStorage.setItem('ab_test_assignments', JSON.stringify(assignmentsObj));

      // Save test results
      const resultsObj: any = {};
      this.results.forEach((variants, testId) => {
        resultsObj[testId] = Object.fromEntries(variants);
      });
      localStorage.setItem('ab_test_results', JSON.stringify(resultsObj));
    } catch (error) {
      console.error('ABTesting: Failed to save data', error);
    }
  }

  private initializeFramework() {
    // Apply active tests on page load
    this.applyActiveTests();
    
    // Set up conversion tracking
    this.setupConversionTracking();
    
    // Clean up expired tests
    this.cleanupExpiredTests();
  }

  // Public Methods
  public createTest(test: ABTest): boolean {
    try {
      // Validate test configuration
      if (!this.validateTest(test)) {
        throw new Error('Invalid test configuration');
      }

      this.tests.set(test.id, test);
      console.log('ABTesting: Test created successfully', test.id);
      
      // If test is active, apply it immediately
      if (test.status === 'active') {
        this.applyTest(test);
      }

      return true;
    } catch (error) {
      console.error('ABTesting: Failed to create test', error);
      return false;
    }
  }

  public startTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) {
      console.error('ABTesting: Test not found', testId);
      return false;
    }

    test.status = 'active';
    test.startDate = new Date().toISOString();
    this.applyTest(test);
    
    trackEvent({
      name: 'ab_test_started',
      parameters: {
        test_id: testId,
        test_name: test.name
      }
    });

    console.log('ABTesting: Test started', testId);
    return true;
  }

  public stopTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test) {
      console.error('ABTesting: Test not found', testId);
      return false;
    }

    test.status = 'completed';
    test.endDate = new Date().toISOString();
    
    trackEvent({
      name: 'ab_test_stopped',
      parameters: {
        test_id: testId,
        test_name: test.name
      }
    });

    console.log('ABTesting: Test stopped', testId);
    return true;
  }

  public getVariant(testId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'active') {
      return null;
    }

    // Check if user is already assigned to a variant
    const userAssignments = this.userAssignments.get(this.userId);
    if (userAssignments && userAssignments.has(testId)) {
      return userAssignments.get(testId)!;
    }

    // Check if user meets targeting criteria
    if (!this.meetsTargetingCriteria(test.targetAudience)) {
      return null;
    }

    // Check traffic allocation
    if (Math.random() > test.trafficAllocation) {
      return null;
    }

    // Assign user to a variant
    const variantId = this.assignVariant(test);
    
    // Store assignment
    if (!this.userAssignments.has(this.userId)) {
      this.userAssignments.set(this.userId, new Map());
    }
    this.userAssignments.get(this.userId)!.set(testId, variantId);
    this.saveStoredData();

    // Track assignment
    trackEvent({
      name: 'ab_test_assigned',
      parameters: {
        test_id: testId,
        variant_id: variantId,
        user_id: this.userId
      }
    });

    return variantId;
  }

  public trackConversion(testId: string, goalId: string, value?: number) {
    const variant = this.getVariant(testId);
    if (!variant) return;

    const test = this.tests.get(testId);
    if (!test) return;

    const goal = test.conversionGoals.find(g => g.id === goalId);
    if (!goal) return;

    // Update results
    if (!this.results.has(testId)) {
      this.results.set(testId, new Map());
    }

    const testResults = this.results.get(testId)!;
    if (!testResults.has(variant)) {
      testResults.set(variant, {
        testId,
        variantId: variant,
        conversions: 0,
        visitors: 1,
        conversionRate: 0,
        confidence: 0,
        improvement: 0,
        isSignificant: false,
        isWinner: false
      });
    }

    const result = testResults.get(variant)!;
    result.conversions++;
    result.conversionRate = result.conversions / result.visitors;
    
    this.saveStoredData();

    // Track conversion event
    trackEvent({
      name: 'ab_test_conversion',
      parameters: {
        test_id: testId,
        variant_id: variant,
        goal_id: goalId,
        goal_name: goal.name,
        value: value || goal.value || 1
      },
      value: value || goal.value || 1
    });

    // Check if test should be stopped due to significance
    this.checkStatisticalSignificance(testId);
  }

  public getTestResults(testId: string): Map<string, ABTestResult> | null {
    return this.results.get(testId) || null;
  }

  public getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'active');
  }

  private validateTest(test: ABTest): boolean {
    // Check required fields
    if (!test.id || !test.name || !test.variants || test.variants.length === 0) {
      return false;
    }

    // Check variant weights sum to 1
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      return false;
    }

    // Check at least one control variant
    const hasControl = test.variants.some(variant => variant.isControl);
    if (!hasControl) {
      return false;
    }

    return true;
  }

  private assignVariant(test: ABTest): string {
    const random = Math.random();
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.id;
      }
    }

    // Fallback to control variant
    return test.variants.find(v => v.isControl)?.id || test.variants[0].id;
  }

  private meetsTargetingCriteria(criteria?: TargetingCriteria): boolean {
    if (!criteria) return true;

    // Check device type
    if (criteria.devices && criteria.devices.length > 0) {
      const device = this.getDeviceType();
      if (!criteria.devices.includes(device)) {
        return false;
      }
    }

    // Check browser
    if (criteria.browsers && criteria.browsers.length > 0) {
      const browser = this.getBrowserName();
      if (!criteria.browsers.includes(browser)) {
        return false;
      }
    }

    // Check new vs returning users
    const isNewUser = this.isNewUser();
    if (criteria.newUsersOnly && !isNewUser) {
      return false;
    }
    if (criteria.returningUsersOnly && isNewUser) {
      return false;
    }

    // Check traffic source
    if (criteria.trafficSource && criteria.trafficSource.length > 0) {
      const source = this.getTrafficSource();
      if (!criteria.trafficSource.includes(source)) {
        return false;
      }
    }

    return true;
  }

  private applyActiveTests() {
    const activeTests = this.getActiveTests();
    activeTests.forEach(test => {
      const variant = this.getVariant(test.id);
      if (variant) {
        this.applyVariant(test, variant);
      }
    });
  }

  private applyTest(test: ABTest) {
    const variant = this.getVariant(test.id);
    if (variant) {
      this.applyVariant(test, variant);
    }
  }

  private applyVariant(test: ABTest, variantId: string) {
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant || variant.isControl) return;

    variant.changes.forEach(change => {
      try {
        this.applyChange(change);
      } catch (error) {
        console.error('ABTesting: Failed to apply change', error, change);
      }
    });

    console.log('ABTesting: Applied variant', variantId, 'for test', test.id);
  }

  private applyChange(change: VariantChange) {
    switch (change.type) {
      case 'element':
        if (change.selector) {
          const element = document.querySelector(change.selector);
          if (element && change.property) {
            (element as any)[change.property] = change.value;
          }
        }
        break;

      case 'text':
        if (change.selector) {
          const element = document.querySelector(change.selector);
          if (element) {
            element.textContent = change.value;
          }
        }
        break;

      case 'style':
        if (change.selector) {
          const elements = document.querySelectorAll(change.selector);
          elements.forEach(element => {
            if (change.property) {
              (element as HTMLElement).style.setProperty(change.property, change.value);
            }
          });
        }
        break;

      case 'redirect':
        if (typeof change.value === 'string') {
          window.location.href = change.value;
        }
        break;
    }
  }

  private setupConversionTracking() {
    // Track page view conversions
    this.getActiveTests().forEach(test => {
      test.conversionGoals.forEach(goal => {
        if (goal.type === 'pageview') {
          this.trackConversion(test.id, goal.id);
        } else if (goal.type === 'click' && goal.selector) {
          document.addEventListener('click', (e) => {
            const target = e.target as Element;
            if (target.matches(goal.selector!)) {
              this.trackConversion(test.id, goal.id, goal.value);
            }
          });
        }
      });
    });
  }

  private checkStatisticalSignificance(testId: string) {
    const test = this.tests.get(testId);
    const results = this.results.get(testId);
    
    if (!test || !results) return;

    // Simple significance check (in production, use proper statistical tests)
    const control = Array.from(results.values()).find(r => {
      const variant = test.variants.find(v => v.id === r.variantId);
      return variant?.isControl;
    });

    if (!control || control.visitors < test.minimumSampleSize) return;

    results.forEach(result => {
      if (result.variantId === control.variantId) return;

      const improvement = ((result.conversionRate - control.conversionRate) / control.conversionRate) * 100;
      result.improvement = improvement;

      // Simplified significance calculation
      const pooled = (control.conversions + result.conversions) / (control.visitors + result.visitors);
      const se = Math.sqrt(pooled * (1 - pooled) * (1/control.visitors + 1/result.visitors));
      const zScore = Math.abs(result.conversionRate - control.conversionRate) / se;
      
      result.confidence = 1 - (2 * (1 - this.normalCDF(Math.abs(zScore))));
      result.isSignificant = result.confidence >= test.statisticalSignificance;
    });
  }

  private normalCDF(x: number): number {
    // Approximation of normal cumulative distribution function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private cleanupExpiredTests() {
    const now = Date.now();
    this.tests.forEach((test, testId) => {
      if (test.endDate && new Date(test.endDate).getTime() < now) {
        test.status = 'completed';
      }
    });
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'other';
  }

  private isNewUser(): boolean {
    return !localStorage.getItem('returning_user');
  }

  private getTrafficSource(): string {
    const referrer = document.referrer;
    if (!referrer) return 'direct';
    if (referrer.includes('google.com')) return 'google';
    if (referrer.includes('facebook.com')) return 'facebook';
    if (referrer.includes('linkedin.com')) return 'linkedin';
    return 'other';
  }
}

// Singleton instance
const abTestingFramework = new ABTestingFramework();

// Convenience functions
export function createABTest(test: ABTest): boolean {
  return abTestingFramework.createTest(test);
}

export function startABTest(testId: string): boolean {
  return abTestingFramework.startTest(testId);
}

export function stopABTest(testId: string): boolean {
  return abTestingFramework.stopTest(testId);
}

export function getABVariant(testId: string): string | null {
  return abTestingFramework.getVariant(testId);
}

export function trackABConversion(testId: string, goalId: string, value?: number) {
  abTestingFramework.trackConversion(testId, goalId, value);
}

export function getABTestResults(testId: string): Map<string, ABTestResult> | null {
  return abTestingFramework.getTestResults(testId);
}

export default abTestingFramework;