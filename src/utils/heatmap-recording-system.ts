/**
 * Heatmap and Session Recording System
 * Captures user interactions, creates heatmaps, and records sessions for analysis
 */

import { trackEvent } from './analytics-manager';

export interface HeatmapData {
  x: number;
  y: number;
  type: 'click' | 'move' | 'scroll' | 'hover';
  timestamp: number;
  element?: string;
  elementText?: string;
  viewport: ViewportInfo;
  sessionId: string;
}

export interface SessionRecording {
  sessionId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  events: SessionEvent[];
  pageUrl: string;
  userAgent: string;
  viewport: ViewportInfo;
  metadata: SessionMetadata;
}

export interface SessionEvent {
  type: 'click' | 'keypress' | 'scroll' | 'resize' | 'focus' | 'blur' | 'input' | 'form' | 'navigation';
  timestamp: number;
  data: any;
  target?: ElementInfo;
}

export interface ElementInfo {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  selector: string;
  position: { x: number; y: number; width: number; height: number };
}

export interface ViewportInfo {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  devicePixelRatio: number;
}

export interface SessionMetadata {
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  leadScore?: number;
  userType?: string;
}

export interface HeatmapConfig {
  enabled: boolean;
  sampleRate: number; // 0.1 = 10% of users
  trackClicks: boolean;
  trackMovement: boolean;
  trackScrolling: boolean;
  trackHovers: boolean;
  maxEvents: number;
  debounceMs: number;
}

export interface RecordingConfig {
  enabled: boolean;
  sampleRate: number;
  maxDuration: number; // in minutes
  captureInputs: boolean;
  captureClicks: boolean;
  captureScrolls: boolean;
  captureKeystrokes: boolean;
  excludeElements: string[]; // CSS selectors to exclude
}

class HeatmapRecordingSystem {
  private heatmapData: HeatmapData[] = [];
  private currentSession: SessionRecording | null = null;
  private sessionId: string;
  private userId?: string;
  private isRecording = false;
  private isHeatmapping = false;
  private mouseTrackingTimeout?: NodeJS.Timeout;
  private scrollTrackingTimeout?: NodeJS.Timeout;
  
  private heatmapConfig: HeatmapConfig = {
    enabled: true,
    sampleRate: 0.3, // 30% of users
    trackClicks: true,
    trackMovement: true,
    trackScrolling: true,
    trackHovers: true,
    maxEvents: 5000,
    debounceMs: 100
  };

  private recordingConfig: RecordingConfig = {
    enabled: true,
    sampleRate: 0.1, // 10% of users for full session recording
    maxDuration: 30, // 30 minutes max
    captureInputs: false, // Privacy-first approach
    captureClicks: true,
    captureScrolls: true,
    captureKeystrokes: false, // Privacy-first approach
    excludeElements: ['input[type="password"]', '.sensitive-data', '.private-content']
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.checkConsentAndInitialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private checkConsentAndInitialize() {
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('aktivcro-cookie-preferences');
        if (consent) {
          const preferences = JSON.parse(consent);
          if (preferences.analytics) {
            this.initializeTracking();
            return true;
          }
        }
      } catch (error) {
        console.error('Heatmap Recording: Failed to check consent', error);
      }
      return false;
    };

