import React, { useState, useEffect } from 'react';
import { trackUserInteraction } from '../../utils/performance-monitor';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieConsentProps {
  onPreferencesChange?: (preferences: CookiePreferences) => void;
}

const COOKIE_CONSENT_KEY = 'aktivcro-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'aktivcro-cookie-preferences';

export const CookieConsent: React.FC<CookieConsentProps> = ({ onPreferencesChange }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsented) {
      // Delay showing banner to avoid blocking initial page load
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // Load existing preferences
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        onPreferencesChange?.(parsed);
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error);
      }
    }
  }, [onPreferencesChange]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    savePreferences(allAccepted);
    trackUserInteraction('cookie-consent-accept-all');
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    savePreferences(necessaryOnly);
    trackUserInteraction('cookie-consent-necessary-only');
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowPreferences(false);
    trackUserInteraction('cookie-consent-custom-preferences');
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    onPreferencesChange?.(prefs);
    
    // Trigger page reload to apply cookie settings
    if (prefs.analytics || prefs.marketing) {
      window.location.reload();
    }
  };

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: category === 'necessary' ? true : value // Necessary cookies cannot be disabled
    }));
  };

  const cookieCategories = [
    {
      id: 'necessary' as const,
      title: 'Necessary Cookies',
      description: 'Essential for basic website functionality, security, and remembering your preferences.',
      required: true,
      examples: 'Session management, security tokens, accessibility preferences'
    },
    {
      id: 'functional' as const,
      title: 'Functional Cookies',
      description: 'Enable enhanced functionality like live chat, form auto-fill, and personalized content.',
      required: false,
      examples: 'Language preferences, region settings, enhanced forms'
    },
    {
      id: 'analytics' as const,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors use our website to improve user experience.',
      required: false,
      examples: 'Google Analytics, Microsoft Clarity, performance monitoring'
    },
    {
      id: 'marketing' as const,
      title: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements and track marketing campaign effectiveness.',
      required: false,
      examples: 'Social media pixels, retargeting ads, conversion tracking'
    }
  ];

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {!showPreferences ? (
          // Cookie Banner
          <div className="p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                🍪
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  We use cookies to enhance your experience
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  We use cookies and similar technologies to provide the best experience on our website. 
                  Some are necessary for basic functionality, while others help us understand how you use 
                  our site and show you relevant content.
                </p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">What we collect:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Usage data and website interactions (with your consent)</li>
                <li>• Form submissions and lead information you provide</li>
                <li>• Technical data like browser type and device info</li>
                <li>• Performance data to improve our website</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Accept All Cookies
              </button>
              
              <button
                onClick={handleAcceptNecessary}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Necessary Only
              </button>
              
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Customize Settings
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By continuing to use our website, you agree to our{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>{' '}
                and{' '}
                <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>
              </p>
            </div>
          </div>
        ) : (
          // Cookie Preferences
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close preferences"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Choose which types of cookies you're comfortable with. You can change these settings at any time.
            </p>

            <div className="space-y-6">
              {cookieCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {category.title}
                        </h4>
                        {category.required && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {category.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Examples:</strong> {category.examples}
                      </p>
                    </div>
                    
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[category.id]}
                          onChange={(e) => handlePreferenceChange(category.id, e.target.checked)}
                          disabled={category.required}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Save Preferences
              </button>
              
              <button
                onClick={() => setShowPreferences(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook to manage cookie consent state
export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
    setHasConsented(consentGiven);

    if (consentGiven) {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (error) {
          console.error('Failed to parse cookie preferences:', error);
        }
      }
    }
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences));
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setHasConsented(false);
    setPreferences(null);
  };

  return {
    preferences,
    hasConsented,
    updatePreferences,
    resetConsent,
    canUseAnalytics: preferences?.analytics || false,
    canUseMarketing: preferences?.marketing || false,
    canUseFunctional: preferences?.functional || false
  };
};

export default CookieConsent;