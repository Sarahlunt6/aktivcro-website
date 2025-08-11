/**
 * Performance Monitoring and Optimization Utilities
 * Tracks Core Web Vitals and provides performance insights
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent?: string;
}

interface WebVitalsMetric extends PerformanceMetric {
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
    
    if (this.isEnabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();

    // Monitor custom metrics
    this.observeResourceTiming();
    this.observeLongTasks();

    // Report on page unload
    window.addEventListener('beforeunload', this.reportMetrics.bind(this));
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          this.recordMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            url: window.location.href
          });
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('lcp', observer);
    } catch (error) {
      console.warn('Could not observe LCP:', error);
    }
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            url: window.location.href
          });
        });
      });

      observer.observe({ type: 'first-input', buffered: true });
      this.observers.set('fid', observer);
    } catch (error) {
      console.warn('Could not observe FID:', error);
    }
  }

  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.recordMetric({
          name: 'CLS',
          value: clsValue,
          timestamp: Date.now(),
          url: window.location.href
        });
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('cls', observer);
    } catch (error) {
      console.warn('Could not observe CLS:', error);
    }
  }

  private observeFCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric({
              name: 'FCP',
              value: entry.startTime,
              timestamp: Date.now(),
              url: window.location.href
            });
          }
        });
      });

      observer.observe({ type: 'paint', buffered: true });
      this.observers.set('fcp', observer);
    } catch (error) {
      console.warn('Could not observe FCP:', error);
    }
  }

  private observeTTFB() {
    if (typeof window === 'undefined' || !window.performance.timing) return;

    const ttfb = window.performance.timing.responseStart - window.performance.timing.requestStart;
    
    this.recordMetric({
      name: 'TTFB',
      value: ttfb,
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          // Track slow resources (> 1s)
          if (entry.duration > 1000) {
            this.recordMetric({
              name: 'slow-resource',
              value: entry.duration,
              timestamp: Date.now(),
              url: entry.name
            });
          }
        });
      });

      observer.observe({ type: 'resource', buffered: true });
      this.observers.set('resource', observer);
    } catch (error) {
      console.warn('Could not observe resource timing:', error);
    }
  }

  private observeLongTasks() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          this.recordMetric({
            name: 'long-task',
            value: entry.duration,
            timestamp: Date.now(),
            url: window.location.href
          });
        });
      });

      observer.observe({ type: 'longtask', buffered: true });
      this.observers.set('longtask', observer);
    } catch (error) {
      console.warn('Could not observe long tasks:', error);
    }
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push({
      ...metric,
      userAgent: navigator.userAgent
    });

    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      this.logPerformanceIssue(metric);
    }
  }

  private logPerformanceIssue(metric: PerformanceMetric) {
    const thresholds = {
      'LCP': 2500,  // Good < 2.5s
      'FID': 100,   // Good < 100ms
      'CLS': 0.1,   // Good < 0.1
      'FCP': 1800,  // Good < 1.8s
      'TTFB': 800,  // Good < 800ms
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    
    if (threshold && metric.value > threshold) {
      console.warn(`🚨 Performance Issue - ${metric.name}:`, {
        value: `${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`,
        threshold: `${threshold}${metric.name === 'CLS' ? '' : 'ms'}`,
        url: metric.url,
        timestamp: new Date(metric.timestamp).toISOString()
      });
    }
  }

  public trackCustomMetric(name: string, value: number, url?: string) {
    this.recordMetric({
      name: `custom-${name}`,
      value,
      timestamp: Date.now(),
      url: url || window.location.href
    });
  }

  public trackApiResponse(endpoint: string, duration: number, status: number) {
    this.recordMetric({
      name: 'api-response',
      value: duration,
      timestamp: Date.now(),
      url: `${endpoint} (${status})`
    });

    // Warn about slow API calls
    if (duration > 3000) {
      console.warn(`🐌 Slow API Response: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  public trackUserInteraction(action: string, duration?: number) {
    this.recordMetric({
      name: `interaction-${action}`,
      value: duration || Date.now(),
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  private async reportMetrics() {
    if (this.metrics.length === 0) return;

    try {
      // Send to analytics if available
      if (typeof window.gtag === 'function') {
        this.metrics.forEach(metric => {
          window.gtag('event', 'performance_metric', {
            metric_name: metric.name,
            metric_value: Math.round(metric.value),
            page_url: metric.url
          });
        });
      }

      // Send to Microsoft Clarity if available
      if (typeof window.clarity === 'function') {
        window.clarity('set', 'performance_data', {
          metrics: this.metrics.slice(-10), // Last 10 metrics
          timestamp: Date.now()
        });
      }

      // Log summary in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Performance Summary:', this.getPerformanceSummary());
      }

    } catch (error) {
      console.error('Failed to report performance metrics:', error);
    }
  }

  private getPerformanceSummary() {
    const summary: Record<string, any> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity
        };
      }
      
      const s = summary[metric.name];
      s.count++;
      s.total += metric.value;
      s.min = Math.min(s.min, metric.value);
      s.max = Math.max(s.max, metric.value);
      s.average = s.total / s.count;
    });

    return summary;
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

// Convenience functions
export function trackCustomMetric(name: string, value: number, url?: string) {
  getPerformanceMonitor().trackCustomMetric(name, value, url);
}

export function trackApiResponse(endpoint: string, duration: number, status: number) {
  getPerformanceMonitor().trackApiResponse(endpoint, duration, status);
}

export function trackUserInteraction(action: string, duration?: number) {
  getPerformanceMonitor().trackUserInteraction(action, duration);
}

// Performance utilities
export function measureAsync<T>(
  fn: () => Promise<T>,
  metricName: string
): Promise<T> {
  const start = performance.now();
  
  return fn().then(result => {
    const duration = performance.now() - start;
    trackCustomMetric(metricName, duration);
    return result;
  }).catch(error => {
    const duration = performance.now() - start;
    trackCustomMetric(`${metricName}-error`, duration);
    throw error;
  });
}

export function measureSync<T>(fn: () => T, metricName: string): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    trackCustomMetric(metricName, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    trackCustomMetric(`${metricName}-error`, duration);
    throw error;
  }
}

// Initialize performance monitoring on import
if (typeof window !== 'undefined') {
  getPerformanceMonitor();
}