    // Check immediately
    if (!checkConsent()) {
      // Poll for consent decision
      const pollInterval = setInterval(() => {
        if (checkConsent()) {
          clearInterval(pollInterval);
        }
      }, 1000);

      setTimeout(() => clearInterval(pollInterval), 30000);
    }
  }

  private initializeTracking() {
    this.userId = localStorage.getItem('aktivcro_user_id') || undefined;

    // Determine if user should be included in sampling
    const shouldHeatmap = Math.random() < this.heatmapConfig.sampleRate;
    const shouldRecord = Math.random() < this.recordingConfig.sampleRate;

    if (shouldHeatmap && this.heatmapConfig.enabled) {
      this.startHeatmapTracking();
    }

    if (shouldRecord && this.recordingConfig.enabled) {
      this.startSessionRecording();
    }

    console.log('Heatmap Recording: Initialized', {
      heatmapping: this.isHeatmapping,
      recording: this.isRecording,
      sessionId: this.sessionId
    });
  }

  // Heatmap Tracking Methods
  private startHeatmapTracking() {
    this.isHeatmapping = true;

    if (this.heatmapConfig.trackClicks) {
      this.setupClickHeatmap();
    }

    if (this.heatmapConfig.trackMovement) {
      this.setupMouseMovementHeatmap();
    }

    if (this.heatmapConfig.trackScrolling) {
      this.setupScrollHeatmap();
    }

    if (this.heatmapConfig.trackHovers) {
      this.setupHoverHeatmap();
    }

    // Clean up old data periodically
    this.setupDataCleanup();

    console.log('Heatmap Recording: Heatmap tracking started');
  }

  private setupClickHeatmap() {
    document.addEventListener('click', (event) => {
      if (!this.isHeatmapping) return;

      const heatmapData: HeatmapData = {
        x: event.clientX,
        y: event.clientY,
        type: 'click',
        timestamp: Date.now(),
        element: this.getElementSelector(event.target as Element),
        elementText: (event.target as Element)?.textContent?.trim().substring(0, 100),
        viewport: this.getViewportInfo(),
        sessionId: this.sessionId
      };

      this.addHeatmapData(heatmapData);

      // Track significant clicks
      const target = event.target as Element;
      if (this.isSignificantElement(target)) {
        trackEvent({
          name: 'heatmap_significant_click',
          parameters: {
            element_selector: heatmapData.element,
            element_text: heatmapData.elementText,
            x: heatmapData.x,
            y: heatmapData.y,
            session_id: this.sessionId
          }
        });
      }
    });
  }

  private setupMouseMovementHeatmap() {
    document.addEventListener('mousemove', (event) => {
      if (!this.isHeatmapping) return;

      // Debounce mouse movement tracking
      if (this.mouseTrackingTimeout) {
        clearTimeout(this.mouseTrackingTimeout);
      }

      this.mouseTrackingTimeout = setTimeout(() => {
        const heatmapData: HeatmapData = {
          x: event.clientX,
          y: event.clientY,
          type: 'move',
          timestamp: Date.now(),
          viewport: this.getViewportInfo(),
          sessionId: this.sessionId
        };

        this.addHeatmapData(heatmapData);
      }, this.heatmapConfig.debounceMs);
    });
  }

  private setupScrollHeatmap() {
    document.addEventListener('scroll', () => {
      if (!this.isHeatmapping) return;

      if (this.scrollTrackingTimeout) {
        clearTimeout(this.scrollTrackingTimeout);
      }

      this.scrollTrackingTimeout = setTimeout(() => {
        const heatmapData: HeatmapData = {
          x: window.innerWidth / 2,
          y: window.scrollY,
          type: 'scroll',
          timestamp: Date.now(),
          viewport: this.getViewportInfo(),
          sessionId: this.sessionId
        };

        this.addHeatmapData(heatmapData);
      }, this.heatmapConfig.debounceMs);
    });
  }

  private setupHoverHeatmap() {
    let hoverTimeout: NodeJS.Timeout;

    document.addEventListener('mouseenter', (event) => {
      if (!this.isHeatmapping) return;

      const target = event.target as Element;
      if (!this.isTrackableElement(target)) return;

      hoverTimeout = setTimeout(() => {
        const heatmapData: HeatmapData = {
          x: event.clientX,
          y: event.clientY,
          type: 'hover',
          timestamp: Date.now(),
          element: this.getElementSelector(target),
          elementText: target.textContent?.trim().substring(0, 50),
          viewport: this.getViewportInfo(),
          sessionId: this.sessionId
        };

        this.addHeatmapData(heatmapData);
      }, 1000); // Track hovers longer than 1 second
    }, true);

    document.addEventListener('mouseleave', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    }, true);
  }

  // Session Recording Methods
  private startSessionRecording() {
    this.isRecording = true;
    
    this.currentSession = {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: Date.now(),
      events: [],
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      viewport: this.getViewportInfo(),
      metadata: this.getSessionMetadata()
    };

    this.setupSessionEventTracking();
    this.setupSessionCleanup();

    console.log('Heatmap Recording: Session recording started');
  }

  private setupSessionEventTracking() {
    if (!this.isRecording) return;

    // Click tracking
    if (this.recordingConfig.captureClicks) {
      document.addEventListener('click', (event) => {
        this.addSessionEvent({
          type: 'click',
          timestamp: Date.now(),
          target: this.getElementInfo(event.target as Element),
          data: {
            x: event.clientX,
            y: event.clientY,
            button: event.button
          }
        });
      });
    }

    // Input tracking (privacy-aware)
    if (this.recordingConfig.captureInputs) {
      document.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        if (this.shouldExcludeElement(target)) return;

        this.addSessionEvent({
          type: 'input',
          timestamp: Date.now(),
          target: this.getElementInfo(target),
          data: {
            inputType: target.type,
            valueLength: target.value.length, // Only track length, not actual value
            placeholder: target.placeholder
          }
        });
      });
    }

    // Form submission tracking
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      
      this.addSessionEvent({
        type: 'form',
        timestamp: Date.now(),
        target: this.getElementInfo(form),
        data: {
          formId: form.id,
          action: form.action,
          method: form.method,
          fieldCount: form.elements.length
        }
      });
    });

    // Scroll tracking
    if (this.recordingConfig.captureScrolls) {
      document.addEventListener('scroll', () => {
        this.addSessionEvent({
          type: 'scroll',
          timestamp: Date.now(),
          data: {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            maxScrollY: Math.max(
              document.body.scrollHeight,
              document.documentElement.scrollHeight
            ) - window.innerHeight
          }
        });
      });
    }

    // Viewport resize tracking
    window.addEventListener('resize', () => {
      this.addSessionEvent({
        type: 'resize',
        timestamp: Date.now(),
        data: {
          viewport: this.getViewportInfo()
        }
      });
    });

    // Page navigation tracking
    window.addEventListener('beforeunload', () => {
      this.endSessionRecording();
    });

    // Focus/blur tracking
    window.addEventListener('focus', () => {
      this.addSessionEvent({
        type: 'focus',
        timestamp: Date.now(),
        data: { windowFocused: true }
      });
    });

    window.addEventListener('blur', () => {
      this.addSessionEvent({
        type: 'blur',
        timestamp: Date.now(),
        data: { windowFocused: false }
      });
    });
  }

  // Public Methods
  public getHeatmapData(): HeatmapData[] {
    return [...this.heatmapData];
  }

  public getCurrentSession(): SessionRecording | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  public generateHeatmapVisualization(elementSelector?: string): string {
    const filteredData = elementSelector 
      ? this.heatmapData.filter(data => data.element?.includes(elementSelector))
      : this.heatmapData;

    const clicks = filteredData.filter(data => data.type === 'click');
    const hovers = filteredData.filter(data => data.type === 'hover');

    // Generate simple heatmap data for visualization
    const heatmapPoints = clicks.concat(hovers).map(point => ({
      x: point.x,
      y: point.y,
      intensity: point.type === 'click' ? 10 : 5,
      type: point.type
    }));

    // In a real implementation, you would generate an actual heatmap visualization
    return JSON.stringify({
      totalPoints: heatmapPoints.length,
      clickPoints: clicks.length,
      hoverPoints: hovers.length,
      points: heatmapPoints.slice(0, 1000) // Limit for performance
    });
  }

  public exportSessionData(): {
    heatmap: HeatmapData[];
    session: SessionRecording | null;
    summary: any;
  } {
    const summary = {
      sessionId: this.sessionId,
      isRecording: this.isRecording,
      isHeatmapping: this.isHeatmapping,
      heatmapEvents: this.heatmapData.length,
      sessionEvents: this.currentSession?.events.length || 0,
      duration: this.currentSession 
        ? Date.now() - this.currentSession.startTime 
        : 0,
      topElements: this.getTopInteractedElements(),
      scrollDepth: this.getMaxScrollDepth()
    };

    return {
      heatmap: this.getHeatmapData(),
      session: this.getCurrentSession(),
      summary
    };
  }

  public updateConfig(heatmapConfig?: Partial<HeatmapConfig>, recordingConfig?: Partial<RecordingConfig>) {
    if (heatmapConfig) {
      this.heatmapConfig = { ...this.heatmapConfig, ...heatmapConfig };
    }
    if (recordingConfig) {
      this.recordingConfig = { ...this.recordingConfig, ...recordingConfig };
    }
  }

  public stopTracking() {
    this.isHeatmapping = false;
    this.endSessionRecording();
  }

  // Private Helper Methods
  private addHeatmapData(data: HeatmapData) {
    if (this.heatmapData.length >= this.heatmapConfig.maxEvents) {
      // Remove oldest entries to stay within limit
      this.heatmapData = this.heatmapData.slice(-Math.floor(this.heatmapConfig.maxEvents * 0.9));
    }

    this.heatmapData.push(data);
  }

  private addSessionEvent(event: SessionEvent) {
    if (!this.currentSession) return;

    this.currentSession.events.push(event);

    // Check session duration limit
    const durationMinutes = (Date.now() - this.currentSession.startTime) / 60000;
    if (durationMinutes > this.recordingConfig.maxDuration) {
      this.endSessionRecording();
    }
  }

  private endSessionRecording() {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.saveSessionData();
      this.isRecording = false;
      
      console.log('Heatmap Recording: Session recording ended', {
        sessionId: this.sessionId,
        duration: this.currentSession.endTime - this.currentSession.startTime,
        events: this.currentSession.events.length
      });
    }
  }

  private saveSessionData() {
    if (!this.currentSession) return;

    try {
      // In production, you would send this to your analytics backend
      const sessionData = {
        ...this.currentSession,
        heatmapData: this.heatmapData.filter(data => data.sessionId === this.sessionId)
      };

      // Store in localStorage for demo purposes (in production, send to server)
      const existingSessions = JSON.parse(localStorage.getItem('aktivcro_sessions') || '[]');
      existingSessions.push({
        sessionId: this.sessionId,
        timestamp: Date.now(),
        eventCount: sessionData.events.length,
        heatmapCount: sessionData.heatmapData.length,
        duration: (sessionData.endTime || Date.now()) - sessionData.startTime
      });

      // Keep only last 10 sessions
      const recentSessions = existingSessions.slice(-10);
      localStorage.setItem('aktivcro_sessions', JSON.stringify(recentSessions));

      // Track session completion
      trackEvent({
        name: 'session_recorded',
        parameters: {
          session_id: this.sessionId,
          duration_minutes: Math.round(((sessionData.endTime || Date.now()) - sessionData.startTime) / 60000),
          event_count: sessionData.events.length,
          heatmap_count: sessionData.heatmapData.length,
          user_id: this.userId
        },
        value: sessionData.events.length
      });

    } catch (error) {
      console.error('Heatmap Recording: Failed to save session data', error);
    }
  }

  private getElementInfo(element: Element): ElementInfo {
    const rect = element.getBoundingClientRect();
    
    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      textContent: element.textContent?.trim().substring(0, 100),
      selector: this.getElementSelector(element),
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    };
  }

  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim()).slice(0, 3);
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }

    let selector = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    return selector;
  }

  private getViewportInfo(): ViewportInfo {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      devicePixelRatio: window.devicePixelRatio
    };
  }

  private getSessionMetadata(): SessionMetadata {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      browser: this.getBrowserName(),
      os: this.getOSName(),
      referrer: document.referrer,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      leadScore: this.getUserLeadScore(),
      userType: this.getUserType()
    };
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private getOSName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  }

  private getUserLeadScore(): number | undefined {
    try {
      const scoreData = localStorage.getItem(`lead_score_${this.userId}`);
      return scoreData ? JSON.parse(scoreData).total : undefined;
    } catch {
      return undefined;
    }
  }

  private getUserType(): string | undefined {
    try {
      const profileData = localStorage.getItem(`lead_profile_${this.userId}`);
      return profileData ? 'lead' : 'visitor';
    } catch {
      return 'visitor';
    }
  }

  private isSignificantElement(element: Element): boolean {
    const significantSelectors = [
      'button', 'a', '.cta', '.btn', '.pricing', '.demo', '.contact',
      '[data-track]', '.track-click', 'input[type="submit"]', 'form'
    ];

    return significantSelectors.some(selector => {
      try {
        return element.matches(selector);
      } catch {
        return false;
      }
    });
  }

  private isTrackableElement(element: Element): boolean {
    // Exclude certain elements from tracking
    const excludeSelectors = [
      'script', 'style', 'meta', 'head', 'title'
    ];

    return !excludeSelectors.some(selector => {
      try {
        return element.matches(selector);
      } catch {
        return false;
      }
    });
  }

  private shouldExcludeElement(element: Element): boolean {
    return this.recordingConfig.excludeElements.some(selector => {
      try {
        return element.matches(selector);
      } catch {
        return false;
      }
    });
  }

  private getTopInteractedElements(): Array<{ selector: string; count: number; type: string }> {
    const elementCounts = new Map<string, { count: number; types: Set<string> }>();

    this.heatmapData.forEach(data => {
      if (data.element) {
        const existing = elementCounts.get(data.element) || { count: 0, types: new Set() };
        existing.count++;
        existing.types.add(data.type);
        elementCounts.set(data.element, existing);
      }
    });

    return Array.from(elementCounts.entries())
      .map(([selector, data]) => ({
        selector,
        count: data.count,
        type: Array.from(data.types).join(', ')
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getMaxScrollDepth(): number {
    const scrollEvents = this.heatmapData.filter(data => data.type === 'scroll');
    if (scrollEvents.length === 0) return 0;

    const maxScroll = Math.max(...scrollEvents.map(event => event.y));
    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    return Math.round((maxScroll / (pageHeight - window.innerHeight)) * 100);
  }

  private setupDataCleanup() {
    // Clean up old data every 5 minutes
    setInterval(() => {
      const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 hour ago
      this.heatmapData = this.heatmapData.filter(data => data.timestamp > cutoffTime);
    }, 5 * 60 * 1000);
  }

  private setupSessionCleanup() {
    // End session after max duration
    setTimeout(() => {
      if (this.isRecording) {
        this.endSessionRecording();
      }
    }, this.recordingConfig.maxDuration * 60 * 1000);
  }
}

// Singleton instance
const heatmapRecordingSystem = new HeatmapRecordingSystem();

// Convenience functions
export function getHeatmapData(): HeatmapData[] {
  return heatmapRecordingSystem.getHeatmapData();
}

export function getCurrentSession(): SessionRecording | null {
  return heatmapRecordingSystem.getCurrentSession();
}

export function generateHeatmapVisualization(elementSelector?: string): string {
  return heatmapRecordingSystem.generateHeatmapVisualization(elementSelector);
}

export function exportSessionData() {
  return heatmapRecordingSystem.exportSessionData();
}

export function updateHeatmapConfig(heatmapConfig: Partial<HeatmapConfig>, recordingConfig?: Partial<RecordingConfig>) {
  heatmapRecordingSystem.updateConfig(heatmapConfig, recordingConfig);
}

export function stopHeatmapTracking() {
  heatmapRecordingSystem.stopTracking();
}

export default heatmapRecordingSystem;