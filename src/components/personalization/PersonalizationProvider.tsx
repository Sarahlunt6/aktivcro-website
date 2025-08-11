import React, { useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import {
  personalizePageContent,
  createPersonalizationContext,
  getAppliedPersonalizations,
  addPersonalizationRule,
  type PersonalizationRule,
  type PersonalizationContext
} from '../../utils/content-personalization-engine';
import { calculateLeadScore, type LeadProfile, type BehavioralData } from '../../utils/lead-scoring-system';
import { trackEvent } from '../../utils/analytics-manager';

interface PersonalizationContextType {
  isPersonalized: boolean;
  appliedRules: string[];
  personalizeContent: (forceRefresh?: boolean) => Promise<void>;
  addRule: (rule: PersonalizationRule) => boolean;
  context: PersonalizationContext | null;
}

const PersonalizationReactContext = createContext<PersonalizationContextType | null>(null);

interface PersonalizationProviderProps {
  children: ReactNode;
  userId?: string;
  enabled?: boolean;
  autoPersonalize?: boolean;
  debugMode?: boolean;
}

export const PersonalizationProvider: React.FC<PersonalizationProviderProps> = ({
  children,
  userId,
  enabled = true,
  autoPersonalize = true,
  debugMode = false
}) => {
  const [isPersonalized, setIsPersonalized] = React.useState(false);
  const [appliedRules, setAppliedRules] = React.useState<string[]>([]);
  const [context, setContext] = React.useState<PersonalizationContext | null>(null);
  const initializationRef = useRef(false);
  const personalizationTimeoutRef = useRef<NodeJS.Timeout>();

  const currentUserId = userId || localStorage.getItem('aktivcro_user_id') || generateUserId();

  useEffect(() => {
    if (enabled && !initializationRef.current) {
      initializePersonalization();
      initializationRef.current = true;
    }

    return () => {
      if (personalizationTimeoutRef.current) {
        clearTimeout(personalizationTimeoutRef.current);
      }
    };
  }, [enabled]);

  const generateUserId = (): string => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('aktivcro_user_id', userId);
    return userId;
  };

  const initializePersonalization = async () => {
    try {
      if (debugMode) {
        console.log('PersonalizationProvider: Initializing personalization for user', currentUserId);
      }

      // Set up session tracking
      setupSessionTracking();

      // Wait for page to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (autoPersonalize) {
            schedulePersonalization();
          }
        });
      } else {
        if (autoPersonalize) {
          schedulePersonalization();
        }
      }

      // Set up mutation observer for dynamic content
      setupMutationObserver();

      // Listen for user data updates
      setupUserDataListeners();

    } catch (error) {
      console.error('PersonalizationProvider: Initialization failed', error);
    }
  };

  const schedulePersonalization = () => {
    // Slight delay to allow other systems to load
    personalizationTimeoutRef.current = setTimeout(() => {
      personalizeContent();
    }, 1000);
  };

  const personalizeContent = async (forceRefresh = false): Promise<void> => {
    if (!enabled) return;

    try {
      // Get user data
      const profile = getUserProfile();
      const behavioralData = getBehavioralData();
      const leadScore = getLeadScore(profile, behavioralData);

      // Create personalization context
      const personalizationContext = createPersonalizationContext(
        currentUserId,
        profile,
        behavioralData,
        leadScore
      );

      setContext(personalizationContext);

      if (debugMode) {
        console.log('PersonalizationProvider: Personalizing content with context', personalizationContext);
      }

      // Apply personalizations
      const success = await personalizePageContent(personalizationContext);

      if (success || forceRefresh) {
        const applied = getAppliedPersonalizations(currentUserId);
        setAppliedRules(applied);
        setIsPersonalized(true);

        // Track personalization success
        trackEvent({
          name: 'personalization_completed',
          parameters: {
            user_id: currentUserId,
            rules_applied: applied.length,
            page_url: window.location.href,
            has_profile: !!profile,
            has_behavioral_data: !!behavioralData,
            lead_score: leadScore?.total || 0
          },
          value: applied.length
        });

        if (debugMode) {
          console.log('PersonalizationProvider: Personalization completed', {
            rulesApplied: applied.length,
            appliedRules: applied
          });
        }
      }

    } catch (error) {
      console.error('PersonalizationProvider: Personalization failed', error);
      
      // Track personalization error
      trackEvent({
        name: 'personalization_error',
        parameters: {
          user_id: currentUserId,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          page_url: window.location.href
        }
      });
    }
  };

  const getUserProfile = (): LeadProfile | undefined => {
    try {
      const profileData = localStorage.getItem(`lead_profile_${currentUserId}`);
      return profileData ? JSON.parse(profileData) : undefined;
    } catch (error) {
      console.error('PersonalizationProvider: Failed to get user profile', error);
      return undefined;
    }
  };

  const getBehavioralData = (): BehavioralData | undefined => {
    try {
      // Get from global variable set by AdvancedIntegration
      const behavioralData = (window as any).aktivcroBehavioralData;
      return behavioralData || undefined;
    } catch (error) {
      console.error('PersonalizationProvider: Failed to get behavioral data', error);
      return undefined;
    }
  };

  const getLeadScore = (profile?: LeadProfile, behavioralData?: BehavioralData): any => {
    try {
      // Try to get cached score first
      const cachedScore = localStorage.getItem(`lead_score_${currentUserId}`);
      if (cachedScore) {
        return JSON.parse(cachedScore);
      }

      // Calculate if we have both profile and behavioral data
      if (profile && behavioralData) {
        return calculateLeadScore(profile, behavioralData);
      }

      return undefined;
    } catch (error) {
      console.error('PersonalizationProvider: Failed to get lead score', error);
      return undefined;
    }
  };

  const setupSessionTracking = () => {
    // Track session start
    if (!sessionStorage.getItem('page_start_time')) {
      sessionStorage.setItem('page_start_time', Date.now().toString());
    }

    // Increment page view count
    const currentCount = parseInt(sessionStorage.getItem('page_view_count') || '0');
    sessionStorage.setItem('page_view_count', (currentCount + 1).toString());

    // Mark returning user
    if (localStorage.getItem(`user_previous_visit_${currentUserId}`)) {
      localStorage.setItem('returning_user', 'true');
    }
    localStorage.setItem(`user_previous_visit_${currentUserId}`, Date.now().toString());
  };

  const setupMutationObserver = () => {
    // Watch for DOM changes that might affect personalization
    const observer = new MutationObserver((mutations) => {
      let shouldRepersonalize = false;

      mutations.forEach(mutation => {
        // Check if new elements were added that might need personalization
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check if element has personalization selectors
              if (element.querySelector?.('[class*="hero"], [class*="cta"], [class*="pricing"]') ||
                  element.matches?.('[class*="hero"], [class*="cta"], [class*="pricing"]')) {
                shouldRepersonalize = true;
              }
            }
          });
        }
      });

      if (shouldRepersonalize) {
        if (debugMode) {
          console.log('PersonalizationProvider: DOM changes detected, re-personalizing');
        }
        // Debounce re-personalization
        clearTimeout(personalizationTimeoutRef.current);
        personalizationTimeoutRef.current = setTimeout(() => {
          personalizeContent();
        }, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  const setupUserDataListeners = () => {
    // Listen for user data updates
    window.addEventListener('aktivcro:user_profile_updated', () => {
      if (debugMode) {
        console.log('PersonalizationProvider: User profile updated, re-personalizing');
      }
      personalizeContent(true);
    });

    window.addEventListener('aktivcro:behavioral_data_updated', () => {
      if (debugMode) {
        console.log('PersonalizationProvider: Behavioral data updated, re-personalizing');
      }
      personalizeContent(true);
    });

    // Listen for lead score updates
    window.addEventListener('aktivcro:lead_scored', () => {
      if (debugMode) {
        console.log('PersonalizationProvider: Lead score updated, re-personalizing');
      }
      personalizeContent(true);
    });
  };

  const addRule = (rule: PersonalizationRule): boolean => {
    const success = addPersonalizationRule(rule);
    if (success && debugMode) {
      console.log('PersonalizationProvider: Added personalization rule', rule.id);
    }
    return success;
  };

  const contextValue: PersonalizationContextType = {
    isPersonalized,
    appliedRules,
    personalizeContent,
    addRule,
    context
  };

  return (
    <PersonalizationReactContext.Provider value={contextValue}>
      {children}
      
      {/* Debug Panel */}
      {debugMode && isPersonalized && (
        <PersonalizationDebugPanel
          appliedRules={appliedRules}
          context={context}
          onRefresh={() => personalizeContent(true)}
        />
      )}
    </PersonalizationReactContext.Provider>
  );
};

// Debug Panel Component
const PersonalizationDebugPanel: React.FC<{
  appliedRules: string[];
  context: PersonalizationContext | null;
  onRefresh: () => void;
}> = ({ appliedRules, context, onRefresh }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!context) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '350px',
        zIndex: 10000,
        border: '2px solid #ffd147',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isExpanded ? '10px' : '0',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <strong>🎯 Personalization Debug</strong>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      {isExpanded && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Applied Rules ({appliedRules.length}):</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
              {appliedRules.map(ruleId => (
                <li key={ruleId} style={{ fontSize: '11px' }}>{ruleId}</li>
              ))}
            </ul>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>User Context:</strong>
            <div style={{ fontSize: '11px', color: '#ccc' }}>
              Device: {context.session.device} | 
              Source: {context.session.source} |
              Returning: {context.session.isReturning ? 'Yes' : 'No'}
            </div>
            <div style={{ fontSize: '11px', color: '#ccc' }}>
              Time on Site: {Math.round(context.session.timeOnSite / 60)}min |
              Pages: {context.session.pagesViewed}
            </div>
          </div>

          {context.profile && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Profile:</strong>
              <div style={{ fontSize: '11px', color: '#ccc' }}>
                {context.profile.company && `Company: ${context.profile.company} | `}
                {context.profile.industry && `Industry: ${context.profile.industry}`}
              </div>
            </div>
          )}

          {context.leadScore && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Lead Score:</strong>
              <div style={{ fontSize: '11px', color: '#ccc' }}>
                Total: {context.leadScore.total} | 
                Grade: {context.leadScore.grade} |
                Category: {context.leadScore.category}
              </div>
            </div>
          )}

          <button
            onClick={onRefresh}
            style={{
              backgroundColor: '#ffd147',
              color: '#1a1a1a',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            Refresh Personalization
          </button>
        </div>
      )}
    </div>
  );
};

// Hook for using personalization context
export const usePersonalization = () => {
  const context = useContext(PersonalizationReactContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};

// Hook for conditional rendering based on personalization rules
export const usePersonalizedContent = (ruleId: string) => {
  const { appliedRules } = usePersonalization();
  return appliedRules.includes(ruleId);
};

// Helper component for conditionally showing personalized content
export const PersonalizedContent: React.FC<{
  ruleId: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ ruleId, children, fallback = null }) => {
  const isApplied = usePersonalizedContent(ruleId);
  return <>{isApplied ? children : fallback}</>;
};

export default PersonalizationProvider;